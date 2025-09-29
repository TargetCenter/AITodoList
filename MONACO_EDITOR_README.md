# Monaco Editor Todo Markdown 集成

本项目已成功集成Monaco Editor，提供强大的代码编辑功能，专门为Todo Markdown语法进行了优化。

## 🚀 主要功能

### 1. 自定义语言支持 (Monarch)
- **语言ID**: `todo-markdown`
- **语法高亮**: 支持任务、时间、优先级、标签等语法元素
- **智能识别**: 自动识别和高亮不同类型的内容

### 2. 智能补全 (IntelliSense)
- **触发方式**: `Ctrl+Space` 或自动触发
- **任务模板**: 快速插入任务模板
- **时间建议**: 智能时间和日期建议
- **标签补全**: 常用标签自动补全
- **依赖建议**: 基于现有任务的依赖建议

### 3. 悬停提示 (Hover)
- **时间信息**: 显示相对时间、星期等详细信息
- **用时转换**: 自动转换不同时间单位
- **优先级说明**: 显示优先级含义和建议
- **标签描述**: 常用标签的详细说明

### 4. 语法校验 (Validation)
- **实时校验**: 输入时实时检查语法错误
- **错误标记**: 红色波浪线标记错误位置
- **警告提示**: 黄色波浪线标记潜在问题
- **循环依赖检测**: 自动检测任务依赖的循环引用

## 🎨 支持的语法

### 基本任务
```markdown
- [ ] 未完成任务
- [x] 已完成任务
- [X] 已完成任务（大写X）
```

### 时间标记
```markdown
- [ ] 相对时间 @today @tomorrow @yesterday
- [ ] 中文时间 @今天 @明天 @昨天
- [ ] 具体日期 @2024-02-01
- [ ] 具体时间 @09:00
- [ ] 日期时间 @2024-02-01 09:00
```

### 用时估算
```markdown
- [ ] 分钟任务 T:30min T:15分钟
- [ ] 小时任务 T:2h T:1小时
- [ ] 天级任务 T:1d T:1天
- [ ] 周级项目 T:1w T:1周
- [ ] 月级规划 T:1m T:1月
```

### 优先级标记
```markdown
- [ ] 紧急任务 !urgent !紧急
- [ ] 高优先级 !high !高
- [ ] 中优先级 !medium !中
- [ ] 低优先级 !low !低
- [ ] 普通任务 !normal !普通
```

### 标签分类
```markdown
- [ ] 工作任务 #工作 #work
- [ ] 学习任务 #学习 #study
- [ ] 生活事务 #生活 #personal
- [ ] 项目相关 #项目 #project
```

### 依赖关系
```markdown
- [ ] 基础任务
- [ ] 依赖任务 -> 基础任务
- [ ] 多重依赖 -> 任务A, 任务B, 任务C
```

### 关键字标记
```markdown
TODO: 待办事项
FIXME: 需要修复
NOTE: 重要说明
HACK: 临时方案
XXX: 特别注意
BUG: 已知错误
DONE: 已完成

待办: 中文待办
已完成: 中文完成
进行中: 中文进行中
```

## 🎯 主题支持

### 内置主题
- **vs**: 浅色主题（默认）
- **vs-dark**: 深色主题
- **hc-black**: 高对比度主题

### 自定义主题
- **todo-light**: 专为Todo语法优化的浅色主题
- **todo-dark**: 专为Todo语法优化的深色主题

## 🛠️ 技术实现

### 文件结构
```
src/
├── components/
│   └── MonacoEditor.vue          # Monaco编辑器组件
├── utils/
│   ├── todoLanguage.js           # Monarch语言定义
│   ├── todoCompletion.js         # 智能补全提供者
│   ├── todoHover.js              # 悬停提示提供者
│   ├── todoValidation.js         # 语法校验提供者
│   └── monacoTest.js             # 功能测试工具
└── views/
    └── TodoEditor.vue            # 主编辑器页面
```

### 核心特性

#### 1. Monarch语言定义
- 使用Monaco Editor的Monarch系统定义语法规则
- 支持复杂的正则表达式匹配
- 提供丰富的token类型和样式

#### 2. 语言服务提供者
- **CompletionItemProvider**: 智能补全
- **HoverProvider**: 悬停提示
- **DiagnosticsProvider**: 语法校验

#### 3. 主题系统
- 基于Monaco Editor的主题系统
- 自定义颜色和样式规则
- 支持浅色和深色模式

## 🚀 使用方法

### 1. 基本使用
```vue
<template>
  <monaco-editor
    v-model="content"
    language="todo-markdown"
    theme="todo-light"
    :options="editorOptions"
  />
</template>
```

### 2. 触发智能补全
- 按 `Ctrl+Space` 手动触发
- 输入特定字符自动触发（@, T:, !, #, ->）

### 3. 查看悬停信息
- 将鼠标悬停在时间、标签、优先级等元素上
- 查看详细的解释和转换信息

### 4. 语法校验
- 编辑器会自动检查语法错误
- 错误位置会显示红色波浪线
- 警告位置会显示黄色波浪线

## 🎉 功能演示

1. **加载演示内容**: 在文件菜单中选择"加载演示内容"
2. **切换主题**: 在工具栏中选择不同主题
3. **测试补全**: 输入 `- [ ]` 然后按 `Ctrl+Space`
4. **查看提示**: 鼠标悬停在 `@today` 或 `!high` 上
5. **语法检查**: 输入错误的日期格式如 `@2024-13-45`

## 🔧 自定义扩展

### 添加新的补全项
在 `todoCompletion.js` 中添加新的建议：

```javascript
const customSuggestions = [
  {
    label: '自定义模板',
    kind: CompletionItemKind.Snippet,
    insertText: '- [ ] ${1:任务} @${2:today} T:${3:1h}',
    detail: '自定义任务模板'
  }
]
```

### 添加新的语法规则
在 `todoLanguage.js` 中扩展tokenizer规则：

```javascript
tokenizer: {
  root: [
    // 添加新的语法规则
    [/\bcustom-keyword\b/, 'keyword.custom'],
    // ... 其他规则
  ]
}
```

## 📝 注意事项

1. **性能优化**: 大文件时建议关闭minimap
2. **内存管理**: 组件销毁时会自动清理Monaco实例
3. **浏览器兼容**: 支持现代浏览器，IE需要polyfill
4. **移动端**: 在移动设备上功能可能受限

## 🐛 故障排除

### 常见问题

1. **Monaco Editor未加载**
   - 检查网络连接
   - 确认npm包已正确安装

2. **语法高亮不工作**
   - 确认语言设置为 `todo-markdown`
   - 检查Monarch定义是否正确注册

3. **补全功能异常**
   - 检查补全提供者是否正确注册
   - 确认触发字符配置正确

4. **主题不生效**
   - 确认主题已正确定义和注册
   - 检查CSS样式是否冲突

## 🎯 未来计划

- [ ] 支持代码折叠
- [ ] 添加插件系统

---

**Monaco Editor Todo Markdown** - 让任务管理更加智能和高效！