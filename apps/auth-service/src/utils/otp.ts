import { TooManyRequestsError } from '@souqify/errorHandler/index';
import { redis } from '@souqify/redis';
import { NextFunction } from 'express';
import { sendEmail } from './email';

const OTP_TTL_SEC = 60 * 5; // OTP valid 5 minutes
const COOLOFF_SEC = 60 * 1; // 1 minute between send attempts (anti-spam)
const REQUEST_WINDOW_SEC = 60 * 15; // count requests in a 15-minute window
const MAX_REQUESTS_PER_WINDOW = 3; // max OTP sends per window before lock
const LOCK_DURATION_SEC = 60 * 60; // lock for 1 hour when limit exceeded

// generate a 6 digit OTP
export const generateOTP = async (email: string) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  await redis.set(`otp:${email}`, otp.toString(), OTP_TTL_SEC);
  await redis.set(`otp:cooloff:${email}`, 'true', COOLOFF_SEC);
  return otp;
};

// send OTP to email
export const sendOTP = async (email: string, template: string, data: Record<string, unknown>) => {
  const otp = await generateOTP(email);

  await sendEmail({
    to: email,
    subject: 'OTP for verification',
    template,
    templateData: {
      otp,
      email,
      ...data,
    },
  });
};

// Check if email is allowed to request OTP (lock = punishment, cooloff = rate limit between sends)
export const checkOTPRestrictions = async (email: string, next: NextFunction) => {
  const locked = await redis.get(`otp:locked:${email}`);
  if (locked) {
    return next(new TooManyRequestsError('Too many OTP requests. You are temporarily locked. Try again in 1 hour.'));
  }

  const cooloff = await redis.get(`otp:cooloff:${email}`);
  if (cooloff) {
    return next(new TooManyRequestsError('Please wait 1 minute before requesting another OTP.'));
  }

  return next();
};

// Track OTP send attempts in a fixed window. If over limit, set lock and return false.
export const trackOTPRequest = async (email: string): Promise<boolean> => {
  const lockKey = `otp:locked:${email}`;
  if (await redis.get(lockKey)) {
    return false;
  }

  const key = `otp:requests:${email}`;
  const raw = await redis.get(key);
  const count = raw ? parseInt(raw, 10) : 0;

  if (count >= MAX_REQUESTS_PER_WINDOW) {
    await redis.set(lockKey, '1', LOCK_DURATION_SEC);
    return false;
  }

  const ttl = await redis.client.ttl(key);
  const windowSec = ttl > 0 ? ttl : REQUEST_WINDOW_SEC;
  await redis.set(key, String(count + 1), windowSec);
  return true;
};
