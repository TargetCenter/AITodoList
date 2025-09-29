import * as monaco from 'monaco-editor'
import { parseMarkdown } from './markdownParser'

// 补全项类型
const CompletionItemKind = monaco.languages.CompletionItemKind

// 获取当前任务列表
const getCurrentTasks = (model) => {
  try {
    const content = model.getValue()
    return parseMarkdown(content)
  } catch (error) {
    return []
  }
}

// 获取当前日期相关的建议
const getDateSuggestions = () => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }

  return [
    {
      label: '@today',
      kind: CompletionItemKind.Keyword,
      insertText: '@today',
      detail: '今天',
      documentation: `今天 (${formatDate(today)})`
    },
    {
      label: '@tomorrow',
      kind: CompletionItemKind.Keyword,
      insertText: '@tomorrow',
      detail: '明天',
      documentation: `明天 (${formatDate(tomorrow)})`
    },
    {
      label: '@yesterday',
      kind: CompletionItemKind.Keyword,
      insertText: '@yesterday',
      detail: '昨天',
      documentation: `昨天 (${formatDate(yesterday)})`
    },
    {
      label: '@今天',
      kind: CompletionItemKind.Keyword,
      insertText: '@今天',
      detail: '今天',
      documentation: `今天 (${formatDate(today)})`
    },
    {
      label: '@明天',
      kind: CompletionItemKind.Keyword,
      insertText: '@明天',
      detail: '明天',
      documentation: `明天 (${formatDate(tomorrow)})`
    },
    {
      label: `@${formatDate(today)}`,
      kind: CompletionItemKind.Value,
      insertText: `@${formatDate(today)}`,
      detail: '今天的日期',
      documentation: '今天的具体日期'
    },
    {
      label: `@${formatDate(tomorrow)}`,
      kind: CompletionItemKind.Value,
      insertText: `@${formatDate(tomorrow)}`,
      detail: '明天的日期',
      documentation: '明天的具体日期'
    }
  ]
}

// 获取时间相关的建议
const getTimeSuggestions = () => {
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  
  return [
    {
      label: `@${currentTime}`,
      kind: CompletionItemKind.Value,
      insertText: `@${currentTime}`,
      detail: '当前时间',
      documentation: '当前的具体时间'
    },
    {
      label: '@09:00',
      kind: CompletionItemKind.Value,
      insertText: '@09:00',
      detail: '上午9点',
      documentation: '常用时间：上午9点'
    },
    {
      label: '@14:00',
      kind: CompletionItemKind.Value,
      insertText: '@14:00',
      detail: '下午2点',
      documentation: '常用时间：下午2点'
    },
    {
      label: '@18:00',
      kind: CompletionItemKind.Value,
      insertText: '@18:00',
      detail: '下午6点',
      documentation: '常用时间：下午6点'
    }
  ]
}

// 获取用时建议
const getDurationSuggestions = () => {
  return [
    {
      label: 'T:30min',
      kind: CompletionItemKind.Value,
      insertText: 'T:30min',
      detail: '30分钟',
      documentation: '预计用时：30分钟'
    },
    {
      label: 'T:1h',
      kind: CompletionItemKind.Value,
      insertText: 'T:1h',
      detail: '1小时',
      documentation: '预计用时：1小时'
    },
    {
      label: 'T:2h',
      kind: CompletionItemKind.Value,
      insertText: 'T:2h',
      detail: '2小时',
      documentation: '预计用时：2小时'
    },
    {
      label: 'T:0.5d',
      kind: CompletionItemKind.Value,
      insertText: 'T:0.5d',
      detail: '半天',
      documentation: '预计用时：半天'
    },
    {
      label: 'T:1d',
      kind: CompletionItemKind.Value,
      insertText: 'T:1d',
      detail: '1天',
      documentation: '预计用时：1天'
    },
    {
      label: 'T:1w',
      kind: CompletionItemKind.Value,
      insertText: 'T:1w',
      detail: '1周',
      documentation: '预计用时：1周'
    }
  ]
}

