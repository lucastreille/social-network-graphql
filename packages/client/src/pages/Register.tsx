import React, { useState } from "react";

import { useMutation } from "@apollo/client";
import { REGISTER_MUTATION } from "../graphql/mutations/auth";
import { useAuth } from "../hooks/useAuth";
import {
  RegisterMutation,
  RegisterMutationVariables,
} from "../generated/graphql";

import { useNavigate } from "react-router-dom";

import "../styles/Auth.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const [registerMutation, { loading, error }] = useMutation<
    RegisterMutation,
    RegisterMutationVariables
  >(REGISTER_MUTATION);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await registerMutation({
        variables: { username, email, password },
      });

      if (response.data?.register.token) {
        login(response.data.register.token, response.data.register.user);
        navigate("/profile");
      }
    } catch (err) {
      console.error("Erreur lors de l’inscription:", err);
    }
  };

  return (
    <div className="auth-container">
      <h2>Inscription</h2>
      <form className="auth-form" onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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
          S'inscrire
        </button>
        {error && <p className="error-message">{error.message}</p>}
      </form>
    </div>
  );
};

export default Register;
