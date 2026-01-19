// 文件管理工具，处理待办组文件的保存和读取
// 使用localStorage进行数据持久化存储

class FileManager {
  constructor() {
    // 使用localStorage存储文件数据
    this.files = new Map()
    this.currentFile = null
    this.storageKey = 'todo-files'
    
    // 初始化时从localStorage加载数据
    this.loadFromStorage()
  }
  
  /**
   * 从localStorage加载文件数据
   */
  loadFromStorage() {
    try {
      const storedData = localStorage.getItem(this.storageKey)
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        // 重建Map对象
        const filesMap = new Map()
        Object.entries(parsedData.files).forEach(([key, value]) => {
          // 重建Date对象
          value.createdAt = new Date(value.createdAt)
          value.updatedAt = new Date(value.updatedAt)
          filesMap.set(key, value)
        })
        this.files = filesMap
        
        // 恢复当前文件
        if (parsedData.currentFile) {
          this.currentFile = parsedData.currentFile
        }
      } else {
        // 如果没有存储数据，创建默认文件
        this.createDefaultFile()
      }
    } catch (error) {
      console.error('从localStorage加载数据失败:', error)
      this.createDefaultFile()
    }
  }
  
  /**
   * 保存数据到localStorage
   */
  saveToStorage() {
    try {
      const dataToStore = {
        files: Object.fromEntries(this.files),
        currentFile: this.currentFile
      }
      localStorage.setItem(this.storageKey, JSON.stringify(dataToStore))
    } catch (error) {
      console.error('保存数据到localStorage失败:', error)
    }
  }
  
  /**
   * 创建默认文件
   */
  createDefaultFile() {
    const defaultContent = `# 我的待办事项

## 今日任务
- [ ] 完成项目文档 @2023-12-01 T:2h
- [ ] 代码审查 @2023-12-01 T:1h -> 完成项目文档
- [x] 晨会 @2023-12-01 T:0.5h

## 本周计划
- [ ] 数据库设计 @2023-12-04 T:4h
- [ ] API开发 @2023-12-05 T:6h -> 数据库设计
- [ ] 前端开发 @2023-12-06 T:8h -> API开发

## 下周安排
- [ ] 测试用例编写 @2023-12-11 T:3h -> 前端开发
- [ ] 集成测试 @2023-12-12 T:2h -> 测试用例编写
- [ ] 部署上线 @2023-12-13 T:1h -> 集成测试`

    this.createFile('默认待办组.md', defaultContent)
  }
  
  /**
   * 创建新文件
   * @param {string} filename - 文件名
   * @param {string} content - 文件内容
   */
  createFile(filename, content = '') {
    const file = {
      id: Date.now().toString(),
      name: filename,
      content: content,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    this.files.set(filename, file)
    this.currentFile = file
    this.saveToStorage() // 保存到localStorage
    return file
  }
  
  /**
   * 保存文件
   * @param {string} filename - 文件名
   * @param {string} content - 文件内容
   */
  saveFile(filename, content) {
    if (this.files.has(filename)) {
      const file = this.files.get(filename)
      file.content = content
      file.updatedAt = new Date()
      this.files.set(filename, file)
      this.currentFile = file
    } else {
      this.createFile(filename, content)
    }
    this.saveToStorage() // 保存到localStorage
  }
  
  /**
   * 读取文件
   * @param {string} filename - 文件名
   * @returns {object|null} 文件对象
   */
  readFile(filename) {
    if (this.files.has(filename)) {
      const file = this.files.get(filename)
      this.currentFile = file
      this.saveToStorage() // 更新当前文件状态
      return file
    }
    return null
  }
  
  /**
   * 获取所有文件列表
   * @returns {Array} 文件列表
   */
  getFileList() {
    return Array.from(this.files.values())
  }
  
  /**
   * 删除文件
   * @param {string} filename - 文件名
   */
  deleteFile(filename) {
    this.files.delete(filename)
    if (this.currentFile && this.currentFile.name === filename) {
      this.currentFile = null
    }
    this.saveToStorage() // 保存到localStorage
  }
  
  /**
   * 获取当前文件
   * @returns {object|null} 当前文件对象
   */
  getCurrentFile() {
    return this.currentFile
  }
  
  /**
   * 设置当前文件
   * @param {string} filename - 文件名
   */
  setCurrentFile(filename) {
    if (this.files.has(filename)) {
      this.currentFile = this.files.get(filename)
      this.saveToStorage() // 保存当前文件状态
    }
  }
  
  /**
   * 清空所有数据（用于重置）
   */
  clearAll() {
    this.files.clear()
    this.currentFile = null
    localStorage.removeItem(this.storageKey)
    this.createDefaultFile()
  }
  
  /**
   * 导出数据（用于备份）
   * @returns {string} JSON格式的数据
   */
  exportData() {
    const dataToExport = {
      files: Object.fromEntries(this.files),
      currentFile: this.currentFile,
      exportTime: new Date().toISOString()
    }
    return JSON.stringify(dataToExport, null, 2)
  }
  
  /**
   * 导入数据（用于恢复备份）
   * @param {string} jsonData - JSON格式的数据
   */
  importData(jsonData) {
    try {
      const parsedData = JSON.parse(jsonData)
      
      // 重建Map对象
      const filesMap = new Map()
      Object.entries(parsedData.files).forEach(([key, value]) => {
        // 重建Date对象
        value.createdAt = new Date(value.createdAt)
        value.updatedAt = new Date(value.updatedAt)
        filesMap.set(key, value)
      })
      
      this.files = filesMap
      this.currentFile = parsedData.currentFile
      this.saveToStorage()
      
      return true
    } catch (error) {
      console.error('导入数据失败:', error)
      return false
    }
  }
}

// 创建单例实例
const fileManager = new FileManager()

export default fileManager
