import axios from "axios";
import React, { useEffect, useState } from "react";
import FileUpload from "./FileUpload";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { getSocket } from "../services/websockes";

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
  const [creatingPublicLink, setCreatingPublicLink] = useState<string | null>(
    null
  );
  const [publicLinkExpiration, setPublicLinkExpiration] = useState(24); // set a default of 24 hours

  const handleCreatePublicLink = async (fieldId: string) => {
    setCreatingPublicLink(fieldId);
  };

  const submitCreatePublicLink = async () => {
    if (!creatingPublicLink) return;
    console.log(creatingPublicLink);
    console.log(publicLinkExpiration);
    try {
      const response = await axios.post(
        "http://localhost:3000/file/public-link",
        { fileId: creatingPublicLink, expiresIn: publicLinkExpiration },
        { withCredentials: true }
      );

      alert(`Public link created: ${response.data.link}`);
      setCreatingPublicLink(null);
      setPublicLinkExpiration(24);
    } catch (error) {
      console.error("Error creating public link:", error);
      alert("Error creating public link");
    }
  };

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

  useEffect(() => {
    const socket = getSocket();

    socket.on("file_updated", (data) => {
      if (data.type === "add") {
        setFiles((prevFiles) => [...prevFiles, data.file]);
      } else if (data.type === "delete") {
        setFiles((prevFiles) =>
          prevFiles.filter((file) => file._id !== data.fileId)
        );
      }
      // Handle 'move' if needed
    });

    return () => {
      socket.off("file_updated");
    };
  }, []);

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
      const response = await axios.get(
        `http://localhost:3000/file/download/${fileId}`,
        {
          withCredentials: true,
        }
      );
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
      <div className="min-h-screen p-6 bg-gray-100">
        <h2 className="mb-6 text-3xl font-bold">File Explorer</h2>
        {currentFolder && (
          <button
            onClick={handleBackClick}
            className="px-4 py-2 mb-6 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Back
          </button>
        )}
        <div className="flex items-center mb-6 space-x-4">
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="New folder name"
            className="flex-grow p-2 border rounded"
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
          <p>Loading...</p>
        ) : (
          <Droppable droppableId={currentFolder || "root"}>
            {(provided) => (
              <ul
                className="flex flex-col gap-4 mt-6"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {creatingPublicLink && (
                  <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="p-6 bg-white rounded">
                      <input
                        type="number"
                        value={publicLinkExpiration}
                        onChange={(e) =>
                          setPublicLinkExpiration(parseInt(e.target.value))
                        }
                        placeholder="Expiration time in hours"
                        className="w-full p-2 mb-4 border rounded"
                      />
                      <div className="flex items-center justify-end space-x-4">
                        <button
                          onClick={submitCreatePublicLink}
                          className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                        >
                          Create Public Link
                        </button>
                        <button
                          onClick={() => setCreatingPublicLink(null)}
                          className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {sharingFile && (
                  <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="p-6 bg-white rounded">
                      <input
                        type="email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        placeholder="Email to share with"
                        className="w-full p-2 mb-4 border rounded"
                      />
                      <select
                        value={sharePermission}
                        onChange={(e) => setSharePermission(e.target.value)}
                        className="w-full p-2 mb-4 border rounded"
                      >
                        <option value="read">Read</option>
                        <option value="write">Write</option>
                      </select>
                      <div className="flex items-center justify-end space-x-4">
                        <button
                          onClick={submitShare}
                          className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                        >
                          Share
                        </button>
                        <button
                          onClick={() => setSharingFile(null)}
                          className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
                              className="w-full p-2 border rounded"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl">
                                  {file.isFolder ? "📁" : "📄"}
                                </span>
                                <span className="font-medium">{file.name}</span>
                                {!file.isFolder && (
                                  <span className="text-sm text-gray-500">
                                    {`(${(file.size / 1024 / 1024).toFixed(
                                      2
                                    )} MB)`}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-row items-center justify-center gap-10">
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
                                  className="px-2 py-1 text-white bg-indigo-500 rounded hover:bg-indigo-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCreatePublicLink(file._id);
                                  }}
                                >
                                  Create Public Link
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
