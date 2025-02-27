import { Context } from '../utils/context';
import { generateToken, hashPassword, verifyPassword } from '../utils/auth';
import { AuthenticationError, UserInputError } from 'apollo-server';
import { 
  User as PrismaUser, 
  Post, 
  Comment, 
  Like 
} from '@prisma/client';
import { 
  UserResolvers, 
  AuthPayload,
  User as GraphQLUser
} from "../generated/graphql";

type EmptyObject = Record<string, never>;

type UserParent = PrismaUser & { 
  posts?: Post[];
  comments?: Comment[];
  likes?: Like[];
};

type LoginArgs = {
  email: string;
  password: string;
};

type RegisterArgs = {
  email: string;
  password: string;
  username: string;
};

type UserIdArgs = {
  id: string;
};

const userQueries: Pick<UserResolvers<Context>["Query"], "user" | "users" | "me"> = {
  me: (_parent: EmptyObject, _args: EmptyObject, { user }: Context) => {
    return user;
  },

  user: async (_parent: EmptyObject, { id }: UserIdArgs, { prisma }: Context) => {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  users: async (_parent: EmptyObject, _args: EmptyObject, { prisma }: Context) => {
    return prisma.user.findMany();
  },
};

const userMutations: Pick<UserResolvers<Context>["Mutation"], "register" | "login"> = {
  register: async (_parent: EmptyObject, { email, password, username }: RegisterArgs, { prisma }: Context): Promise<AuthPayload> => {

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
    

    const prismaUser = await prisma.user.create({
      data: {
        email,
        password: await hashPassword(password),
        username,
        createdAt: new Date().toISOString(),
      },
    });
    
    const graphqlUser: GraphQLUser = {
      id: prismaUser.id,
      email: prismaUser.email,
      username: prismaUser.username,
      createdAt: prismaUser.createdAt instanceof Date 
        ? prismaUser.createdAt.toISOString() 
        : prismaUser.createdAt,
      posts: null,
      comments: null,
      likes: null,
    };
    
    return {
      token: generateToken(prismaUser),
      user: graphqlUser,
    };
  },

  login: async (_parent: EmptyObject, { email, password }: LoginArgs, { prisma }: Context): Promise<AuthPayload> => {

    const prismaUser = await prisma.user.findUnique({ where: { email } });
    if (!prismaUser) {
      throw new AuthenticationError('Invalid email or password');
    }
    

    const passwordValid = await verifyPassword(password, prismaUser.password);
    if (!passwordValid) {
      throw new AuthenticationError('Invalid email or password');
    }
    

    const graphqlUser: GraphQLUser = {
      id: prismaUser.id,
      email: prismaUser.email,
      username: prismaUser.username,
      createdAt: prismaUser.createdAt instanceof Date 
        ? prismaUser.createdAt.toISOString() 
        : prismaUser.createdAt,
      posts: null,
      comments: null,
      likes: null,
    };
    

    return {
      token: generateToken(prismaUser),
      user: graphqlUser,
    };
    
  },
};

const userFields: UserResolvers<Context>["User"] = {
  posts: (parent: UserParent, _args: EmptyObject, { prisma }: Context) => {
    if (parent.posts) {
      return parent.posts;
    }
    
    return prisma.post.findMany({ 
      where: { userId: parent.id } 
    });
  },
  
  comments: (parent: UserParent, _args: EmptyObject, { prisma }: Context) => {
    if (parent.comments) {
      return parent.comments;
    }
    
    return prisma.comment.findMany({ 
      where: { userId: parent.id } 
    });
  },
  
  likes: (parent: UserParent, _args: EmptyObject, { prisma }: Context) => {
    if (parent.likes) {
      return parent.likes;
    }
    
    return prisma.like.findMany({ 
      where: { userId: parent.id } 
    });
  }
};

export const userResolvers: UserResolvers<Context> = {
  Query: userQueries,
  Mutation: userMutations,
  User: userFields
} as UserResolvers<Context>;