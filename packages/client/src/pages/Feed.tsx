import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faTimes } from "@fortawesome/free-solid-svg-icons";
import Post from "../components/tools/Post";
import "../styles/feed.css";

const Feed = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      username: "dhirmmo27nd",
      image: "image.png",
      likes: 124,
      description: "Conquer the great outdoors one trail at a time!",
    },
    {
      id: 2,
      username: "dhirmmo27nd",
      image: "image.png",
      likes: 98,
      description: "Explore the beauty of nature!",
    },
    {
      id: 3,
      username: "dhirmmo27nd",
      image: "image.png",
      likes: 200,
      description: "Adventure awaits!",
    },
    {
      id: 4,
      username: "dhirmmo27nd",
      image: "image.png",
      likes: 150,
      description: "Take only pictures, leave only footprints!",
    },
  ]);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortByLikes, setSortByLikes] = useState(false);

  const handleSortChange = () => {
    setSortByLikes(!sortByLikes);
    setShowSortModal(false);
    setPosts((prevPosts) =>
      [...prevPosts].sort((a, b) =>
        sortByLikes ? a.id - b.id : b.likes - a.likes
      )
    );
  };

  const handleLikePost = (postId) => {
    setPosts((prevPosts) => {
      const updatedPosts = prevPosts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      );
      return sortByLikes
        ? [...updatedPosts].sort((a, b) => b.likes - a.likes)
        : updatedPosts;
    });
  };

  return (
    <div className="feed-container">
      <div className="feed-header">
        <button className="sort-button" onClick={() => setShowSortModal(true)}>
          <FontAwesomeIcon icon={faSort} />
        </button>
      </div>
      {showSortModal && (
        <div
          className="sort-modal-overlay"
          onClick={() => setShowSortModal(false)}
        >
          <div className="sort-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-modal"
              onClick={() => setShowSortModal(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <label>
              <input
                type="checkbox"
                checked={sortByLikes}
                onChange={handleSortChange}
              />
              Trier par likes
            </label>
          </div>
        </div>
      )}
      <div className="feed">
        {posts.map((post) => (
          <Post key={post.id} post={post} onLike={handleLikePost} />
        ))}
      </div>
    </div>
  );
};

export default Feed;
