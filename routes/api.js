/* @flow */
import express from 'express';

import UsersController from '../controllers/userscontroller';
import { validate } from '../middleware/validator';
import { authenticate } from '../middleware/auth';

let router = express.Router();


router.post('/users', validate, UsersController.create);
router.post('/users/login', validate, UsersController.login);

router.get('/users', authenticate, UsersController.getUser);

export default router;
