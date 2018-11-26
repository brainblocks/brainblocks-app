/* @flow */
import express from 'express';

import UsersController from '../../controllers/userscontroller';
import { validate } from '../../middleware/validator';
import { authenticate } from '../../middleware/auth';

let router = express.Router();

router.post('/', validate, UsersController.create);
router.get('/', authenticate, UsersController.getUser);

router.get('/contacts', authenticate, UsersController.getContacts);
router.post('/contacts', authenticate, validate, UsersController.addContact);
router.delete('/contacts', authenticate, validate, UsersController.deleteContact);

export default router;
