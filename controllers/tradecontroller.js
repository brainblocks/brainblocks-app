/* @flow */
import models from '../models';
import SuccessResponse from '../responses/success_response';
import ErrorResponse from '../responses/error_response';
import { getTradeCurrencies, getTradePairs, getTradeEstimate, createTrade, getMarketPairs, getMinimalAmount, getTradeStatus, getTransactions } from '../services/trade';

const { Trades } = models.models;

export default class {

    static async marketPairs(req : Object, res : Object) : Promise<void> {
        const success = new SuccessResponse(res);
        const user = req.user;

        // ensure authorization
        if (!user) {
            return res.status(401).send({ error: 'Not authorized' });
        }

        success.send({ status: 'success', pairs: await getMarketPairs() });
    }

    static async tradeCurrencies(req : Object, res : Object) : Promise<void> {
        const success = new SuccessResponse(res);
        const user = req.user;

        // ensure authorization
        if (!user) {
            return res.status(401).send({ error: 'Not authorized' });
        }

        success.send({ status: 'success', currencies: await getTradeCurrencies() });
    }

    static async tradePairs(req : Object, res : Object) : Promise<void> {
        const success = new SuccessResponse(res);
        const user = req.user;
        const currency = req.params.currency;

        // ensure authorization
        if (!user) {
            return res.status(401).send({ error: 'Not authorized' });
        }

        success.send({ status: 'success', currencies: await getTradePairs(currency) });
    }

    static async minimalAmountPair(req : Object, res : Object) : Promise<void> {
        const success = new SuccessResponse(res);
        const user = req.user;
        const pair = req.params.pair;

        // ensure authorization
        if (!user) {
            return res.status(401).send({ error: 'Not authorized' });
        }

        success.send({ status: 'success', minAmount: await getMinimalAmount(pair) });
    }

    static async tradeEstimate(req : Object, res : Object) : Promise<void> {
        const success = new SuccessResponse(res);
        const error = new ErrorResponse(res);
        const user = req.user;
        const query = req.query;
        const amount = query.amount;
        const pair = query.pair;

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
            let trade = await createTrade(pair, receiveAddress, tradeAmount, extraId, refundAddress);

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

            const newTrade = await Trades.create(createObj);

            // update trade id with id from database
            trade.id = newTrade.id;

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

    static async getAllTrades(req : Object, res : Object) : Promise<void> {
        const user = req.user;
        const options = req.query;

        // ensure authorization
        if (!user) {
            return res.status(401).send({ error: 'Not authorized' });
        }

        let success = new SuccessResponse(res);
        let error = new ErrorResponse(res);

        try {
            const userId = user.userId;
            const trades = await Trades.findAll({ userId });
            const transactions = await getTransactions(options);
            let list = [];

            for (let trade of trades) {
                let transaction = transactions.find(x => x.id === trade.tradeId);
                if (transaction) {
                    transaction.id = trade.id;
                    delete transaction.isPartner;
                    list.push(transaction);
                }
            }

            success.send({
                status: 'success',
                trades: list
            });
        } catch (err) {
            console.error(`Error fetching trades`, err);
            return error.send('Error fetching trades');
        }
    }

    static async getTradeStatus(req : Object, res : Object) : Promise<void> {
        const user = req.user;
        const id   = req.params.tradeId;

        // ensure authorization
        if (!user) {
            return res.status(401).send({ error: 'Not authorized' });
        }

        let success = new SuccessResponse(res);
        let error = new ErrorResponse(res);

        try {
            const trade = await Trades.findOne({ userId: user.userId, id });
            let currentTradeStatus = await getTradeStatus(trade.tradeId);

            currentTradeStatus.id = trade.id;

            success.send({
                status: 'success',
                trade:  currentTradeStatus
            });
        } catch (err) {
            console.error(`Error fetching trade`, err);
            return error.send('Error fetching trade');
        }
    }
}
