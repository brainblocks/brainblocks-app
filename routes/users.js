/* @flow */
import express from 'express';

let router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
    res.send('respond with a resource');
});

export default router;
