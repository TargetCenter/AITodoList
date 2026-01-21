# Pollinations AI API 使用指南

## 快速开始

### 1. 获取 API Key

访问 https://enter.pollinations.ai 注册并获取 API Key

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local，填入你的 API Key
VITE_POLLINATIONS_API_KEY=sk_your_actual_key_here
```

### 3. 在代码中使用

```javascript
import pollinationsAPI from './utils/pollinationsAPI.js'

// 方式一：使用默认实例（已自动配置）
const result = await pollinationsAPI.generateText('写一首关于编程的诗')

// 方式二：创建自定义实例
import { PollinationsAPI } from './utils/pollinationsAPI.js'
const customAPI = new PollinationsAPI({
  apiKey: 'sk_your_key_here',
  defaultModel: 'gemini'
})
```

## API 方法详解

### 文本生成

#### 1. 简单文本生成

```javascript
import pollinationsAPI from './utils/pollinationsAPI.js'

// 基础用法
const text = await pollinationsAPI.generateText('什么是人工智能？')
console.log(text)

// 带参数
const text = await pollinationsAPI.generateText('写一个故事', {
  model: 'gemini',          // 模型选择
  temperature: 0.8,         // 创造性 (0-2)
  seed: 1234,              // 随机种子
  json: true               // 返回 JSON 格式
})

// 带系统提示
const text = await pollinationsAPI.generateText('今天天气怎么样', {
  system: '你是一个友好的助手'
})
```

#### 2. 聊天完成 (OpenAI 兼容)

```javascript
const response = await pollinationsAPI.chatCompletions({
  messages: [
    { role: 'system', content: '你是一个专业的待办事项管理助手' },
    { role: 'user', content: '帮我规划一个学习计划' }
  ],
  model: 'openai',
  temperature: 0.7,
  max_tokens: 2000
})

console.log(response.choices[0].message.content)
```

#### 3. 流式聊天

```javascript
// 使用异步生成器
for await (const chunk of pollinationsAPI.chatCompletionsStream({
  messages: [
    { role: 'user', content: '讲一个长故事' }
  ],
  model: 'gemini'
})) {
  console.log(chunk)  // 逐块输出
}

// 使用回调
await pollinationsAPI.chatCompletionsStream(
  {
    messages: [{ role: 'user', content: '写代码' }],
    model: 'openai'
  },
  (chunk) => console.log(chunk)  // 实时处理每个数据块
)
```

### 图片生成

```javascript
// 生成图片
const imageUrl = await pollinationsAPI.generateImage('一只可爱的猫咪', {
  model: 'flux',       // 图片模型
  width: 1024,        // 宽度
  height: 1024,       // 高度
  seed: 42,           // 随机种子
  private: true,      // 私有模式
  enhance: true       // 增强模式
})

// imageUrl 可直接用于 img 标签
document.getElementById('myImage').src = imageUrl
```

### 模型查询

```javascript
// 获取文本模型列表 (OpenAI 格式)
const models = await pollinationsAPI.getTextModels()
console.log(models.data.map(m => m.id))

// 获取文本模型详细信息
const detailedModels = await pollinationsAPI.getTextModelsDetailed()
console.log(detailedModels)

// 获取图片模型列表
const imageModels = await pollinationsAPI.getImageModels()
console.log(imageModels)
```

### 账户管理

```javascript
// 获取账户信息
const profile = await pollinationsAPI.getAccountProfile()
console.log(profile.name, profile.email, profile.tier)

// 获取余额
const balance = await pollinationsAPI.getAccountBalance()
console.log(`剩余 pollen: ${balance.balance}`)

// 获取使用历史
const usage = await pollinationsAPI.getAccountUsage({ format: 'json' })
console.log(usage.usage)
```

## 待办事项专用方法

这些方法是专门为待办事项管理设计的：

### 1. 优化待办内容

```javascript
const todoContent = `- [ ] 完成项目 @2024-01-15 2h`

const optimized = await pollinationsAPI.optimizeTodoContent(todoContent)
console.log(optimized)
// 输出优化后的待办事项，描述更清晰、时间估算更合理
```

### 2. 根据主题生成待办

```javascript
const todos = await pollinationsAPI.generateTodoByTopic('学习 Vue 3', {
  timeframe: '一周',      // 时间范围：今天/本周/本月/本季度
  priority: '中等',       // 优先级：低/中等/高/紧急
  includeSubtasks: true,  // 包含子任务
  estimateTime: true      // 估算时间
})

console.log(todos)
// 输出完整的待办事项清单
```

### 3. 任务分解

```javascript
const subtasks = await pollinationsAPI.breakdownTask('开发一个网站')

