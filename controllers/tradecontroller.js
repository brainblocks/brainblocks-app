/* @flow */
import SuccessResponse from '../responses/success_response';
import ErrorResponse from '../responses/error_response';
import { getTradeCurrencies, getTradePairs, getTradeEstimate, createTrade, getMarketPairs, getMinimalAmount, getTradeStatus } from '../services/trade';

export default class {

    static async getMarketPairs(req : Object, res : Object) : Promise<void> {
        let success = new SuccessResponse(res);
        success.send({ status: 'success', pairs: await getMarketPairs() });
    }

    static async getTradeCurrencies(req : Object, res : Object) : Promise<void> {
        let success = new SuccessResponse(res);
        success.send({ status: 'success', currencies: await getTradeCurrencies() });
    }

    static async getTradePairs(req : Object, res : Object) : Promise<void> {
        let success = new SuccessResponse(res);
        let currency = req.body.currency;
        success.send({ status: 'success', currencies: await getTradePairs(currency) });
    }

    static async getMinimalAmountPair(req : Object, res : Object) : Promise<void> {
        let success = new SuccessResponse(res);
        let pair = req.body.pair;
        success.send({ status: 'success', minAmount: await getMinimalAmount(pair) });
    }

    static async getTradeStatus(req : Object, res : Object) : Promise<void> {
        let success = new SuccessResponse(res);
        let id = req.body.id;
        success.send({ status: 'success', trade: await getTradeStatus(id) });
    }

    static async getTradeEstimate(req : Object, res : Object) : Promise<void> {
        const amount = req.body.amount;
        const pair = req.body.pair;
        let success = new SuccessResponse(res);
        let error = new ErrorResponse(res);

        try {
            const estimate = await getTradeEstimate(pair, amount);

            success.send({
                status: 'success',
                estimate
            });
        } catch (err) {
            console.error(`Error getting trade estimate`, err);
            return error.send('Error getting trade estimate');
        }
    }

    static async createTrade(req : Object, res : Object) : Promise<void> {
        const body = req.body;
        const pair = body.pair;
        const receiveAddress = body.receiveAddress;
        const tradeAmount = body.tradeAmount;
        const extraId = body.extraId;
        const refundAddress = body.refundAddress;

        let success = new SuccessResponse(res);
        let error = new ErrorResponse(res);

        try {
            const trade = await createTrade(pair, receiveAddress, tradeAmount, extraId, refundAddress);

            success.send({
                status: 'success',
                trade
            });
        } catch (err) {
            console.error(`Error creating trade`, err);
            return error.send('Error creating trade');
        }
    }
}
