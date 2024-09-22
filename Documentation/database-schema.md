# Database Schema Documentation

## Overview

This document outlines the database schema for the Cloud Storage Platform. The application uses MongoDB, a NoSQL database, with Mongoose as the ODM (Object Document Mapper).

## Collections

### Users

Stores information about registered users.

```javascript
{
  _id: ObjectId,
  username: String,
  email: {
    type: String,
    unique: true
  },
  password: String, // Hashed
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  isVerified: Boolean,
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}
```

Indexes:
- email: unique index

### Files

Stores metadata about uploaded files.

```javascript
{
  _id: ObjectId,
  name: String,
  key: String, // S3 object key
  size: Number,
  mimeType: String,
  userId: ObjectId, // Reference to Users collection
  parentFolderId: ObjectId, // Reference to Folders collection
  isPublic: Boolean,
  publicUrl: String,
  createdAt: Date,
  updatedAt: Date,
  lastAccessed: Date
}
```

Indexes:
- userId: index
- parentFolderId: index
- name: text index for search functionality

### Folders

Represents folder structure in the storage system.

```javascript
{
  _id: ObjectId,
  name: String,
  userId: ObjectId, // Reference to Users collection
  parentFolderId: ObjectId, // Reference to Folders collection (self-referential)
  path: String, // Full path of the folder
  createdAt: Date,
  updatedAt: Date
}
```

Indexes:
- userId: index
- parentFolderId: index
- path: unique index

### Shares

Tracks file and folder sharing between users.

```javascript
{
  _id: ObjectId,
  resourceId: ObjectId, // Reference to either Files or Folders
  resourceType: String, // 'file' or 'folder'
  ownerId: ObjectId, // Reference to Users collection
  sharedWithId: ObjectId, // Reference to Users collection
  permission: String, // 'read' or 'write'
  createdAt: Date,
  expiresAt: Date // Optional expiration date for the share
}
```

Indexes:
- resourceId: index
- ownerId: index
- sharedWithId: index

### PublicLinks

Manages public sharing links for files.

```javascript
{
  _id: ObjectId,
  fileId: ObjectId, // Reference to Files collection
  userId: ObjectId, // Reference to Users collection
  token: String, // Unique token for the public link
  expiresAt: Date,
  createdAt: Date,
  lastAccessed: Date,
  accessCount: Number
}
```

Indexes:
- fileId: index
- token: unique index

### ChunkedUploads

Tracks progress of large file uploads that are split into chunks.

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users collection
  fileName: String,
  fileSize: Number,
  mimeType: String,
  chunkSize: Number,
  totalChunks: Number,
  uploadedChunks: [Number],
  createdAt: Date,
  updatedAt: Date,
  expiresAt: Date // Time after which incomplete upload can be cleaned up
}
```

Indexes:
- userId: index
- expiresAt: index for cleanup operations

## Relationships

- Users (1) -> (N) Files
- Users (1) -> (N) Folders
- Folders (1) -> (N) Files
- Folders (1) -> (N) Folders (self-referential for nested folders)
- Users (1) -> (N) Shares (as owner)
- Users (1) -> (N) Shares (as shared with)
- Files (1) -> (N) PublicLinks
- Users (1) -> (N) ChunkedUploads

## Notes

1. All `_id` fields are MongoDB ObjectIds.
2. Dates are stored as ISODate objects in MongoDB.
3. Passwords are hashed before storage for security.
4. The `path` field in the Folders collection helps with efficient querying of nested folder structures.
5. The ChunkedUploads collection allows for resumable uploads of large files.

This schema is designed to efficiently support the core functionalities of the Cloud Storage Platform, including file management, folder organization, sharing, and large file uploads.
