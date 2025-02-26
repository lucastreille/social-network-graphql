import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN_MUTATION } from "../graphql/mutations/auth";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../redux/authSlice";
import { useDispatch } from "react-redux";

import "../styles/Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginMutation, { loading, error }] = useMutation(LOGIN_MUTATION);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginMutation({ variables: { email, password } });

      if (response.data?.login.token) {
        const { token, user, email, id, username } = response.data.login;
        login(token, user);
        dispatch(
          setCredentials({
            token,
            user,
            email,
            username,
            id,
          })
        );
        navigate("/");
      }
    } catch (err) {
      console.error("Erreur de connexion:", err);
    }
  };

  return (
    <div className="auth-container">
      <h2>Connexion</h2>
      <form className="auth-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          Se connecter
        </button>
        {error && <p className="error-message">{error.message}</p>}
      </form>
    </div>
  );
};

export default Login;
