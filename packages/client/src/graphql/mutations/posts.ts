import { gql } from "@apollo/client";

export const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
      content
      likeCount
      createdAt
      user {
        username
      }
      comments {
        id
        content
        user {
          id
          username
        }
      }
    }
  }
`;

export const CREATE_POST = gql`
  mutation CreatePost($title: String!, $content: String!) {
    createPost(title: $title, content: $content)
  }
`;
