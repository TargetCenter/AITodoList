# Markdown待办任务工具

一个基于Vue.js和ECharts的待办任务管理工具，支持使用Markdown语法声明任务、时间安排和任务依赖关系，并通过关系图进行可视化展示。

## 功能特性

1. **Markdown语法支持**：
   - 使用标准Markdown待办列表语法
   - 支持任务开始时间和用时声明
   - 支持任务依赖关系声明

2. **实时语法检查**：
   - 实时检查Markdown语法
   - 提供语法错误提示

3. **任务关系可视化**：
   - 使用ECharts关系图展示任务依赖
   - 箭头表示任务依赖方向
   - 不同颜色区分已完成和未完成任务

4. **AI 智能助手**：
   - 优化待办内容 - 自动改进任务描述和时间估算
   - 生成待办清单 - 根据主题自动生成任务列表
   - 任务分解 - 将大任务拆解为可执行的子任务
   - 项目规划 - 生成完整的项目计划和里程碑
   - 智能建议 - 分析任务并提供改进建议

5. **文件管理**：
   - 支持多个待办组文件
   - 新建、保存、打开文件功能

## Markdown语法规范

```
- [ ] 任务名称 @开始时间 用时 -> 依赖任务
- [x] 已完成任务 @开始时间 用时 -> 依赖任务
```

### 示例：

```markdown
- [ ] 设计数据库 @2023-09-15 2h
- [ ] 开发API接口 @2023-09-16 4h -> 设计数据库
- [ ] 前端页面开发 @2023-09-17 3h -> 设计数据库
- [x] 项目初始化 @2023-09-14 1h
- [ ] 部署测试环境 @2023-09-20 2h -> 开发API接口, 前端页面开发
```

### 语法说明：

1. **任务状态**：`[ ]` 表示未完成，`[x]` 表示已完成
2. **开始时间**：使用 `@` 符号后跟时间，支持格式：
   - `YYYY-MM-DD` (如 2023-09-15)
3. **用时**：任务预计用时，支持单位：
   - `h` 小时 (如 2h)
   - `d` 天 (如 1.5d)
4. **依赖关系**：使用 `->` 符号后跟依赖任务名称

## 项目结构

