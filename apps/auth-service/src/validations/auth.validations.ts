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

/** Schema for POST /register – use with validationHandler(registerSchema) */
export const registerSchema = {
  body: z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
  }),
};
