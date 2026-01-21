/**
 * Pollinations.ai API 客户端
 * 完整实现官方 OpenAPI 规范，包含数据校验和异常处理
 *
 * 官方文档: https://gen.pollinations.ai
 * API Key 获取: https://enter.pollinations.ai
 */

// ============================================================================
// 数据校验工具
// ============================================================================

class ValidationError extends Error {
  constructor(field, message, value) {
    super(`Validation failed for '${field}': ${message}`)
    this.name = 'ValidationError'
    this.field = field
    this.value = value
  }
}

class APIError extends Error {
  constructor(code, message, details = null) {
    super(message)
    this.name = 'APIError'
    this.code = code
    this.details = details
  }
}

const Validator = {
  // 验证 API Key 格式
  validateAPIKey(key) {
    if (!key || typeof key !== 'string') {
      throw new ValidationError('apiKey', 'API key is required and must be a string')
    }
    // pk_ (publishable) 或 sk_ (secret) 开头，或者临时 key
    if (!key.match(/^(pk_|sk_|temp_)/)) {
      console.warn('Warning: API key format may be invalid')
    }
    return true
  },

  // 验证模型名称
  validateTextModel(model) {
    const validModels = [
      'openai', 'openai-fast', 'openai-large',
      'qwen-coder', 'mistral', 'openai-audio',
      'gemini', 'gemini-fast', 'gemini-large',
      'deepseek', 'grok', 'gemini-search',
      'chickytutor', 'midijourney',
      'claude-fast', 'claude', 'claude-large',
      'perplexity-fast', 'perplexity-reasoning',
      'kimi', 'nova-fast', 'glm', 'minimax', 'nomnom'
    ]
    if (model && !validModels.includes(model)) {
      throw new ValidationError('model', `Invalid text model. Must be one of: ${validModels.join(', ')}`, model)
    }
    return true
  },

  validateImageModel(model) {
    const validModels = [
      'flux', 'zimage', 'turbo', 'gptimage', 'gptimage-large',
      'kontext', 'seedream', 'seedream-pro',
      'nanobanana', 'nanobanana-pro',
      'veo', 'seedance', 'seedance-pro',
      'wan', 'klein'
    ]
    if (model && !validModels.includes(model)) {
      throw new ValidationError('model', `Invalid image model. Must be one of: ${validModels.join(', ')}`, model)
    }
    return true
  },

  // 验证消息格式
  validateMessages(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new ValidationError('messages', 'Messages must be a non-empty array')
    }

    const validRoles = ['system', 'developer', 'user', 'assistant', 'tool', 'function']

    messages.forEach((msg, index) => {
      if (!msg.role || typeof msg.role !== 'string') {
        throw new ValidationError(`messages[${index}].role`, 'Role is required and must be a string')
      }
      if (!validRoles.includes(msg.role)) {
        throw new ValidationError(`messages[${index}].role`, `Invalid role. Must be one of: ${validRoles.join(', ')}`)
      }
      if (!msg.content && msg.role !== 'assistant') {
        throw new ValidationError(`messages[${index}].content`, 'Content is required')
      }
    })

    return true
  },

  // 验证温度参数
  validateTemperature(temp) {
    if (temp !== undefined && (typeof temp !== 'number' || temp < 0 || temp > 2)) {
      throw new ValidationError('temperature', 'Temperature must be a number between 0 and 2', temp)
    }
    return true
  },

  // 验证 max_tokens
  validateMaxTokens(tokens) {
    if (tokens !== undefined && (typeof tokens !== 'number' || tokens < 0)) {
      throw new ValidationError('max_tokens', 'max_tokens must be a positive number', tokens)
    }
    return true
  },

  // 验证图片尺寸
  validateDimension(value, name) {
    if (value !== undefined && (typeof value !== 'number' || value <= 0 || value > 8192)) {
      throw new ValidationError(name, `${name} must be a positive number (max 8192)`, value)
    }
    return true
  },

  // 验证 seed
  validateSeed(seed) {
    if (seed !== undefined && (typeof seed !== 'number' || seed < -1)) {
      throw new ValidationError('seed', 'Seed must be a number >= -1', seed)
    }
    return true
  },

  // 验证 prompt
  validatePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new ValidationError('prompt', 'Prompt is required and must be a non-empty string')
    }
    return true
  }
}

