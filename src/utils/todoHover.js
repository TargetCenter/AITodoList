import * as monaco from 'monaco-editor'

// 获取时间相关的悬停信息
const getTimeHoverInfo = (text) => {
  // 相对时间
  if (text === 'today' || text === '今天') {
    const today = new Date()
    return {
      contents: [
        { value: '**今天**' },
        { value: `日期：${today.toISOString().split('T')[0]}` },
        { value: `星期：${['日', '一', '二', '三', '四', '五', '六'][today.getDay()]}` }
      ]
    }
  }

  if (text === 'tomorrow' || text === '明天') {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return {
      contents: [
        { value: '**明天**' },
        { value: `日期：${tomorrow.toISOString().split('T')[0]}` },
        { value: `星期：${['日', '一', '二', '三', '四', '五', '六'][tomorrow.getDay()]}` }
      ]
    }
  }

  if (text === 'yesterday' || text === '昨天') {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return {
      contents: [
        { value: '**昨天**' },
        { value: `日期：${yesterday.toISOString().split('T')[0]}` },
        { value: `星期：${['日', '一', '二', '三', '四', '五', '六'][yesterday.getDay()]}` }
      ]
    }
  }

  // 具体日期
  const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/)
  if (dateMatch) {
    const date = new Date(dateMatch[1])
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    let relativeText = ''
    if (diffDays === 0) {
      relativeText = '今天'
    } else if (diffDays === 1) {
      relativeText = '明天'
    } else if (diffDays === -1) {
      relativeText = '昨天'
    } else if (diffDays > 0) {
      relativeText = `${diffDays}天后`
    } else {
      relativeText = `${Math.abs(diffDays)}天前`
    }

    return {
      contents: [
        { value: '**日期信息**' },
        { value: `日期：${dateMatch[1]}` },
        { value: `星期：${['日', '一', '二', '三', '四', '五', '六'][date.getDay()]}` },
        { value: `相对时间：${relativeText}` }
      ]
    }
  }

  // 时间格式
  const timeMatch = text.match(/(\d{2}:\d{2})/)
  if (timeMatch) {
    const [hours, minutes] = timeMatch[1].split(':').map(Number)
    const period = hours >= 12 ? '下午' : '上午'
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours)
    
    return {
      contents: [
        { value: '**时间信息**' },
        { value: `时间：${timeMatch[1]}` },
        { value: `12小时制：${period} ${displayHours}:${minutes.toString().padStart(2, '0')}` }
      ]
    }
  }

  return null
}

// 获取用时相关的悬停信息
const getDurationHoverInfo = (text) => {
  const durationMatch = text.match(/T:(\d+(?:\.\d+)?)(h|d|w|m|y|小时|天|周|月|年|min|分钟)/)
  if (!durationMatch) return null

  const [, amount, unit] = durationMatch
  const numAmount = parseFloat(amount)
  
  const unitMap = {
    'min': { name: '分钟', hours: numAmount / 60 },
    '分钟': { name: '分钟', hours: numAmount / 60 },
    'h': { name: '小时', hours: numAmount },
    '小时': { name: '小时', hours: numAmount },
    'd': { name: '天', hours: numAmount * 8 }, // 按工作日8小时计算
    '天': { name: '天', hours: numAmount * 8 },
    'w': { name: '周', hours: numAmount * 40 }, // 按工作周40小时计算
    '周': { name: '周', hours: numAmount * 40 },
    'm': { name: '月', hours: numAmount * 160 }, // 按工作月160小时计算
    '月': { name: '月', hours: numAmount * 160 },
    'y': { name: '年', hours: numAmount * 2000 }, // 按工作年2000小时计算
    '年': { name: '年', hours: numAmount * 2000 }
  }

  const unitInfo = unitMap[unit]
  if (!unitInfo) return null

  const contents = [
    { value: '**用时信息**' },
    { value: `原始：${amount}${unitInfo.name}` }
  ]

  // 转换为其他单位
  if (unitInfo.hours !== numAmount) {
    contents.push({ value: `小时：${unitInfo.hours.toFixed(1)}小时` })
  }
  
  if (unitInfo.hours >= 8) {
    contents.push({ value: `工作日：${(unitInfo.hours / 8).toFixed(1)}天` })
  }
  
  if (unitInfo.hours >= 40) {
    contents.push({ value: `工作周：${(unitInfo.hours / 40).toFixed(1)}周` })
  }

  return { contents }
}

// 获取优先级相关的悬停信息
const getPriorityHoverInfo = (text) => {
  const priorityMatch = text.match(/!(high|medium|low|urgent|normal|高|中|低|紧急|普通)/i)
  if (!priorityMatch) return null

  const priority = priorityMatch[1].toLowerCase()
  
  const priorityMap = {
    'high': { name: '高优先级', color: '🔴', description: '需要优先处理的重要任务' },
    '高': { name: '高优先级', color: '🔴', description: '需要优先处理的重要任务' },
    'urgent': { name: '紧急', color: '🚨', description: '需要立即处理的紧急任务' },
    '紧急': { name: '紧急', color: '🚨', description: '需要立即处理的紧急任务' },
    'medium': { name: '中优先级', color: '🟡', description: '正常优先级的任务' },
    '中': { name: '中优先级', color: '🟡', description: '正常优先级的任务' },
    'normal': { name: '普通', color: '🟢', description: '普通优先级的任务' },
    '普通': { name: '普通', color: '🟢', description: '普通优先级的任务' },
    'low': { name: '低优先级', color: '🔵', description: '可以延后处理的任务' },
    '低': { name: '低优先级', color: '🔵', description: '可以延后处理的任务' }
  }

  const priorityInfo = priorityMap[priority]
  if (!priorityInfo) return null

  return {
    contents: [
      { value: '**优先级信息**' },
      { value: `${priorityInfo.color} ${priorityInfo.name}` },
      { value: priorityInfo.description }
    ]
  }
}

