import { gql } from "@apollo/client";

export const CREATE_COMMENT = gql`
  mutation CREATE_COMMENT($postId: ID!, $content: String!, $userId: ID!) {
    createComment(postId: $postId, content: $content, userId: $userId) {
      id
      content
      user {
        id
        username
      }
    }
  }
`;
