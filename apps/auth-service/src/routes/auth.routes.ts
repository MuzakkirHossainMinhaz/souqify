import { validationHandler } from '@souqify/validationHandler/index.js';
import { Router } from 'express';
import { register } from '../controllers/auth.controllers.js';
import { registerSchema } from '../validations/auth.validations.js';

const router = Router();

router.post('/register', validationHandler(registerSchema), register);

export default router;
