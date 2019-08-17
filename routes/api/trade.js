/* @flow */
import express from 'express';

import TradeController from '../../controllers/tradecontroller';
import { authenticate } from '../../middleware/auth';

let router = express.Router();

router.get('/pairs', authenticate, TradeController.getMarketPairs);
router.get('/currencies', authenticate, TradeController.getTradeCurrencies);
router.post('/minAmount', authenticate, TradeController.getMinimalAmountPair);
router.post('/estimate', authenticate, TradeController.getTradeEstimate);
router.post('/currencyPairs', authenticate, TradeController.getTradePairs);
router.post('/create', authenticate, TradeController.createTrade);
router.post('/getTrades', authenticate, TradeController.getTrades);

export default router;
