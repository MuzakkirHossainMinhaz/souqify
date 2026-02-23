import { prisma } from '@souqify/prisma';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = (plain: string, hashed: string): Promise<boolean> => {
  return bcrypt.compare(plain, hashed);
};

export const checkUserExists = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const createUser = async (email: string, name: string, password: string) => {
  const hashed = await hashPassword(password);
  return await prisma.user.create({
    data: { email, name, password: hashed },
  });
};

export const updateUserPassword = async (id: string, password: string) => {
  const hashed = await hashPassword(password);
  return await prisma.user.update({
    where: { id },
    data: { password: hashed },
  });
};
