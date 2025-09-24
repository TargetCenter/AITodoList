// 自动补全数据源

/**
 * 获取任务模板
 */
export function getTaskTemplates() {
  return [
    {
      label: '- [ ] 新任务',
      description: '创建一个新的待办任务',
      insertText: '- [ ] ',
      type: 'task'
    },
    {
      label: '- [x] 已完成任务',
      description: '创建一个已完成的任务',
      insertText: '- [x] ',
      type: 'task'
    },
    {
      label: '- [ ] 任务 @时间',
      description: '带开始时间的任务',
      insertText: '- [ ] ${1:任务名称} @${2:2023-12-01}',
      type: 'task-with-time'
    },
    {
      label: '- [ ] 任务 @时间 T:用时',
      description: '带开始时间和用时的任务',
      insertText: '- [ ] ${1:任务名称} @${2:2023-12-01} T:${3:2h}',
      type: 'task-with-duration'
    },
    {
      label: '- [ ] 任务 ->依赖',
      description: '带依赖关系的任务',
      insertText: '- [ ] ${1:任务名称} ->${2:依赖任务}',
      type: 'task-with-dependency'
    },
    {
      label: '- [ ] 完整任务',
      description: '包含所有属性的完整任务',
      insertText: '- [ ] ${1:任务名称} @${2:2023-12-01} T:${3:2h} ->${4:依赖任务}',
      type: 'full-task'
    }
  ]
}

/**
 * 获取时间格式建议
 */
export function getTimeFormats() {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return [
    {
      label: formatDate(today),
      description: '今天',
      insertText: formatDate(today),
      type: 'date'
    },
    {
      label: formatDate(tomorrow),
      description: '明天',
      insertText: formatDate(tomorrow),
      type: 'date'
    },
    {
      label: '2023-12-01',
      description: '标准日期格式 (YYYY-MM-DD)',
      insertText: '2023-12-01',
      type: 'date'
    },
    {
      label: '09:00',
      description: '时间格式 (HH:MM)',
      insertText: '09:00',
      type: 'time'
    },
    {
      label: '2023-12-01 09:00',
      description: '日期时间格式',
      insertText: '2023-12-01 09:00',
      type: 'datetime'
    }
  ]
}

/**
 * 获取用时格式建议
 */
export function getDurationFormats() {
  return [
    {
      label: '1h',
      description: '1小时',
      insertText: '1h',
      type: 'duration'
    },
    {
      label: '2h',
      description: '2小时',
      insertText: '2h',
      type: 'duration'
    },
    {
      label: '4h',
      description: '4小时',
      insertText: '4h',
      type: 'duration'
    },
    {
      label: '1d',
      description: '1天',
      insertText: '1d',
      type: 'duration'
    },
    {
      label: '2d',
      description: '2天',
      insertText: '2d',
      type: 'duration'
    },
    {
      label: '1w',
      description: '1周',
      insertText: '1w',
      type: 'duration'
    },
    {
      label: '1m',
      description: '1个月',
      insertText: '1m',
      type: 'duration'
    },
    {
      label: '0.5h',
      description: '30分钟',
      insertText: '0.5h',
      type: 'duration'
    },
    {
      label: '1.5h',
      description: '1.5小时',
      insertText: '1.5h',
      type: 'duration'
    }
  ]
}

/**
 * 获取常用任务建议
 */
export function getCommonTasks() {
  return [
    {
      label: '需求分析',
      description: '项目需求分析和整理',
      insertText: '- [ ] 需求分析 @${1:2023-12-01} T:${2:2h}',
      type: 'common-task'
    },
    {
      label: '技术调研',
      description: '技术方案调研和选型',
      insertText: '- [ ] 技术调研 @${1:2023-12-01} T:${2:4h}',
      type: 'common-task'
    },
    {
      label: '数据库设计',
      description: '设计数据库表结构',
      insertText: '- [ ] 数据库设计 @${1:2023-12-01} T:${2:3h}',
      type: 'common-task'
    },
    {
      label: 'API开发',
      description: '后端API接口开发',
      insertText: '- [ ] API开发 @${1:2023-12-01} T:${2:6h}',
      type: 'common-task'
    },
    {
      label: '前端开发',
      description: '前端页面和组件开发',
      insertText: '- [ ] 前端开发 @${1:2023-12-01} T:${2:8h}',
      type: 'common-task'
    },
    {
      label: '单元测试',
      description: '编写单元测试用例',
      insertText: '- [ ] 单元测试 @${1:2023-12-01} T:${2:2h}',
      type: 'common-task'
    },
    {
      label: '集成测试',
      description: '系统集成测试',
      insertText: '- [ ] 集成测试 @${1:2023-12-01} T:${2:3h}',
      type: 'common-task'
    },
    {
      label: '部署上线',
      description: '项目部署和上线',
      insertText: '- [ ] 部署上线 @${1:2023-12-01} T:${2:1h}',
      type: 'common-task'
    },
    {
      label: '文档编写',
      description: '项目文档编写',
      insertText: '- [ ] 文档编写 @${1:2023-12-01} T:${2:2h}',
      type: 'common-task'
    },
    {
      label: '代码审查',
      description: '代码审查和优化',
      insertText: '- [ ] 代码审查 @${1:2023-12-01} T:${2:1h}',
      type: 'common-task'
    }
  ]
}

