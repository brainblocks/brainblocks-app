/* @flow */
import bigInt from 'big-integer';
import request from 'request-promise';

import SuccessResponse from '../responses/success_response';
import ErrorResponse from '../responses/error_response';
import { getChains, republishBlock, getBalance, getBlockAccount, process, generateWork } from '../services/nano-node';

export async function wait(ms : number) : Promise<void> {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

export default class {

    static async chains(req : Object, res : Object) : Promise<void> {
        const accounts = req.body.accounts;
        let success = new SuccessResponse(res);
        let error = new ErrorResponse(res);

        try {
            const chains = await getChains(accounts);

            success.send({
                status:   'success',
                accounts: chains.accounts
            });
        } catch (err) {
            console.error(`Error getting chains`, err);
            return error.send('Error getting chains');
        }
    }

    static async faucet(req : Object, res : Object) : Promise<void> {
        let success = new SuccessResponse(res);
        let error = new ErrorResponse(res);
        const address = req.body.address;
        const ip = req.body.ip;
        const ua = req.body.useragent;

        let body = JSON.stringify({ address, ip_address: ip, user_agent: ua, api_key: '6c417b8f-3fa5-4aaa-9464-e57151ca4552' });

        let response;

        try {
            response = await request({
                method:                  'POST',
                uri:                     'https://nano-faucet.org/nano/send.php',
                headers: {
                    'content-type': 'application/json'
                },
                body,
                resolveWithFullResponse: true
            });
        } catch (err) {
            await wait(1000);

            response = await request({
                method:                  'POST',
                uri:                     'https://nano-faucet.org/nano/send.php',
                headers: {
                    'content-type': 'application/json'
                },
                body,
                resolveWithFullResponse: true
            });
        }

        const parsedData = JSON.parse(response);

        if (parsedData.includes('Nano Sent')) {
            success.send({
                status:   'success'
            });
        } else {
            console.error(`Error requesting faucet`);
            return error.send('Error requesting faucet');
        }
    }

    static async republish(req : Object, res : Object) : Promise<void> {
        const hash = req.body.hash;
        let success = new SuccessResponse(res);
        let error = new ErrorResponse(res);

        try {
            const block = await republishBlock(hash);
            success.send({
                status: 'success',
                blocks: block
            });
        } catch (err) {
            console.error(`Error in republish`, err);
            return error.send('Error in republish');
        }

    }

    static async broadcast(req : Object, res : Object) : Promise<void> {
        let success = new SuccessResponse(res);
        let error = new ErrorResponse(res);

        let block = JSON.parse(req.body.block);
        const hash = req.body.hash;
        // get work and attach to block
        const work = await generateWork(hash);
        block.work = work;
        console.log('block: ', block);
        const amount = req.body.amount;

        if (amount !== 'false') {
            let account;
            let balance;
            try {
                account = await getBlockAccount(block.previous);
                const bal = await getBalance(account);
                balance = bal.balance;
            } catch (err) {
                console.error('Error getting account before broadcast', err);
                return error.send('Error getting account before broadcast');
            }

            if (bigInt(balance) !== bigInt(amount)) {
                return error.badRequest('Client account balance does not match actual balance.');
            }
        }

        try {
            const processBlock = await process(block);

            success.send({
                status: 'success',
                hash:   processBlock,
                work
            });
        } catch (err) {
            console.error('Error broadcasting block', err);
            return error.send('Error broadcasting block');
        }

    }
}
