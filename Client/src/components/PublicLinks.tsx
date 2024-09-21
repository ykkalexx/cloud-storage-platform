import React, { useState, useEffect } from "react";
import axios from "axios";

interface PublicLink {
  _id: string;
  fileId: {
    _id: string;
    name: string;
  };
  token: string;
  expiresAt: string;
  downloads: number;
}

const PublicLinks: React.FC = () => {
  const [publicLinks, setPublicLinks] = useState<PublicLink[]>([]);

  useEffect(() => {}, []);

  const fetchPublicLinks = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/file/public-links",
        {
          withCredentials: true,
        }
      );
      setPublicLinks(response.data);
    } catch (error) {
      console.error("Error fetching public links:", error);
    }
  };

  const revokePublicLink = async (linkId: string) => {
    try {
      await axios.delete(`http://localhost:3000/file/public-link/${linkId}`);
      fetchPublicLinks();
    } catch (error) {
      console.error("Error revoking public link:", error);
    }
  };

  if (publicLinks.length === 0) {
    return <div>You haven't created any public links yet</div>;
  }

  return (
    <div className="p-6 bg-gray-100">
      <h2 className="mb-6 text-3xl font-bold">Public Links</h2>
      <ul className="space-y-4">
        {publicLinks.map((link) => (
          <li key={link._id} className="p-4 bg-white rounded shadow">
            <p className="mb-2">
              <strong>File:</strong> {link.fileId.name}
            </p>
            <p className="mb-2">
              <strong>Link:</strong>{" "}
              {`http://localhost:5173/public/files/${link.token}`}
            </p>
            <p className="mb-2">
              <strong>Expires:</strong>{" "}
              {new Date(link.expiresAt).toLocaleString()}
            </p>
            <p className="mb-2">
              <strong>Downloads:</strong> {link.downloads}
            </p>
            <button
              onClick={() => revokePublicLink(link._id)}
              className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
            >
              Revoke
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PublicLinks;
