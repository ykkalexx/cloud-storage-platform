import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get("http://localhost:3000/auth/verify", {
          withCredentials: true,
        });
        console.log("yeah it works");
        setIsAuthenticated(true);
        console.log("isAuthenticated:", isAuthenticated);
        setUser(response.data.user);
        console.log("user:", user);
      } catch (error) {
        console.log("Auth status check failed", error);
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async () => {
    try {
      const response = await axios.get("/auth/verify", {
        withCredentials: true,
      });
      setIsAuthenticated(true);
      setUser(response.data.user);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const logout = async () => {
    await axios.post("/auth/logout", {}, { withCredentials: true });
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};
