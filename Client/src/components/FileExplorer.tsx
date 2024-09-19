import axios from "axios";
import React, { useEffect, useState } from "react";
import FileUpload from "./FileUpload";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

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
  const [loading, setLoading] = useState<boolean>(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [sharingFile, setSharingFile] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState("read");

  useEffect(() => {
    fetchFiles();
  }, [currentFolder]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/file/contents/${currentFolder || ""}`,
        { withCredentials: true }
      );
      setFiles(response.data.contents);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (fileId: string) => {
    setSharingFile(fileId);
  };

  const submitShare = async () => {
    if (!sharingFile) return;

    try {
      console.log("Sharing file:", sharingFile);
      await axios.post(
        "http://localhost:3000/share/share",
        {
          fileId: sharingFile,
          sharedWithEmail: shareEmail,
          permission: sharePermission,
        },
        {
          withCredentials: true,
        }
      );

      alert("File shared successfully");
      setSharingFile(null);
      setShareEmail("");
      setSharePermission("read");
    } catch (error) {
      console.error("Error sharing file:", error);
      alert("Error sharing file");
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

  const handleRename = async (id: string) => {
    setRenamingId(id);

    const file = files.find((f) => f._id === id);
    if (file) {
      setNewName(file.name);
    }
  };

  const submitRename = async () => {
    if (!renamingId || !newName.trim()) return;

    try {
      await axios.post(
        "http://localhost:3000/file/rename",
        {
          id: renamingId,
          newName: newName.trim(),
        },
        { withCredentials: true }
      );
      setRenamingId(null);
      setNewName("");
      fetchFiles();
    } catch (error) {
      console.error("Error renaming file/folder:", error);
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

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const movedItem = files.find((file) => file._id === draggableId);
    if (!movedItem) return;

    // If dropping into a folder
    if (destination.droppableId !== "file-list") {
      try {
        const newParentId =
          destination.droppableId === "root" ? "" : destination.droppableId;

        const payload = {
          fileId: draggableId,
          newParentId,
        };

        const response = await axios.post(
          "http://localhost:3000/file/move",
          payload,
          { withCredentials: true }
        );

        fetchFiles();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error response from backend:", error.response?.data);
        } else {
          console.error("Error moving file:", error);
        }
      }
    } else {
      // Reordering within the same folder
      const newFiles = Array.from(files);
      newFiles.splice(source.index, 1);
      newFiles.splice(destination.index, 0, movedItem);
      setFiles(newFiles);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="min-h-screen p-4 bg-gray-100">
        <h2 className="mb-4 text-2xl font-bold">File Explorer</h2>
        {currentFolder && (
          <button
            onClick={handleBackClick}
            className="px-4 py-2 mb-4 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Back
          </button>
        )}
        <div className="flex items-center mb-4">
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="New folder name"
            className="flex-grow p-2 mr-2 border rounded"
          />
          <button
            onClick={handleCreateFolder}
            className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
          >
            Create Folder
          </button>
        </div>
        <FileUpload parentId={currentFolder} onUploadComplete={fetchFiles} />
        {loading ? (
          <p>loading...</p>
        ) : (
          <Droppable droppableId={currentFolder || "root"}>
            {(provided) => (
              <ul
                className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {files.map((file, index) => (
                  <Draggable
                    key={file._id}
                    draggableId={file._id}
                    index={index}
                  >
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="p-4 bg-white rounded shadow cursor-pointer hover:bg-gray-100"
                        onClick={() => handleFileClick(file)}
                      >
                        {renamingId === file._id ? (
                          <div>
                            <input
                              type="text"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              onBlur={submitRename}
                              onKeyPress={(e) =>
                                e.key === "Enter" && submitRename()
                              }
                              autoFocus
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-2 bg-white rounded shadow cursor-pointer hover:bg-gray-100">
                            <div className="flex items-center">
                              <span className="mr-2 text-2xl">
                                {file.isFolder ? "📁" : "📄"}
                              </span>
                              <span className="flex-grow">{file.name}</span>
                              {!file.isFolder && (
                                <span className="ml-2 text-sm text-gray-500">
                                  {`(${(file.size / 1024 / 1024).toFixed(
                                    2
                                  )} MB)`}
                                </span>
                              )}
                            </div>
                            {sharingFile && (
                              <div className="fixed inset-0 z-10 overflow-y-auto">
                                <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                                  <div className="fixed inset-0 transition-opacity">
                                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                                  </div>
                                  <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
                                  &#8203;
                                  <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                    <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                                      <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                          <input
                                            type="email"
                                            value={shareEmail}
                                            onChange={(e) =>
                                              setShareEmail(e.target.value)
                                            }
                                            placeholder="Enter email to share with"
                                            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                                          />
                                          <select
                                            value={sharePermission}
                                            onChange={(e) =>
                                              setSharePermission(e.target.value)
                                            }
                                            className="block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-400 rounded shadow appearance-none hover:border-gray-500 focus:outline-none focus:shadow-outline"
                                          >
                                            <option value="read">Read</option>
                                            <option value="download">
                                              Download
                                            </option>
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
                                      <button
                                        onClick={submitShare}
                                        type="button"
                                        className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                      >
                                        Share
                                      </button>
                                      <button
                                        onClick={() => setSharingFile(null)}
                                        type="button"
                                        className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <button
                                className="px-2 py-1 text-white bg-yellow-500 rounded hover:bg-yellow-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRename(file._id);
                                }}
                              >
                                Rename
                              </button>
                              {!file.isFolder && (
                                <button
                                  className="px-2 py-1 text-white bg-indigo-500 rounded hover:bg-indigo-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare(file._id);
                                  }}
                                >
                                  Share
                                </button>
                              )}
                              {!file.isFolder && (
                                <button
                                  className="px-2 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(file._id);
                                  }}
                                >
                                  Download
                                </button>
                              )}
                              <button
                                className="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(file._id);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                        {file.isFolder && (
                          <Droppable droppableId={file._id}>
                            {(provided) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="p-2 mt-2 bg-gray-200 rounded"
                              >
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        )}
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        )}
      </div>
    </DragDropContext>
  );
};

export default FileExplorer;
