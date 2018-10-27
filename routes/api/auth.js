import express from "express";
import AuthController from "../../controllers/authcontroller";
import {authenticate} from "../../middleware/auth";
import { validate } from '../../middleware/validator';

const router = express.Router();

router.get('/',  authenticate, AuthController.fetch);
router.post('/',  validate, AuthController.login);
router.delete('/',  authenticate, AuthController.logout);

export default router;