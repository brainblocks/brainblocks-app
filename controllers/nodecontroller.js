/* @flow */
import bigInt from 'big-integer';

import SuccessResponse from '../responses/success_response';
import ErrorResponse from '../responses/error_response';
import { getChains, republishBlock, getBalance, getBlockAccount, process } from '../services/nano-node';

export default class {

    static async chains ( req : Object, res : Object ) : Promise<void>{
        const accounts = req.body.accounts;
        const chains = await getChains(accounts);
        let success = new SuccessResponse(res);

        success.send({
            status:   'success',
            accounts: chains.accounts
        });
    }

    static async republish ( req : Object, res : Object ) : Promise<void> {
    	const hash = req.body.hash;
    	const block = await republishBlock(hash);
    	let success = new SuccessResponse(res);

    	success.send({
    		status: 'success',
    		blocks: block,
    	});
    }

    static async broadcast ( req : Object, res : Object ) : Promise<void> {
        const block = JSON.parse(req.body.block);
        const amount = req.body.amount;
        const account = await getBlockAccount(block.previous);
        let success = new SuccessResponse(res);

        if (amount !== 'false') {
            let { balance } = await getBalance(account)
            if (bigInt(balance) !== bigInt(amount)) {
                return res.status(400).send({ error: 'Client account balance does not match actual balance.' });
            }
        }

        const processBlock = await process(req.body.block);

        success.send({
            status: 'success',
            hash: processBlock
        });

    }
}
