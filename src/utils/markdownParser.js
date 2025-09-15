// Markdown解析器，用于解析待办任务

/**
 * 解析Markdown内容，提取待办任务
 * @param {string} markdown - Markdown文本
 * @returns {Array} 任务对象数组
 */
export function parseMarkdown(markdown) {
  const lines = markdown.split('\n')
  const tasks = []
  const taskMap = new Map()
  
  lines.forEach((line, index) => {
    // 匹配待办任务格式: - [ ] 任务名称 @开始时间 用时
    const taskRegex = /^-\s*\[([ xX])\]\s*(.+?)(?:\s+@(\d{4}-\d{2}-\d{2}|\d{2}-\d{2}|\d{2}:\d{2}|\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}))?(?:\s+(\d+(?:\.\d+)?[hmd]))?(?:\s*-&gt;\s*(.+))?$/
    const match = line.match(taskRegex)
    
    if (match) {
      const [, checked, title, startTime, duration, dependenciesStr] = match
      const completed = checked === 'x' || checked === 'X'
      const dependencies = dependenciesStr ? dependenciesStr.split(',').map(d => d.trim()) : []
      
      const task = {
        id: `task-${index}`,
        title,
        completed,
        startTime: startTime || null,
        duration: duration || null,
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
  
  lines.forEach((line, lineNumber) => {
    // 跳过空行
    if (!line.trim()) return
    
    // 检查是否为待办任务格式
    if (line.startsWith('- [')) {
      // 检查复选框格式
      if (!/^- \[[ xX]\]/.test(line)) {
        errors.push({
          line: lineNumber + 1,
          message: '复选框格式错误，应为 [ ] 或 [x]'
        })
        return
      }
      
      // 检查时间格式
      const timeMatch = line.match(/@(\S+)/)
      if (timeMatch) {
        const timeStr = timeMatch[1]
        // 简单验证时间格式
        if (!/^(\d{4}-\d{2}-\d{2}|\d{2}-\d{2}|\d{2}:\d{2}|\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})$/.test(timeStr)) {
          errors.push({
            line: lineNumber + 1,
            message: `时间格式错误: ${timeStr}，应为 YYYY-MM-DD 或 HH:MM`
          })
        }
      }
      
      // 检查用时格式
      const durationMatch = line.match(/(\d+(?:\.\d+)?[hmd])/)
      if (durationMatch) {
        const durationStr = durationMatch[1]
        if (!/^\d+(?:\.\d+)?[hmd]$/.test(durationStr)) {
          errors.push({
            line: lineNumber + 1,
            message: `用时格式错误: ${durationStr}，应为数字+h|m|d (例如 2h, 1.5d)`
          })
        }
      }
    } else if (!line.trim().startsWith('#') && !line.trim().startsWith('>')) {
      // 不是待办任务也不是标题或引用，给出提示
      errors.push({
        line: lineNumber + 1,
        message: '非标准待办任务格式'
      })
    }
  })
  
  return errors
}