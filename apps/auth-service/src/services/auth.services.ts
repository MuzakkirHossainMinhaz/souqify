import { prisma } from '@souqify/prisma';

// check if the user exists
export const checkUserExists = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};
