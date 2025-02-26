import { gql } from 'apollo-server';

export const UserTypes = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    createdAt: String!
    posts: [Post]
    comments: [Comment]
    likes: [Like]
  }
  type AuthPayload {
    token: String!
    user: User!
  }
`;