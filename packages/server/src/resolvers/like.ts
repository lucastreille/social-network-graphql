import { Context } from "../utils/context";
import { AuthenticationError, UserInputError } from "apollo-server";
import { Like } from "@prisma/client";

interface LikePostArgs {
    id: string;
}

interface CreateLikeArgs {
    postId: string;
}

export const likeResolvers = {
    Query: {
        like: async (_: unknown, { id }: LikePostArgs, { prisma }: Context): Promise<Like | null> => {
            return await prisma.like.findUnique({
                where: { id },
                include: { user: true, post: true }
            });
        },

        likes: async (_: unknown, __: unknown, { prisma }: Context): Promise<Like[]> => {
            return await prisma.like.findMany({
                include: { user: true, post: true },
                orderBy: { createdAt: "desc" }
            });
        }
    },

    Mutation: {
        addLike: async (
            _: Record<string, never>,
            { postId }: CreateLikeArgs,
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
                where: { postId, userId: user.id }
            });
    
            if (existingLike) {
                // Suppression du like existant
                await prisma.like.delete({ where: { id: existingLike.id } });
    
                // Décrémentation du compteur de likes
                await prisma.post.update({
                    where: { id: post.id },
                    data: {
                        likeCount: { decrement: 1 }
                    }
                });
    
                return "Like removed";
            } else {
                // Ajout du like
                await prisma.like.create({
                    data: {
                        post: { connect: { id: postId } },
                        user: { connect: { id: user.id } }
                    }
                });
    
                // Incrémentation du compteur de likes
                await prisma.post.update({
                    where: { id: post.id },
                    data: {
                        likeCount: { increment: 1 }
                    }
                });
    
                return "Post liked";
            }
        }
    }
}    