// 获取优先级建议
const getPrioritySuggestions = () => {
  return [
    {
      label: '!high',
      kind: CompletionItemKind.Keyword,
      insertText: '!high',
      detail: '高优先级',
      documentation: '标记为高优先级任务'
    },
    {
      label: '!medium',
      kind: CompletionItemKind.Keyword,
      insertText: '!medium',
      detail: '中优先级',
      documentation: '标记为中优先级任务'
    },
    {
      label: '!low',
      kind: CompletionItemKind.Keyword,
      insertText: '!low',
      detail: '低优先级',
      documentation: '标记为低优先级任务'
    },
    {
      label: '!urgent',
      kind: CompletionItemKind.Keyword,
      insertText: '!urgent',
      detail: '紧急',
      documentation: '标记为紧急任务'
    },
    {
      label: '!高',
      kind: CompletionItemKind.Keyword,
      insertText: '!高',
      detail: '高优先级',
      documentation: '标记为高优先级任务'
    },
    {
      label: '!中',
      kind: CompletionItemKind.Keyword,
      insertText: '!中',
      detail: '中优先级',
      documentation: '标记为中优先级任务'
    },
    {
      label: '!低',
      kind: CompletionItemKind.Keyword,
      insertText: '!低',
      detail: '低优先级',
      documentation: '标记为低优先级任务'
    }
  ]
}

// 获取标签建议
const getTagSuggestions = () => {
  return [
    {
      label: '#工作',
      kind: CompletionItemKind.Keyword,
      insertText: '#工作',
      detail: '工作标签',
      documentation: '工作相关的任务'
    },
    {
      label: '#学习',
      kind: CompletionItemKind.Keyword,
      insertText: '#学习',
      detail: '学习标签',
      documentation: '学习相关的任务'
    },
    {
      label: '#生活',
      kind: CompletionItemKind.Keyword,
      insertText: '#生活',
      detail: '生活标签',
      documentation: '生活相关的任务'
    },
    {
      label: '#项目',
      kind: CompletionItemKind.Keyword,
      insertText: '#项目',
      detail: '项目标签',
      documentation: '项目相关的任务'
    },
    {
      label: '#重要',
      kind: CompletionItemKind.Keyword,
      insertText: '#重要',
      detail: '重要标签',
      documentation: '重要的任务'
    },
    {
      label: '#work',
      kind: CompletionItemKind.Keyword,
      insertText: '#work',
      detail: 'Work tag',
      documentation: 'Work related tasks'
    },
    {
      label: '#study',
      kind: CompletionItemKind.Keyword,
      insertText: '#study',
      detail: 'Study tag',
      documentation: 'Study related tasks'
    },
    {
      label: '#personal',
      kind: CompletionItemKind.Keyword,
      insertText: '#personal',
      detail: 'Personal tag',
      documentation: 'Personal tasks'
    }
  ]
}

// 获取任务模板建议
const getTaskTemplateSuggestions = () => {
  return [
    {
      label: '- [ ] 新任务',
      kind: CompletionItemKind.Snippet,
      insertText: '- [ ] ${1:任务描述}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: '基本任务模板',
      documentation: '创建一个基本的待办任务'
    },
    {
      label: '- [ ] 带时间的任务',
      kind: CompletionItemKind.Snippet,
      insertText: '- [ ] ${1:任务描述} @${2:today}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: '带时间的任务模板',
      documentation: '创建一个带有时间标记的任务'
    },
    {
      label: '- [ ] 带用时的任务',
      kind: CompletionItemKind.Snippet,
      insertText: '- [ ] ${1:任务描述} T:${2:1h}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: '带用时的任务模板',
      documentation: '创建一个带有预计用时的任务'
    },
    {
      label: '- [ ] 完整任务',
      kind: CompletionItemKind.Snippet,
      insertText: '- [ ] ${1:任务描述} @${2:today} T:${3:1h} !${4:medium} #${5:工作}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: '完整任务模板',
      documentation: '创建一个包含时间、用时、优先级和标签的完整任务'
    },
    {
      label: '- [ ] 带依赖的任务',
      kind: CompletionItemKind.Snippet,
      insertText: '- [ ] ${1:任务描述} -> ${2:依赖任务}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: '带依赖的任务模板',
      documentation: '创建一个有依赖关系的任务'
    }
  ]
}

