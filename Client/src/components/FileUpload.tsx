import React, { useState } from "react";
import axios from "axios";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const uploadChunk = async (
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number
  ) => {
    const formData = new FormData();
    formData.append("chunk", chunk);
    formData.append("chunkIndex", chunkIndex.toString());
    formData.append("totalChunks", totalChunks.toString());
    formData.append("fileName", file!.name);

    await axios.post("http://localhost:3000/file/upload-chunk", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
  };

  const handleUpload = async () => {
    if (!file) return;

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    setUploading(true);

    try {
      for (let i = 0; i < totalChunks; i++) {
        const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        await uploadChunk(chunk, i, totalChunks);
        setProgress(((i + 1) / totalChunks) * 100);
      }

      await axios.post(
        "http://localhost:3000/file/complete-upload",
        {
          fileName: file.name,
          totalChunks: totalChunks,
        },
        {
          withCredentials: true,
        }
      );

      alert("File uploaded successfully");
      setProgress(0);
      setFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4">
      <input type="file" onChange={handleFileChange} className="mb-4" />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 ${
          uploading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {progress > 0 && <progress value={progress} max="100" />}
    </div>
  );
};

export default FileUpload;
