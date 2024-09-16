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

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await axios.delete(`http://localhost:3000/file/folder/${folderId}`, {
        withCredentials: true,
      });
      setFiles(files.filter((file) => file._id !== folderId));
      alert("Folder deleted successfully");
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("Error deleting folder");
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

    console.log(destination.droppableId);

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

        console.log("Destination droppableId:", destination.droppableId);
        console.log("Payload being sent to backend:", payload);

        const response = await axios.post(
          "http://localhost:3000/file/move",
          payload,
          { withCredentials: true }
        );

        console.log("Response from backend:", response.data);
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
        {loading ? (
          <p>loading...</p>
        ) : (
          <Droppable droppableId={currentFolder || "root"}>
            {(provided) => (
              <ul
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4"
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
                        className="p-4 bg-white rounded shadow hover:bg-gray-100 cursor-pointer"
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
                          <div className="flex items-center justify-between p-2 bg-white rounded shadow hover:bg-gray-100 cursor-pointer">
                            <div className="flex items-center">
                              <span className="mr-2 text-2xl">
                                {file.isFolder ? "📁" : "📄"}
                              </span>
                              <span className="flex-grow">{file.name}</span>
                              {!file.isFolder && (
                                <span className="text-sm text-gray-500 ml-2">
                                  {`(${(file.size / 1024 / 1024).toFixed(
                                    2
                                  )} MB)`}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRename(file._id);
                                }}
                              >
                                Rename
                              </button>
                              {!file.isFolder && (
                                <button
                                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(file._id);
                                  }}
                                >
                                  Download
                                </button>
                              )}
                              <button
                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
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
