import { Context } from "../utils/context";
import { AuthenticationError, UserInputError } from "apollo-server";
import { Comment as PrismaComment, User, Post } from "@prisma/client";
import { 
  CommentResolvers, 
  QueryCommentArgs, 
  QueryCommentsByPostArgs, 
  MutationCreateCommentArgs,
  ResolversParentTypes
} from "../generated/graphql";

// Type for Comment parent objects coming from Prisma
type CommentParent = PrismaComment & {
  user?: User;
  post?: Post;
  userId: string;
  postId: string;
};


type EmptyObject = Record<string, never>;


const commentQueries: Pick<CommentResolvers<Context>["Query"], "comment" | "commentsByPost"> = {
  comment: async (_parent: EmptyObject, args: QueryCommentArgs, { prisma }: Context) => {
    return prisma.comment.findUnique({
      where: { id: args.id },
      include: { user: true, post: true }
    });
  },

  commentsByPost: async (_parent: EmptyObject, args: QueryCommentsByPostArgs, { prisma }: Context) => {
    return prisma.comment.findMany({
      where: { postId: args.postId },
      include: { user: true },
      orderBy: { createdAt: "asc" }
    });
  }
};

const commentMutations: Pick<CommentResolvers<Context>["Mutation"], "createComment"> = {
  createComment: async (_parent: EmptyObject, { content, postId }: MutationCreateCommentArgs, { prisma, user }: Context) => {
    if (!user) {
      throw new AuthenticationError("You must be logged in to comment");
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new UserInputError("Post not found");
    }

    return prisma.comment.create({
      data: {
        content,
        post: { connect: { id: postId } },
        user: { connect: { id: user.id } }
      },
      include: {
        user: true,
        post: true
      }
    });
  },
};


const commentFields: CommentResolvers<Context>["Comment"] = {
  user: (parent: CommentParent, _args: EmptyObject, { prisma }: Context) => {
    if (parent.user) {
      return parent.user;
    }
    
    return prisma.user.findUnique({ 
      where: { id: parent.userId } 
    });
  },
  
  post: (parent: CommentParent, _args: EmptyObject, { prisma }: Context) => {
    if (parent.post) {
      return parent.post;
    }
    
    return prisma.post.findUnique({ 
      where: { id: parent.postId } 
    });
  }
};

export const commentResolvers: CommentResolvers<Context> = {
  Query: commentQueries,
  Mutation: commentMutations,
  Comment: commentFields
} as CommentResolvers<Context>;