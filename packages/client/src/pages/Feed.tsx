import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

import {
  useGetPostsQuery,
  useCreatePostMutation,
  useAddLikeMutation,
  useCreate_CommentMutation,
  useLikesQuery,
} from "../generated/graphql";

import "../styles/Feed.css";

const getColorForUser = (username: string): string => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 95%)`;
};

const Feed = () => {
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [commentTexts, setCommentTexts] = useState<{
    [postId: string]: string;
  }>({});
  const [sortByLikes, setSortByLikes] = useState(false);

  const [createPost] = useCreatePostMutation();
  const [addLike] = useAddLikeMutation();
  const [createComment] = useCreate_CommentMutation();

  const { data, loading, error, refetch } = useGetPostsQuery();
  const { data: likesData } = useLikesQuery();

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const posts = data?.posts ?? [];

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
    } catch (err) {}
  };

  const handleLike = async (postId: string) => {
    try {
      await addLike({ variables: { postId } });
      refetch();
      window.location.reload();
    } catch (err) {}
  };

  const handleAddComment = async (postId: string) => {
    if (!commentTexts[postId]?.trim()) return;
    try {
      await createComment({
        variables: {
          postId,
          content: commentTexts[postId],
          userId: user?.id || "",
        },
      });
      setCommentTexts({ ...commentTexts, [postId]: "" });
      refetch();
    } catch (err) {}
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSortByLikes = () => {
    setSortByLikes(!sortByLikes);
  };

  const sortedPosts = sortByLikes
    ? [...posts].sort((a, b) => b.likeCount - a.likeCount)
    : posts;

  return (
    <div className="feedContainer">
      <aside className="leftSidebar">
        <div className="profileSection">
          <img src="avatarProfile.png" alt="Profile" className="profileImage" />
          <div className="profileName">@{user?.username || "Guest"}</div>
        </div>
        <nav className="menu">
          <button className="deconnexion" onClick={handleLogout}>
            Déconnexion
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
            const likeUserIds =
              likesData?.likes
                .filter((like) => String(like.post.id) === String(post.id))
                .map((like) => String(like.user.id)) || [];
            const likedByCurrentUser = likeUserIds.includes(String(user?.id));

            const postDate = new Date(Number(post.createdAt));
            const datePart = postDate.toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });
            const timePart = postDate.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <li
                className="postItem"
                key={post.id}
                style={{ background: getColorForUser(post.user.username) }}
              >
                <div className="postHeader">
                  <img
                    src="avatarProfile2.jpg"
                    alt="Profile"
                    className="postAvatar"
                  />
                  <div>
                    <div className="postUserName">
                      {post.user.username || "Utilisateur inconnu"}
                    </div>
                    <div className="postTime">
                      {datePart} {timePart} • Public
                    </div>
                  </div>
                </div>

                <div className="postBubble">
                  {post.title && <div className="postTitle">{post.title}</div>}
                  <div className="postContent">{post.content}</div>
                </div>

                <div className="postActions">
                  <div
                    className={`actionItem ${
                      likedByCurrentUser ? "liked" : ""
                    }`}
                    onClick={() => handleLike(post.id)}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                    {post.likeCount} Likes
                  </div>
                  <div className="actionItem">
                    {(post.comments || []).length} Comments
                  </div>
                  <div className="actionItem" onClick={() => alert("SOON")}>
                    Share
                  </div>
                </div>

                <div className="commentSection">
                  <div className="commentTitle">Commentaire :</div>
                  {(post.comments || []).length === 0 ? (
                    <div className="noComments">Pas de commentaire</div>
                  ) : (
                    (post.comments || []).map((comment, index) => (
                      <div key={comment.id} className="commentItemWrapper">
                        <div className="commentItem">{comment.content}</div>
                        {index < (post.comments || []).length - 1 && (
                          <div className="commentSeparator"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="addCommentSection">
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
                  />
                  <button onClick={() => handleAddComment(post.id)}>
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
