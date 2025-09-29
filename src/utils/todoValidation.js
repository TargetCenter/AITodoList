import * as monaco from 'monaco-editor'

// 错误类型定义
const DiagnosticSeverity = monaco.MarkerSeverity

// 语法校验规则
class TodoValidator {
  constructor() {
    this.rules = [
      this.validateTaskSyntax,
      this.validateDateFormat,
      this.validateTimeFormat,
      this.validateDurationFormat,
      this.validateDependencies,
      this.validatePriorityFormat,
      this.validateTagFormat
    ]
  }

  // 校验任务语法
  validateTaskSyntax(line, lineNumber) {
    const errors = []
    
    // 检查任务格式
    const taskMatch = line.match(/^(\s*)-(\s*)\[(.)\](.*)$/)
    if (taskMatch) {
      const [, indent, space1, checkbox, content] = taskMatch
      
      // 检查复选框格式
      if (![' ', 'x', 'X'].includes(checkbox)) {
        errors.push({
          severity: DiagnosticSeverity.Error,
          startLineNumber: lineNumber,
          startColumn: line.indexOf('[') + 2,
          endLineNumber: lineNumber,
          endColumn: line.indexOf('[') + 3,
          message: `无效的复选框状态 '${checkbox}'，应该是 ' '、'x' 或 'X'`
        })
      }

      // 检查任务内容是否为空
      if (!content.trim()) {
        errors.push({
          severity: DiagnosticSeverity.Warning,
          startLineNumber: lineNumber,
          startColumn: line.indexOf(']') + 1,
          endLineNumber: lineNumber,
          endColumn: line.length + 1,
          message: '任务描述不能为空'
        })
      }

      // 检查缩进是否为偶数个空格
      if (indent.length % 2 !== 0) {
        errors.push({
          severity: DiagnosticSeverity.Warning,
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: indent.length + 1,
          message: '建议使用偶数个空格进行缩进'
        })
      }
    }

    return errors
  }

  // 校验日期格式
  validateDateFormat(line, lineNumber) {
    const errors = []
    const dateMatches = line.matchAll(/@(\d{4}-\d{2}-\d{2})/g)
    
    for (const match of dateMatches) {
      const dateStr = match[1]
      const date = new Date(dateStr)
      
      // 检查日期是否有效
      if (isNaN(date.getTime()) || date.toISOString().split('T')[0] !== dateStr) {
        const startCol = match.index + 1
        errors.push({
          severity: DiagnosticSeverity.Error,
          startLineNumber: lineNumber,
          startColumn: startCol,
          endLineNumber: lineNumber,
          endColumn: startCol + match[0].length,
          message: `无效的日期格式 '${dateStr}'，应该是 YYYY-MM-DD 格式`
        })
      } else {
        // 检查日期是否过于久远
        const today = new Date()
        const diffTime = Math.abs(date.getTime() - today.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays > 365 * 10) { // 超过10年
          const startCol = match.index + 1
          errors.push({
            severity: DiagnosticSeverity.Warning,
            startLineNumber: lineNumber,
            startColumn: startCol,
            endLineNumber: lineNumber,
            endColumn: startCol + match[0].length,
            message: `日期 '${dateStr}' 距离现在过于久远，请确认是否正确`
          })
        }
      }
    }

    return errors
  }

  // 校验时间格式
  validateTimeFormat(line, lineNumber) {
    const errors = []
    const timeMatches = line.matchAll(/@(\d{2}:\d{2})/g)
    
    for (const match of timeMatches) {
      const timeStr = match[1]
      const [hours, minutes] = timeStr.split(':').map(Number)
      
      // 检查小时和分钟范围
      if (hours < 0 || hours > 23) {
        const startCol = match.index + 1
        errors.push({
          severity: DiagnosticSeverity.Error,
          startLineNumber: lineNumber,
          startColumn: startCol,
          endLineNumber: lineNumber,
          endColumn: startCol + match[0].length,
          message: `无效的小时 '${hours}'，应该在 00-23 范围内`
        })
      }
      
      if (minutes < 0 || minutes > 59) {
        const startCol = match.index + 1
        errors.push({
          severity: DiagnosticSeverity.Error,
          startLineNumber: lineNumber,
          startColumn: startCol,
          endLineNumber: lineNumber,
          endColumn: startCol + match[0].length,
          message: `无效的分钟 '${minutes}'，应该在 00-59 范围内`
        })
      }
    }

    return errors
  }

