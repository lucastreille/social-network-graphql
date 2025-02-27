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
    const token = getToken();
    const userId = getUserId();

    if (token && userId) {
      setUser({
        id: userId,
        email: "Chargement...",
        username: "Chargement...",
      });
      setUser({ id: userId, username: "Chargement...", email: "" });
    }
  }, []);

  const { data } = useQuery<GetMeQuery>(GET_ME, {
    skip: !user || user.username !== "Chargement...",
    onCompleted: (data) => {
      if (data?.me) {
        setUser({
          id: data.me.id,
          username: data.me.username,
          email: data.me.email,
        });
      }
    },
  });

  const login = (token: string, userData: User) => {
    setToken(token, userData.id);
    setUser(userData);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return { user, login, logout };
};
