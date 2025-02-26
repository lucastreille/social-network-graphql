import { gql } from 'apollo-server';

export const typeDefs = gql`
    type User {
        id: ID!
        email: String!
        username: String!
        createdAt: String!
    }

    type AuthPayload {
        token: String!
        user: User!
    }

    type Post {
        id: ID!
        title: String!
        content: String!
        published: Boolean!
        createdAt: String!
        updatedAt: String!
        author: User!
        comments: [Comment!]!
        likes: [Like!]!
        likeCount: Int!
    }

    type Comment {
        id: ID!
        content: String!
        createdAt: String!
        updatedAt: String!
        author: User!
        post: Post!
    }

    type Like {
        id: ID!
        createdAt: String!
        user: User!
        post: Post!
    }

    type Query {
        me: User
        user(id: ID!): User
        users: [User!]!
    }

    type Mutation {
        register(email: String!, password: String!, username: String!): AuthPayload!
        login(email: String!, password: String!): AuthPayload!
    }
`;