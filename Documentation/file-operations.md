# File Operations Documentation

## Overview

This document details the file operations implemented in the Cloud Storage Platform. These operations cover uploading, downloading, updating, deleting, and managing files and folders.

## File Upload

### Single File Upload

1. Client sends a POST request to `/api/files/upload` with the file in the request body.
2. Server receives the file and processes it:
   - Generates a unique file name to avoid conflicts
   - Streams the file to AWS S3 for storage
   - Creates a metadata record in the MongoDB database
3. Server responds with the file ID and upload confirmation.

### Chunked File Upload (for large files)

1. Client splits large file into chunks (e.g., 5MB each).
2. For each chunk:
   - Client sends a POST request to `/api/files/upload-chunk` with chunk data and metadata (chunk number, total chunks, file name).
   - Server stores the chunk temporarily and updates the upload progress.
3. After all chunks are uploaded, client sends a POST request to `/api/files/complete-upload`.
4. Server assembles the chunks, uploads the complete file to S3, and creates the database record.

## File Download

1. Client sends a GET request to `/api/files/{fileId}/download`.
2. Server verifies user's permission to access the file.
3. If authorized, server generates a pre-signed URL for the S3 object.
4. Server responds with the pre-signed URL, which the client can use to download the file directly from S3.

## File Update

1. Client sends a PUT request to `/api/files/{fileId}` with updated metadata or file content.
2. Server verifies user's permission to modify the file.
3. If updating content:
   - Server uploads the new content to S3, replacing the old file
   - Updates the metadata in the database (e.g., size, modified date)
4. If updating metadata only, server updates the database record.

## File Delete

1. Client sends a DELETE request to `/api/files/{fileId}`.
2. Server verifies user's permission to delete the file.
3. If authorized:
   - Server deletes the file from S3
   - Removes the metadata record from the database
   - Removes any associated shares or public links

## Folder Operations

### Create Folder

1. Client sends a POST request to `/api/folders` with folder name and parent folder ID (if applicable).
2. Server creates a new folder record in the database.

### List Folder Contents

1. Client sends a GET request to `/api/folders/{folderId}/contents`.
2. Server queries the database for all files and subfolders within the specified folder.
3. Server responds with a list of files and folders, including metadata.

### Move File/Folder

1. Client sends a POST request to `/api/files/move` or `/api/folders/move` with the item ID and new parent folder ID.
2. Server updates the parent folder reference in the database.
3. If moving a folder, server recursively updates the path for all contained files and subfolders.

## File Sharing

### Create Share

1. Client sends a POST request to `/api/share` with file/folder ID and recipient details.
2. Server creates a new share record in the database, linking the resource to the recipient user.

### List Shares

1. Client sends a GET request to `/api/share/with-me` or `/api/share/by-me`.
2. Server queries the database for relevant share records and returns the list.

### Revoke Share

1. Client sends a DELETE request to `/api/share/{shareId}`.
2. Server removes the share record from the database.

## Public Link Generation

1. Client sends a POST request to `/api/files/{fileId}/public-link`.
2. Server generates a unique token and creates a public link record in the database.
3. Server responds with the public URL.

## Error Handling

- All operations include error handling for cases such as:
  - File not found
  - Unauthorized access
  - Quota exceeded
  - Network errors during upload/download
- Detailed error messages are logged server-side, while client receives appropriate HTTP status codes and error descriptions.

## Optimizations

- Implement caching for frequently accessed files to reduce S3 requests.
- Use AWS S3 Transfer Acceleration for improved upload/download speeds.
- Implement background jobs for time-consuming operations like moving large folders.

This file operations system provides a robust and scalable solution for managing files and folders in the Cloud Storage Platform, with considerations for performance, security, and user experience.
