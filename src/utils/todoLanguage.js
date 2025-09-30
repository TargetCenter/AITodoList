// Monaco Editor 语言定义 - 简化版本
export const todoLanguageDefinition = {
  // 设置默认token
  defaultToken: 'invalid',
  tokenPostfix: '.todo',

  // 关键字和标识符
  tokenizer: {
    root: [
      // 任务行
      [/^-\s*\[[ xX]\]/, 'keyword'],
      
      // 复选框
      [/\[[ xX]\]/, 'keyword'],
      
      // 时间标记
      [/@\w+/, 'type'],
      
      // 数字 - 放在前面优先匹配
      [/\d+/, 'number'],
      
      // 计划时间关键词
      [/今天|明天|昨天|今天上午|今天下午|明天上午|明天下午|周一|周二|周三|周四|周五|周六|周日|上午|下午|晚上/, 'number'],
      
      // 时间格式
      [/\d{1,2}:\d{2}|\d{4}-\d{2}-\d{2}/, 'number'],
      
      // 时长
      [/\d+(小时|分钟|天|周)/, 'number'],
      
      // 依赖箭头
      [/->/, 'operator'],
      
      // 标题
      [/^#+\s*/, 'comment'],
      
      // 空格和换行
      [/\s+/, ''],
      
      // 分隔符
      [/[\\[\]]/, 'delimiter'],
      
      // 普通文本 - 最后匹配
      [/[^@\[\]\->\s#]+/, 'string'],
    ]
  }
}

// 自定义主题
export const todoTheme = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
    { token: 'string', foreground: '008000' },
    { token: 'type', foreground: 'FF8C00' },
    { token: 'number', foreground: 'FF0000' },
    { token: 'operator', foreground: 'A52A2A' },
    { token: 'comment', foreground: '008000', fontStyle: 'italic' },
    { token: 'delimiter', foreground: '000000' }
  ],
  colors: {
    'editor.background': '#FFFFFF',
    'editor.foreground': '#000000'
  }
}

export const todoDarkTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
    { token: 'string', foreground: 'CE9178' },
    { token: 'type', foreground: '4EC9B0' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'operator', foreground: 'D4D4D4' },
    { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
    { token: 'delimiter', foreground: 'D4D4D4' }
  ],
  colors: {
    'editor.background': '#1E1E1E',
    'editor.foreground': '#D4D4D4'
  }
}