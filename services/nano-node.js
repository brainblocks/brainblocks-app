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

type Block = {
    type : string,
    account : string,
    previous : string,
    representative : string,
    balance : BigInt,
    link? : string,
    source? : string,
    link_as_account : string,
    signature : string,
    work : string
};

export function toBigInt(num : string) : BigInt {
    return bigInt(num);
}

export async function wait(ms : number) : Promise<void> {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

export async function nanoAction<R : Object>(action : string, args : Object = {}) : Promise<R> {

    // for debug only, this fills logs
    // console.log((new Date()).toUTCString(), 'START', action, args);

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

    // for debug only, this fills logs
    // console.log((new Date()).toUTCString(), 'COMPLETE', action, args, res.body);

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
    res.block_account = res.block_account;

    if (res.contents.account) {
        res.contents.account = res.contents.account;
    }
    if (res.contents.representative) {
        res.contents.representative = res.contents.representative;
    }
    if (res.contents.link_as_account) {
        res.contents.link_as_account = res.contents.link_as_account;
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

export async function process(block : Block) : Promise<string> {
    const serializedBlock = JSON.stringify(block);
    let { hash } = await nanoAction('process', { block: serializedBlock });
    return hash;
}

export async function generateWork(hash : string) : Promise<string> {
    let { work } = await nanoAction('work_generate', {
        hash,
        use_peers: true
    });

    return work;
}

export async function getChains(inputAccounts : Array<string>) : Promise<Object> {
    let res = { accounts: {} };
    let accounts = [];

    for (let account of inputAccounts) {
        accounts.push(account);
    }

    const frontiers = await getFrontiers(accounts);

    for (let account of accounts) {
        let { balance, pending } = await getBalance(account);
        let accountObject = { balance, pending, blocks: [] };

        // check if account is in frontiers
        if (frontiers.hasOwnProperty(account)) {
            const chain = await getChain(frontiers[account]);
            const blocks = await getHashes(chain);
            const blocks2 = [];

            for (let hash of Object.keys(blocks)) {
                let data = blocks[hash];
                let contents = JSON.parse(data.contents);

                if (data.block_account) {
                    data.block_account = data.block_account;
                }
                if (data.source_account) {
                    data.source_account = data.source_account;
                }
                if (contents.account) {
                    contents.account = contents.account;
                }
                if (contents.representative) {
                    contents.representative = contents.representative;
                }
                if (contents.link_as_account) {
                    contents.link_as_account = contents.link_as_account;
                }

                // write contents changes back to data block
                data.contents = JSON.stringify(contents);

                if (contents.type === 'open' || contents.type === 'receive') {
                    const blockAccount = await getBlockAccount(contents.source);
                    data.origin = blockAccount;
                } else if (contents.type === 'state') {
                    // check if it is receiving
                    if (data.source_account) {
                        const blockAccount = data.source_account;
                        data.origin = blockAccount;
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
        accounts.push(account);
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
                blockObject.from = info.block_account;
                blockObject.hash = hash;
                blocks.push(blockObject);
            }
            const nanoAccount = account;
            const accountObject = { account: nanoAccount, blocks };

            res.accounts[nanoAccount] = accountObject;
        }
    }
    return res;
}
