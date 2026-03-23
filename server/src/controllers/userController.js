import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, username: true, role: true, createdAt: true } });
    res.json(users);
  } catch (err) {
    next(err);
  }
};
