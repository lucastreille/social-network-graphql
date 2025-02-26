import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost.tsx";

import Navbar from "./components/layout/Navbar";

import "./App.css";
import "./styles/navbar.css";
import "./styles/home.css";
import "./styles/feed.css";
import "./styles/post.css";
import "./styles/createpost.css";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/edit" element={<EditPost />} />
      </Routes>
    </Router>
  );
}

export default App;
