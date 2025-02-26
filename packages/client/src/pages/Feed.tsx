import { useQuery, useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_POSTS, CREATE_POST } from "../graphql/mutations/posts";
import { ADD_LIKE, ADD_DISLIKE } from "../graphql/mutations/likes";
import { CREATE_COMMENT } from "../graphql/mutations/comments";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faThumbsDown } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUser } from "../redux/authSlice";
import "../styles/Feed.css";

interface CommentAuthor {
  username: string;
}

interface Comment {
  id: string;
  content: string;
  user: CommentAuthor;
}

interface PostUser {
  username: string;
  avatar?: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  likeCount?: number;
  dislikeCount?: number;
  createdAt: string;
  user: PostUser;
  comments: Comment[];
}

const Feed = () => {
  const [posts, setPostsState] = useState<Post[]>([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [commentTexts, setCommentTexts] = useState<{
    [postId: string]: string;
  }>({});
  const [sortByLikes, setSortByLikes] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();
  const user = useSelector(getUser);

  const { loading, error, data, refetch } = useQuery(GET_POSTS);
  const [createPost] = useMutation(CREATE_POST);
  const [addLike] = useMutation(ADD_LIKE);
  const [addDislike] = useMutation(ADD_DISLIKE);
  const [createComment] = useMutation(CREATE_COMMENT);

  useEffect(() => {
    if (data && data.posts) {
      setPostsState(data.posts);
    }
  }, [data]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error.message}</p>;

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPost({
        variables: { title: newPostTitle, content: newPostContent },
      });
      setNewPostTitle("");
      setNewPostContent("");
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await addLike({ variables: { postId } });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDislike = async (postId: string) => {
    try {
      await addDislike({ variables: { postId } });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentTexts[postId]?.trim()) return;
    try {
      await createComment({
        variables: { postId, content: commentTexts[postId] },
      });
      setCommentTexts({ ...commentTexts, [postId]: "" });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSortByLikes = () => {
    setSortByLikes(!sortByLikes);
  };

  const sortedPosts = sortByLikes
    ? [...posts].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
    : posts;

  return (
    <div className="feedContainer">
      <aside className="leftSidebar">
        <div className="profileSection">
          <img src="avatarProfile.png" alt="Profile" className="profileImage" />
          <div className="profileName">@{user ? user.username : "Guest"}</div>
        </div>
        <nav className="menu">
          <ul>
            <li>News Feed</li>
            <li>Messages</li>
            <li>Friends</li>
            <li>Groups</li>
            <li>Settings</li>
          </ul>
        </nav>
        <button className="deconnexion" onClick={handleLogout}>
          Deconnexion
        </button>
      </aside>

      <main className="mainFeed">
        <div className="feedsHeader">
          <div className="feedsTitle">Feeds</div>
          <div className="feedsTabs">
            <div
              className={`tab sortTab ${sortByLikes ? "active" : ""}`}
              onClick={handleSortByLikes}
            >
              Tri par like
            </div>
          </div>
        </div>

        <ul className="postList">
          {sortedPosts.map((post) => (
            <li className="postItem" key={post.id}>
              <div className="postUserInfo">
                <img
                  src={post.user.avatar || "avatarProfile2.jpg"}
                  alt="Profile"
                  className="profileImage"
                />
                <div>
                  <div className="postUserName">
                    {post.user.username || "Utilisateur inconnu"}
                  </div>
                  <div className="postTime">
                    {new Date(post.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
              <div className="postTitle">{post.title}</div>
              <div className="postContent">{post.content}</div>
              <div className="postActions">
                <div
                  className="postAction-line"
                  onClick={() => handleLike(post.id)}
                >
                  <FontAwesomeIcon icon={faHeart} />
                  {post.likeCount ?? 0}
                </div>
                <div
                  className="postAction-line"
                  onClick={() => handleDislike(post.id)}
                >
                  <FontAwesomeIcon icon={faThumbsDown} />
                  {post.dislikeCount ?? 0}
                </div>
                <div>Share</div>
              </div>

              {/* Display existing comments */}
              <div style={{ marginTop: "10px" }}>
                {post.comments.map((comment) => (
                  <div key={comment.id} style={{ marginBottom: "6px" }}>
                    <strong>
                      {comment.user?.username || "Utilisateur inconnu"}:
                    </strong>{" "}
                    {comment.content}
                  </div>
                ))}
              </div>

              {/* Add a comment */}
              <div style={{ marginTop: "10px" }}>
                <textarea
                  placeholder="Écrire un commentaire..."
                  value={commentTexts[post.id] || ""}
                  onChange={(e) =>
                    setCommentTexts({
                      ...commentTexts,
                      [post.id]: e.target.value,
                    })
                  }
                  rows={2}
                  style={{ width: "100%", resize: "none" }}
                />
                <button
                  style={{ marginTop: "5px" }}
                  onClick={() => handleAddComment(post.id)}
                >
                  Commenter
                </button>
              </div>
            </li>
          ))}
        </ul>
      </main>

      <aside className="rightSidebar">
        <div className="createPostSection">
          <h3>Créer un post</h3>
          <form onSubmit={handleCreatePost}>
            <input
              type="text"
              placeholder="Titre"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Contenu"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              required
            />
            <button type="submit">Publier</button>
          </form>
        </div>
      </aside>
    </div>
  );
};

export default Feed;
