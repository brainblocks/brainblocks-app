/* @flow */
import express from 'express';

import TradeController from '../../controllers/tradecontroller';
// import { validate } from '../../middleware/validator';
// import { authenticate } from '../../middleware/auth';

let router = express.Router();

router.get('/pairs', TradeController.getMarketPairs);
router.get('/currencies', TradeController.getTradeCurrencies);
router.post('/minAmount', TradeController.getMinimalAmountPair);
router.post('/estimate', TradeController.getTradeEstimate);
router.post('/currencyPairs', TradeController.getTradePairs);
router.post('/create', TradeController.createTrade);
router.post('/status', TradeController.getTradeStatus);

export default router;
