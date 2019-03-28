/* @flow */
import express from 'express';

import usersRouter from './users';
import authRouter from './auth';
import nodeRouter from './node';
import socketRouter from './socket';

const router = express.Router();

router.use('/users', usersRouter);
router.use('/auth', authRouter);
router.use('/node', nodeRouter);
router.use('/socket', socketRouter);

export default router;
