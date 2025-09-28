// Pollinations.ai LLM API 集成模块
// 提供文本生成、待办事项优化等AI功能

class PollinationsAPI {
  constructor() {
    this.baseURL = 'https://text.pollinations.ai'
    this.defaultModel = 'openai'
    this.defaultOptions = {
      temperature: 0.7,
      max_tokens: 1000,
      stream: false
    }
  }

  /**
   * 发送请求到 Pollinations.ai API
   * @param {string} prompt - 用户输入的提示词
   * @param {Object} options - 可选参数
   * @returns {Promise<string>} AI 生成的响应
   */
  async generateText(prompt, options = {}) {
    try {
      const config = {
        ...this.defaultOptions,
        ...options
      }

      // 如果是流式响应
      if (config.stream) {
        return this.generateStreamText(prompt, config)
      }

      // Pollinations.ai 使用 GET 请求，将 prompt 作为 URL 参数
      const url = new URL(this.baseURL)
      
      // 构建请求 URL，将 prompt 作为路径参数
      const requestUrl = `${this.baseURL}/${encodeURIComponent(prompt)}`
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
        }
      })

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
      }

      const text = await response.text()
      return text || '生成失败'

    } catch (error) {
      console.error('Pollinations API 错误:', error)
      throw new Error(`AI生成失败: ${error.message}`)
    }
  }

  /**
   * 流式文本生成（Pollinations.ai 暂不支持流式，使用模拟流式）
   * @param {string} prompt - 提示词
   * @param {Object} config - 配置选项
   * @returns {Promise<AsyncGenerator>} 流式响应生成器
   */
  async generateStreamText(prompt, config) {
    try {
      // 先获取完整响应
      const fullResponse = await this.generateText(prompt, { ...config, stream: false })
      
      // 模拟流式输出
      return this.simulateStreamResponse(fullResponse)

    } catch (error) {
      console.error('流式生成错误:', error)
      throw error
    }
  }

  /**
   * 模拟流式响应
   * @param {string} fullText - 完整文本
   * @returns {AsyncGenerator} 异步生成器
   */
  async* simulateStreamResponse(fullText) {
    const words = fullText.split('')
    const chunkSize = Math.max(1, Math.floor(words.length / 50)) // 分成大约50个块
    
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join('')
      yield chunk
      
      // 添加小延迟以模拟流式效果
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }

  /**
   * 优化待办事项内容
   * @param {string} todoContent - 原始待办事项内容
   * @returns {Promise<string>} 优化后的内容
   */
  async optimizeTodoContent(todoContent) {
    const prompt = `
请帮我优化以下待办事项内容，使其更加清晰、具体和可执行。请保持原有的格式（包括复选框、日期、时间估算等），但改进描述的准确性和可操作性：

原始内容：
${todoContent}

请返回优化后的待办事项内容，要求：
1. 保持原有的Markdown格式
2. 让任务描述更具体和可执行
3. 合理安排任务优先级和依赖关系
4. 如果时间估算不合理，请调整
5. 添加必要的标签和分类
`

    return await this.generateText(prompt, {
      temperature: 0.5,
      max_tokens: 1500
    })
  }

  /**
   * 根据主题生成待办事项
   * @param {string} topic - 主题或项目名称
   * @param {Object} options - 生成选项
   * @returns {Promise<string>} 生成的待办事项
   */
  async generateTodoByTopic(topic, options = {}) {
    const {
      timeframe = '一周',
      priority = '中等',
      includeSubtasks = true,
      estimateTime = true
    } = options

    const prompt = `
请为"${topic}"这个主题生成一个详细的待办事项清单，要求：

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
`

    return await this.generateText(prompt, {
      temperature: 0.6,
      max_tokens: 2000
    })
  }

  /**
   * 智能任务分解
   * @param {string} task - 需要分解的大任务
   * @returns {Promise<string>} 分解后的子任务列表
   */
  async breakdownTask(task) {
    const prompt = `
请将以下大任务分解为具体的可执行子任务：

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
`

    return await this.generateText(prompt, {
      temperature: 0.4,
      max_tokens: 1000
    })
  }

  /**
   * 生成项目计划
   * @param {string} projectName - 项目名称
   * @param {string} description - 项目描述
   * @param {string} deadline - 截止日期
   * @returns {Promise<string>} 完整的项目计划
   */
  async generateProjectPlan(projectName, description, deadline) {
    const prompt = `
请为以下项目生成一个完整的待办事项计划：

项目名称：${projectName}
项目描述：${description}
截止日期：${deadline}

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
`

    return await this.generateText(prompt, {
      temperature: 0.5,
      max_tokens: 3000
    })
  }

  /**
   * 智能提醒和建议
   * @param {string} todoContent - 当前待办事项内容
   * @returns {Promise<string>} AI建议
   */
  async getSuggestions(todoContent) {
    const prompt = `
请分析以下待办事项内容，并提供改进建议：

${todoContent}

请从以下角度提供建议：
1. 任务优先级是否合理
2. 时间估算是否现实
3. 任务依赖关系是否清晰
4. 是否有遗漏的重要任务
5. 工作负荷是否平衡
6. 具体的改进建议

请用简洁明了的中文回答。
`

    return await this.generateText(prompt, {
      temperature: 0.6,
      max_tokens: 800
    })
  }

  /**
   * 检查API连接状态
   * @returns {Promise<boolean>} 连接是否正常
   */
  async checkConnection() {
    try {
      const response = await this.generateText('测试连接', {
        max_tokens: 10,
        temperature: 0.1
      })
      return response && response.length > 0
    } catch (error) {
      console.error('API连接检查失败:', error)
      return false
    }
  }
}

// 创建单例实例
const pollinationsAPI = new PollinationsAPI()

export default pollinationsAPI