import { gql } from "apollo-server";

export const postTypeDefs = gql`
  type Post {
    id: ID!
    title: String!
    content: String!
    createdAt: String!
    updatedAt: String!
    user: User!
    comments: [Comment!]
    likes: [Like!]
    likeCount: Int!
  }

  type Query {
    post(id: ID!): Post
    posts: [Post!]!
  }

  type Mutation {
    createPost(title: String!, content: String!): String!
    updatePost(id: ID!, title: String!, content: String!): String!
    deletePost(id: ID!): String!
  }
`;
