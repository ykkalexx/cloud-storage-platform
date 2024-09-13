import React, { useState, useEffect } from "react";
import axios from "axios";

interface File {
  _id: string;
  name: string;
  size: number;
  createdAt: string;
}

const FileList: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get("http://localhost:3000/file/list", {
          withCredentials: true,
        });
        setFiles(response.data);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);

  const handleDownload = async (fileId: string) => {
    try {
      const response = await axios.get(`/api/files/${fileId}`);
      window.open(response.data.url, "_blank");
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file");
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await axios.delete(`http://localhost:3000/file/delete/${fileId}`, {
        withCredentials: true,
      });
      setFiles(files.filter((file) => file._id !== fileId));
      alert("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Your Files</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <li
            key={file._id}
            className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <p className="text-lg font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              onClick={() => handleDownload(file._id)}
            >
              Download
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              onClick={() => handleDelete(file._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
