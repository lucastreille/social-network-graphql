import { Context } from '../utils/context';
import { AuthenticationError, UserInputError } from 'apollo-server';
import { Post as PrismaPost, User, Comment, Like } from '@prisma/client';

type PostWithRelations = PrismaPost & { 
  user?: User;
  comments?: Comment[];
  likes?: Like[];
};

interface PostIdArgs {
  id: string;
}

interface CreatePostArgs {
  title: string;
  content: string;
}

interface UpdatePostArgs extends PostIdArgs {
  title: string;
  content: string;
}

type ResolverParent = Record<string, never>;

export const postResolvers = {
  
  Query: {
    post: async (_parent: ResolverParent, args: PostIdArgs, context: Context): Promise<PostWithRelations | null> => {
      const { prisma } = context;
      const { id } = args;
      
      return await prisma.post.findUnique({
        where: { id },
        include: {
          user: true,
          comments: true,
          likes: true
        }
      });
    },

    posts: async (_parent: ResolverParent, _args: Record<string, never>, context: Context): Promise<PostWithRelations[]> => {
      const { prisma } = context;
      
      return await prisma.post.findMany({
        include: {
          user: true,
          comments: true,
          likes: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    },
  },

  Mutation: {
    createPost: async (
      _parent: ResolverParent, 
      args: CreatePostArgs, 
      context: Context
    ): Promise<string> => {
      const { prisma, user } = context;
      const { title, content } = args;

      if (!user) {
        throw new AuthenticationError('You must be logged in to create a post');
      }

      await prisma.post.create({
        data: {
          title,
          content,
          user: { connect: { id: user.id } } 
        }
      });

      return "post crée avec succés";
    },

    updatePost: async (
      _parent: ResolverParent, 
      args: UpdatePostArgs, 
      context: Context
    ): Promise<string> => {
      const { prisma, user } = context;
      const { id, title, content } = args;

      if (!user) {
        throw new AuthenticationError("You must be logged in to update a post");
      }

      const post = await prisma.post.findUnique({
        where: { id },
      });

      if (!post) {
        throw new UserInputError("Post not found");
      }

      const postUserId = post.userId;

      if (postUserId !== user.id) {
        throw new UserInputError("You can only update your own post");
      }

      const updatedPost = await prisma.post.update({
        where: { id },
        data: {
          title: title ?? post.title,
          content: content ?? post.content,
        }
      });

      if (!updatedPost.id) {
        throw new Error("Post update failed, no ID returned.");
      }

      return "Post mis à jour";
    },

    deletePost: async (
      _parent: ResolverParent, 
      args: PostIdArgs, 
      context: Context
    ): Promise<string> => {
      const { prisma, user } = context;
      const { id } = args;

      if (!user) {
        throw new AuthenticationError("You must be logged in to delete a post");
      }

      const post = await prisma.post.findUnique({ where: { id } });
      
      if (!post) {
        throw new UserInputError("Post not found");
      }
      
      const postUserId = post.userId;

      if (postUserId !== user.id) {
        throw new UserInputError("You can only delete your own post");
      }

      await prisma.post.delete({ where: { id } });

      return "Post deleted successfully";
    }
  },

  // Résolveurs de type pour Post
  Post: {
    comments: (parent: PostWithRelations, _args: Record<string, never>, { prisma }: Context): Promise<Comment[]> => {
      // Si les commentaires sont déjà inclus via l'include de Prisma
      if (parent.comments) {
        return Promise.resolve(parent.comments);
      }
      
      // Sinon, chargez-les
      return prisma.comment.findMany({ 
        where: { postId: parent.id } 
      });
    },
    
    likes: (parent: PostWithRelations, _args: Record<string, never>, { prisma }: Context): Promise<Like[]> => {
      if (parent.likes) {
        return Promise.resolve(parent.likes);
      }
      
      return prisma.like.findMany({ 
        where: { postId: parent.id } 
      });
    },

    user: (parent: PostWithRelations, _args: Record<string, never>, { prisma }: Context): Promise<User | null> => {
      if (parent.user) {
        return Promise.resolve(parent.user);
      }
      
      return prisma.user.findUnique({ 
        where: { id: parent.userId } 
      });
    }
  }
};