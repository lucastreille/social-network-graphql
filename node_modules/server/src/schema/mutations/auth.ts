import { gql } from 'apollo-server';

export const AuthMutations = gql`
  type Mutation {
    register(email: String!, password: String!, username: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }
`;