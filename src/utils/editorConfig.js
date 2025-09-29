// 编辑器配置管理工具
const CONFIG_KEY = 'todo-editor-config'

// 默认配置
const defaultConfig = {
  // 总体开关
  autoComplete: false, // 默认禁用自动补全
  hoverInfo: false,    // 默认禁用悬停信息
  syntaxValidation: false, // 默认禁用语法校验
  
  // 自动补全子项开关
  taskTemplates: false,    // 任务模板
  dateSuggestions: false,  // 日期建议
  timeSuggestions: false,  // 时间建议
  durationSuggestions: false, // 用时建议
  prioritySuggestions: false, // 优先级建议
  tagSuggestions: false,   // 标签建议
  dependencySuggestions: false, // 依赖任务建议
  statusSuggestions: false, // 状态建议
  keywordSuggestions: false // 关键字建议
}

// 获取配置
export function getEditorConfig() {
  try {
    const storedConfig = localStorage.getItem(CONFIG_KEY)
    if (storedConfig) {
      return { ...defaultConfig, ...JSON.parse(storedConfig) }
    }
  } catch (error) {
    console.warn('Failed to parse editor config from localStorage:', error)
  }
  return { ...defaultConfig }
}

// 保存配置
export function saveEditorConfig(config) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
    return true
  } catch (error) {
    console.error('Failed to save editor config to localStorage:', error)
    return false
  }
}

// 更新配置
export function updateEditorConfig(newConfig) {
  const currentConfig = getEditorConfig()
  const updatedConfig = { ...currentConfig, ...newConfig }
  return saveEditorConfig(updatedConfig)
}

// 重置配置为默认值
export function resetEditorConfig() {
  return saveEditorConfig(defaultConfig)
}