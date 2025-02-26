import { Context } from '../utils/context';
import { AuthenticationError, UserInputError } from 'apollo-server';
import { Post } from '@prisma/client';

interface PostByIdArgs {
    id: string;
}

interface CreatePostArgs {
    title: string;
    content: string;
}

interface UpdatePostArgs {
    id: string;
    title: string;
    content: string;
}

export const postResolvers = {
    Query: {
        post: async ({ id }: PostByIdArgs, { prisma }: Context): Promise<Post | null> => {
            return await prisma.post.findUnique({
                where: { id },
                include: {
                    user: true,
                    comments: true,
                    likes: true
                }
            });
        },

        posts: async ({ prisma }: Context): Promise<Post[]> => {
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
            _: Record<string, never>,
            { title, content }: CreatePostArgs,
            { prisma, user }: Context
        ): Promise<{ post: Post }> => {

            console.log(user)

            if (!user) {
                throw new AuthenticationError('You must be logged in to create a post');
            }

            const post = await prisma.post.create({
                data: {
                    title,
                    content,
                    user: { connect: { id: user.id } } 
                },
                include: {
                    user: true
                }
            });

            return { post };
        },

        updatePost: async (
            _: Record<string, never>,
            { id, title, content }: UpdatePostArgs,
            { prisma, user }: Context
        ): Promise<String> => {
            if (!user) {
                throw new AuthenticationError("You must be logged in to update a post");
            }

            const post = await prisma.post.findUnique({
                where: { id },
            });

            if (!post) {
                throw new UserInputError("Post not found");
            }

        
            const userPost = user
            const postUserId = post.userId


            // Vérification que l'utilisateur est le propriétaire du post
            if (postUserId !== userPost.id) {
                throw new UserInputError("You can only update your own post");
            }

            // Mise à jour du post avec les données fournies
            const updatedPost = await prisma.post.update({
                where: { id },
                data: {
                    title: title ?? post.title,  // Utilisation de l'ancien titre si aucun nouveau n'est fourni
                    content: content ?? post.content,  // Idem pour le contenu
                },
                include: {
                    user: true,
                }
            });

            console.log(post);  // Vérifiez la structure de l'objet retourné

            console.log(updatedPost);  // Vérifiez la structure de l'objet retourné

            console.log("Post fetched:", post);  // Vérifier la structure du post trouvé
            console.log("Updated post:", updatedPost);  // Vérifier la structure du post mis à jour
        
            // S'assurer que l'ID de updatedPost est non-null
            if (!updatedPost.id) {
                throw new Error("Post update failed, no ID returned.");
            }

            return "Post mis à jour ";
        },

          deletePost: async (
            _: Record<string, never>,
            { id }: PostByIdArgs,
            { prisma, user }: Context
        ): Promise<String> => {
            if (!user) {
                throw new AuthenticationError("You must be logged in to delete a comment");
            }

            const userPost = user
            const post = await prisma.post.findUnique({ where: { id } });
            if (!post) {
                throw new UserInputError("Post not found");
            }
            const postUserId = post.userId

            console.log(postUserId == userPost.id)
            if (postUserId !== userPost.id) {
                throw new UserInputError("You can only delete your own post");
            }

            await prisma.post.delete({ where: { id } });

            return "Post deleted successfully" ;
        }

    }
};
