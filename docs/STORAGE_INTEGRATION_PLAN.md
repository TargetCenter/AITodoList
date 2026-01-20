# Storage Integration Plan

## Overview

This document outlines the plan for integrating multiple storage backends for the todo task management system. Currently, the system uses localStorage for data persistence. The goal is to support multiple storage options to provide flexibility for different use cases.

## Current State

- **Storage**: LocalStorage (browser-based)
- **File Manager**: [`fileManager.js`](file:///workspace/src/utils/fileManager.js)
- **Data Format**: JSON with Markdown content
- **Persistence**: Automatic save to localStorage

## Target Storage Backends

### 1. Supabase Integration

**Status**: Package installed but not configured

**Implementation Plan**:

#### Phase 1: Configuration
- [ ] Create `.env` file with Supabase credentials
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_SERVICE_KEY` (for admin operations)
- [ ] Update [`supabaseClient.ts`](file:///workspace/src/utils/supabaseClient.ts) with proper error handling

#### Phase 2: Database Schema
```sql
-- Create tables
CREATE TABLE todo_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  todo_group_id UUID REFERENCES todo_groups(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  start_time TIMESTAMP WITH TIME ZONE,
  planned_time VARCHAR(50),
  dependencies TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_todo_groups_user_id ON todo_groups(user_id);
CREATE INDEX idx_tasks_todo_group_id ON tasks(todo_group_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- Enable RLS (Row Level Security)
ALTER TABLE todo_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own todo groups"
  ON todo_groups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todo groups"
  ON todo_groups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todo groups"
  ON todo_groups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todo groups"
  ON todo_groups FOR DELETE
  USING (auth.uid() = user_id);
```

#### Phase 3: Implementation
- [ ] Create `src/utils/supabaseStorage.js` - Supabase storage adapter
- [ ] Implement CRUD operations:
  - `createTodoGroup(name, content)`
  - `getTodoGroups(userId)`
  - `getTodoGroup(id)`
  - `updateTodoGroup(id, content)`
  - `deleteTodoGroup(id)`
- [ ] Add authentication flow (login/signup)
- [ ] Create storage selector in UI
- [ ] Implement data synchronization between localStorage and Supabase

#### Phase 4: Features
- [ ] Real-time updates using Supabase Realtime
- [ ] Offline support with conflict resolution
- [ ] File attachments using Supabase Storage
- [ ] User collaboration features

#### Benefits
- Cloud-based storage with automatic sync
- User authentication and multi-device support
- Real-time collaboration
- Built-in database features (indexes, RLS)

---

### 2. Neo4j Integration

**Status**: Not started

**Implementation Plan**:

#### Phase 1: Setup
- [ ] Install Neo4j driver: `npm install neo4j-driver`
- [ ] Create `.env` file with Neo4j credentials
  - `VITE_NEO4J_URI`
  - `VITE_NEO4J_USER`
  - `VITE_NEO4J_PASSWORD`

#### Phase 2: Database Schema
```cypher
// Create constraints
CREATE CONSTRAINT todo_group_id IF NOT EXISTS FOR (tg:Todogroup) REQUIRE tg.id IS UNIQUE;
CREATE CONSTRAINT task_id IF NOT EXISTS FOR (t:Task) REQUIRE t.id IS UNIQUE;

// Create indexes
CREATE INDEX task_completed IF NOT EXISTS FOR (t:Task) ON (t.completed);
CREATE INDEX task_start_time IF NOT EXISTS FOR (t:Task) ON (t.start_time);

// Data model
(:TodoGroup {id, name, content, userId, createdAt, updatedAt})
(:Task {id, title, completed, startTime, plannedTime, createdAt, updatedAt})
(:User {id, username, email})

// Relationships
(:TodoGroup)-[:HAS_TASK]->(:Task)
(:Task)-[:DEPENDS_ON]->(:Task)
(:User)-[:OWNS]->(:TodoGroup)
```

#### Phase 3: Implementation
- [ ] Create `src/utils/neo4jStorage.js` - Neo4j storage adapter
- [ ] Implement CRUD operations:
  - `createTodoGroup(name, content, userId)`
  - `getTodoGroups(userId)`
  - `getTodoGroup(id)`
  - `updateTodoGroup(id, content)`
  - `deleteTodoGroup(id)`
  - `getTaskDependencies(taskId)` - Get dependency graph
- [ ] Implement Cypher queries for complex operations
- [ ] Add graph visualization enhancements using Neo4j data

#### Phase 4: Advanced Features
- [ ] Path finding algorithms (shortest path between tasks)
- [ ] Centrality analysis (identify critical tasks)
- [ ] Community detection (group related tasks)
- [ ] Temporal queries (time-based task analysis)

#### Benefits
- Native graph database for task dependencies
- Powerful graph algorithms and queries
- Natural fit for relationship visualization
- Scalable for large task graphs

---

### 3. CNB (Cloud Native Buildpacks) Integration

**Status**: Not started

**Implementation Plan**:

#### Phase 1: Understanding CNB
- [ ] Research CNB storage capabilities
- [ ] Evaluate if CNB is suitable for this use case
- [ ] Consider alternative cloud storage solutions

#### Phase 2: Alternative Approach
Since CNB is primarily for building applications, consider using:
- **AWS S3** for file storage
- **Google Cloud Storage** for file storage
- **Azure Blob Storage** for file storage

#### Phase 3: Implementation (using S3 as example)
- [ ] Install AWS SDK: `npm install @aws-sdk/client-s3`
- [ ] Create `.env` file with AWS credentials
  - `VITE_AWS_ACCESS_KEY_ID`
  - `VITE_AWS_SECRET_ACCESS_KEY`
  - `VITE_AWS_REGION`
  - `VITE_AWS_S3_BUCKET`
- [ ] Create `src/utils/s3Storage.js` - S3 storage adapter
- [ ] Implement CRUD operations:
  - `uploadTodoGroup(filename, content)`
  - `downloadTodoGroup(filename)`
  - `listTodoGroups()`
  - `deleteTodoGroup(filename)`
- [ ] Add versioning support
- [ ] Implement backup and restore functionality

#### Benefits
- Scalable cloud storage
- Version control for files
- Easy backup and restore
- Multi-region support

---

### 4. GitHub Issues Integration

**Status**: Not started

**Implementation Plan**:

#### Phase 1: Setup
- [ ] Install Octokit: `npm install octokit`
- [ ] Create `.env` file with GitHub credentials
  - `VITE_GITHUB_TOKEN`
  - `VITE_GITHUB_OWNER`
  - `VITE_GITHUB_REPO`

#### Phase 2: Implementation
- [ ] Create `src/utils/githubStorage.js` - GitHub Issues storage adapter
- [ ] Implement CRUD operations:
  - `createTodoGroup(title, body, labels)`
  - `getTodoGroups(labels)`
  - `getTodoGroup(issueNumber)`
  - `updateTodoGroup(issueNumber, body)`
  - `deleteTodoGroup(issueNumber)`
  - `syncFromGitHub()` - Sync issues to local storage
- [ ] Map Markdown tasks to GitHub issues:
  - Each task becomes an issue
  - Dependencies use issue references (#123)
  - Use labels for task metadata (priority, status)
- [ ] Implement bidirectional sync

#### Phase 3: Features
- [ ] Use GitHub Projects for task boards
- [ ] Integrate with GitHub Actions for automation
- [ ] Support GitHub Milestones for deadlines
- [ ] Use GitHub comments for task discussions
- [ ] Implement webhooks for real-time updates

#### Benefits
- Leverage existing GitHub infrastructure
- Built-in collaboration features
- Issue tracking and discussion
- Integration with CI/CD pipelines
- Free for public repositories

---

## Implementation Priority

### Phase 1: High Priority (Q1 2024)
1. **Supabase Integration** - Complete implementation
   - Authentication
   - Basic CRUD operations
   - Real-time sync

### Phase 2: Medium Priority (Q2 2024)
2. **GitHub Issues Integration** - Complete implementation
   - Issue synchronization
   - Bidirectional sync
   - Projects integration

### Phase 3: Low Priority (Q3 2024)
3. **Neo4j Integration** - Complete implementation
   - Graph queries
   - Advanced analytics
   - Enhanced visualization

### Phase 4: Future Consideration
4. **Cloud Storage (S3/GCS/Azure)** - Evaluate and implement if needed

---

## Architecture Design

### Storage Adapter Pattern

```javascript
// Base storage interface
class StorageAdapter {
  async create(name, content) { throw new Error('Not implemented') }
  async read(id) { throw new Error('Not implemented') }
  async update(id, content) { throw new Error('Not implemented') }
  async delete(id) { throw new Error('Not implemented') }
  async list() { throw new Error('Not implemented') }
  async sync() { throw new Error('Not implemented') }
}

// Implementations
class LocalStorageAdapter extends StorageAdapter { /* ... */ }
class SupabaseAdapter extends StorageAdapter { /* ... */ }
class Neo4jAdapter extends StorageAdapter { /* ... */ }
class GitHubAdapter extends StorageAdapter { /* ... */ }
class S3Adapter extends StorageAdapter { /* ... */ }

// Storage manager
class StorageManager {
  constructor(adapter) {
    this.adapter = adapter
  }

  setAdapter(adapter) {
    this.adapter = adapter
  }

  async create(name, content) {
    return await this.adapter.create(name, content)
  }

  // ... delegate other methods
}
```

### Data Flow

```
User Input
    ↓
TodoEditor Component
    ↓
FileManager (Current)
    ↓
StorageManager (New)
    ↓
StorageAdapter (Selected Backend)
    ↓
Storage Backend (LocalStorage/Supabase/Neo4j/GitHub/S3)
```

---

## Migration Strategy

### Data Migration

1. **Export from LocalStorage**
   - Export all todo groups to JSON
   - Validate data format

2. **Import to New Backend**
   - Parse JSON data
   - Transform to backend-specific format
   - Bulk insert/import

3. **Validation**
   - Verify data integrity
   - Check relationships
   - Test functionality

### Rollback Plan

- Keep localStorage as backup
- Implement export functionality for all backends
- Provide clear migration instructions
- Support multiple backends simultaneously during transition

---

## Security Considerations

### Supabase
- Use Row Level Security (RLS)
- Implement proper authentication
- Use service key only for admin operations
- Validate user permissions on client side

### Neo4j
- Use authentication and encryption
- Implement role-based access control
- Sanitize Cypher queries to prevent injection
- Use connection pooling

### GitHub
- Use personal access tokens with minimal permissions
- Implement token rotation
- Use repository-specific tokens
- Validate repository ownership

### Cloud Storage (S3/GCS/Azure)
- Use IAM roles and policies
- Implement bucket policies
- Enable encryption at rest and in transit
- Use temporary credentials when possible

---

## Testing Strategy

### Unit Tests
- Test each storage adapter independently
- Mock external API calls
- Test error handling
- Test data transformation

### Integration Tests
- Test end-to-end workflows
- Test data synchronization
- Test error recovery
- Test concurrent operations

### Performance Tests
- Benchmark each backend
- Test with large datasets
- Test concurrent users
- Measure sync times

---

## Documentation

### User Documentation
- How to configure each storage backend
- How to switch between backends
- How to migrate data
- Troubleshooting guide

### Developer Documentation
- API documentation for each adapter
- Database schemas
- Architecture diagrams
- Contribution guidelines

---

## Success Metrics

- **Functionality**: All CRUD operations work for each backend
- **Performance**: Sync time < 2 seconds for typical use cases
- **Reliability**: 99.9% uptime for cloud backends
- **User Experience**: Seamless switching between backends
- **Security**: No security vulnerabilities in implementation

---

## Timeline

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Supabase Phase 1-2 | Week 1-2 | Not Started |
| Supabase Phase 3-4 | Week 3-4 | Not Started |
| GitHub Issues Phase 1-2 | Week 5-6 | Not Started |
| GitHub Issues Phase 3 | Week 7-8 | Not Started |
| Neo4j Phase 1-2 | Week 9-10 | Not Started |
| Neo4j Phase 3-4 | Week 11-12 | Not Started |
| Cloud Storage Evaluation | Week 13 | Not Started |
| Testing & Documentation | Week 14-16 | Not Started |

---

## Resources

### Supabase
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

### Neo4j
- [Neo4j JavaScript Driver](https://neo4j.com/docs/javascript-manual/current/)
- [Cypher Query Language](https://neo4j.com/docs/cypher-manual/current/)
- [Neo4j Graph Data Science](https://neo4j.com/docs/graph-data-science/current/)

### GitHub
- [Octokit.js Documentation](https://octokit.github.io/rest.js/)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [GitHub Projects API](https://docs.github.com/en/rest/projects)

### Cloud Storage
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Google Cloud Storage Client Libraries](https://cloud.google.com/storage/docs/reference/libraries)
- [Azure Storage SDK for JavaScript](https://docs.microsoft.com/en-us/javascript/api/@azure/storage-blob)

---

## Conclusion

This plan provides a comprehensive roadmap for integrating multiple storage backends into the todo task management system. The implementation will follow a phased approach, prioritizing the most useful and commonly used backends first. The storage adapter pattern will ensure flexibility and maintainability, allowing easy addition of new backends in the future.

Regular updates to this document will track progress and any changes to the plan.
