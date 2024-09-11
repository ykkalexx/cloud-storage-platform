import React from "react";
import { useAuth } from "../hooks/useAuth";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Welcome to your Dashboard, {user?.username}!
      </h1>
      <p>
        This is a protected route. Only authenticated users can see this page.
      </p>
    </div>
  );
};

export default Dashboard;
