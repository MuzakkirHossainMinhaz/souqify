import { z } from 'zod';

const nameSchema = z
  .string({ error: 'Name is required' })
  .min(1, 'Name cannot be empty')
  .max(120, 'Name must be at most 120 characters')
  .trim();

const emailSchema = z.email({
  error: 'Please provide a valid email address',
});

const passwordSchema = z
  .string({ error: 'Password is required' })
  .min(6, 'Password must be at least 6 characters')
  .max(32, 'Password must be at most 32 characters');

const otpSchema = z
  .string({ error: 'OTP is required' })
  .length(6, 'OTP must be a 6-digit code');

/** Schema for POST /register – request OTP */
export const registerSchema = {
  body: z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
  }),
};

/** Schema for POST /register/verify – complete registration */
export const verifyRegisterSchema = {
  body: z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    otp: otpSchema,
  }),
};

/** Schema for POST /login */
export const loginSchema = {
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
};

/** Schema for POST /forgot-password */
export const forgotPasswordSchema = {
  body: z.object({
    email: emailSchema,
  }),
};

/** Schema for POST /reset-password */
export const resetPasswordSchema = {
  body: z.object({
    email: emailSchema,
    otp: otpSchema,
    password: passwordSchema,
  }),
};
