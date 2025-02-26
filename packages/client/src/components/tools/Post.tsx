import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencilAlt,
  faHeart,
  faComment,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/post.css";

const Post = ({ post }) => {
  const postRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const navigate = useNavigate();

  const handleClickOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleEditPost = () => {
    navigate("/edit", { state: { description: post.description } });
  };

  const handleLikePost = () => {
    setLikes(likes + 1);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, `${post.username}: ${newComment}`]);
      setNewComment("");
      setShowCommentModal(false);
    }
  };

  return (
    <div ref={postRef} className="post">
      <div className="post-header">
        <div className="post-user">
          <h3>{post.username}</h3>
        </div>
        <div className="post-options-wrapper">
          <button className="post-header-option" onClick={handleClickOptions}>
            ⋮
          </button>
          {showOptions && (
            <div className="post-options-menu">
              <button onClick={handleEditPost}>
                <FontAwesomeIcon icon={faPencilAlt} /> Edit Post
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="post-content">
        <img src={post.image} alt="post" className="post-image" />
      </div>
      <div className="post-actions">
        <button className="like-button" onClick={handleLikePost}>
          <FontAwesomeIcon icon={faHeart} className="heart-icon" /> {likes}
        </button>
        <button
          className="comment-button"
          onClick={() => setShowCommentModal(true)}
        >
          <FontAwesomeIcon icon={faComment} />
        </button>
      </div>
      <pre>{post.description}</pre>
      <div className="post-header-separator" />
      <div className="post-comments">
        {comments.map((comment, index) => (
          <p key={index}>{comment}</p>
        ))}
      </div>
      {showCommentModal && (
        <div
          className="comment-modal-overlay"
          onClick={() => setShowCommentModal(false)}
        >
          <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-modal"
              onClick={() => setShowCommentModal(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h3>Ajouter un commentaire</h3>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Écrire un commentaire..."
            />
            <button onClick={handleAddComment}>Commenter</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