// 获取依赖任务建议
const getDependencySuggestions = (tasks) => {
  return tasks
    .filter(task => !task.completed)
    .map(task => ({
      label: task.title,
      kind: CompletionItemKind.Reference,
      insertText: task.title,
      detail: '依赖任务',
      documentation: `依赖任务：${task.title}${task.startTime ? ` (${task.startTime})` : ''}`
    }))
}

// 获取状态建议
const getStatusSuggestions = () => {
  return [
    {
      label: 'PENDING',
      kind: CompletionItemKind.Keyword,
      insertText: 'PENDING',
      detail: '待处理',
      documentation: '任务状态：待处理'
    },
    {
      label: 'IN_PROGRESS',
      kind: CompletionItemKind.Keyword,
      insertText: 'IN_PROGRESS',
      detail: '进行中',
      documentation: '任务状态：进行中'
    },
    {
      label: 'COMPLETED',
      kind: CompletionItemKind.Keyword,
      insertText: 'COMPLETED',
      detail: '已完成',
      documentation: '任务状态：已完成'
    },
    {
      label: 'CANCELLED',
      kind: CompletionItemKind.Keyword,
      insertText: 'CANCELLED',
      detail: '已取消',
      documentation: '任务状态：已取消'
    },
    {
      label: '待处理',
      kind: CompletionItemKind.Keyword,
      insertText: '待处理',
      detail: '待处理',
      documentation: '任务状态：待处理'
    },
    {
      label: '进行中',
      kind: CompletionItemKind.Keyword,
      insertText: '进行中',
      detail: '进行中',
      documentation: '任务状态：进行中'
    },
    {
      label: '已完成',
      kind: CompletionItemKind.Keyword,
      insertText: '已完成',
      detail: '已完成',
      documentation: '任务状态：已完成'
    }
  ]
}

// 补全提供者
export const todoCompletionProvider = {
  triggerCharacters: ['@', 'T', '!', '#', '-', ' '],
  
  provideCompletionItems: (model, position) => {
    const textUntilPosition = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    })

    const currentLine = model.getLineContent(position.lineNumber)
    const lineUntilCursor = currentLine.substring(0, position.column - 1)
    
    let suggestions = []

    // 任务模板建议（行首）
    if (lineUntilCursor.trim() === '' || lineUntilCursor.match(/^\s*$/)) {
      suggestions.push(...getTaskTemplateSuggestions())
    }

    // 时间相关建议
    if (lineUntilCursor.includes('@') || lineUntilCursor.endsWith('@')) {
      suggestions.push(...getDateSuggestions())
      suggestions.push(...getTimeSuggestions())
    }

    // 用时建议
    if (lineUntilCursor.includes('T:') || lineUntilCursor.endsWith('T:')) {
      suggestions.push(...getDurationSuggestions())
    }

    // 优先级建议
    if (lineUntilCursor.includes('!') || lineUntilCursor.endsWith('!')) {
      suggestions.push(...getPrioritySuggestions())
    }

    // 标签建议
    if (lineUntilCursor.includes('#') || lineUntilCursor.endsWith('#')) {
      suggestions.push(...getTagSuggestions())
    }

    // 依赖任务建议
    if (lineUntilCursor.includes('->') || lineUntilCursor.endsWith('->')) {
      const tasks = getCurrentTasks(model)
      suggestions.push(...getDependencySuggestions(tasks))
    }

    // 状态建议
    if (lineUntilCursor.match(/\b(status|状态)[:：]\s*$/i)) {
      suggestions.push(...getStatusSuggestions())
    }

    // 通用关键字建议
    const keywords = [
      'TODO', 'FIXME', 'NOTE', 'HACK', 'XXX', 'BUG', 'DONE',
      '待办', '已完成', '进行中', '暂停', '取消', '重要', '紧急'
    ]

    keywords.forEach(keyword => {
      suggestions.push({
        label: keyword,
        kind: CompletionItemKind.Keyword,
        insertText: keyword,
        detail: '关键字',
        documentation: `关键字：${keyword}`
      })
    })

    return {
      suggestions: suggestions
    }
  }
}