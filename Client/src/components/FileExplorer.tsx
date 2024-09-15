import axios from "axios";
import React, { useEffect, useState } from "react";
import FileUpload from "./FileUpload";

interface FileItem {
  _id: string;
  name: string;
  isFolder: boolean;
  size: number;
}

const FileExplorer: React.FC = () => {
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folderName, setFolderName] = useState<string>("");

  useEffect(() => {
    fetchFiles();
  }, [currentFolder]);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/file/contents/${currentFolder || ""}`,
        { withCredentials: true }
      );
      setFiles(response.data.contents);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleCreateFolder = async () => {
    try {
      await axios.post(
        "http://localhost:3000/file/folder",
        {
          name: folderName,
          parentId: currentFolder,
        },
        { withCredentials: true }
      );
      setFolderName("");
      fetchFiles();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleFileClick = (file: FileItem) => {
    if (file.isFolder) {
      setCurrentFolder(file._id);
    } else {
      // Handle file download
    }
  };

  const handleBackClick = async () => {
    if (!currentFolder) return;
    try {
      const response = await axios.get(
        `http://localhost:3000/file/contents/${currentFolder || ""}`,
        { withCredentials: true }
      );
      setCurrentFolder(response.data.parent);
    } catch (error) {
      console.error("Error navigating back:", error);
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/file/${fileId}`, {
        withCredentials: true,
      });
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
    <div className="p-4 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">File Explorer</h2>
      {currentFolder && (
        <button
          onClick={handleBackClick}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back
        </button>
      )}
      <div className="mb-4 flex items-center">
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="New folder name"
          className="border p-2 rounded mr-2 flex-grow"
        />
        <button
          onClick={handleCreateFolder}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Create Folder
        </button>
      </div>
      <FileUpload parentId={currentFolder} onUploadComplete={fetchFiles} />
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {files.map((file) => (
          <li
            key={file._id}
            onClick={() => handleFileClick(file)}
            className="p-4 bg-white rounded shadow hover:bg-gray-100 cursor-pointer"
          >
            <div className="flex items-center">
              <span className="mr-2 text-2xl">
                {file.isFolder ? "📁" : "📄"}
              </span>
              <span className="flex-grow">{file.name}</span>
              {!file.isFolder && (
                <>
                  <span className="text-sm text-gray-500">
                    {`(${(file.size / 1024 / 1024).toFixed(2)} MB)`}
                  </span>
                  <button
                    className="ml-2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    onClick={() => handleDownload(file._id)}
                  >
                    Download
                  </button>
                  <button
                    className="ml-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDelete(file._id)}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileExplorer;
