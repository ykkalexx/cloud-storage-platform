import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface RedirectIfAuthProps {
  children: React.ReactNode;
}

const RedirectIfAuthenticated: React.FC<RedirectIfAuthProps> = ({
  children,
}) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RedirectIfAuthenticated;
