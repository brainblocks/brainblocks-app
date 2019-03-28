/* @flow */
import express from 'express';
import WebSocket from 'ws';

import SuccessResponse from '../../responses/success_response';
import ErrorResponse from '../../responses/error_response';
import { getInfo, getPending } from '../../services/nano-node';

let router = express.Router();

const wss = new WebSocket.Server({ port: 3019 });

const subscriptionMap = {};

router.post('/new-block/:key/submit', async (req, res) => {
	const fullBlock = req.body;
	let { key } = req.params;

	if (key !== 'Ndr0ki0JKdByHeaRBB0FynD0U6N8v1433axWrl5') {
		return res.status(403).send({ error: 'Client is rejected!' });
	}

	try {
		fullBlock.block = JSON.parse(fullBlock.block);
	} catch (err) {
		console.log(`Error parsing block data! `, err.message);
		return res.status(403).send({ error: 'Error parsing block data!' });
	}

	let destinations = [];

	if (fullBlock.block.type === 'state') {
		if (fullBlock.is_send === 'true' && fullBlock.block.link_as_account) {
			destinations.push(fullBlock.block.link_as_account);
		}
		destinations.push(fullBlock.account);
	} else {
		destinations.push(fullBlock.block.destination);
	}

	// Send it to all!
	for (let destination of destinations) {
		if (!subscriptionMap[destination]) return; // Nobody listening for this

		console.log(`Sending block to subscriber ${destination}: `, fullBlock.amount);

		for (let ws of subscriptionMap[destination]) {
			const hash = fullBlock.hash;
			const nodeBlock = await getInfo(hash);
			const res = {accounts:{}};
		    const blockObject = {};
		    const account = nodeBlock.block_account;

            blockObject.amount = nodeBlock.amount;
            blockObject.from = account;
            blockObject.hash = hash;

            const accountObject = {};
            accountObject.account = account;
            accountObject.blocks = [blockObject];

            res.accounts[account] = accountObject;

			const event = {
				event: 'newBlock',
				data: res
			};
			ws.send(JSON.stringify(event));
		}
	}
	let success = new SuccessResponse(res);

	success.send({
		status: 'success'
	});
});

wss.on('connection', function(ws) {
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
		for (let account of ws.subscriptions) {
			if (!subscriptionMap[account] || !subscriptionMap[account].length) return; // Not in there for some reason?
			subscriptionMap[account] = subscriptionMap[account].filter(subWs => subWs !== ws);

			if (subscriptionMap[account].length === 0) {
				delete subscriptionMap[account];
			}
		}
	});
});

function parseEvent(ws, event) {
	switch (event.event) {
		case 'subscribe':
			subscribeAccounts(ws, event.data);
			break;
		case 'unsubscribe':
			unsubscribeAccounts(ws, event.data);
			break;
		case 'pending':
			getPendingBlocks(ws, event.data);
			break;
	}
}

async function getPendingBlocks(ws, accounts) {
	if (!accounts) {
		const event = {
			event: 'error',
			data: 'Invalid Pending Request. Missing Accounts'
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
				data: 'Account Not Subscribed!'
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
		data: blockData
	};
	ws.send(JSON.stringify(event));
}

function subscribeAccounts(ws, accounts) {
	for (let account of accounts) {
		if (ws.subscriptions.indexOf(account) !== -1) return; // Already subscribed
		ws.subscriptions.push(account);

		// notify the user they are subscribed
		const event = {
			event: 'subscribed',
			data: account
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
		if (existingSub === -1) return; // Not subscribed

		ws.subscriptions.splice(existingSub, 1);

		// Remove from global map
		if (!subscriptionMap[account]) return; // Nobody subscribed to this account?

		const globalIndex = subscriptionMap[account].indexOf(ws);

		if (globalIndex === -1) {
			console.log(`Subscribe, not found in the global map?  Potential leak? `, account);
			return;
		}

		subscriptionMap[account].splice(globalIndex, 1);
	}
}

export default router;