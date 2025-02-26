import { gql } from 'apollo-server';

export const likeTypeDefs = gql`
  type Like {
    id: ID!
    user: User!
    post: Post!
  }

  type Query {
    like(id: ID!): Like
    likes: [Like!]!
  }

  type Mutation {
    addLike(postId: ID!): String!
  }
`;
