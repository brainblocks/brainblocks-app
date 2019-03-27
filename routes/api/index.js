/* @flow */
import express from 'express';

import usersRouter from './users';
import authRouter from './auth';
import nodeRouter from './node';

const router = express.Router();

router.use('/users', usersRouter);
router.use('/auth', authRouter);
router.use('/node', nodeRouter);

export default router;
