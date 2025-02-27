import { gql } from "@apollo/client";

export const ADD_LIKE = gql`
  mutation AddLike($postId: ID!) {
    addLike(postId: $postId)
  }
`;

export const GET_LIKES = gql`
  query Likes {
    likes {
      user {
        id
      }
      post {
        id
      }
    }
  }
`;
