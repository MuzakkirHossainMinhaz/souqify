import {
  BadRequestError,
  TooManyRequestsError,
  UnauthorizedError,
} from '@souqify/errorHandler/index';
import { NextFunction, Request, Response } from 'express';
import {
  checkUserExists,
  comparePassword,
  createUser,
  updateUserPassword,
} from '../services/auth.services';
import { checkOTPRestrictions, sendOTP, trackOTPRequest, verifyOTP } from '../utils/otp';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;

    if (await checkUserExists(email)) {
      throw BadRequestError.validationError('User already exists');
    }

    await checkOTPRestrictions(email);
    const isAllowed = await trackOTPRequest(email);
    if (!isAllowed) {
      throw new TooManyRequestsError('Too many OTP requests. Please try again after 1 hour.');
    }
    await sendOTP(email, 'verifyEmail', { name });

    res.status(200).json({ message: `OTP sent to ${email}. Please verify your email.` });
  } catch (error) {
    next(error);
  }
};

export const verifyRegister = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, otp } = req.body;

    if (await checkUserExists(email)) {
      throw BadRequestError.validationError('User already exists');
    }

    await verifyOTP(email, otp);
    await createUser(email, name, password);

    res.status(201).json({ message: 'Registration complete. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await checkUserExists(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }
    if (!user.password) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await checkUserExists(email);
    if (!user) {
      res.status(200).json({
        message: 'If an account exists for this email, you will receive a reset code.',
      });
      return;
    }

    await checkOTPRestrictions(email);
    const isAllowed = await trackOTPRequest(email);
    if (!isAllowed) {
      throw new TooManyRequestsError('Too many OTP requests. Please try again after 1 hour.');
    }
    await sendOTP(email, 'verifyEmail', { name: user.name });

    res.status(200).json({
      message: 'If an account exists for this email, you will receive a reset code.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, password } = req.body;

    const user = await checkUserExists(email);
    if (!user) {
      throw new BadRequestError('Invalid or expired reset code.');
    }

    await verifyOTP(email, otp);
    await updateUserPassword(user.id, password);

    res.status(200).json({ message: 'Password has been reset. You can now log in.' });
  } catch (error) {
    next(error);
  }
};
