/* @flow */
import express from 'express';

import UsersController from '../../controllers/userscontroller';
import { validate } from '../../middleware/validator';
import { authenticate } from '../../middleware/auth';

let router = express.Router();

router.post('/', validate, UsersController.create);
router.post('/login', validate, UsersController.login);

router.get('/', authenticate, UsersController.getUser);
router.delete('/session', authenticate, UsersController.signOut);

export default router;
