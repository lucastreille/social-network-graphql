import { useState, useEffect } from "react";
import { getToken, setToken, removeToken } from "../utils/auth";
import { useQuery, useApolloClient } from "@apollo/client";
import { GET_ME } from "../graphql/queries/users";
import { GetMeQuery } from "../generated/graphql";

interface User {
  id: string;
  username: string;
  email: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const client = useApolloClient();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useQuery<GetMeQuery>(GET_ME, {
    skip: !getToken(),
    fetchPolicy: "network-only",
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
    client.clearStore();
  };

  return { user, login, logout };
};
