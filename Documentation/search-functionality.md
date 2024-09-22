# Search Functionality Documentation

## Overview

This document outlines the search functionality implemented in the Cloud Storage Platform. The search feature allows users to quickly find files and folders based on various criteria.

## Search Architecture

The search functionality is built using MongoDB's text search capabilities, enhanced with custom indexing and query optimization techniques.

## Indexing

1. **Text Indexes**: 
   - Created on the `name` field of both File and Folder collections.
   - Additional fields like `tags` or `description` are included if present.

   Example:
   ```javascript
   db.files.createIndex({ name: "text", tags: "text" })
   db.folders.createIndex({ name: "text" })
   ```

2. **Compound Indexes**:
   - Created to support filtering and sorting operations.
   
   Example:
   ```javascript
   db.files.createIndex({ userId: 1, createdAt: -1 })
   ```

## Search Implementation

### Basic Search

1. Client sends a GET request to `/api/search` with a query parameter.
2. Server constructs a MongoDB text search query.
3. Results are returned, sorted by relevance.

Example query:
```javascript
db.files.find(
  { $text: { $search: queryString }, userId: currentUserId },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })
```

### Advanced Search

Supports additional parameters for refined searching:

- `type`: Filter by file or folder
- `extension`: Filter by file extension
- `size`: Filter by file size range
- `dateRange`: Filter by creation or modification date range

Example advanced query:
```javascript
db.files.find({
  $text: { $search: queryString },
  userId: currentUserId,
  mimeType: { $in: requestedTypes },
  size: { $gte: minSize, $lte: maxSize },
  createdAt: { $gte: startDate, $lte: endDate }
})
```

## Search API Endpoint

`GET /api/search`

Query Parameters:
- `q`: Search query string (required)
- `type`: 'file' or 'folder' (optional)
- `extension`: File extension (optional)
- `minSize`: Minimum file size in bytes (optional)
- `maxSize`: Maximum file size in bytes (optional)
- `startDate`: Start of date range (ISO 8601 format) (optional)
- `endDate`: End of date range (ISO 8601 format) (optional)
- `page`: Page number for pagination (default: 1)
- `limit`: Number of results per page (default: 20)

Response:
```json
{
  "results": [
    {
      "id": "file_id",
      "name": "filename.ext",
      "type": "file",
      "path": "/path/to/file",
      "size": 1024,
      "createdAt": "2023-01-01T00:00:00Z"
    },
    // ... more results
  ],
  "totalResults": 100,
  "currentPage": 1,
  "totalPages": 5
}
```

## Performance Optimizations

1. **Limit Fields**: Only return necessary fields to reduce payload size.
2. **Pagination**: Implement cursor-based pagination for efficient handling of large result sets.
3. **Caching**: Implement Redis caching for frequent search queries.
4. **Aggregation Pipeline**: Use MongoDB's aggregation pipeline for complex queries to improve performance.

## Search Relevance Tuning

1. **Field Weights**: Assign different weights to fields for more relevant results.
   ```javascript
   db.files.createIndex(
     { name: "text", description: "text" },
     { weights: { name: 10, description: 5 } }
   )
   ```

2. **Fuzzy Matching**: Implement fuzzy matching for typo tolerance.

3. **Synonyms**: Define synonyms for common terms to improve search accuracy.

## Background Indexing

For large datasets, implement background indexing processes to maintain search index without impacting system performance.

## Security Considerations

1. Ensure search results only include files/folders the user has permission to access.
2. Implement rate limiting on the search API to prevent abuse.
3. Sanitize and validate all user inputs to prevent injection attacks.

## Future Enhancements

1. Implement Elasticsearch for more advanced full-text search capabilities.
2. Add support for searching file contents (for text-based files).
3. Implement machine learning models for personalized search rankings.

This search functionality provides a powerful and flexible way for users to find their files and folders quickly and efficiently, with considerations for performance, relevance, and security.
