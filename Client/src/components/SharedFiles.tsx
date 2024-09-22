import React, { useState, useEffect } from "react";
import axios from "axios";

interface SharedFile {
  _id: string;
  fileId: {
    _id: string;
    name: string;
    isFolder: boolean;
  };
  ownerId: {
    username: string;
    email: string;
  };
  sharedWith: string;
  permission: string;
}

const SharedFiles: React.FC = () => {
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchedSharedFiles = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/share/shared", {
          withCredentials: true,
        });
        console.log(response.data);
        setSharedFiles(response.data.sharedFiles);
      } catch (error) {
        console.error("Error fetching shared files:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchedSharedFiles();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!Array.isArray(sharedFiles)) {
    return <div>Shared files data is not available</div>;
  }

  if (sharedFiles.length === 0) {
    return <div>No one shared a file with you yet</div>;
  }

  return (
    <div className="p-8 bg-gray-100">
      <h2 className="mb-4 text-2xl font-bold">Shared with me</h2>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {sharedFiles.map((share) => (
          <li key={share._id} className="p-4 bg-white border rounded-lg shadow">
            <div className="flex items-center mb-2 space-x-2">
              <span className="text-lg">
                {share.fileId.isFolder ? "📁" : "📄"}
              </span>
              <span className="font-medium text-gray-700">
                {share.fileId.name}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              <div>
                Shared by: {share.ownerId.username} ({share.ownerId.email})
              </div>
              <div>Permission: {share.permission}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SharedFiles;