```
src/
├── components/     # 可复用组件
│   ├── AIAssistant.vue    # AI 智能助手组件
│   └── MonacoEditor.vue   # Monaco 编辑器组件
├── views/          # 页面视图
│   ├── TodoEditor.vue  # 待办编辑器
│   └── TodoGraph.vue   # 关系图展示
├── router/         # 路由配置
├── utils/          # 工具函数
│   ├── pollinationsAPI.js  # Pollinations.ai API 客户端
│   ├── markdownParser.js   # Markdown解析器
│   ├── fileManager.js      # 文件管理器
│   ├── todoLanguage.js     # Monaco 语言定义
│   ├── todoCompletion.js   # 自动补全
│   ├── todoHover.js        # 悬停提示
│   └── todoValidation.js   # 实时验证
└── assets/         # 静态资源
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

服务器启动后，会在终端显示访问地址，通常是：
- http://localhost:3000/ (如果3000端口可用)
- http://localhost:3001/ (如果3000端口被占用会自动切换到其他端口)

### 构建生产版本

```bash
npm run build
```

### 本地预览构建结果

```bash
npm run serve
```

## 技术栈

- [Vue.js 3](https://v3.vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Element Plus](https://element-plus.org/)
- [ECharts](https://echarts.apache.org/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Pollinations.ai](https://pollinations.ai/) - AI 服务提供商

## 使用说明

1. **创建新文件**：点击"文件管理" -> "新建文件"，输入文件名创建新的待办组
2. **编辑任务**：在左侧编辑器中使用Markdown语法编写待办任务
3. **语法检查**：点击"语法检查"按钮检查Markdown格式
4. **保存文件**：点击"文件管理" -> "保存文件"保存当前待办组
5. **打开文件**：点击"文件管理" -> "打开文件"选择已有待办组
6. **查看关系图**：点击"查看关系图"按钮查看任务依赖关系可视化展示
7. **AI 助手**：点击右下角 AI 按钮，使用智能功能优化和管理待办任务

## AI 助手配置

### 获取 API Key

访问 https://enter.pollinations.ai 注册账号并获取 API Key

### 配置方式

**方式一：环境变量（推荐）**

```bash
# 创建 .env.local 文件
echo "VITE_POLLINATIONS_API_KEY=sk_你的key" > .env.local
```

**方式二：本地存储**

1. 打开浏览器开发者工具 (F12)
2. 在 Console 中执行：
```javascript
localStorage.setItem('pollinations_api_key', 'sk_你的key')
```

### AI 功能说明

- **优化内容** - AI 自动改进任务描述、调整时间估算
- **生成待办** - 输入主题，自动生成完整的待办清单
- **任务分解** - 将大任务分解为 3-8 个可执行的子任务
- **项目规划** - 根据项目名称和描述，生成完整的项目计划
- **智能建议** - 分析当前待办事项，提供优化建议

详细使用文档请参考 [POLLINATIONS_API_USAGE.md](POLLINATIONS_API_USAGE.md)

## 开发注意事项

### Vite 版本降级

**原因**：为了解决 Vue DevTools 与 WebStorm IDE 集成问题

- Vite v7.x 存在与 Vue DevTools 的兼容性问题，导致在浏览器 DevTools 中点击组件文件无法在 WebStorm 中打开
- 已降级到 Vite v6.3.6，该版本与 Vue DevTools v8.0.2 完全兼容
- 配置了 `launchEditor: 'webstorm'` 以支持直接从浏览器 DevTools 打开 Vue 文件

### Tailwind CSS 版本兼容性

**重要**：本项目必须使用 Tailwind CSS v3.x，不要升级到 v4.x

#### 问题描述
- Tailwind CSS v4 是实验性版本，API 不稳定
- v4 的配置方式和 PostCSS 插件与 v3 完全不同
- v4 中许多 v3 的功能（如响应式样式）可能无法正常工作

#### 正确配置
```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

#### PostCSS 配置 (postcss.config.js)
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### 错误配置（会导致响应式样式失效）
```javascript
// 错误：v4 配置方式
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},  // 这是 v4 的插件
    autoprefixer: {},
  },
}
```

#### 解决方案
如果遇到响应式样式（如 `md:grid-cols-2`）不生效的问题：

1. 检查 package.json 中的 tailwindcss 版本
2. 确保使用 v3.4.0 而不是 v4.x
3. 如果安装了 v4，请降级：
   ```bash
   npm uninstall tailwindcss @tailwindcss/postcss
   npm install -D tailwindcss@^3.4.0 postcss@^8.4.0
   ```
4. 更新 postcss.config.js 使用标准配置

## 依赖关系图说明

- **节点**：每个任务为一个节点
- **颜色**：绿色表示已完成任务，蓝色表示未完成任务
- **大小**：节点大小与任务用时成正比
- **连线**：箭头表示依赖关系，从依赖任务指向被依赖任务
- **交互**：鼠标悬停可查看任务详细信息，拖拽可调整布局

## 存储集成计划

本项目计划支持多种存储后端，以提供更灵活的数据管理方案。详细的集成计划请参考 [Storage Integration Plan](docs/STORAGE_INTEGRATION_PLAN.md)。

### 支持的存储后端

1. **Supabase** - 云端数据库，支持实时同步和用户认证
2. **Neo4j** - 图数据库，适合处理复杂的任务依赖关系
3. **GitHub Issues** - 集成 GitHub 问题跟踪，便于协作
4. **Cloud Storage (S3/GCS/Azure)** - 云端文件存储，支持版本控制

### 当前状态

- ✅ Supabase 包已安装，待配置
- ⏳ 其他存储后端待实现

### 实施进度

详细的实施时间表和任务清单请查看 [Storage Integration Plan](docs/STORAGE_INTEGRATION_PLAN.md)。