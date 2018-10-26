/* @flow */
import express from 'express';
import apiRouter from "./api";

let router = express.Router();

router.use('/api', apiRouter);

export default router;


