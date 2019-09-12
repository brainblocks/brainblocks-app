/* @flow */
import models from '../models';
import SuccessResponse from '../responses/success_response';
import ErrorResponse from '../responses/error_response';
import { getTradeCurrencies, getTradePairs, getTradeEstimate, createTrade, getMarketPairs, getMinimalAmount, getTradeStatus } from '../services/trade';

const { Trades } = models.models;

export default class {

    static async getMarketPairs(req : Object, res : Object) : Promise<void> {
        const success = new SuccessResponse(res);
        const user = req.user;

        // ensure authorization
        if (!user) {
            return res.status(401).send({ error: 'Not authorized' });
        }

        success.send({ status: 'success', pairs: await getMarketPairs() });
    }

    static async getTradeCurrencies(req : Object, res : Object) : Promise<void> {
        const success = new SuccessResponse(res);
        const user = req.user;

        // ensure authorization
        if (!user) {
            return res.status(401).send({ error: 'Not authorized' });
        }

        success.send({ status: 'success', currencies: await getTradeCurrencies() });
    }

    static async getTradePairs(req : Object, res : Object) : Promise<void> {
        const success = new SuccessResponse(res);
        const user = req.user;
        const currency = req.body.currency;

        // ensure authorization
        if (!user) {
            return res.status(401).send({ error: 'Not authorized' });
        }

        success.send({ status: 'success', currencies: await getTradePairs(currency) });
    }

    static async getMinimalAmountPair(req : Object, res : Object) : Promise<void> {
        const success = new SuccessResponse(res);
        const user = req.user;
        const pair = req.body.pair;

        // ensure authorization
        if (!user) {
            return res.status(401).send({ error: 'Not authorized' });
        }

        success.send({ status: 'success', minAmount: await getMinimalAmount(pair) });
    }

    static async getTradeEstimate(req : Object, res : Object) : Promise<void> {
        const success = new SuccessResponse(res);
        const error = new ErrorResponse(res);
        const body = req.body;
        const user = req.user;
        const amount = body.amount;
        const pair = body.pair;

        // ensure authorization
        if (!user) {
            return res.status(401).send({ error: 'Not authorized' });
        }

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
        const user = req.user;
        const pair = body.pair;
        const receiveAddress = body.receiveAddress;
        const tradeAmount = body.tradeAmount;
        const extraId = body.extraId;
        const refundAddress = body.refundAddress;

        // ensure authorization
        if (!user) {
            return res.status(401).send({ error: 'Not authorized' });
        }

        let success = new SuccessResponse(res);
        let error = new ErrorResponse(res);

        try {
            const trade = await createTrade(pair, receiveAddress, tradeAmount, extraId, refundAddress);

            // check to make sure we created a trade
            if (!trade) {
                return res.status(400).send({ error: 'Error creating trade' });
            }

            // create trade
            const createObj = {
                userId:    user.userId,
                tradeId:   trade.id,
                from:      trade.fromCurrency,
                to:        trade.toCurrency
            };

            await Trades.create(createObj);

            success.send({
                status: 'success',
                trade
            });
        } catch (err) {
            console.error(`Error creating trade`, err);
            if (err.statusCode !== 500 && err.hasOwnProperty('error')) {
                return error.send('Error creating trade', err.statusCode, {
                    reason: JSON.parse(err.error)
                });
            }
            return error.send('Error creating trade');
        }
    }

    static async getTrades(req : Object, res : Object) : Promise<void> {
        const user = req.user;

        // ensure authorization
        if (!user) {
            return res.status(401).send({ error: 'Not authorized' });
        }

        let success = new SuccessResponse(res);
        let error = new ErrorResponse(res);

        try {
            let list = [];
            const trades = await Trades.findAll({ userId: user.userId });

            for (let trade of trades) {
                let id = trade.tradeId;
                let status = await getTradeStatus(id);
                status.id = trade.id;
                delete status.isPartner;
                list.push(status);
            }

            success.send({
                status: 'success',
                trades: list
            });
        } catch (err) {
            console.error(`Error fetching trade`, err);
            return error.send('Error fetching trade');
        }
    }
}