  // 校验用时格式
  validateDurationFormat(line, lineNumber) {
    const errors = []
    const durationMatches = line.matchAll(/T:(\d+(?:\.\d+)?)(h|d|w|m|y|小时|天|周|月|年|min|分钟)/g)
    
    for (const match of durationMatches) {
      const amount = parseFloat(match[1])
      const unit = match[2]
      
      // 检查数值是否合理
      if (amount <= 0) {
        const startCol = match.index + 1
        errors.push({
          severity: DiagnosticSeverity.Error,
          startLineNumber: lineNumber,
          startColumn: startCol,
          endLineNumber: lineNumber,
          endColumn: startCol + match[0].length,
          message: `用时数值 '${amount}' 必须大于 0`
        })
      }

      // 检查是否过于夸张
      const maxValues = {
        'min': 1440, '分钟': 1440, // 24小时
        'h': 24, '小时': 24, // 24小时
        'd': 365, '天': 365, // 1年
        'w': 52, '周': 52, // 1年
        'm': 12, '月': 12, // 1年
        'y': 10, '年': 10 // 10年
      }

      if (maxValues[unit] && amount > maxValues[unit]) {
        const startCol = match.index + 1
        errors.push({
          severity: DiagnosticSeverity.Warning,
          startLineNumber: lineNumber,
          startColumn: startCol,
          endLineNumber: lineNumber,
          endColumn: startCol + match[0].length,
          message: `用时 '${amount}${unit}' 似乎过长，请确认是否正确`
        })
      }
    }

    return errors
  }

  // 校验依赖关系
  validateDependencies(line, lineNumber) {
    const errors = []
    const dependencyMatch = line.match(/->(.+)$/)
    
    if (dependencyMatch) {
      const dependencies = dependencyMatch[1].split(',').map(dep => dep.trim())
      
      for (const dep of dependencies) {
        if (!dep) {
          const startCol = line.indexOf('->') + 1
          errors.push({
            severity: DiagnosticSeverity.Error,
            startLineNumber: lineNumber,
            startColumn: startCol,
            endLineNumber: lineNumber,
            endColumn: line.length + 1,
            message: '依赖任务名称不能为空'
          })
        }
        
        // 检查是否有重复的依赖
        const duplicates = dependencies.filter(d => d === dep)
        if (duplicates.length > 1) {
          const startCol = line.indexOf('->') + 1
          errors.push({
            severity: DiagnosticSeverity.Warning,
            startLineNumber: lineNumber,
            startColumn: startCol,
            endLineNumber: lineNumber,
            endColumn: line.length + 1,
            message: `重复的依赖任务 '${dep}'`
          })
        }
      }
    }

    return errors
  }

  // 校验优先级格式
  validatePriorityFormat(line, lineNumber) {
    const errors = []
    const priorityMatches = line.matchAll(/!([a-zA-Z\u4e00-\u9fa5]+)/g)
    
    const validPriorities = [
      'high', 'medium', 'low', 'urgent', 'normal',
      '高', '中', '低', '紧急', '普通'
    ]

    for (const match of priorityMatches) {
      const priority = match[1].toLowerCase()
      
      if (!validPriorities.includes(priority) && !validPriorities.includes(match[1])) {
        const startCol = match.index + 1
        errors.push({
          severity: DiagnosticSeverity.Warning,
          startLineNumber: lineNumber,
          startColumn: startCol,
          endLineNumber: lineNumber,
          endColumn: startCol + match[0].length,
          message: `未知的优先级 '${match[1]}'，建议使用：high, medium, low, urgent, normal 或 高, 中, 低, 紧急, 普通`
        })
      }
    }

    return errors
  }