// ============================================================================
// Pollinations API 客户端
// ============================================================================

class PollinationsAPI {
  constructor(config = {}) {
    this.baseURL = config.baseURL || 'https://gen.pollinations.ai'
    this.apiKey = config.apiKey || null
    this.defaultModel = config.defaultModel || 'openai'
    this.timeout = config.timeout || 60000 // 60秒默认超时
  }

  // 设置 API Key
  setAPIKey(key) {
    Validator.validateAPIKey(key)
    this.apiKey = key
  }

  // 获取请求头
  getHeaders(contentType = 'application/json') {
    const headers = {
      'Accept': contentType === 'application/json' ? 'application/json' : '*/*'
    }

    if (contentType === 'application/json') {
      headers['Content-Type'] = 'application/json'
    }

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    return headers
  }

  // 处理响应错误
  async handleResponse(response) {
    const contentType = response.headers.get('content-type')
    const isJSON = contentType && contentType.includes('application/json')

    if (response.ok) {
      return isJSON ? await response.json() : await response.text()
    }

    // 解析错误响应
    let errorData
    if (isJSON) {
      errorData = await response.json()
    } else {
      errorData = { message: await response.text() }
    }

    // 根据状态码抛出相应的错误
    const errorMap = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      402: 'PAYMENT_REQUIRED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      429: 'RATE_LIMIT_EXCEEDED',
      500: 'INTERNAL_ERROR',
      503: 'SERVICE_UNAVAILABLE'
    }

    const code = errorMap[response.status] || 'UNKNOWN_ERROR'
    const message = errorData.error?.message || errorData.message || `HTTP ${response.status}`

