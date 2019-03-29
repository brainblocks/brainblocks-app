/* @flow */
import request from 'request-promise';
import bigInt from 'big-integer';

import { development } from '../config/nano-config';

export type BigInt = {|
    isZero : () => boolean,
    isNegative : () => boolean,
    add : (BigInt) => BigInt,
    subtract : (BigInt) => BigInt,
    greater : (BigInt) => boolean,
    lesser : (BigInt) => boolean,
    greaterOrEquals : (BigInt) => boolean,
    lesserOrEquals : (BigInt) => boolean,
    equals : (mixed) => boolean
|};

export function toBigInt(num : string) : BigInt {
    return bigInt(num);
}

export async function wait(ms : number) : Promise<void> {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

export async function nanoAction<R : Object>(action : string, args : Object = {}) : Promise<R> {

    console.log((new Date()).toUTCString(), 'START', action, args);

    let res;
    let body = JSON.stringify({
        action,
        ...args
    });

    try {
        res = await request({
            method:  'POST',
            uri:     development.host,
            headers: {
                'content-type': 'application/json'
            },
            body,
            resolveWithFullResponse: true
        });

        if (!res.statusCode) {
            throw new Error(`Expected status code from rai node`);
        }

    } catch (err) {
        await wait(8000);

        res = await request({
            method:                  'POST',
            uri:                     development.host,
            body,
            resolveWithFullResponse: true
        });
    }

    console.log((new Date()).toUTCString(), 'COMPLETE', action, args, res.body);

    if (res.statusCode !== 200) {
        throw new Error(`Expected status to be 200, got ${ res.statusCode } for action: ${ action }`);
    }

    let data = JSON.parse(res.body);

    if (data.error) {
        // nano_node returns this error but process the command anyway?
        if (data.error !== 'Gap source block') {
            let err = new Error(data.error);

            // $FlowFixMe
            err.data = args;

            throw err;
        }
    }

    return data;
}

export async function republishBlock(hash : string) : Promise<Object>  {
    let res = await nanoAction('republish', {
        hash
    });

    return res.blocks;
}

export async function getFrontiers(accounts : Array<string>) : Promise<Object> {
    let res = await nanoAction('accounts_frontiers', {
        accounts,
        count: '500'
    });

    return res.frontiers;
}

export async function getChain(block : string) : Promise<Array<string>>  {
    let res = await nanoAction('chain', {
        block,
        count: '500'
    });

    return res.blocks;
}

export async function getPendingBlocks(accounts : Array<string>) : Promise<Object> {
    let res = await nanoAction('accounts_pending', {
        accounts,
        count: '500'
    });

    return res.blocks;
}

export async function getHashes(hashes : Array<string>) : Promise<Object>  {
    let res = await nanoAction('blocks_info', {
        hashes,
        source: true
    });
    return res.blocks;
}

export async function getInfo(hash : string) : Object {
    let res = await nanoAction('block_info', { hash });
    // replace xrb_ for nano_
    res.block_account = res.block_account.replace('xrb_', 'nano_');

    if (res.contents.account) {
        res.contents.account = res.contents.account.replace('xrb_', 'nano_');
    }
    if (res.contents.representative) {
        res.contents.representative = res.contents.representative.replace('xrb_', 'nano_');
    }
    if (res.contents.link_as_account) {
        res.contents.link_as_account = res.contents.link_as_account.replace('xrb_', 'nano_');
    }
    // return block
    return res;
}

export async function getBlockAccount(hash : string) : Promise<string> {
    let res = await nanoAction('block_account', {
        hash
    });

    return res.account.replace('xrb_', 'nano_');
}

export async function getBalance(account : string) : Promise<{ balance : string, pending : string }> {
    let { balance, pending } = await nanoAction('account_balance', { account });

    return {
        balance, pending
    };
}

export async function process(block : string) : Promise<string> {
    const serializedBlock = JSON.stringify(block);
    let { hash } = await nanoAction('process', { block: serializedBlock });
    return hash;
}

export async function getChains(inputAccounts : Array<string>) : Promise<Object> {
    let res = { accounts: {} };
    let accounts = [];

    for (let account of inputAccounts) {
        accounts.push(account.replace('xrb_', 'nano_'));
    }

    const frontiers = await getFrontiers(accounts);

    for (let account of accounts) {
        let { balance, pending } = await getBalance(account);
        let accountObject = { balance, pending, blocks: [] };

        // check if account is in frontiers
        if (frontiers.hasOwnProperty(account.replace('nano_', 'xrb_'))) {
            const chain = await getChain(frontiers[account.replace('nano_', 'xrb_')]);
            const blocks = await getHashes(chain);
            const blocks2 = [];

            for (let hash of Object.keys(blocks)) {
                let data = blocks[hash];
                let contents = JSON.parse(data.contents);

                if (data.block_account) {
                    data.block_account = data.block_account.replace('xrb_', 'nano_');
                }
                if (data.source_account) {
                    data.source_account = data.source_account.replace('xrb_', 'nano_');
                }
                if (contents.account) {
                    contents.account = contents.account.replace('xrb_', 'nano_');
                }
                if (contents.representative) {
                    contents.representative = contents.representative.replace('xrb_', 'nano_');
                }
                if (contents.link_as_account) {
                    contents.link_as_account = contents.link_as_account.replace('xrb_', 'nano_');
                }

                // write contents changes back to data block
                data.contents = JSON.stringify(contents);

                if (contents.type === 'open' || contents.type === 'receive') {
                    data.origin = await getBlockAccount(contents.source).replace('xrb_', 'nano_');
                } else if (contents.type === 'state') {
                    // check if it is receiving
                    if (data.source_account) {
                        data.origin = data.source_account.replace('xrb_', 'nano_');
                    }
                }
                blocks2.push(data);
            }

            accountObject.blocks = blocks2;
        }
        res.accounts[account] = accountObject;
    }

    return res;
}

export async function getPending(inputAccounts : Array<string>) : Promise<Object> {
    // replace xrb_ with nano_
    let accounts = [];

    for (let account of inputAccounts) {
        accounts.push(account.replace('xrb_', 'nano_'));
    }
    const pending = await getPendingBlocks(accounts);
    let res = { accounts: {} };

    for (let account of Object.keys(pending)) {
        const data = pending[account];

        if (Array.isArray(data) && data.length > 0) {
            const blocks = [];
            const hashes = await getHashes(data);

            for (let hash of Object.keys(hashes)) {
                const info = hashes[hash];
                let blockObject = {};
                blockObject.amount = info.amount;
                blockObject.from = info.block_account.replace('xrb_', 'nano_');
                blockObject.hash = hash;
                blocks.push(blockObject);
            }
            const nanoAccount = account.replace('xrb_', 'nano_');
            const accountObject = { account: nanoAccount, blocks };

            res.accounts[nanoAccount] = accountObject;
        }
    }
    return res;
}
