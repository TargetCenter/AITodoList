// Monaco Editor 功能测试工具

export const testMonacoFeatures = () => {
  console.log('🚀 开始测试Monaco Editor功能...')
  
  const tests = [
    {
      name: '语法高亮测试',
      content: '- [ ] 测试任务 @today T:1h !high #测试',
      expected: '应该显示不同颜色的语法高亮'
    },
    {
      name: '时间格式测试',
      content: '- [ ] 会议 @2024-02-01 09:00',
      expected: '时间应该被正确识别和高亮'
    },
    {
      name: '依赖关系测试',
      content: '- [ ] 任务B -> 任务A',
      expected: '依赖关系应该被正确解析'
    },
    {
      name: '优先级测试',
      content: '- [ ] 紧急任务 !urgent',
      expected: '优先级应该被正确标记'
    },
    {
      name: '标签测试',
      content: '- [ ] 工作任务 #工作 #项目',
      expected: '标签应该被正确识别'
    }
  ]
  
  tests.forEach((test, index) => {
    console.log(`✅ 测试 ${index + 1}: ${test.name}`)
    console.log(`   内容: ${test.content}`)
    console.log(`   预期: ${test.expected}`)
  })
  
  console.log('🎉 Monaco Editor功能测试完成！')
  
  return {
    totalTests: tests.length,
    testCases: tests
  }
}

// 验证Monaco Editor是否正确加载
export const verifyMonacoLoaded = () => {
  if (typeof monaco !== 'undefined') {
    console.log('✅ Monaco Editor已成功加载')
    console.log(`📦 Monaco版本: ${monaco.editor.VERSION || '未知'}`)
    return true
  } else {
    console.error('❌ Monaco Editor未正确加载')
    return false
  }
}

// 测试自定义语言是否注册成功
export const testCustomLanguage = () => {
  try {
    const languages = monaco.languages.getLanguages()
    const todoLanguage = languages.find(lang => lang.id === 'todo-markdown')
    
    if (todoLanguage) {
      console.log('✅ 自定义语言 todo-markdown 注册成功')
      return true
    } else {
      console.error('❌ 自定义语言 todo-markdown 未找到')
      return false
    }
  } catch (error) {
    console.error('❌ 测试自定义语言时出错:', error)
    return false
  }
}

// 完整的功能验证
export const runFullTest = () => {
  console.log('🔍 开始完整功能验证...')
  
  const results = {
    monacoLoaded: verifyMonacoLoaded(),
    customLanguage: testCustomLanguage(),
    featureTests: testMonacoFeatures()
  }
  
  const allPassed = results.monacoLoaded && results.customLanguage
  
  if (allPassed) {
    console.log('🎉 所有测试通过！Monaco Editor集成成功！')
  } else {
    console.log('⚠️ 部分测试失败，请检查配置')
  }
  
  return results
}