import { commentResolvers } from './comment';
import { likeResolvers } from './like';
import { postResolvers } from './post';
import { userResolvers } from './user';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...likeResolvers.Query,
    ...commentResolvers.Query,
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...likeResolvers.Mutation,
    ...commentResolvers.Mutation,
  },
  
  
};