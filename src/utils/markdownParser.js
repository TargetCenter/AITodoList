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
    // 匹配待办任务格式: - [ ] 任务名称 时间 计划时间 ->依赖
    const taskRegex = /^-\s*\[([ xX])\]\s*(.+?)\s+(\S+?)\s+(\S+?)(?:\s*->\s*(.+))?$/
    const match = line.match(taskRegex)
    
    if (match) {
      const [, checked, title, time, plannedTime, dependenciesStr] = match
      const completed = checked === 'x' || checked === 'X'
      const dependencies = dependenciesStr ? dependenciesStr.split(',').map(d => d.trim()) : []
      
      const task = {
        id: `task-${index}`,
        title,
        completed,
        time: time || null,
        plannedTime: plannedTime || null,
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
          message: '复选框格式错误，应为[ ] 或[x]'
        })
        return
      }
      
      // 检查基本格式
      const parts = line.trim().split(/\s+/)
      if (parts.length < 4) {
        errors.push({
          line: lineNumber + 1,
          message: '任务格式错误，应为: - [ ] 任务名称 时间 计划时间'
        })
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