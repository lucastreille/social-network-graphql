import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_POST_DETAIL } from '../graphql/queries/posts';
import { ADD_COMMENT } from '../graphql/mutations/comments';
import { useParams } from 'react-router-dom';

const PostDetail = () => {
  const { id } = useParams();
  const { data, loading, error } = useQuery(GET_POST_DETAIL, { variables: { id } });

  const [commentText, setCommentText] = useState('');
  const [addComment, { loading: addingComment }] = useMutation(ADD_COMMENT, {
    refetchQueries: [{ query: GET_POST_DETAIL, variables: { id } }],
  });

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment({ variables: { postId: id, content: commentText } });
    setCommentText('');
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error.message}</p>;

  return (
    <div>
      <h2>{data.getPost.title}</h2>
      <p><strong>Publié par :</strong> {data.getPost.author.email}</p>
      <p>{data.getPost.content}</p>

      <h3>Commentaires</h3>
      <ul>
        {data.getPost.comments.map((comment: any) => (
          <li key={comment.id}>
            <p><strong>{comment.author.email} :</strong> {comment.content}</p>
          </li>
        ))}
      </ul>

      <h3>Ajouter un commentaire</h3>
      <form onSubmit={handleAddComment}>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Écrire un commentaire..."
          rows={3}
        />
        <button type="submit" disabled={addingComment}>Publier</button>
      </form>
    </div>
  );
};

export default PostDetail;
