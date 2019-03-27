/* @flow */
import express from 'express';

import NodeController from '../../controllers/nodecontroller';
import { validate } from '../../middleware/validator';
import { authenticate } from '../../middleware/auth';

let router = express.Router();

router.post('/chains', validate, NodeController.chains);
router.post('/republish', validate, NodeController.republish);
router.post('/broadcast',validate, NodeController.broadcast);

export default router;
