import { Context } from "../utils/context";
import { AuthenticationError, UserInputError } from "apollo-server";
import { Like, User, Post } from "@prisma/client";

export const likeResolvers = {
  Query: {
    like: async (_parent: object, args: { id: string }, { prisma }: Context) => {
      return await prisma.like.findUnique({
        where: { id: args.id },
        include: { user: true, post: true }
      });
    },

    likes: async (_parent: object, _args: object, { prisma }: Context) => {
      return await prisma.like.findMany({
        include: { user: true, post: true },
        orderBy: { createdAt: "desc" }
      });
    }
  },

  Mutation: {
    addLike: async (_parent: object, args: { postId: string }, { prisma, user }: Context): Promise<string> => {
      if (!user) {
        throw new AuthenticationError("You must be logged in to like a post");
      }

      const post = await prisma.post.findUnique({ where: { id: args.postId } });
      if (!post) {
        throw new UserInputError("Post not found");
      }

      const existingLike = await prisma.like.findFirst({
        where: { postId: args.postId, userId: user.id }
      });

      if (existingLike) {
        await prisma.like.delete({ where: { id: existingLike.id } });
        await prisma.post.update({
          where: { id: post.id },
          data: { likeCount: { decrement: 1 } }
        });
        return "Like removed";
      } else {
        await prisma.like.create({
          data: {
            post: { connect: { id: args.postId } },
            user: { connect: { id: user.id } }
          }
        });
        await prisma.post.update({
          where: { id: post.id },
          data: { likeCount: { increment: 1 } }
        });
        return "Post liked";
      }
    }
  },

  Like: {
    user: (parent: Like & { user?: User }, _args: object, { prisma }: Context) => {
      if (parent.user) {
        return parent.user;
      }
      return prisma.user.findUnique({ where: { id: parent.userId } });
    },
    
    post: (parent: Like & { post?: Post }, _args: object, { prisma }: Context) => {
      if (parent.post) {
        return parent.post;
      }
      return prisma.post.findUnique({ where: { id: parent.postId } });
    }
  }
};