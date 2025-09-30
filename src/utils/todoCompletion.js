// Monaco Editor 自动补全提供者
export const todoCompletionProvider = {
  provideCompletionItems: (model, position) => {
    const lineContent = model.getLineContent(position.lineNumber)
    const lineUntilPosition = model.getValueInRange({
      startLineNumber: position.lineNumber,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    })

    const suggestions = []

    // 任务开始补全
    if (lineUntilPosition.trim() === '' || lineUntilPosition.trim() === '-') {
      suggestions.push({
        label: '- [ ]',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: '- [ ] $1 $2 $3',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: '创建新任务'
      })
    }

    // 复选框补全
    if (lineUntilPosition.includes('- [') && !lineUntilPosition.includes(']')) {
      suggestions.push({
        label: '[ ]',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: '[ ]',
        documentation: '未完成任务'
      })
      suggestions.push({
        label: '[x]',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: '[x]',
        documentation: '已完成任务'
      })
    }

    // 时间补全
    if (lineUntilPosition.includes(']') && !lineUntilPosition.includes('@')) {
      const timeSuggestions = [
        { label: '今天', documentation: '今天' },
        { label: '明天', documentation: '明天' },
        { label: '昨天', documentation: '昨天' },
        { label: '今天上午', documentation: '今天上午' },
        { label: '今天下午', documentation: '今天下午' },
        { label: '明天上午', documentation: '明天上午' },
        { label: '明天下午', documentation: '明天下午' },
        { label: '周一', documentation: '周一' },
        { label: '周二', documentation: '周二' },
        { label: '周三', documentation: '周三' },
        { label: '周四', documentation: '周四' },
        { label: '周五', documentation: '周五' },
        { label: '周六', documentation: '周六' },
        { label: '周日', documentation: '周日' },
        { label: '上午', documentation: '上午' },
        { label: '下午', documentation: '下午' },
        { label: '晚上', documentation: '晚上' }
      ]

      timeSuggestions.forEach(time => {
        suggestions.push({
          label: time.label,
          kind: monaco.languages.CompletionItemKind.Value,
          insertText: time.label,
          documentation: time.documentation
        })
      })
    }

    // 时长补全
    if (lineUntilPosition.split(' ').length >= 3) {
      const durationSuggestions = [
        { label: '1小时', documentation: '1小时' },
        { label: '2小时', documentation: '2小时' },
        { label: '30分钟', documentation: '30分钟' },
        { label: '1天', documentation: '1天' },
        { label: '2天', documentation: '2天' },
        { label: '1周', documentation: '1周' }
      ]

      durationSuggestions.forEach(duration => {
        suggestions.push({
          label: duration.label,
          kind: monaco.languages.CompletionItemKind.Unit,
          insertText: duration.label,
          documentation: duration.documentation
        })
      })
    }

    // 依赖补全
    if (lineUntilPosition.includes('->') || lineUntilPosition.split(' ').length >= 4) {
      suggestions.push({
        label: '->',
        kind: monaco.languages.CompletionItemKind.Operator,
        insertText: '-> ',
        documentation: '任务依赖'
      })
    }

    return {
      suggestions: suggestions
    }
  }
}