import { Context } from "../utils/context";
import { AuthenticationError, UserInputError } from "apollo-server";
import { Comment } from "@prisma/client";

interface CommentByIdArgs {
    id: string;
}

interface CommentByPostArgs {
    postId: string;
}

interface CreateCommentArgs {
    postId: string;
    content: string;
}

interface UpdateCommentArgs {
    id: string;
    content: string;
}

export const commentResolvers = {
    Query: {
        comment: async ( _: Record<string, never>,
            { id }: CommentByIdArgs, { prisma }: Context): Promise<Comment | null> => {
            return await prisma.comment.findUnique({
                where: { id },
                include: { user: true, post: true }
            });
        },

        commentsByPost: async (_: Record<string, never>,
            { postId }: CommentByPostArgs, { prisma }: Context): Promise<Comment[]> => {
            return await prisma.comment.findMany({
                where: { postId },
                include: { user: true },
                orderBy: { createdAt: "asc" }
            });
        }
    },

    Mutation: {
        createComment: async (
            _: Record<string, never>,
            { postId, content }: CreateCommentArgs,
            { prisma, user }: Context
        ): Promise<Comment> => {
            if (!user) {
                throw new AuthenticationError("You must be logged in to comment");
            }

            const post = await prisma.post.findUnique({ where: { id: postId } });
            if (!post) {
                throw new UserInputError("Post not found");
            }

            return await prisma.comment.create({
                data: {
                    content,
                    post: { connect: { id: postId } },
                    user: { connect: { id: user.id } }
                }
            });
        },
    }
};