/**
 * 根据上下文获取自动补全建议
 * @param {string} line - 当前行内容
 * @param {number} cursor - 光标位置
 * @param {Array} existingTasks - 已存在的任务列表
 */
export function getAutoCompleteSuggestions(line, cursor, existingTasks = []) {
  const beforeCursor = line.substring(0, cursor)
  const afterCursor = line.substring(cursor)
  
  // 如果在行首，提供任务模板
  if (beforeCursor.trim() === '' || beforeCursor.trim() === '-') {
    return getTaskTemplates()
  }
  
  // 如果在@符号后，提供时间格式
  if (beforeCursor.includes('@') && !beforeCursor.includes(' ', beforeCursor.lastIndexOf('@'))) {
    return getTimeFormats()
  }
  
  // 如果在T:后，提供用时格式
  if (beforeCursor.includes('T:') && !beforeCursor.includes(' ', beforeCursor.lastIndexOf('T:'))) {
    return getDurationFormats()
  }
  
  // 如果在->后，提供已存在的任务作为依赖
  if (beforeCursor.includes('->')) {
    const dependencyStart = beforeCursor.lastIndexOf('->')
    const dependencyText = beforeCursor.substring(dependencyStart + 2).trim()
    
    return existingTasks
      .filter(task => task.title.toLowerCase().includes(dependencyText.toLowerCase()))
      .map(task => ({
        label: task.title,
        description: `依赖任务: ${task.title}`,
        insertText: task.title,
        type: 'dependency'
      }))
  }
  
  // 如果输入了部分任务名称，提供常用任务建议
  if (beforeCursor.match(/^-\s*\[\s*\]\s*(.+)$/)) {
    const taskName = beforeCursor.match(/^-\s*\[\s*\]\s*(.+)$/)[1]
    return getCommonTasks().filter(task => 
      task.label.toLowerCase().includes(taskName.toLowerCase())
    )
  }
  
  // 默认返回任务模板
  return getTaskTemplates()
}

/**
 * 处理模板插入，支持占位符
 * @param {string} template - 模板字符串
 * @param {Function} onPlaceholder - 占位符处理回调
 */
export function processTemplate(template, onPlaceholder) {
  // 查找所有占位符 ${number:defaultText}
  const placeholders = []
  const regex = /\$\{(\d+):([^}]+)\}/g
  let match
  
  while ((match = regex.exec(template)) !== null) {
    placeholders.push({
      index: parseInt(match[1]),
      defaultText: match[2],
      start: match.index,
      end: match.index + match[0].length,
      fullMatch: match[0]
    })
  }
  
  // 按索引排序
  placeholders.sort((a, b) => a.index - b.index)
  
  // 替换占位符为默认文本
  let result = template
  for (let i = placeholders.length - 1; i >= 0; i--) {
    const placeholder = placeholders[i]
    result = result.substring(0, placeholder.start) + 
             placeholder.defaultText + 
             result.substring(placeholder.end)
  }
  
  return {
    text: result,
    placeholders: placeholders.map((p, i) => ({
      ...p,
      // 重新计算位置（因为前面的替换会影响后面的位置）
      start: p.start - placeholders.slice(0, i).reduce((acc, prev) => 
        acc + (prev.fullMatch.length - prev.defaultText.length), 0),
      end: p.start - placeholders.slice(0, i).reduce((acc, prev) => 
        acc + (prev.fullMatch.length - prev.defaultText.length), 0) + p.defaultText.length
    }))
  }
}