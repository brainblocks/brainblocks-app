/* @flow */
import express from 'express';

import UsersController from '../controllers/userscontroller';
import { validate } from '../middleware/validator';

let router = express.Router();


router.post('/users', validate, UsersController.create);
router.post('/users/login', validate, UsersController.login);

export default router;
