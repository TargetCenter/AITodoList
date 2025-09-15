// 文件管理工具，处理待办组文件的保存和读取
import { ref } from 'vue'

class FileManager {
  constructor() {
    // 模拟文件存储 (在实际应用中可能会使用localStorage或后端API)
    this.files = ref(new Map())
    this.currentFile = ref(null)
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
    
    this.files.value.set(filename, file)
    this.currentFile.value = file
    return file
  }
  
  /**
   * 保存文件
   * @param {string} filename - 文件名
   * @param {string} content - 文件内容
   */
  saveFile(filename, content) {
    if (this.files.value.has(filename)) {
      const file = this.files.value.get(filename)
      file.content = content
      file.updatedAt = new Date()
      this.files.value.set(filename, file)
      this.currentFile.value = file
    } else {
      this.createFile(filename, content)
    }
  }
  
  /**
   * 读取文件
   * @param {string} filename - 文件名
   * @returns {object|null} 文件对象
   */
  readFile(filename) {
    if (this.files.value.has(filename)) {
      const file = this.files.value.get(filename)
      this.currentFile.value = file
      return file
    }
    return null
  }
  
  /**
   * 获取所有文件列表
   * @returns {Array} 文件列表
   */
  getFileList() {
    return Array.from(this.files.value.values())
  }
  
  /**
   * 删除文件
   * @param {string} filename - 文件名
   */
  deleteFile(filename) {
    this.files.value.delete(filename)
    if (this.currentFile.value && this.currentFile.value.name === filename) {
      this.currentFile.value = null
    }
  }
  
  /**
   * 获取当前文件
   * @returns {object|null} 当前文件对象
   */
  getCurrentFile() {
    return this.currentFile.value
  }
  
  /**
   * 设置当前文件
   * @param {string} filename - 文件名
   */
  setCurrentFile(filename) {
    if (this.files.value.has(filename)) {
      this.currentFile.value = this.files.value.get(filename)
    }
  }
}

// 创建单例实例
const fileManager = new FileManager()

export default fileManager