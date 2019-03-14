/* @flow */
import express from 'express';

import UsersController from '../../controllers/userscontroller';
import { validate } from '../../middleware/validator';
import { authenticate } from '../../middleware/auth';

let router = express.Router();

router.post('/', validate, UsersController.create);
router.get('/', authenticate, UsersController.getUser);
router.patch('/', authenticate, validate, UsersController.update);
router.post('/rpc/verify-email', authenticate, UsersController.verifyEmail);
router.post('/rpc/resend-verification-email', authenticate, UsersController.resendVerificationEmail);

router.get('/contacts', authenticate, UsersController.getContacts);
router.post('/contacts', authenticate, validate, UsersController.addContact);
router.delete('/contacts/:contactId', authenticate, validate, UsersController.deleteContact);
router.patch('/contacts/:contactId', authenticate, validate, UsersController.updateContact);

router.post('/2fa', authenticate, UsersController.set2fa);
router.post('/2fa/confirm', authenticate, UsersController.confirm2fa);
router.delete('/2fa/', authenticate, UsersController.deactivate2fa);

export default router;
