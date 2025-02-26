import { Context } from '../utils/context';
import { generateToken, hashPassword, verifyPassword } from '../utils/auth';
import { AuthenticationError, UserInputError } from 'apollo-server';
import { User as PrismaUser, Post, Comment, Like } from '@prisma/client';

interface UserIdArgs {
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

interface AuthPayload {
  token: string;
  user: PrismaUser;
}

type UserWithPosts = PrismaUser & { 
  posts?: Post[] 
};

type UserWithComments = PrismaUser & { 
  comments?: Comment[] 
};

type UserWithLikes = PrismaUser & { 
  likes?: Like[] 
};

export const userResolvers = {
  Query: {
    me: (_parent: object, _args: object, { user }: Context): PrismaUser | null => {
      console.log(user);
      return user;
    },
    
    user: (_parent: object, args: UserIdArgs, { prisma }: Context): Promise<PrismaUser | null> => {
      return prisma.user.findUnique({
        where: { id: args.id },
      });
    },
    
    users: (_parent: object, _args: object, { prisma }: Context): Promise<PrismaUser[]> => {
      return prisma.user.findMany();
    },
  },
  
  Mutation: {
    register: async (
      _parent: object,
      args: RegisterArgs,
      { prisma }: Context
    ): Promise<AuthPayload> => {
      const { email, password, username } = args;
      
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
      _parent: object,
      args: LoginArgs,
      { prisma }: Context
    ): Promise<AuthPayload> => {
      const { email, password } = args;
      
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
  
  User: {
    posts: (parent: UserWithPosts, _args: object, { prisma }: Context): Promise<Post[]> => {
      if (parent.posts) {
        return Promise.resolve(parent.posts);
      }
      
      return prisma.post.findMany({ 
        where: { userId: parent.id } 
      });
    },
    
    comments: (parent: UserWithComments, _args: object, { prisma }: Context): Promise<Comment[]> => {
      if (parent.comments) {
        return Promise.resolve(parent.comments);
      }
      
      return prisma.comment.findMany({ 
        where: { userId: parent.id } 
      });
    },
    
    likes: (parent: UserWithLikes, _args: object, { prisma }: Context): Promise<Like[]> => {
      if (parent.likes) {
        return Promise.resolve(parent.likes);
      }
      
      return prisma.like.findMany({ 
        where: { userId: parent.id } 
      });
    }
  }
};