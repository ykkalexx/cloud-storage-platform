import React from "react";
import { useAuth } from "../hooks/useAuth";

import FileExplorer from "../components/FileExplorer";

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
      <FileExplorer />
    </div>
  );
};

export default Dashboard;
