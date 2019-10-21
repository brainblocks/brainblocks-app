/* @flow */
import express from 'express';
import WebSocket from 'ws';

import SuccessResponse from '../../responses/success_response';
import { getInfo, getPending } from '../../services/nano-node';

let router = express.Router();

const wsPort = process.env.WS_PORT;
const nodeConnection = process.env.NODE_CONNECTION || 'ssh.node2.brainblocks.io';
const nodeWSPort = process.env.NODE_WS_PORT || 7078;
const wss = new WebSocket.Server({ port: wsPort });
const socketConnection = `ws://${ nodeConnection }:${ nodeWSPort }`;
let nodeSocket = new WebSocket(socketConnection);

// websocket subscriber map
let subscriptionMap = {};

// tps reporting
let tpsCount = 0;
// Seconds between reporting statistics to console (Connected clients, TPS)
const statTime = 10;

router.post('/', (req, res) => {
    let success = new SuccessResponse(res);

    success.send({
        status: 'success'
    });
});

async function getPendingBlocks(ws, accounts) : Promise<void> {
    if (!accounts) {
        const event = {
            event: 'error',
            data:  'Invalid Pending Request. Missing Accounts'
        };
        ws.send(JSON.stringify(event));
        return;
    }

    let subAccounts = [];

    // check to make sure all accounts provided are subscribed and reject those that are not
    for (let account of accounts) {
        const existingSub = ws.subscriptions.indexOf(account);
        if (existingSub === -1) {
            const event = {
                event: 'error',
                data:  'Account Not Subscribed!'
            };
            ws.send(JSON.stringify(event));
            return; // Not subscribed
        } else {
            subAccounts.push(account);
        }
    }

    // grab pending blocks here
    let blockData = await getPending(accounts);

    // create a new event that we can send to our client
    const event = {
        event: 'newBlock',
        data:  blockData
    };
    ws.send(JSON.stringify(event));
}

function subscribeAccounts(ws, accounts) {
    for (let account of accounts) {
        if (ws.subscriptions.indexOf(account) !== -1) {
            return; // Already subscribed
        }
        ws.subscriptions.push(account);

        console.log('subscribed', account);
        // notify the user they are subscribed
        const event = {
            event: 'subscribed',
            data:  account
        };
        ws.send(JSON.stringify(event));

        // Add into global map
        if (!subscriptionMap[account]) {
            subscriptionMap[account] = [];
        }

        subscriptionMap[account].push(ws);
    }
}

function unsubscribeAccounts(ws, accounts) {
    for (let account of accounts) {
        const existingSub = ws.subscriptions.indexOf(account);
        if (existingSub === -1) {
            return; // Not subscribed
        }

        ws.subscriptions.splice(existingSub, 1);

        // Remove from global map
        if (!subscriptionMap[account]) {
            return; // Nobody subscribed to this account?
        }

        const globalIndex = subscriptionMap[account].indexOf(ws);

        if (globalIndex === -1) {
            console.log(`Subscribe, not found in the global map?  Potential leak? `, account);
            return;
        }

        subscriptionMap[account].splice(globalIndex, 1);
    }
}

function parseEvent(ws, event) {
    let accounts = [];
    if (event.hasOwnProperty('data') && Array.isArray(event.data)) {
        for (let account of event.data) {
            accounts.push(account);
        }
    }
    switch (event.event) {
    case 'subscribe':
        subscribeAccounts(ws, accounts);
        break;
    case 'unsubscribe':
        unsubscribeAccounts(ws, accounts);
        break;
    case 'pending':
        getPendingBlocks(ws, accounts);
        break;
    default:
        break;
    }
}

nodeSocket.on('open', () => {
    console.log('Node Socket - connected');
    let subscribe = JSON.stringify({ 'action': 'subscribe', 'topic': 'confirmation' });
    nodeSocket.send(subscribe);
});

nodeSocket.on('close', () => {
    console.log('Node Socket - disconnected');
});

nodeSocket.on('message', async message => {
    let fullPacket = JSON.parse(message);
    let fullMessage = fullPacket.message;
    let fullBlock = fullMessage.block;

    // increase tps counter
    tpsCount = tpsCount += 1;

    let destinations = [];

    /* All block types
      if (fullBlock.block.type === 'state') {
          if (fullBlock.is_send === 'true' && fullBlock.block.link_as_account) {
              destinations.push(fullBlock.block.link_as_account);
          }
          // push to destinations array
          destinations.push(fullBlock.account);
      } else {
          // push to destinations array
          destinations.push(fullBlock.block.destination);
      }
    */

    /* For now, only sends where we are the recipient */
    if (fullBlock.type !== 'state' || fullBlock.subtype !== 'send') {
        return;
    }

    destinations.push(fullBlock.link_as_account);

    // Send it to all!
    for (let destination of destinations) {
        if (!subscriptionMap[destination]) {
            return;
        } // Nobody listening for this

        for (let ws of subscriptionMap[destination]) {
            const hash = fullMessage.hash;
            const nodeBlock = await getInfo(hash);
            const fromAccount = nodeBlock.block_account;
            let data = { accounts: { } };
            let blockObject = {};

            blockObject.amount = nodeBlock.amount;
            blockObject.from = fromAccount;
            blockObject.hash = hash;

            let accountObject = {};
            accountObject.account = destination;
            accountObject.blocks = [ blockObject ];

            data.accounts[destination] = accountObject;

            const event = {
                event: 'newBlock',
                data
            };
            ws.send(JSON.stringify(event));
        }
    }
});

wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.subscriptions = [];

    ws.on('message', message => {
        console.log('message: ', message);
        try {
            const event = JSON.parse(message);
            parseEvent(ws, event);
        } catch (err) {
            console.log(`Bad message: `, err);
        }
    });

    ws.on('close', event => {
        console.log(`Wallet Socket - Connection Closed`, event);

        for (let account of ws.subscriptions) {
            if (!subscriptionMap[account] || !subscriptionMap[account].length) {
                return;
            } // Not in there for some reason?

            subscriptionMap[account] = subscriptionMap[account].filter(subWs => subWs !== ws);

            if (subscriptionMap[account].length === 0) {
                delete subscriptionMap[account];
            }
        }
    });
});

function ping(ws) {
    // send ping to destination
    const time = Date.now();
    const event = {
        event: 'ping',
        data:  time
    };
    ws.send(JSON.stringify(event));
}

async function pulse() : Promise<void> {
    // pull pending for accounts
    const accounts = Object.keys(subscriptionMap);
    const blockData = await getPending(accounts);
    const blockAccounts = blockData.accounts;

    for (let destination of Object.keys(subscriptionMap)) {
        for (let ws of subscriptionMap[destination]) {
            // kill dead connections
            if (ws.isAlive === false) {
                ws.terminate();
                continue;
            }

            // send ping to destination
            ping(ws);

            // send pending blocks to user
            let dataObject = { accounts: {} };
            dataObject.accounts[destination] = blockAccounts[destination];
            const event = {
                event: 'newBlock',
                data:  dataObject
            };
            ws.send(JSON.stringify(event));
        }
    }
}

function printStats() {
    const connectedClients = wss.clients.size;
    const tps = tpsCount / statTime;
    console.log(`[Stats] Connected clients: ${ connectedClients }; TPS Average: ${ tps }`);
    tpsCount = 0;
    pulse();
}

setInterval(printStats, statTime * 1000); // Print stats every x seconds

export default router;
