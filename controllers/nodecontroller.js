/* @flow */
import bigInt from 'big-integer';
// import rp from 'request-promise';

import SuccessResponse from '../responses/success_response';
import ErrorResponse from '../responses/error_response';
import { getChains, republishBlock, getBalance, getBlockAccount, process, generateWork } from '../services/nano-node';

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

    // static async faucet(req : Object, res : Object) : Promise<void> {
    //     let success = new SuccessResponse(res);
    //     let error = new ErrorResponse(res);
    //     const address = req.body.address;
    //     const ip = req.body.ip;
    //     const ua = req.body.useragent;
    //
    //     if (!process.env.FAUCET) {
    //         return error.send('Error requesting faucet');
    //     }
    //
    //     let options = {
    //         method: 'POST',
    //         uri:    'https://nano-faucet.org/nano/send.php',
    //         body:   {
    //             address,
    //             ip_address: ip,
    //             user_agent: ua,
    //             api_key:    process.env.FAUCET
    //         },
    //         json: false // Automatically stringifies the body to JSON
    //     };
    //
    //     await rp(options)
    //         .then((parsed) => {
    //             console.log(parsed);
    //             if (parsed.includes('Nano Sent')) {
    //                 success.send({
    //                     status:   'success'
    //                 });
    //             }
    //         })
    //         .catch((err) => {
    //             console.error(`Error requesting faucet`, err);
    //             return error.send('Error requesting faucet');
    //         });
    // }

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
