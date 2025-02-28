import { useState, useEffect } from "react";
import { getToken, setToken, removeToken, getUserId } from "../utils/auth";
import { useQuery } from "@apollo/client";
import { GET_ME } from "../graphql/queries/users";
import { GetMeQuery } from "../generated/graphql";

interface User {
  id: string;
  username: string;
  email: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      setUser({ id: userId, username: "Chargement...", email: "" });
    }
  }, []);

  useQuery<GetMeQuery>(GET_ME, {
    skip: !!user,
    onCompleted: (data) => {
      if (data?.me) {
        const fetchedUser = {
          id: data.me.id,
          username: data.me.username,
          email: data.me.email,
        };
        setUser(fetchedUser);
        localStorage.setItem("user", JSON.stringify(fetchedUser));
      }
    },
  });

  const login = (token: string, userData: User) => {
    setToken(token, userData.id);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    removeToken();
    localStorage.removeItem("user");
    setUser(null);
  };

  return { user, login, logout };
};
