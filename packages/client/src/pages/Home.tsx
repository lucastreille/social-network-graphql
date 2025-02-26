import "../styles/home.css";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: -50,
        duration: 1,
        ease: "power2.out",
      });
      gsap.from(textRef.current, {
        opacity: 0,
        y: -30,
        delay: 0.5,
        duration: 1,
        ease: "power2.out",
      });
      gsap.from(buttonRef.current, {
        opacity: 0,
        scale: 0.8,
        delay: 1,
        duration: 0.5,
        ease: "bounce.out",
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="home" key={Math.random()}>
      <div className="overlay">
        <h1 ref={titleRef}>🚀 Connecte-toi, Partage & Inspire 🌍</h1>
        <p ref={textRef}>
          Rejoins une communauté dynamique où tu peux échanger des idées,
          partager des moments forts et découvrir des tendances inédites. 📲✨
        </p>
        <button
          ref={buttonRef}
          className="cta"
          onClick={() => navigate("/feed")}
        >
          💬 Commencer l'aventure
        </button>
      </div>
    </div>
  );
};

export default Home;
