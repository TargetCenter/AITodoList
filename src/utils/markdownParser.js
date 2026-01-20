// Markdown解析器，用于解析待办任务

/**
 * 解析Markdown内容，提取待办任务
 * 支持格式: - [ ] 任务名称 @时间 T:时长 ->依赖
 * 或者: - [ ] 任务名称 时间 时长 ->依赖
 * @param {string} markdown - Markdown文本
 * @returns {Array} 任务对象数组
 */
export function parseMarkdown(markdown) {
  const lines = markdown.split('\n')
  const tasks = []
  const taskMap = new Map()

  lines.forEach((line, index) => {
    // 匹配待办任务格式（支持两种格式）
    // 格式1: - [ ] 任务名 @时间 T:时长 ->依赖
    // 格式2: - [ ] 任务名 时间 时长 ->依赖
    const taskRegex1 = /^-\s*\[([ xX])\]\s*(.+?)\s+@(\S+?)\s+T:(\S+?)(?:\s*->\s*(.+))?$/
    const taskRegex2 = /^-\s*\[([ xX])\]\s*(.+?)\s+(\S+?)\s+(\S+?)(?:\s*->\s*(.+))?$/

    let match = line.match(taskRegex1)
    let format = 1

    if (!match) {
      match = line.match(taskRegex2)
      format = 2
    }

    if (match) {
      const [, checked, title, timeOrDatetime, duration, dependenciesStr] = match
      const completed = checked === 'x' || checked === 'X'
      const dependencies = dependenciesStr ? dependenciesStr.split(',').map(d => d.trim()) : []

      const task = {
        id: `task-${index}`,
        title: title.trim(),
        completed,
        time: format === 1 ? timeOrDatetime : timeOrDatetime || null,
        plannedTime: duration || null,
        dependencies
      }

      tasks.push(task)
      taskMap.set(title, task)
    }
  })

  return tasks
}

/**
 * 验证Markdown语法
 * @param {string} markdown - Markdown文本
 * @returns {Array} 错误信息数组
 */
export function validateSyntax(markdown) {
  const lines = markdown.split('\n')
  const errors = []

  // 支持的格式正则
  const taskRegex1 = /^-\s*\[([ xX])\]\s*(.+?)\s+@(\S+?)\s+T:(\S+?)(?:\s*->\s*(.+))?$/  // - [ ] 任务 @时间 T:时长 ->依赖
  const taskRegex2 = /^-\s*\[([ xX])\]\s*(.+?)\s+(\S+?)\s+(\S+?)(?:\s*->\s*(.+))?$/        // - [ ] 任务 时间 时长 ->依赖

  lines.forEach((line, lineNumber) => {
    // 跳过空行、标题和引用
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('>')) {
      return
    }

    // 检查是否为待办任务格式
    if (trimmedLine.startsWith('- [')) {
      // 检查复选框格式
      if (!/^- \[[ xX]\]/.test(trimmedLine)) {
        errors.push({
          line: lineNumber + 1,
          message: '复选框格式错误，应为[ ] 或[x]'
        })
        return
      }

      // 检查是否符合任一支持的任务格式
      if (!taskRegex1.test(trimmedLine) && !taskRegex2.test(trimmedLine)) {
        errors.push({
          line: lineNumber + 1,
          message: '任务格式错误，支持格式: - [ ] 任务名 @时间 T:时长 ->依赖 或 - [ ] 任务名 时间 时长 ->依赖'
        })
      }
    }
  })

  return errors
}