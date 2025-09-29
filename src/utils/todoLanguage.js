// Todo Markdown 语言的 Monarch 定义
export const todoLanguageDefinition = {
  // 设置默认token
  defaultToken: 'text',
  
  // 忽略大小写
  ignoreCase: false,

  // 关键字定义
  keywords: [
    'TODO', 'FIXME', 'NOTE', 'HACK', 'XXX', 'BUG', 'DONE',
    '待办', '已完成', '进行中', '暂停', '取消', '重要', '紧急'
  ],

  // 优先级关键字
  priorities: [
    'HIGH', 'MEDIUM', 'LOW', 'URGENT', 'NORMAL',
    '高', '中', '低', '紧急', '普通'
  ],

  // 状态关键字
  statuses: [
    'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'PAUSED',
    '待处理', '进行中', '已完成', '已取消', '已暂停'
  ],

  // 时间单位
  timeUnits: [
    'h', 'hour', 'hours', 'd', 'day', 'days', 'w', 'week', 'weeks',
    'm', 'month', 'months', 'y', 'year', 'years', 'min', 'minute', 'minutes',
    '小时', '天', '周', '月', '年', '分钟'
  ],

  // 符号定义
  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  // 转义字符
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  // 分词器规则
  tokenizer: {
    root: [
      // 任务项（简化版本）
      [/^(\s*)(-\s*\[)([ xX])(\]\s*)/, ['white', 'keyword.todo', 'keyword.todo.checkbox', 'keyword.todo']],

      // 标题（# ## ### 等）
      [/^#{1,6}\s+.*$/, 'string.header'],

      // 时间标记 @YYYY-MM-DD 或 @today, @tomorrow 等
      [/@(today|tomorrow|yesterday|今天|明天|昨天)/, 'keyword.time.relative'],
      [/@\d{4}-\d{2}-\d{2}/, 'keyword.time.date'],
      [/@\d{2}:\d{2}/, 'keyword.time.clock'],
      [/@\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/, 'keyword.time.datetime'],

      // 用时标记 T:2h, T:1d 等
      [/T:\d+(?:\.\d+)?[a-zA-Z\u4e00-\u9fa5]+/, 'keyword.duration'],

      // 依赖关系 ->
      [/->/, 'keyword.dependency.arrow'],

      // 优先级标记 !high, !medium, !low
      [/!(high|medium|low|urgent|normal|高|中|低|紧急|普通)/i, 'keyword.priority'],

      // 标签 #tag
      [/#[a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]*/, 'keyword.tag'],

      // 关键字
      [/\b(TODO|FIXME|NOTE|HACK|XXX|BUG|DONE|待办|已完成|进行中|暂停|取消|重要|紧急)\b/, 'keyword'],

      // 状态关键字
      [/\b(PENDING|IN_PROGRESS|COMPLETED|CANCELLED|PAUSED|待处理|进行中|已完成|已取消|已暂停)\b/, 'keyword.status'],

      // 数字
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/\d+/, 'number'],

      // 字符串
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/'([^'\\]|\\.)*$/, 'string.invalid'],
      [/"/, 'string', '@string_double'],
      [/'/, 'string', '@string_single'],
      [/`/, 'string', '@string_backtick'],

      // 代码块
      [/^```/, 'string.code', '@codeblock'],

      // 链接
      [/\[([^\]]*)\]\(([^)]*)\)/, 'string.link'],
      [/https?:\/\/[^\s]+/, 'string.url'],

      // 强调
      [/\*\*[^*]+\*\*/, 'markup.bold'],
      [/\*[^*]+\*/, 'markup.italic'],
      [/~~[^~]+~~/, 'markup.strikethrough'],
      [/`[^`]+`/, 'markup.code'],

      // 分隔符
      [/[{}()\[\]]/, 'delimiter.bracket'],
      [/[<>]/, 'delimiter.angle'],
      [/@symbols/, 'delimiter'],

      // 空白字符
      [/[ \t\r\n]+/, 'white'],

      // 其他文本
      [/[^\s]+/, 'text']
    ],

    // 双引号字符串
    string_double: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, 'string', '@pop']
    ],

    // 单引号字符串
    string_single: [
      [/[^\\']+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/'/, 'string', '@pop']
    ],

    // 反引号字符串
    string_backtick: [
      [/[^\\`]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/`/, 'string', '@pop']
    ],

    // 代码块
    codeblock: [
      [/^```/, 'string.code', '@pop'],
      [/.*/, 'string.code']
    ]
  }
}

