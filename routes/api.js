/* @flow */
import express from 'express';

import UsersController from '../controllers/userscontroller';

let router = express.Router();


router.post('/users', UsersController.create);

export default router;
