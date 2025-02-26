import { gql } from '@apollo/client';

export const ADD_COMMENT = gql`
  mutation AddComment($postId: ID!, $content: String!) {
    addComment(postId: $postId, content: $content) {
      id
      content
      author {
        id
        email
      }
    }
  }
`;
