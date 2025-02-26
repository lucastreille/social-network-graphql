import { gql } from 'apollo-server';
import { postTypeDefs } from './types/Post';
import { commentTypeDefs } from './types/Comment';
import { likeTypeDefs } from './types/Like';

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

    ${postTypeDefs}
    ${commentTypeDefs}
    ${likeTypeDefs}

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