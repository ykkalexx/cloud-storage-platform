import React, { useState } from "react";
import axios from "axios";

interface SearchResult {
  _id: string;
  name: string;
  size: number;
  mimeType: string;
  tags: string[];
  score?: number; // Make score optional
}

const Search: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/search?query=${encodeURIComponent(query)}`,
        {
          withCredentials: true,
        }
      );
      setResults(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error searching files:", error);
    }
  };

  return (
    <div className="relative w-full p-4 bg-gray-100">
      <div className="max-w-2xl mx-auto flex items-center space-x-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search files..."
          className="flex-grow p-2 border border-gray-300 rounded"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Search
        </button>
      </div>
      {results.length > 0 && (
        <ul className="mt-4 space-y-4">
          {results.map((file) => (
            <li key={file._id} className="p-4 bg-white rounded shadow">
              <p className="font-bold">{file.name}</p>
              <p className="text-sm text-gray-600">{file.mimeType}</p>
              <p className="text-sm text-gray-600">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-sm text-gray-600">
                Tags: {file.tags.join(", ")}
              </p>
              {file.score !== undefined && (
                <p className="text-sm text-gray-600">
                  Relevance: {file.score.toFixed(2)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;
