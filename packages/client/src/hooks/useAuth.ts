import { useState, useEffect } from 'react';
import { getToken, setToken, removeToken, getUserId } from '../utils/auth';

interface User {
  id: string;
  email: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getToken();
    const userId = getUserId();
    if (token && userId) {
      setUser({ id: userId, email: "Chargement..." });
    }
  }, []);

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
