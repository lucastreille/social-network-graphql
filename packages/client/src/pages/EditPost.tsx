import { useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/editpost.css";

const EditPost = () => {
  const location = useLocation();
  const [postData, setPostData] = useState({
    description: location.state?.description || "",
  });

  const handleChange = (e) => {
    setPostData({ ...postData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Post updated (Front only, no backend yet)");
  };

  return (
    <div className="edit-post-container">
      <div className="edit-post">
        <h2>Edit Post</h2>
        <form onSubmit={handleSubmit}>
          <img src="image.png" alt="post" className="post-image" />
          <textarea
            name="description"
            placeholder="Edit caption..."
            value={postData.description}
            onChange={handleChange}
            required
          />
          <button type="submit">Update</button>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