console.log(subtasks)
// 输出：
// - [ ] 需求分析 @2024-01-15 T:2h
// - [ ] 设计原型 @2024-01-16 T:4h -> 需求分析
// - [ ] 前端开发 @2024-01-17 T:16h -> 设计原型
// ...
```

### 4. 生成项目计划

```javascript
const plan = await pollinationsAPI.generateProjectPlan(
  '开发移动应用',           // 项目名称
  '一个健身追踪应用',       // 描述
  '2024-12-31'             // 截止日期
)

console.log(plan)
// 输出包含项目概述、里程碑、任务分解、时间安排、风险评估的完整计划
```

### 5. 获取智能建议

```javascript
const suggestions = await pollinationsAPI.getSuggestions(todoContent)

console.log(suggestions)
// 输出关于优先级、时间估算、依赖关系等方面的改进建议
```

## 在 Vue 组件中使用

### 示例：创建一个简单的聊天组件

```vue
<template>
  <div class="chat-demo">
    <div class="messages">
      <div v-for="(msg, index) in messages" :key="index" :class="msg.role">
        {{ msg.content }}
      </div>
    </div>
    <div class="input-area">
      <input
        v-model="userInput"
        @keyup.enter="sendMessage"
        placeholder="输入消息..."
      />
      <button @click="sendMessage" :disabled="loading">
        {{ loading ? '生成中...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import pollinationsAPI from '../utils/pollinationsAPI.js'

const messages = ref([
  { role: 'assistant', content: '你好！有什么可以帮你的吗？' }
])
const userInput = ref('')
const loading = ref(false)

const sendMessage = async () => {
  if (!userInput.value.trim() || loading.value) return

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: userInput.value
  })

  const userMessage = userInput.value
  userInput.value = ''
  loading.value = true

  try {
    // 调用 API
    const response = await pollinationsAPI.chatCompletions({
      messages: messages.value.map(m => ({
        role: m.role,
        content: m.content
      })),
      model: 'openai',
      temperature: 0.7
    })

    // 添加助手回复
    messages.value.push({
      role: 'assistant',
      content: response.choices[0].message.content
    })
  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content: `错误: ${error.message}`
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.chat-demo {
  max-width: 600px;
  margin: 20px auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
}

.messages {
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.messages > div {
  padding: 10px;
  margin: 5px 0;
  border-radius: 5px;
}

.user {
  background-color: #e3f2fd;
  text-align: right;
}

.assistant {
  background-color: #f5f5f5;
}

.input-area {
  display: flex;
  gap: 10px;
}

.input-area input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.input-area button {
  padding: 10px 20px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.input-area button:disabled {
  background-color: #ccc;
}
</style>
```

## 错误处理

```javascript
import { ValidationError, APIError } from './utils/pollinationsAPI.js'

try {
  const result = await pollinationsAPI.generateText('')
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('验证错误:', error.field, error.message)
    // 处理验证错误
  } else if (error instanceof APIError) {
    console.log('API 错误:', error.code, error.message)
    // 处理 API 错误
    // error.code 可能是:
    // - UNAUTHORIZED (401) - API Key 无效
    // - PAYMENT_REQUIRED (402) - 余额不足
    // - FORBIDDEN (403) - 无权限
    // - RATE_LIMIT_EXCEEDED (429) - 请求过多
    // - INTERNAL_ERROR (500) - 服务器错误
  }
}
```

## 可用模型列表

### 文本模型
- `openai` - GPT 系列（默认）
- `openai-fast` - 快速版本
- `openai-large` - 大版本
- `gemini` - Google Gemini
- `gemini-fast` - Gemini 快速版
- `gemini-large` - Gemini 大版本
- `claude` - Anthropic Claude
- `claude-fast` - Claude 快速版
- `claude-large` - Claude 大版本
- `deepseek` - DeepSeek
- `grok` - Grok
- `qwen-coder` - 通义千问代码版
- `mistral` - Mistral
- 等等...

### 图片模型
- `flux` - Flux（默认）
- `turbo` - 快速生成
- `gptimage` - GPT Image
- `zimage` - Z Image
- `veo` - 视频生成
- 等等...

## 价格说明

- 使用 **Pollen** 作为计费单位
- 免费用户每天有免费额度
- 可在 https://enter.pollinations.ai 充值
- 使用 `getAccountBalance()` 查询余额

## 开发建议

1. **使用环境变量存储 API Key**，不要硬编码
2. **添加错误处理**，所有 API 调用都应该 try-catch
3. **显示加载状态**，AI 生成需要时间
4. **流式输出长文本**，提升用户体验
5. **控制请求频率**，避免超出限制
6. **验证用户输入**，使用 `Validator` 工具
