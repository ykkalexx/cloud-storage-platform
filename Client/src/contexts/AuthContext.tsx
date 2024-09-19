import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth/verify", {
          withCredentials: true,
        });

        setIsAuthenticated(true);

        setUser(response.data.user);
        setToken(response.data.token);
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async () => {
    try {
      const response = await axios.get("http://localhost:3000/auth/verify", {
        withCredentials: true,
      });
      setIsAuthenticated(true);
      setUser(response.data.user);
      setToken(response.data.token);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    }
  };

  const logout = async () => {
    await axios.post(
      "http://localhost:3000/auth/logout",
      {},
      { withCredentials: true }
    );
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, token, logout, login }}
    >
      {children}
    </AuthContext.Provider>
  );
};
