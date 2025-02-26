import { gql } from "@apollo/client";

export const ADD_LIKE = gql`
  mutation AddLike($postId: ID!) {
    addLike(postId: $postId)
  }
`;

export const ADD_DISLIKE = gql`
  mutation AddDislike($postId: ID!) {
    addDislike(postId: $postId)
  }
`;
