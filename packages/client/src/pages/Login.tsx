import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN_MUTATION } from "../graphql/mutations/auth";
import { useAuth } from "../hooks/useAuth";
import { LoginMutation, LoginMutationVariables } from "../generated/graphql";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginMutation, { loading, error }] = useMutation<
    LoginMutation,
    LoginMutationVariables
  >(LOGIN_MUTATION);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginMutation({ variables: { email, password } });

      if (response.data?.login.token) {
        login(response.data.login.token, response.data.login.user);
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
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
        {error && <p className="error-message">{error.message}</p>}
      </form>
      <button type="button" onClick={() => navigate("/register")}>
        Créer un compte
      </button>
    </div>
  );
};

export default Login;