// 获取标签相关的悬停信息
const getTagHoverInfo = (text) => {
  const tagMatch = text.match(/#([a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]*)/)
  if (!tagMatch) return null

  const tag = tagMatch[1]
  
  const commonTags = {
    '工作': { description: '工作相关的任务', icon: '💼' },
    'work': { description: 'Work related tasks', icon: '💼' },
    '学习': { description: '学习相关的任务', icon: '📚' },
    'study': { description: 'Study related tasks', icon: '📚' },
    '生活': { description: '生活相关的任务', icon: '🏠' },
    'personal': { description: 'Personal tasks', icon: '🏠' },
    '项目': { description: '项目相关的任务', icon: '📋' },
    'project': { description: 'Project related tasks', icon: '📋' },
    '重要': { description: '重要的任务', icon: '⭐' },
    'important': { description: 'Important tasks', icon: '⭐' },
    '紧急': { description: '紧急的任务', icon: '🚨' },
    'urgent': { description: 'Urgent tasks', icon: '🚨' }
  }

  const tagInfo = commonTags[tag]
  
  return {
    contents: [
      { value: '**标签信息**' },
      { value: `${tagInfo ? tagInfo.icon : '🏷️'} #${tag}` },
      { value: tagInfo ? tagInfo.description : `标签：${tag}` }
    ]
  }
}

// 获取任务状态相关的悬停信息
const getTaskStatusHoverInfo = (text) => {
  if (text === '[ ]') {
    return {
      contents: [
        { value: '**任务状态**' },
        { value: '☐ 未完成任务' },
        { value: '点击复选框可以标记为完成' }
      ]
    }
  }

  if (text === '[x]' || text === '[X]') {
    return {
      contents: [
        { value: '**任务状态**' },
        { value: '☑️ 已完成任务' },
        { value: '点击复选框可以取消完成状态' }
      ]
    }
  }

  return null
}

// 获取依赖关系的悬停信息
const getDependencyHoverInfo = (text, model) => {
  if (!text.includes('->')) return null

  const dependencyMatch = text.match(/->(.+)$/)
  if (!dependencyMatch) return null

  const dependencies = dependencyMatch[1].split(',').map(dep => dep.trim())
  
  return {
    contents: [
      { value: '**依赖关系**' },
      { value: '🔗 此任务依赖于以下任务：' },
      ...dependencies.map(dep => ({ value: `• ${dep}` })),
      { value: '完成依赖任务后才能开始此任务' }
    ]
  }
}

// 悬停提供者
export const todoHoverProvider = {
  provideHover: (model, position) => {
    const word = model.getWordAtPosition(position)
    if (!word) return null

    const line = model.getLineContent(position.lineNumber)
    const wordText = word.word
    
    // 检查各种类型的悬停信息
    let hoverInfo = null

    // 时间相关
    if (line.includes('@')) {
      const timeMatch = line.match(/@(\w+|\d{4}-\d{2}-\d{2}|\d{2}:\d{2})/g)
      if (timeMatch) {
        for (const match of timeMatch) {
          if (match.includes(wordText)) {
            hoverInfo = getTimeHoverInfo(match.substring(1))
            break
          }
        }
      }
    }

    // 用时相关
    if (!hoverInfo && line.includes('T:')) {
      const durationMatch = line.match(/T:\d+(?:\.\d+)?[a-zA-Z\u4e00-\u9fa5]+/)
      if (durationMatch && durationMatch[0].includes(wordText)) {
        hoverInfo = getDurationHoverInfo(durationMatch[0])
      }
    }

    // 优先级相关
    if (!hoverInfo && line.includes('!')) {
      const priorityMatch = line.match(/![a-zA-Z\u4e00-\u9fa5]+/)
      if (priorityMatch && priorityMatch[0].includes(wordText)) {
        hoverInfo = getPriorityHoverInfo(priorityMatch[0])
      }
    }

    // 标签相关
    if (!hoverInfo && line.includes('#')) {
      const tagMatch = line.match(/#[a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]*/)
      if (tagMatch && tagMatch[0].includes(wordText)) {
        hoverInfo = getTagHoverInfo(tagMatch[0])
      }
    }

    // 任务状态
    if (!hoverInfo) {
      const statusMatch = line.match(/\[([ xX])\]/)
      if (statusMatch) {
        const statusPos = line.indexOf(statusMatch[0])
        if (position.column >= statusPos + 1 && position.column <= statusPos + statusMatch[0].length + 1) {
          hoverInfo = getTaskStatusHoverInfo(statusMatch[0])
        }
      }
    }

    // 依赖关系
    if (!hoverInfo && line.includes('->')) {
      hoverInfo = getDependencyHoverInfo(line, model)
    }

    // 通用关键字
    if (!hoverInfo) {
      const keywords = {
        'TODO': '待办事项标记',
        'FIXME': '需要修复的问题',
        'NOTE': '注释或说明',
        'HACK': '临时解决方案',
        'XXX': '需要注意的地方',
        'BUG': '已知的错误',
        'DONE': '已完成的任务',
        '待办': '待办事项',
        '已完成': '已完成的任务',
        '进行中': '正在进行的任务',
        '暂停': '暂停的任务',
        '取消': '已取消的任务',
        '重要': '重要的任务',
        '紧急': '紧急的任务'
      }

      if (keywords[wordText]) {
        hoverInfo = {
          contents: [
            { value: '**关键字**' },
            { value: `${wordText}: ${keywords[wordText]}` }
          ]
        }
      }
    }

    return hoverInfo
  }
}