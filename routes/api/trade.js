/* @flow */
import express from 'express';

import TradeController from '../../controllers/tradecontroller';
import { authenticate } from '../../middleware/auth';

let router = express.Router();

router.get('/pairs', authenticate, TradeController.marketPairs);
router.get('/pairs/:currency', authenticate, TradeController.tradePairs);
router.get('/currencies', authenticate, TradeController.tradeCurrencies);
router.get('/minAmount/:pair', authenticate, TradeController.minimalAmountPair);
router.get('/estimate', authenticate, TradeController.tradeEstimate);
router.post('/create', TradeController.createTrade);
router.get('/trades', TradeController.getAllTrades);
router.get('/trades/:tradeId', TradeController.getTradeStatus);

export default router;
