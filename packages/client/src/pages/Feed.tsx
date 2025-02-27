import { useQuery, useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_POSTS, CREATE_POST } from "../graphql/mutations/posts";
import { ADD_LIKE } from "../graphql/mutations/likes";
import { CREATE_COMMENT } from "../graphql/mutations/comment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUser } from "../redux/authSlice";
import { GET_LIKES } from "../graphql/mutations/likes";

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
  createdAt: string;
  user: PostUser;
  comments: Comment[];
}

interface LikeData {
  user: { id: string };
  post: { id: string };
}

interface LikesQueryData {
  likes: LikeData[];
}

const getColorForUser = (username: string): string => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 95%)`;
};

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

  console.log("user", user);

  const { loading, error, data, refetch } = useQuery(GET_POSTS);
  const { data: likesData } = useQuery<LikesQueryData>(GET_LIKES);
  const [createPost] = useMutation(CREATE_POST);
  const [addLike] = useMutation(ADD_LIKE);
  const [createComment] = useMutation(CREATE_COMMENT);

  console.log("data", data);

  useEffect(() => {
    if (data && data.posts) setPostsState(data.posts);
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

  const handleAddComment = async (postId: string) => {
    if (!commentTexts[postId]?.trim()) return;
    try {
      await createComment({
        variables: {
          postId,
          content: commentTexts[postId],
          userId: user?.id,
        },
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
          <button className="deconnexion" onClick={handleLogout}>
            Deconnexion
          </button>
        </nav>
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
          {sortedPosts.map((post) => {
            // Pour chaque post, on récupère les IDs des utilisateurs ayant liké
            const likeUserIds =
              likesData?.likes
                .filter((like) => String(like.post.id) === String(post.id))
                .map((like) => String(like.user.id)) || [];
            // Si l'ID du user connecté est dans la liste, on met le cœur en rouge
            const likedByCurrentUser = likeUserIds.includes(String(user?.id));
            return (
              <li
                className="postItem"
                key={post.id}
                style={{ background: getColorForUser(post.user.username) }}
              >
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
                      {new Date(
                        Number(post.createdAt) * 1000
                      ).toLocaleTimeString([], {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
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
                    className={`postAction-line ${
                      likedByCurrentUser ? "liked" : ""
                    }`}
                    onClick={() => handleLike(post.id)}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                    {post.likeCount ?? 0}
                  </div>
                  <div>Share</div>
                </div>
                <div style={{ marginTop: "10px" }}>
                  {post.comments.map((comment) => (
                    <div key={comment.id} style={{ marginBottom: "6px" }}>
                      <strong>
                        {comment.user && comment.user.username
                          ? comment.user.username
                          : user?.username || "Utilisateur inconnu"}
                        :
                      </strong>

                      {comment.content}
                    </div>
                  ))}
                </div>
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
            );
          })}
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
