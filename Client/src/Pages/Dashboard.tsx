import React from "react";
import { useAuth } from "../hooks/useAuth";

import FileExplorer from "../components/FileExplorer";
import SharedFiles from "../components/SharedFiles";
import PublicLinks from "../components/PublicLinks";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">
        Welcome to your Dashboard, {user?.username}!
      </h1>
      <p>
        This is a protected route. Only authenticated users can see this page.
      </p>
      <FileExplorer />
      <SharedFiles />
      <PublicLinks />
    </div>
  );
};

export default Dashboard;
