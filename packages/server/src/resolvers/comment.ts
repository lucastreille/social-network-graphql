import { Context } from "../utils/context";
import { AuthenticationError, UserInputError } from "apollo-server";
import { Comment as PrismaComment, User, Post } from "@prisma/client";

type CommentParent = PrismaComment & {
  user?: User;
  post?: Post;
};

interface CommentIdArgs {
  id: string;
}

interface CommentByPostArgs {
  postId: string;
}

interface CreateCommentArgs {
  postId: string;
  content: string;
}

export const commentResolvers = {
  Query: {
    comment: async (_parent: object, args: CommentIdArgs, { prisma }: Context) => {
      return await prisma.comment.findUnique({
        where: { id: args.id },
        include: { user: true, post: true }
      });
    },

    commentsByPost: async (_parent: object, args: CommentByPostArgs, { prisma }: Context) => {
      return await prisma.comment.findMany({
        where: { postId: args.postId },
        include: { user: true },
        orderBy: { createdAt: "asc" }
      });
    }
  },

  Mutation: {
    createComment: async (_parent: object, args: CreateCommentArgs, { prisma, user }: Context) => {
      if (!user) {
        throw new AuthenticationError("You must be logged in to comment");
      }

      const post = await prisma.post.findUnique({ where: { id: args.postId } });
      if (!post) {
        throw new UserInputError("Post not found");
      }

      return await prisma.comment.create({
        data: {
          content: args.content,
          post: { connect: { id: args.postId } },
          user: { connect: { id: user.id } }
        },
        include: {
          user: true,
          post: true
        }
      });
    },
  },

  Comment: {
    user: (parent: CommentParent, _args: object, { prisma }: Context) => {
      if (parent.user) {
        return parent.user;
      }
      
      return prisma.user.findUnique({ 
        where: { id: parent.userId } 
      });
    },
    
    post: (parent: CommentParent, _args: object, { prisma }: Context) => {
      if (parent.post) {
        return parent.post;
      }
      
      return prisma.post.findUnique({ 
        where: { id: parent.postId } 
      });
    }
  }
};