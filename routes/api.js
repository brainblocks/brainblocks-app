/* @flow */
import express from 'express';

import UsersController from '../controllers/userscontroller';
import { validate } from '../middleware/validator';
import { authenticate } from '../middleware/auth';

let router = express.Router();


router.post('/users', validate, UsersController.create);
router.post('/users/login', validate, UsersController.login);

router.get('/users', authenticate, UsersController.getUser);
router.delete('/users/session', authenticate, UsersController.signOut);
router.post('/users/contacts', authenticate, validate, UsersController.addContact);
router.delete('/users/contacts', authenticate, validate, UsersController.deleteContact);

export default router;
