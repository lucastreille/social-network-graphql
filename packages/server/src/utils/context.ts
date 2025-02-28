import { PrismaClient, User } from '@prisma/client';
import { verifyToken } from './auth';
import { Request } from 'express'; 

export interface Context {
  prisma: PrismaClient;
  userId: string | null;
  user: User | null;
}

export interface ContextParams {
  req: Request;
}

const prisma = new PrismaClient();

export const createContext = async ({ req }: ContextParams): Promise<Context> => {
  const context: Context = {
    prisma,
    userId: null,
    user: null,
  };

  const authHeader = req?.headers?.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      context.userId = payload.userId;
      
      try {
        context.user = await prisma.user.findUnique({
          where: { id: payload.userId },
        });
      } catch (error) {
        console.error('Error fetching user in context:', error);
      }
    }
  }

  return context;
};