// 自定义主题定义
export const todoTheme = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'keyword.todo', foreground: '0066cc', fontStyle: 'bold' },
    { token: 'keyword.todo.checkbox', foreground: 'ff6b6b', fontStyle: 'bold' },
    { token: 'keyword.header', foreground: '2b8a3e', fontStyle: 'bold' },
    { token: 'string.header', foreground: '2b8a3e', fontStyle: 'bold' },
    { token: 'keyword.time.relative', foreground: 'fd7e14', fontStyle: 'italic' },
    { token: 'keyword.time.date', foreground: '1c7ed6' },
    { token: 'keyword.time.clock', foreground: '1c7ed6' },
    { token: 'keyword.time.datetime', foreground: '1c7ed6' },
    { token: 'keyword.duration', foreground: 'ae3ec9', fontStyle: 'bold' },
    { token: 'keyword.dependency.arrow', foreground: 'f76707', fontStyle: 'bold' },
    { token: 'keyword.priority', foreground: 'e03131', fontStyle: 'bold' },
    { token: 'keyword.tag', foreground: '7950f2' },
    { token: 'keyword.status', foreground: '099268', fontStyle: 'bold' },
    { token: 'markup.bold', fontStyle: 'bold' },
    { token: 'markup.italic', fontStyle: 'italic' },
    { token: 'markup.strikethrough', fontStyle: 'strikethrough' },
    { token: 'markup.code', foreground: 'd63384', background: 'f8f9fa' },
    { token: 'string.link', foreground: '0969da' },
    { token: 'string.url', foreground: '0969da', fontStyle: 'underline' },
    { token: 'string.code', foreground: '24292f', background: 'f6f8fa' },
    { token: 'text', foreground: '24292f' }
  ],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#24292f',
    'editorLineNumber.foreground': '#656d76',
    'editorLineNumber.activeForeground': '#24292f',
    'editor.selectionBackground': '#0969da26',
    'editor.selectionHighlightBackground': '#0969da1a',
    'editor.findMatchBackground': '#ffdf5d66',
    'editor.findMatchHighlightBackground': '#ffdf5d33'
  }
}

// 深色主题定义
export const todoDarkTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword.todo', foreground: '58a6ff', fontStyle: 'bold' },
    { token: 'keyword.todo.checkbox', foreground: 'ff7b72', fontStyle: 'bold' },
    { token: 'keyword.header', foreground: '7ee787', fontStyle: 'bold' },
    { token: 'string.header', foreground: '7ee787', fontStyle: 'bold' },
    { token: 'keyword.time.relative', foreground: 'ffa657', fontStyle: 'italic' },
    { token: 'keyword.time.date', foreground: '79c0ff' },
    { token: 'keyword.time.clock', foreground: '79c0ff' },
    { token: 'keyword.time.datetime', foreground: '79c0ff' },
    { token: 'keyword.duration', foreground: 'd2a8ff', fontStyle: 'bold' },
    { token: 'keyword.dependency.arrow', foreground: 'ffa657', fontStyle: 'bold' },
    { token: 'keyword.priority', foreground: 'ff7b72', fontStyle: 'bold' },
    { token: 'keyword.tag', foreground: 'd2a8ff' },
    { token: 'keyword.status', foreground: '56d364', fontStyle: 'bold' },
    { token: 'markup.bold', fontStyle: 'bold' },
    { token: 'markup.italic', fontStyle: 'italic' },
    { token: 'markup.strikethrough', fontStyle: 'strikethrough' },
    { token: 'markup.code', foreground: 'f85149', background: '161b22' },
    { token: 'string.link', foreground: '58a6ff' },
    { token: 'string.url', foreground: '58a6ff', fontStyle: 'underline' },
    { token: 'string.code', foreground: 'e6edf3', background: '161b22' },
    { token: 'text', foreground: 'e6edf3' }
  ],
  colors: {
    'editor.background': '#0d1117',
    'editor.foreground': '#e6edf3',
    'editorLineNumber.foreground': '#7d8590',
    'editorLineNumber.activeForeground': '#e6edf3',
    'editor.selectionBackground': '#264f78',
    'editor.selectionHighlightBackground': '#264f7840',
    'editor.findMatchBackground': '#ffd33d44',
    'editor.findMatchHighlightBackground': '#ffd33d22'
  }
}