import { gql } from "@apollo/client";

export const GET_POSTS = gql`
  query GetPosts {
    getPosts {
      id
      title
      content
      author {
        id
        email
      }
    }
  }
`;

export const GET_POST_DETAIL = gql`
  query GetPostDetail($id: ID!) {
    getPost(id: $id) {
      id
      title
      content
      author {
        id
        email
      }
      comments {
        id
        content
        author {
          id
          email
        }
      }
    }
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
