import { Context } from '../utils/context';
import { AuthenticationError, UserInputError } from 'apollo-server';
import { Post as PrismaPost, User, Comment, Like } from '@prisma/client';
import {
  PostResolvers,
  QueryPostArgs,
  MutationCreatePostArgs,
  MutationUpdatePostArgs,
  MutationDeletePostArgs
} from "../generated/graphql";


type PostParent = PrismaPost & { 
  user?: User;
  comments?: Comment[];
  likes?: Like[];
  userId: string;
};



type EmptyObject = Record<string, never>;

const postQueries: Pick<PostResolvers<Context>["Query"], "post" | "posts"> = {
  post: async (_parent: EmptyObject, args: QueryPostArgs, { prisma }: Context) => {
    return prisma.post.findUnique({
      where: { id: args.id },
      include: {
        user: true,
        comments: true,
        likes: true
      }
    });
  },

  posts: async (_parent: EmptyObject, _args: EmptyObject, { prisma }: Context) => {
    return prisma.post.findMany({
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
};




const postMutations: Pick<PostResolvers<Context>["Mutation"], "createPost" | "updatePost" | "deletePost"> = {
  createPost: async (_parent: EmptyObject, { title, content }: MutationCreatePostArgs, { prisma, user }: Context): Promise<string> => {
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

  updatePost: async (_parent: EmptyObject, { id, title, content }: MutationUpdatePostArgs, { prisma, user }: Context): Promise<string> => {
    if (!user) {
      throw new AuthenticationError("You must be logged in to update a post");
    }

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new UserInputError("Post not found");
    }

    if (post.userId !== user.id) {
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

  deletePost: async (_parent: EmptyObject, { id }: MutationDeletePostArgs, { prisma, user }: Context): Promise<string> => {
    if (!user) {
      throw new AuthenticationError("You must be logged in to delete a post");
    }

    const post = await prisma.post.findUnique({ where: { id } });
    
    if (!post) {
      throw new UserInputError("Post not found");
    }
    
    if (post.userId !== user.id) {
      throw new UserInputError("You can only delete your own post");
    }

    await prisma.post.delete({ where: { id } });

    return "Post deleted successfully";
  }
};

const postFields: PostResolvers<Context>["Post"] = {
  comments: (parent: PostParent, _args: EmptyObject, { prisma }: Context) => {
    if (parent.comments) {
      return parent.comments;
    }
    
    return prisma.comment.findMany({ 
      where: { postId: parent.id } 
    });
  },
  
  likes: (parent: PostParent, _args: EmptyObject, { prisma }: Context) => {
    if (parent.likes) {
      return parent.likes;
    }
    
    return prisma.like.findMany({ 
      where: { postId: parent.id } 
    });
  },

  user: (parent: PostParent, _args: EmptyObject, { prisma }: Context) => {
    if (parent.user) {
      return parent.user;
    }
    
    return prisma.user.findUnique({ 
      where: { id: parent.userId } 
    });
  }
};


export const postResolvers: PostResolvers<Context> = {
  Query: postQueries,
  Mutation: postMutations,
  Post: postFields
} as PostResolvers<Context>;