    throw new APIError(code, message, errorData.error?.details)
  }

  // 构建查询字符串
  buildQueryString(params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    return searchParams.toString()
  }

  // ========================================================================
  // 文本生成 API
  // ========================================================================

  /**
   * 简单文本生成 (GET /text/{prompt})
   * @param {string} prompt - 提示词
   * @param {Object} options - 可选参数
   * @returns {Promise<string>} 生成的文本
   */
  async generateText(prompt, options = {}) {
    try {
      Validator.validatePrompt(prompt)

      const {
        model = this.defaultModel,
        seed = 0,
        system,
        json: returnJSON = false,
        temperature,
        stream = false
      } = options

      Validator.validateTextModel(model)
      if (temperature !== undefined) Validator.validateTemperature(temperature)
      Validator.validateSeed(seed)

      const params = { model, seed }
      if (system) params.system = system
      if (returnJSON) params.json = true
      if (temperature !== undefined) params.temperature = temperature
      if (stream) params.stream = false // 简单端点不支持流式

      const queryString = this.buildQueryString(params)
      const url = `${this.baseURL}/text/${encodeURIComponent(prompt)}${queryString ? '?' + queryString : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders('text/plain')
      })

      const result = await this.handleResponse(response)

      // 如果是 JSON 模式，解析返回的 JSON
      if (returnJSON && typeof result === 'string') {
        try {
          return JSON.parse(result)
        } catch (e) {
          return result
        }
      }

      return result
    } catch (error) {
      if (error instanceof ValidationError || error instanceof APIError) {
        throw error
      }
      throw new APIError('NETWORK_ERROR', `Failed to generate text: ${error.message}`)
    }
  }

  /**
   * 聊天完成 (POST /v1/chat/completions)
   * OpenAI 兼容接口
   * @param {Object} params - 请求参数
   * @returns {Promise<Object>} 聊天响应
   */
  async chatCompletions(params = {}) {
    try {
      const {
        messages,
        model = this.defaultModel,
        temperature,
        max_tokens,
        top_p,
        frequency_penalty,
        presence_penalty,
        stream = false,
        stop,
        seed,
        response_format,
        tools,
        tool_choice
      } = params

      // 数据验证
      Validator.validateMessages(messages)
      Validator.validateTextModel(model)
      if (temperature !== undefined) Validator.validateTemperature(temperature)
      if (max_tokens !== undefined) Validator.validateMaxTokens(max_tokens)
      if (seed !== undefined) Validator.validateSeed(seed)

      // 构建请求体
      const requestBody = {
        messages,
        model,
        stream
      }

      if (temperature !== undefined) requestBody.temperature = temperature
      if (max_tokens !== undefined) requestBody.max_tokens = max_tokens
      if (top_p !== undefined) requestBody.top_p = top_p
      if (frequency_penalty !== undefined) requestBody.frequency_penalty = frequency_penalty
      if (presence_penalty !== undefined) requestBody.presence_penalty = presence_penalty
      if (stop !== undefined) requestBody.stop = stop
      if (seed !== undefined) requestBody.seed = seed
      if (response_format !== undefined) requestBody.response_format = response_format
      if (tools !== undefined) requestBody.tools = tools
      if (tool_choice !== undefined) requestBody.tool_choice = tool_choice

      const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody)
      })

      return await this.handleResponse(response)
    } catch (error) {
      if (error instanceof ValidationError || error instanceof APIError) {
        throw error
      }
      throw new APIError('NETWORK_ERROR', `Chat completion failed: ${error.message}`)
    }
  }

  /**
   * 流式聊天完成
   * @param {Object} params - 请求参数
   * @param {Function} onChunk - 接收数据块的回调
   * @returns {Promise<AsyncGenerator>} 异步生成器
   */
  async *chatCompletionsStream(params = {}, onChunk = null) {
    try {
      const { messages, model = this.defaultModel, temperature, max_tokens } = params

      Validator.validateMessages(messages)
      Validator.validateTextModel(model)
      if (temperature !== undefined) Validator.validateTemperature(temperature)
      if (max_tokens !== undefined) Validator.validateMaxTokens(max_tokens)

      const requestBody = {
        ...params,
        messages,
        model,
        stream: true
      }

      const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        await this.handleResponse(response)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // 保留不完整的行

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6))
              const content = data.choices?.[0]?.delta?.content
              if (content) {
                yield content
                if (onChunk) onChunk(content)
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof APIError) {
        throw error
      }
      throw new APIError('NETWORK_ERROR', `Stream chat failed: ${error.message}`)
    }
  }

  // ========================================================================
  // 图片/视频生成 API
  // ========================================================================

  /**
   * 生成图片或视频 (GET /image/{prompt})
   * @param {string} prompt - 提示词
   * @param {Object} options - 可选参数
   * @returns {Promise<string>} 图片/视频 URL
   */
  async generateImage(prompt, options = {}) {
    try {
      Validator.validatePrompt(prompt)

      const {
        model = 'flux',
        width = 1024,
        height = 1024,
        seed = 0,
        nologo = false,
        private = false,
        enhance = false,
        nofeed = false
      } = options

      Validator.validateImageModel(model)
      Validator.validateDimension(width, 'width')
      Validator.validateDimension(height, 'height')
      Validator.validateSeed(seed)

      const params = { model, width, height, seed }
      if (nologo) params.nologo = true
      if (private) params.private = true
      if (enhance) params.enhance = true
      if (nofeed) params.nofeed = true

      const queryString = this.buildQueryString(params)
      const url = `${this.baseURL}/image/${encodeURIComponent(prompt)}${queryString ? '?' + queryString : ''}`

      // 直接返回 URL，让浏览器加载
      return url
    } catch (error) {
      if (error instanceof ValidationError || error instanceof APIError) {
        throw error
      }
      throw new APIError('NETWORK_ERROR', `Image generation failed: ${error.message}`)
    }
  }

  // ========================================================================
  // 模型列表 API
  // ========================================================================

  /**
   * 获取可用的文本模型列表 (GET /v1/models)
   * OpenAI 兼容格式
   */
  async getTextModels() {
    try {
      const response = await fetch(`${this.baseURL}/v1/models`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      return await this.handleResponse(response)
    } catch (error) {
      throw new APIError('NETWORK_ERROR', `Failed to get text models: ${error.message}`)
    }
  }

  /**
   * 获取文本模型详细信息 (GET /text/models)
   */
  async getTextModelsDetailed() {
    try {
      const response = await fetch(`${this.baseURL}/text/models`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      return await this.handleResponse(response)
    } catch (error) {
      throw new APIError('NETWORK_ERROR', `Failed to get detailed text models: ${error.message}`)
    }
  }

  /**
   * 获取图片模型列表 (GET /image/models)
   */
  async getImageModels() {
    try {
      const response = await fetch(`${this.baseURL}/image/models`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      return await this.handleResponse(response)
    } catch (error) {
      throw new APIError('NETWORK_ERROR', `Failed to get image models: ${error.message}`)
    }
  }

  // ========================================================================
  // 账户管理 API
  // ========================================================================

  /**
   * 获取用户资料 (GET /account/profile)
   */
  async getAccountProfile() {
    try {
      const response = await fetch(`${this.baseURL}/account/profile`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      return await this.handleResponse(response)
    } catch (error) {
      throw new APIError('NETWORK_ERROR', `Failed to get account profile: ${error.message}`)
    }
  }

  /**
   * 获取 pollen 余额 (GET /account/balance)
   */
  async getAccountBalance() {
    try {
      const response = await fetch(`${this.baseURL}/account/balance`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      return await this.handleResponse(response)
    } catch (error) {
      throw new APIError('NETWORK_ERROR', `Failed to get account balance: ${error.message}`)
    }
  }

  /**
   * 获取使用历史 (GET /account/usage)
   * @param {Object} options - 查询选项
   */
  async getAccountUsage(options = {}) {
    try {
      const { format = 'json' } = options
      const params = { format }

      const queryString = this.buildQueryString(params)
      const url = `${this.baseURL}/account/usage${queryString ? '?' + queryString : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      })

      return await this.handleResponse(response)
    } catch (error) {
      throw new APIError('NETWORK_ERROR', `Failed to get account usage: ${error.message}`)
    }
  }

  // ========================================================================
  // 待办事项相关的 AI 功能
  // ========================================================================

  /**
   * 优化待办事项内容
   */
  async optimizeTodoContent(todoContent) {
    try {
      if (!todoContent || todoContent.trim().length === 0) {
        throw new ValidationError('todoContent', 'Todo content is required')
      }

      const prompt = `请帮我优化以下待办事项内容，使其更加清晰、具体和可执行。请保持原有的格式（包括复选框、日期、时间估算等），但改进描述的准确性和可操作性：

原始内容：
${todoContent}

请返回优化后的待办事项内容，要求：
1. 保持原有的Markdown格式
2. 让任务描述更具体和可执行
3. 合理安排任务优先级和依赖关系
4. 如果时间估算不合理，请调整
5. 添加必要的标签和分类

只返回优化后的内容，不要有其他说明文字。`

      return await this.generateText(prompt, {
        temperature: 0.5
      })
    } catch (error) {
      throw new APIError('OPTIMIZATION_FAILED', `Failed to optimize todo: ${error.message}`)
    }
  }

  /**
   * 根据主题生成待办事项
   */
  async generateTodoByTopic(topic, options = {}) {
    try {
      Validator.validatePrompt(topic)

      const {
        timeframe = '一周',
        priority = '中等',
        includeSubtasks = true,
        estimateTime = true
      } = options

      const prompt = `请为"${topic}"这个主题生成一个详细的待办事项清单，要求：

1. 时间范围：${timeframe}
2. 优先级：${priority}
3. ${includeSubtasks ? '包含子任务分解' : '只包含主要任务'}
4. ${estimateTime ? '包含时间估算' : '不需要时间估算'}

请使用以下格式：
- [ ] 任务描述 @日期 ${estimateTime ? 'T:时间估算' : ''} ${includeSubtasks ? '-> 依赖任务' : ''}

生成的内容应该：
- 使用Markdown格式
- 任务具体可执行
- 合理安排优先级
- 包含适当的分类和标签
- 考虑任务之间的依赖关系

只返回生成的待办事项内容，不要有其他说明。`

      return await this.generateText(prompt, {
        temperature: 0.6
      })
    } catch (error) {
      throw new APIError('GENERATION_FAILED', `Failed to generate todos: ${error.message}`)
    }
  }

  /**
   * 任务分解
   */
  async breakdownTask(task) {
    try {
      if (!task || task.trim().length === 0) {
        throw new ValidationError('task', 'Task description is required')
      }

      const prompt = `请将以下大任务分解为具体的可执行子任务：

任务：${task}

要求：
1. 分解为3-8个子任务
2. 每个子任务都具体可执行
3. 按照逻辑顺序排列
4. 包含时间估算
5. 标明任务依赖关系
6. 使用Markdown复选框格式

格式示例：
- [ ] 子任务1 @日期 T:时间
- [ ] 子任务2 @日期 T:时间 -> 子任务1

只返回分解后的子任务列表，不要有其他说明。`

      return await this.generateText(prompt, {
        temperature: 0.4
      })
    } catch (error) {
      throw new APIError('BREAKDOWN_FAILED', `Failed to breakdown task: ${error.message}`)
    }
  }

  /**
   * 生成项目计划
   */
  async generateProjectPlan(projectName, description = '', deadline = '') {
    try {
      if (!projectName || projectName.trim().length === 0) {
        throw new ValidationError('projectName', 'Project name is required')
      }

      let prompt = `请为以下项目生成一个完整的待办事项计划：

项目名称：${projectName}`

      if (description) {
        prompt += `\n项目描述：${description}`
      }
      if (deadline) {
        prompt += `\n截止日期：${deadline}`
      }

      prompt += `

请生成包含以下部分的完整计划：
1. 项目概述
2. 主要里程碑
3. 详细任务分解
4. 时间安排
5. 风险评估和应对措施

使用Markdown格式，包含：
- 标题层级
- 任务复选框
- 日期标记
- 时间估算
- 任务依赖关系
- 优先级标记

只返回生成的项目计划，不要有其他说明。`

      return await this.generateText(prompt, {
        temperature: 0.5
      })
    } catch (error) {
      throw new APIError('PROJECT_PLAN_FAILED', `Failed to generate project plan: ${error.message}`)
    }
  }

  /**
   * 智能提醒和建议
   */
  async getSuggestions(todoContent) {
    try {
      if (!todoContent || todoContent.trim().length === 0) {
        throw new ValidationError('todoContent', 'Todo content is required')
      }

      const prompt = `请分析以下待办事项内容，并提供改进建议：

${todoContent}

请从以下角度提供建议：
1. 任务优先级是否合理
2. 时间估算是否现实
3. 任务依赖关系是否清晰
4. 是否有遗漏的重要任务
5. 工作负荷是否平衡
6. 具体的改进建议

请用简洁明了的中文回答。`

      return await this.generateText(prompt, {
        temperature: 0.6
      })
    } catch (error) {
      throw new APIError('SUGGESTIONS_FAILED', `Failed to get suggestions: ${error.message}`)
    }
  }

  // ========================================================================
  // 工具方法
  // ========================================================================

  /**
   * 检查 API 连接状态
   */
  async checkConnection() {
    try {
      await this.getTextModels()
      return true
    } catch (error) {
      console.error('Connection check failed:', error.message)
      return false
    }
  }

  /**
   * 获取默认模型
   */
  getDefaultModel() {
    return this.defaultModel
  }

  /**
   * 设置默认模型
   */
  setDefaultModel(model) {
    Validator.validateTextModel(model)
    this.defaultModel = model
  }
}

// ============================================================================
// 导出单例和类
// ============================================================================

// 创建默认实例
const pollinationsAPI = new PollinationsAPI()

// 导出类和实例
export { PollinationsAPI, Validator, ValidationError, APIError }
export default pollinationsAPI
