import { validationHandler } from '@souqify/validationHandler/index';
import { Router } from 'express';
import {
  forgotPassword,
  login,
  register,
  resetPassword,
  verifyRegister,
} from '../controllers/auth.controllers';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyRegisterSchema,
} from '../validations/auth.validations';

const router = Router();

router.post('/register', validationHandler(registerSchema), register);
router.post('/register/verify', validationHandler(verifyRegisterSchema), verifyRegister);
router.post('/login', validationHandler(loginSchema), login);
router.post('/forgot-password', validationHandler(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validationHandler(resetPasswordSchema), resetPassword);

export default router;
