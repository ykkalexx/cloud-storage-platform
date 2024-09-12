This is a fantastic project idea! A cloud storage service like Dropbox or Google Drive with additional features like versioning, collaborative editing, and access control is an ambitious and highly valuable project, especially for someone pursuing computer games development. Let's break it down into a web app.

1. Core Structure of the Web App:
   To build this as a web app, you’ll need to break it down into backend, frontend, storage, and additional functionalities (like collaborative editing and version control). Here’s how it can be structured:

Backend:
The backend will handle file uploads/downloads, file versioning, user authentication, and access control.

API Design:
Use NodeJs Typescript to design REST or gRPC APIs to manage file operations.
The APIs will interact with the distributed file system (Ceph/MinIO) and handle metadata using MySQL.
File Storage & Retrieval:
Ceph or MinIO: Distributed storage will allow you to efficiently manage large-scale file storage. Files will be broken into chunks (for better upload/download speeds), and chunking will also allow for resumable uploads.
Database Management:
MySQL will handle metadata like user information, file ownership, permissions, and versioning info.
Redis can be used for caching frequently accessed metadata or user sessions to improve performance.
Version Control System:
Every time a file is updated, store a version in Ceph/MinIO and keep a record of the changes in the database (MySQL). You can also implement a rollback system here.
User Management and Authentication:
OAuth2 for secure user login and authentication.
Implement role-based access control (RBAC) to manage file sharing and access control for different users (read/write/share permissions).
Frontend:
The frontend will be where users interact with the service to upload/download files, manage versions, share files, and collaboratively edit documents.

Technologies:

Use React.js Typescript for building the user interface.
For collaborative editing use rich text editors for documents.
WebSockets for real-time collaborative editing so that multiple users can edit a file at the same time.
Features:

File upload/download management with chunking and progress bars for large files.
File version management where users can view, compare, and revert to older versions.
Sharing and permission control through intuitive UI for sharing files with specific roles (view/edit/share).
Storage System (AWS S3):
The distributed file system will be responsible for handling the actual file storage in the cloud.

Object Storage: Use AWS S3

Add websockets and collaborative to invite someone to work together one a document.

Chunking: For large files, split the file into smaller chunks on upload. Ensure chunking and resumable uploads are handled correctly.

Encryption: Ensure data is encrypted at rest (stored in the object storage) and during transit (using TLS/SSL).

3. Expansion with Collaborative Editing:
   Collaborative editing can be a standout feature for your cloud service. Here’s how you could implement it:

Real-time Collaborative Editing:
Use WebSockets or SignalR to handle real-time updates between multiple users. When one user makes changes to a document, the changes should be reflected for others in real time.

Integrate existing tools for collaborative editing. For example, Google Docs API.

4. Security and Access Control:
   Use OAuth2 for user authentication, and enforce Role-Based Access Control (RBAC) for managing access to files.

Ensure data integrity by generating hashes for each file chunk, verifying during upload/download if the chunk was transmitted correctly.

5. Scalability Considerations:
   Load Balancing: Use Kubernetes or Docker Swarm to manage the load across multiple instances of your application.
   Distributed File Storage: Make sure the file storage (Ceph or MinIO) is horizontally scalable.
   Caching: Use Redis as a caching layer for faster access to frequently used metadata and session information.
   Overall Architecture