  // 校验标签格式
  validateTagFormat(line, lineNumber) {
    const errors = []
    const tagMatches = line.matchAll(/#([a-zA-Z0-9_\u4e00-\u9fa5]*)/g)
    
    for (const match of tagMatches) {
      const tag = match[1]
      
      // 检查标签是否为空
      if (!tag) {
        const startCol = match.index + 1
        errors.push({
          severity: DiagnosticSeverity.Error,
          startLineNumber: lineNumber,
          startColumn: startCol,
          endLineNumber: lineNumber,
          endColumn: startCol + 1,
          message: '标签名称不能为空'
        })
      }
      
      // 检查标签是否以数字开头
      if (tag && /^\d/.test(tag)) {
        const startCol = match.index + 1
        errors.push({
          severity: DiagnosticSeverity.Warning,
          startLineNumber: lineNumber,
          startColumn: startCol,
          endLineNumber: lineNumber,
          endColumn: startCol + match[0].length,
          message: `标签 '${tag}' 不建议以数字开头`
        })
      }
      
      // 检查标签长度
      if (tag && tag.length > 20) {
        const startCol = match.index + 1
        errors.push({
          severity: DiagnosticSeverity.Warning,
          startLineNumber: lineNumber,
          startColumn: startCol,
          endLineNumber: lineNumber,
          endColumn: startCol + match[0].length,
          message: `标签 '${tag}' 过长，建议不超过20个字符`
        })
      }
    }

    return errors
  }

  // 校验整个文档
  validateDocument(model) {
    const markers = []
    const lineCount = model.getLineCount()
    
    for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
      const line = model.getLineContent(lineNumber)
      
      // 跳过空行和注释行
      if (!line.trim() || line.trim().startsWith('//') || line.trim().startsWith('/*')) {
        continue
      }
      
      // 应用所有校验规则
      for (const rule of this.rules) {
        const errors = rule.call(this, line, lineNumber)
        markers.push(...errors)
      }
    }

    return markers
  }

  // 校验任务依赖的循环引用
  validateCircularDependencies(model) {
    const markers = []
    const tasks = this.parseTasksFromModel(model)
    const visited = new Set()
    const recursionStack = new Set()

    const hasCycle = (taskTitle, path = []) => {
      if (recursionStack.has(taskTitle)) {
        return path.concat(taskTitle)
      }
      
      if (visited.has(taskTitle)) {
        return null
      }

      visited.add(taskTitle)
      recursionStack.add(taskTitle)

      const task = tasks.find(t => t.title === taskTitle)
      if (task && task.dependencies) {
        for (const dep of task.dependencies) {
          const cycle = hasCycle(dep, path.concat(taskTitle))
          if (cycle) {
            return cycle
          }
        }
      }

      recursionStack.delete(taskTitle)
      return null
    }

    for (const task of tasks) {
      visited.clear()
      recursionStack.clear()
      
      const cycle = hasCycle(task.title)
      if (cycle) {
        markers.push({
          severity: DiagnosticSeverity.Error,
          startLineNumber: task.lineNumber,
          startColumn: 1,
          endLineNumber: task.lineNumber,
          endColumn: task.line.length + 1,
          message: `检测到循环依赖：${cycle.join(' -> ')}`
        })
      }
    }

    return markers
  }

  // 从模型中解析任务
  parseTasksFromModel(model) {
    const tasks = []
    const lineCount = model.getLineCount()
    
    for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
      const line = model.getLineContent(lineNumber)
      const taskMatch = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.+?)(?:\s*->(.+))?$/)
      
      if (taskMatch) {
        const [, , , title, dependenciesStr] = taskMatch
        const dependencies = dependenciesStr 
          ? dependenciesStr.split(',').map(dep => dep.trim())
          : []
        
        tasks.push({
          title: title.trim(),
          dependencies,
          lineNumber,
          line
        })
      }
    }
    
    return tasks
  }
}

// 语法校验提供者
export const todoValidationProvider = {
  validator: new TodoValidator(),
  
  register() {
    // 注册模型变化监听器
    monaco.editor.onDidCreateModel((model) => {
      if (model.getLanguageId() === 'todo-markdown') {
        this.validateModel(model)
        
        // 监听内容变化
        model.onDidChangeContent(() => {
          // 延迟校验，避免频繁校验
          setTimeout(() => {
            this.validateModel(model)
          }, 500)
        })
      }
    })
  },

  validateModel(model) {
    if (model.getLanguageId() !== 'todo-markdown') {
      return
    }

    try {
      // 基本语法校验
      const basicMarkers = this.validator.validateDocument(model)
      
      // 循环依赖校验
      const circularMarkers = this.validator.validateCircularDependencies(model)
      
      // 合并所有错误标记
      const allMarkers = [...basicMarkers, ...circularMarkers]
      
      // 设置错误标记
      monaco.editor.setModelMarkers(model, 'todo-validation', allMarkers)
    } catch (error) {
      console.error('语法校验出错:', error)
    }
  },

  // 手动触发校验
  validate(model) {
    this.validateModel(model)
  }
}