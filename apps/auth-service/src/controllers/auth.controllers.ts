import { BadRequestError, TooManyRequestsError } from '@souqify/errorHandler/index.js';
import { NextFunction, Request, Response } from 'express';
import { checkUserExists } from '../services/auth.services.js';
import { checkOTPRestrictions, sendOTP, trackOTPRequest } from '../utils/otp.js';

// register a new user
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;

    if (await checkUserExists(email)) {
      throw BadRequestError.validationError('User already exists');
    }

    await checkOTPRestrictions(email, next);
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
