# 存储集成计划

## 概述

本文档详细说明了待办任务管理系统多种存储后端的集成方案。目前系统使用 localStorage 进行数据持久化，目标是支持多种存储选项，为不同使用场景提供灵活性。

## 当前状态

- **存储方式**：LocalStorage（浏览器本地存储）
- **文件管理器**：[`fileManager.js`](file:///workspace/src/utils/fileManager.js)
- **数据格式**：JSON 格式存储 Markdown 内容
- **持久化**：自动保存到 localStorage

## 目标存储后端

### 1. Supabase 集成

**状态**：已安装包但未配置

**实施计划**：

#### 第一阶段：配置
- [ ] 创建 `.env` 文件配置 Supabase 凭证
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_SERVICE_KEY`（用于管理操作）
- [ ] 更新 [`supabaseClient.ts`](file:///workspace/src/utils/supabaseClient.ts) 添加错误处理

#### 第二阶段：数据库设计
```sql
-- 创建表
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

-- 创建索引
CREATE INDEX idx_todo_groups_user_id ON todo_groups(user_id);
CREATE INDEX idx_tasks_todo_group_id ON tasks(todo_group_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- 启用 RLS（行级安全）
ALTER TABLE todo_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "用户可以查看自己的待办组"
  ON todo_groups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的待办组"
  ON todo_groups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的待办组"
  ON todo_groups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的待办组"
  ON todo_groups FOR DELETE
  USING (auth.uid() = user_id);
```

#### 第三阶段：实现
- [ ] 创建 `src/utils/supabaseStorage.js` - Supabase 存储适配器
- [ ] 实现 CRUD 操作：
  - `createTodoGroup(name, content)`
  - `getTodoGroups(userId)`
  - `getTodoGroup(id)`
  - `updateTodoGroup(id, content)`
  - `deleteTodoGroup(id)`
- [ ] 添加认证流程（登录/注册）
- [ ] 在 UI 中添加存储选择器
- [ ] 实现 localStorage 和 Supabase 之间的数据同步

#### 第四阶段：功能增强
- [ ] 使用 Supabase Realtime 实现实时更新
- [ ] 离线支持与冲突解决
- [ ] 使用 Supabase Storage 支持文件附件
- [ ] 用户协作功能

#### 优势
- 基于云的存储，自动同步
- 用户认证和多设备支持
- 实时协作
- 内置数据库功能（索引、RLS）

---

### 2. Neo4j 集成

**状态**：未开始

**实施计划**：

#### 第一阶段：设置
- [ ] 安装 Neo4j 驱动：`npm install neo4j-driver`
- [ ] 创建 `.env` 文件配置 Neo4j 凭证
  - `VITE_NEO4J_URI`
  - `VITE_NEO4J_USER`
  - `VITE_NEO4J_PASSWORD`

#### 第二阶段：数据库设计
```cypher
// 创建约束
CREATE CONSTRAINT todo_group_id IF NOT EXISTS FOR (tg:Todogroup) REQUIRE tg.id IS UNIQUE;
CREATE CONSTRAINT task_id IF NOT EXISTS FOR (t:Task) REQUIRE t.id IS UNIQUE;

// 创建索引
CREATE INDEX task_completed IF NOT EXISTS FOR (t:Task) ON (t.completed);
CREATE INDEX task_start_time IF NOT EXISTS FOR (t:Task) ON (t.start_time);

// 数据模型
(:TodoGroup {id, name, content, userId, createdAt, updatedAt})
(:Task {id, title, completed, startTime, plannedTime, createdAt, updatedAt})
(:User {id, username, email})

// 关系
(:TodoGroup)-[:HAS_TASK]->(:Task)
(:Task)-[:DEPENDS_ON]->(:Task)
(:User)-[:OWNS]->(:TodoGroup)
```

#### 第三阶段：实现
- [ ] 创建 `src/utils/neo4jStorage.js` - Neo4j 存储适配器
- [ ] 实现 CRUD 操作：
  - `createTodoGroup(name, content, userId)`
  - `getTodoGroups(userId)`
  - `getTodoGroup(id)`
  - `updateTodoGroup(id, content)`
  - `deleteTodoGroup(id)`
  - `getTaskDependencies(taskId)` - 获取依赖图
- [ ] 实现复杂操作的 Cypher 查询
- [ ] 使用 Neo4j 数据增强关系图可视化

#### 第四阶段：高级功能
- [ ] 路径查找算法（任务间最短路径）
- [ ] 中心性分析（识别关键任务）
- [ ] 社区检测（分组相关任务）
- [ ] 时态查询（基于时间的任务分析）

#### 优势
- 原生图数据库，适合任务依赖关系
- 强大的图算法和查询
- 自然契合关系可视化
- 可扩展的大型任务图

---

### 3. CNB（Cloud Native Buildpacks）集成

**状态**：未开始

**实施计划**：

#### 第一阶段：了解 CNB
- [ ] 研究 CNB 存储能力
- [ ] 评估 CNB 是否适合此用例
- [ ] 考虑其他云存储解决方案

#### 第二阶段：替代方案
由于 CNB 主要用于构建应用程序，考虑使用：
- **AWS S3** 用于文件存储
- **Google Cloud Storage** 用于文件存储
- **Azure Blob Storage** 用于文件存储

#### 第三阶段：实现（以 S3 为例）
- [ ] 安装 AWS SDK：`npm install @aws-sdk/client-s3`
- [ ] 创建 `.env` 文件配置 AWS 凭证
  - `VITE_AWS_ACCESS_KEY_ID`
  - `VITE_AWS_SECRET_ACCESS_KEY`
  - `VITE_AWS_REGION`
  - `VITE_AWS_S3_BUCKET`
- [ ] 创建 `src/utils/s3Storage.js` - S3 存储适配器
- [ ] 实现 CRUD 操作：
  - `uploadTodoGroup(filename, content)`
  - `downloadTodoGroup(filename)`
  - `listTodoGroups()`
  - `deleteTodoGroup(filename)`
- [ ] 添加版本控制支持
- [ ] 实现备份和恢复功能

#### 优势
- 可扩展的云存储
- 文件版本控制
- 易于备份和恢复
- 多区域支持

---

### 4. GitHub Issues 集成

**状态**：未开始

**实施计划**：

#### 第一阶段：设置
- [ ] 安装 Octokit：`npm install octokit`
- [ ] 创建 `.env` 文件配置 GitHub 凭证
  - `VITE_GITHUB_TOKEN`
  - `VITE_GITHUB_OWNER`
  - `VITE_GITHUB_REPO`

#### 第二阶段：实现
- [ ] 创建 `src/utils/githubStorage.js` - GitHub Issues 存储适配器
- [ ] 实现 CRUD 操作：
  - `createTodoGroup(title, body, labels)`
  - `getTodoGroups(labels)`
  - `getTodoGroup(issueNumber)`
  - `updateTodoGroup(issueNumber, body)`
  - `deleteTodoGroup(issueNumber)`
  - `syncFromGitHub()` - 同步 issues 到本地存储
- [ ] 将 Markdown 任务映射到 GitHub issues：
  - 每个任务成为一个 issue
  - 依赖关系使用 issue 引用（#123）
  - 使用标签表示任务元数据（优先级、状态）
- [ ] 实现双向同步

#### 第三阶段：功能增强
- [ ] 使用 GitHub Projects 作为任务看板
- [ ] 与 GitHub Actions 集成实现自动化
- [ ] 支持 GitHub Milestones 作为截止日期
- [ ] 使用 GitHub 评论进行任务讨论
- [ ] 实现 webhook 实现实时更新

#### 优势
- 利用现有 GitHub 基础设施
- 内置协作功能
- 问题跟踪和讨论
- 与 CI/CD 管道集成
- 公开仓库免费使用

---

## 实施优先级

### 第一阶段：高优先级（2024 年第一季度）
1. **Supabase 集成** - 完整实现
   - 认证
   - 基本 CRUD 操作
   - 实时同步

### 第二阶段：中优先级（2024 年第二季度）
2. **GitHub Issues 集成** - 完整实现
   - Issue 同步
   - 双向同步
   - Projects 集成

### 第三阶段：低优先级（2024 年第三季度）
3. **Neo4j 集成** - 完整实现
   - 图查询
   - 高级分析
   - 增强可视化

### 第四阶段：未来考虑
4. **云存储（S3/GCS/Azure）** - 评估并根据需要实现

---

## 架构设计

### 存储适配器模式

```javascript
// 基础存储接口
class StorageAdapter {
  async create(name, content) { throw new Error('未实现') }
  async read(id) { throw new Error('未实现') }
  async update(id, content) { throw new Error('未实现') }
  async delete(id) { throw new Error('未实现') }
  async list() { throw new Error('未实现') }
  async sync() { throw new Error('未实现') }
}

// 具体实现
class LocalStorageAdapter extends StorageAdapter { /* ... */ }
class SupabaseAdapter extends StorageAdapter { /* ... */ }
class Neo4jAdapter extends StorageAdapter { /* ... */ }
class GitHubAdapter extends StorageAdapter { /* ... */ }
class S3Adapter extends StorageAdapter { /* ... */ }

// 存储管理器
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

  // ... 委托其他方法
}
```

### 数据流

```
用户输入
    ↓
TodoEditor 组件
    ↓
FileManager（当前）
    ↓
StorageManager（新增）
    ↓
StorageAdapter（选定的后端）
    ↓
存储后端（LocalStorage/Supabase/Neo4j/GitHub/S3）
```

---

## 迁移策略

### 数据迁移

1. **从 LocalStorage 导出**
   - 将所有待办组导出为 JSON
   - 验证数据格式

2. **导入到新后端**
   - 解析 JSON 数据
   - 转换为后端特定格式
   - 批量插入/导入

3. **验证**
   - 验证数据完整性
   - 检查关系
   - 测试功能

### 回滚计划

- 将 localStorage 作为备份保留
- 为所有后端实现导出功能
- 提供清晰的迁移说明
- 在过渡期间同时支持多个后端

---

## 安全考虑

### Supabase
- 使用行级安全（RLS）
- 实施适当的认证
- 仅在管理操作中使用服务密钥
- 在客户端验证用户权限

### Neo4j
- 使用认证和加密
- 实施基于角色的访问控制
- 清理 Cypher 查询以防止注入
- 使用连接池

### GitHub
- 使用具有最小权限的个人访问令牌
- 实施令牌轮换
- 使用仓库特定令牌
- 验证仓库所有权

### 云存储（S3/GCS/Azure）
- 使用 IAM 角色和策略
- 实施 bucket 策略
- 启用静态和传输中加密
- 尽可能使用临时凭证

---

## 测试策略

### 单元测试
- 独立测试每个存储适配器
- 模拟外部 API 调用
- 测试错误处理
- 测试数据转换

### 集成测试
- 测试端到端工作流
- 测试数据同步
- 测试错误恢复
- 测试并发操作

### 性能测试
- 对每个后端进行基准测试
- 使用大型数据集测试
- 测试并发用户
- 测量同步时间

---

## 文档

### 用户文档
- 如何配置每个存储后端
- 如何在后端之间切换
- 如何迁移数据
- 故障排除指南

### 开发者文档
- 每个适配器的 API 文档
- 数据库架构
- 架构图
- 贡献指南

---

## 成功指标

- **功能性**：每个后端的所有 CRUD 操作正常工作
- **性能**：典型用例的同步时间 < 2 秒
- **可靠性**：云后端 99.9% 正常运行时间
- **用户体验**：在后端之间无缝切换
- **安全性**：实现中无安全漏洞

---

## 时间表

| 里程碑 | 目标日期 | 状态 |
|--------|----------|------|
| Supabase 第一至二阶段 | 第 1-2 周 | 未开始 |
| Supabase 第三至四阶段 | 第 3-4 周 | 未开始 |
| GitHub Issues 第一至二阶段 | 第 5-6 周 | 未开始 |
| GitHub Issues 第三阶段 | 第 7-8 周 | 未开始 |
| Neo4j 第一至二阶段 | 第 9-10 周 | 未开始 |
| Neo4j 第三至四阶段 | 第 11-12 周 | 未开始 |
| 云存储评估 | 第 13 周 | 未开始 |
| 测试与文档 | 第 14-16 周 | 未开始 |

---

## 资源

### Supabase
- [Supabase 文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

### Neo4j
- [Neo4j JavaScript 驱动](https://neo4j.com/docs/javascript-manual/current/)
- [Cypher 查询语言](https://neo4j.com/docs/cypher-manual/current/)
- [Neo4j 图数据科学](https://neo4j.com/docs/graph-data-science/current/)

### GitHub
- [Octokit.js 文档](https://octokit.github.io/rest.js/)
- [GitHub API 文档](https://docs.github.com/en/rest)
- [GitHub Projects API](https://docs.github.com/en/rest/projects)

### 云存储
- [AWS JavaScript SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Google Cloud Storage 客户端库](https://cloud.google.com/storage/docs/reference/libraries)
- [Azure Storage JavaScript SDK](https://docs.microsoft.com/en-us/javascript/api/@azure/storage-blob)

---

## 结论

本计划为待办任务管理系统集成多种存储后端提供了全面的路线图。实施将采用分阶段的方法，优先实现最有用和最常用的后端。存储适配器模式将确保灵活性和可维护性，便于未来添加新的后端。

本文档将定期更新以跟踪进度和计划的任何变更。
