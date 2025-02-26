import { Context } from '../utils/context';
import { generateToken, hashPassword, verifyPassword } from '../utils/auth';
import { AuthenticationError, UserInputError } from 'apollo-server';
import { User } from '@prisma/client';

interface UserByIdArgs {
    id: string;
}

interface RegisterArgs {
    email: string;
    password: string;
    username: string;
}


interface LoginArgs {
    email: string;
    password: string;
}

export const userResolvers = {

    Query: {

        me: (_: unknown, __: unknown, { user }: Context): User | null => {
            return user;
        },
        
        user: (_: unknown, { id }: UserByIdArgs, { prisma }: Context): Promise<User | null> => {
            return prisma.user.findUnique({
            where: { id },
            });
        },
        
        users: (_: unknown, __: unknown, { prisma }: Context): Promise<User[]> => {
            return prisma.user.findMany();
        },

    },
  
    Mutation: {

        register: async (
            _: unknown,
            { email, password, username }: RegisterArgs,
            { prisma }: Context
        ): Promise<{ token: string; user: User }> => {

            const emailExists = await prisma.user.findUnique({ where: { email } });
            if (emailExists) {
                throw new UserInputError('This email is already registered');
            }
            

            const usernameExists = await prisma.user.findUnique({ where: { username } });
            if (usernameExists) {
                throw new UserInputError('This username is already taken');
            }
            

            if (password.length < 6) {
                throw new UserInputError('Password must be at least 6 characters long');
            }
            

            const user = await prisma.user.create({
                data: {
                email,
                password: await hashPassword(password),
                username,
                },
            });
            
            return {
                token: generateToken(user),
                user,
            };

        },
        
        login: async (
            _: unknown,
            { email, password }: LoginArgs,
            { prisma }: Context
        ): Promise<{ token: string; user: User }> => {

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                throw new AuthenticationError('Invalid email or password');
            }
            

            const passwordValid = await verifyPassword(password, user.password);
            if (!passwordValid) {
                throw new AuthenticationError('Invalid email or password');
            }
            
            return {
                token: generateToken(user),
                user,
            };

        },

    },


};