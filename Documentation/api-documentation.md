# API Documentation

## Overview

This document outlines the RESTful API endpoints for the Cloud Storage Platform. The API is designed to handle user authentication, file operations, sharing, and search functionalities.

## Base URL

All API requests should be made to: `localhost:3000`

## Authentication

Most endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### User Authentication

#### POST /auth/register

Register a new user.

Request body:

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

Response:

```json
{
  "message": "User registered successfully",
  "userId": "string"
}
```

#### POST /auth/login

Authenticate a user and receive a JWT token.

Request body:

```json
{
  "email": "string",
  "password": "string"
}
```

Response:

```json
{
  "token": "string",
  "refreshToken": "string"
}
```

### File Operations

#### POST /files/upload

Upload a file. Requires authentication.

Request body (form-data):

- `file`: File to upload
- `parentFolderId` (optional): ID of the parent folder

Response:

```json
{
  "message": "File uploaded successfully",
  "fileId": "string"
}
```

#### GET /files/{fileId}

Retrieve file metadata. Requires authentication.

Response:

```json
{
  "id": "string",
  "name": "string",
  "size": "number",
  "mimeType": "string",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

#### GET /files/{fileId}/download

Download a file. Requires authentication.

Response: File data stream

#### DELETE /files/{fileId}

Delete a file. Requires authentication.

Response:

```json
{
  "message": "File deleted successfully"
}
```

### Folder Operations

#### POST /folders

Create a new folder. Requires authentication.

Request body:

```json
{
  "name": "string",
  "parentFolderId": "string (optional)"
}
```

Response:

```json
{
  "message": "Folder created successfully",
  "folderId": "string"
}
```

#### GET /folders/{folderId}/contents

List contents of a folder. Requires authentication.

Response:

```json
{
  "folders": [
    {
      "id": "string",
      "name": "string",
      "createdAt": "string (ISO date)"
    }
  ],
  "files": [
    {
      "id": "string",
      "name": "string",
      "size": "number",
      "mimeType": "string",
      "createdAt": "string (ISO date)"
    }
  ]
}
```

### Sharing

#### POST /share

Share a file or folder. Requires authentication.

Request body:

```json
{
  "resourceId": "string",
  "resourceType": "file" | "folder",
  "sharedWithEmail": "string",
  "permission": "read" | "write"
}
```

Response:

```json
{
  "message": "Resource shared successfully",
  "shareId": "string"
}
```

#### GET /share/with-me

List resources shared with the authenticated user.

Response:

```json
{
  "sharedResources": [
    {
      "id": "string",
      "name": "string",
      "type": "file" | "folder",
      "sharedBy": "string (email)",
      "permission": "read" | "write"
    }
  ]
}
```

### Search

#### GET /search

Search for files and folders. Requires authentication.

Query parameters:

- `q`: Search query string
- `type` (optional): "file" | "folder"
- `page` (optional): Page number for pagination
- `limit` (optional): Number of results per page

Response:

```json
{
  "results": [
    {
      "id": "string",
      "name": "string",
      "type": "file" | "folder",
      "path": "string"
    }
  ],
  "totalResults": "number",
  "currentPage": "number",
  "totalPages": "number"
}
```

## Error Responses

All endpoints may return the following error responses:

- 400 Bad Request: Invalid input data
- 401 Unauthorized: Missing or invalid authentication token
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Requested resource not found
- 500 Internal Server Error: Unexpected server error

Error response body:

```json
{
  "error": "string",
  "message": "string"
}
```

## Rate Limiting

API requests are limited to 100 requests per minute per user. Exceeding this limit will result in a 429 Too Many Requests response.

---

This API documentation provides a comprehensive overview of the available endpoints, request/response formats, and error handling. For detailed information about request and response schemas, please refer to the OpenAPI/Swagger specification.
