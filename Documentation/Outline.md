Cloud Storage Service Project Outline
Tech Stack

Backend: Node.js with TypeScript
Frontend: React.js with TypeScript
Database: MongoDb for metadata storage
Caching: Redis
Object Storage: AWS S3
Authentication: OAuth2
Real-time Communication: WebSockets

Systems to Implement

1. User Authentication and Authorization System

Implement user registration and login
Set up OAuth2 for secure authentication

2. File Storage and Retrieval System

Set up AWS S3 for object storage
Implement file upload and download functionality
Develop chunking mechanism for large files

3. Folders

Users can create and navigate through folders.
Files can be uploaded to specific folders.
The file explorer provides a familiar interface for users to manage their files and folders.
Implementing drag-and-drop functionality for moving files between folders.
Adding a breadcrumb navigation to show the current folder path.
Implementing file and folder renaming functionality.
Adding a search feature to find files across all folders.

4. File Sharing and Collaboration System

File Access Tracking: File owners can see in real-time when their files are viewed or downloaded.
Public Link Sharing

5. Search and Indexing System

Implement search functionality for files and metadata
Optimize search performance using indexing techniques
