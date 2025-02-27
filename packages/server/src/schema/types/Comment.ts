import { gql } from "apollo-server";

export const commentTypeDefs = gql`
  type Comment {
    id: ID!
    content: String!
    createdAt: String!
    updatedAt: String!
    user: User
    post: Post!
  }

  type Query {
    comment(id: ID!): Comment
    commentsByPost(postId: ID!): [Comment!]!
  }

  type Mutation {
    createComment(postId: ID!, content: String!): Comment!
  }
`;
