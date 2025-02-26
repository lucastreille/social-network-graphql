import { useState } from "react";
import "../styles/createpost.css";

const CreatePost = () => {
  const [postData, setPostData] = useState({
    username: "rzsales",
    profileImage: "/profile.jpg",
    image: "",
    description: "",
  });

  const handleChange = (e) => {
    setPostData({ ...postData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Post created (Front only, no backend yet)");
  };

  return (
    <div className="create-post-container">
      <div className="create-post">
        <h2>Create a New Post</h2>
        <span>@{postData.username}</span>
        <form onSubmit={handleSubmit}>
          <img src="image.png" alt="post" className="post-image" />
          <textarea
            name="description"
            placeholder="Write a caption..."
            value={postData.description}
            onChange={handleChange}
            required
          />
          <button type="submit">Post</button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
