import { Context } from "../utils/context";
import { AuthenticationError, UserInputError } from "apollo-server";
import { Like as PrismaLike, User, Post } from "@prisma/client";
import {
  LikeResolvers,
  QueryLikeArgs,
  MutationAddLikeArgs,
  ResolversParentTypes,
} from "../generated/graphql";

type LikeParent = PrismaLike & {
  user?: User;
  post?: Post;
  userId: string;
  postId: string;
};

type EmptyObject = Record<string, never>;

const likeQueries: Pick<LikeResolvers<Context>["Query"], "like" | "likes"> = {
  like: async (
    _parent: EmptyObject,
    args: QueryLikeArgs,
    { prisma }: Context
  ) => {
    return prisma.like.findUnique({
      where: { id: args.id },
      include: { user: true, post: true },
    });
  },

  likes: async (
    _parent: EmptyObject,
    _args: EmptyObject,
    { prisma }: Context
  ) => {
    return prisma.like.findMany({
      include: { user: true, post: true },
      orderBy: { createdAt: "desc" },
    });
  },
};

const likeMutations: Pick<LikeResolvers<Context>["Mutation"], "addLike"> = {
  addLike: async (
    _parent: EmptyObject,
    { postId }: MutationAddLikeArgs,
    { prisma, user }: Context
  ): Promise<string> => {
    if (!user) {
      throw new AuthenticationError("You must be logged in to like a post");
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new UserInputError("Post not found");
    }

    const existingLike = await prisma.like.findFirst({
      where: { postId, userId: user.id },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      await prisma.post.update({
        where: { id: post.id },
        data: { likeCount: { decrement: 1 } },
      });
      return "Like removed";
    } else {
      await prisma.like.create({
        data: {
          post: { connect: { id: postId } },
          user: { connect: { id: user.id } },
        },
      });
      await prisma.post.update({
        where: { id: post.id },
        data: { likeCount: { increment: 1 } },
      });
      return "Post liked";
    }
  },
};

const likeFields: LikeResolvers<Context>["Like"] = {
  user: (parent: LikeParent, _args: EmptyObject, { prisma }: Context) => {
    if (parent.user) {
      return parent.user;
    }
    return prisma.user.findUnique({ where: { id: parent.userId } });
  },

  post: (parent: LikeParent, _args: EmptyObject, { prisma }: Context) => {
    if (parent.post) {
      return parent.post;
    }
    return prisma.post.findUnique({ where: { id: parent.postId } });
  },
};

export const likeResolvers: LikeResolvers<Context> = {
  Query: likeQueries,
  Mutation: likeMutations,
  Like: likeFields,
} as LikeResolvers<Context>;
