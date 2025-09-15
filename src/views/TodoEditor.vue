<template>
  <div class="todo-editor">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1>Markdown 待办任务编辑器</h1>
          <div class="file-info" v-if="currentFile">
            当前文件: {{ currentFile.name }}
          </div>
        </div>
        <div class="toolbar">
          <el-dropdown @command="handleFileCommand">
            <el-button>
              文件管理<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="new">新建文件</el-dropdown-item>
                <el-dropdown-item command="save">保存文件</el-dropdown-item>
                <el-dropdown-item command="open">打开文件</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="primary" @click="checkSyntax">语法检查</el-button>
          <el-button type="info" @click="viewGraph">查看关系图</el-button>
        </div>
      </el-header>
      
      <el-container>
        <el-main>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="editor-container">
                <h3>Markdown 编辑器</h3>
                <code-mirror-editor
                  v-model="markdownContent"
                  @update:modelValue="onContentChange"
                  style="height: 500px;"
                />
              </div>
            </el-col>
            
            <el-col :span="12">
              <div class="preview-container">
                <h3>任务预览</h3>
                <div class="task-list">
                  <el-card v-for="task in tasks" :key="task.id" class="task-card">
                    <div class="task-header">
                      <el-checkbox v-model="task.completed" @change="onTaskStatusChange(task)"></el-checkbox>
                      <span :class="{ 'completed': task.completed }">{{ task.title }}</span>
                    </div>
                    <div class="task-details">
                      <div v-if="task.startTime !== null">
                        <i class="el-icon-time"></i>
                        开始时间: 
                        <span v-if="editingTaskId !== task.id || editingField !== 'startTime'" @click="startEditing(task, 'startTime')">
                          {{ task.startTime || '未设置' }}
                        </span>
                        <span v-else>
                          <el-date-picker
                            v-model="editingValue"
                            type="datetime"
                            placeholder="选择日期时间"
                            size="small"
                            style="width: 180px;"
                            @change="saveEditing(task)"
                            @blur="saveEditing(task)"
                            @keyup.esc="cancelEditing"
                            ref="editInput"
                          ></el-date-picker>
                        </span>
                      </div>
                      <div v-if="task.duration !== null">
                        <i class="el-icon-timer"></i>
                        用时: 
                        <span v-if="editingTaskId !== task.id || editingField !== 'duration'" @click="startEditing(task, 'duration')">
                          {{ task.duration || '未设置' }}
                        </span>
                        <span v-else>
                          <el-input 
                            v-model="editingValue" 
                            size="small" 
                            style="width: 100px;"
                            placeholder="例如: 2h, 1.5d"
                            @keyup.enter="saveEditing(task)"
                            @blur="saveEditing(task)"
                            @keyup.esc="cancelEditing"
                            ref="editInput"
                          >
                            <template #append>
                              <el-select v-model="durationUnit" style="width: 70px;">
                                <el-option label="小时" value="h"></el-option>
                                <el-option label="天" value="d"></el-option>
                                <el-option label="月" value="m"></el-option>
                              </el-select>
                            </template>
                          </el-input>
                        </span>
                      </div>
                      <div v-if="task.dependencies.length > 0">
                        <i class="el-icon-link"></i>
                        依赖任务: {{ task.dependencies.join(', ') }}
                      </div>
                    </div>
                  </el-card>
                </div>
                
                <div v-if="syntaxErrors.length > 0" class="errors">
                  <h4>语法错误:</h4>
                  <el-alert
                    v-for="(error, index) in syntaxErrors"
                    :key="index"
                    :title="error.message"
                    type="error"
                    :closable="false"
                    show-icon
                  ></el-alert>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
    </el-container>
    
    <!-- 新建文件对话框 -->
    <el-dialog v-model="newFileDialogVisible" title="新建文件" width="30%">
      <el-input v-model="newFileName" placeholder="请输入文件名"></el-input>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="newFileDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createNewFile">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 打开文件对话框 -->
    <el-dialog v-model="openFileDialogVisible" title="打开文件" width="30%">
      <el-select v-model="selectedFile" placeholder="请选择文件" style="width: 100%">
        <el-option
          v-for="file in fileList"
          :key="file.name"
          :label="file.name"
          :value="file.name">
        </el-option>
      </el-select>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="openFileDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="openSelectedFile">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { parseMarkdown, validateSyntax } from '../utils/markdownParser'
import fileManager from '../utils/fileManager'
import CodeMirrorEditor from '../components/CodeMirrorEditor.vue'

export default {
  name: 'TodoEditor',
  components: {
    CodeMirrorEditor
  },
  setup() {
    const router = useRouter()
    const markdownContent = ref('')
    const tasks = ref([])
    const syntaxErrors = ref([])
    
    // 文件管理相关
    const newFileDialogVisible = ref(false)
    const openFileDialogVisible = ref(false)
    const newFileName = ref('')
    const selectedFile = ref('')
    
    // 计算属性
    const currentFile = computed(() => fileManager.getCurrentFile())
    const fileList = computed(() => fileManager.getFileList())
    
    // 编辑状态管理
    const editingTaskId = ref(null)
    const editingField = ref('')
    const editingValue = ref('')
    const durationUnit = ref('h')
    
    const onContentChange = () => {
      // 实时解析Markdown内容
      try {
        tasks.value = parseMarkdown(markdownContent.value)
        syntaxErrors.value = validateSyntax(markdownContent.value)
      } catch (error) {
        console.error('解析错误:', error)
      }
    }
    
    const onTaskStatusChange = (changedTask) => {
      // 更新Markdown内容以反映任务状态变化
      try {
        // 将当前的Markdown内容分割成行
        const lines = markdownContent.value.split('\n')
        
        // 查找并更新对应的任务行
        const updatedLines = lines.map(line => {
          // 使用与markdownParser.js中相同的正则表达式来匹配任务
          const taskRegex = /^-\s*\[([ xX])\]\s*(.+?)(?:\s+@(.*?))?(?:\s+(.*?))?(?:\s*->\s*(.*?))?$/
          const match = line.match(taskRegex)
          
          if (match) {
            const [, checked, title] = match
            // 检查标题是否匹配（去除可能的时间和其他信息后）
            if (title.trim() === changedTask.title.trim()) {
              // 根据任务状态更新复选框
              const newCheckbox = changedTask.completed ? 'x' : ' '
              return line.replace(/^(-\s*\[)[ xX](\].*)$/, `$1${newCheckbox}$2`)
            }
          }
          
          return line
        })
        
        // 更新Markdown内容
        markdownContent.value = updatedLines.join('\n')
        
        // 重新解析内容以确保一致性
        onContentChange()
      } catch (error) {
        console.error('更新任务状态时出错:', error)
      }
    }
    
    // 开始编辑字段
    const startEditing = (task, field) => {
      editingTaskId.value = task.id
      editingField.value = field
      editingValue.value = task[field] || ''
    }
    
    // 保存编辑的字段
    const saveEditing = (task) => {
      try {
        // 将当前的Markdown内容分割成行
        const lines = markdownContent.value.split('\n')
        
        // 查找并更新对应的任务行
        const updatedLines = lines.map(line => {
          // 使用与markdownParser.js中相同的正则表达式来匹配任务
          const taskRegex = /^(-\s*\[([ xX])\]\s*)(.+?)(\s+@(.*?))?(?:\s+(.*?))?(?:\s*->\s*(.*?))?$/
          const match = line.match(taskRegex)
          
          if (match) {
            const [, taskPrefix, checked, title, timePart, time, duration, dependencies] = match
            // 检查标题是否匹配
            if (title.trim() === task.title.trim()) {
              // 根据编辑的字段更新相应内容
              if (editingField.value === 'startTime') {
                // 更新时间
                let timeValue = editingValue.value
                // 如果是日期对象，格式化为 YYYY-MM-DD HH:MM
                if (timeValue instanceof Date) {
                  const year = timeValue.getFullYear()
                  const month = String(timeValue.getMonth() + 1).padStart(2, '0')
                  const day = String(timeValue.getDate()).padStart(2, '0')
                  const hours = String(timeValue.getHours()).padStart(2, '0')
                  const minutes = String(timeValue.getMinutes()).padStart(2, '0')
                  timeValue = `${year}-${month}-${day} ${hours}:${minutes}`
                }
                
                const newTimePart = timeValue ? ` @${timeValue}` : ''
                if (timePart) {
                  // 如果原来有时间，替换它
                  return line.replace(/\s+@.*?(?=\s+[0-9]|$|\s*->)/, newTimePart)
                } else {
                  // 如果原来没有时间，添加它
                  return `${taskPrefix}${title}${newTimePart}${duration ? ` ${duration}` : ''}${dependencies ? ` -> ${dependencies}` : ''}`
                }
              } else if (editingField.value === 'duration') {
                // 更新用时
                const newDuration = editingValue.value ? ` ${editingValue.value}${durationUnit.value}` : ''
                if (duration) {
                  // 如果原来有用时，替换它
                  return line.replace(/\s+[0-9]+(?:\.[0-9]+)?[hmd]/, newDuration)
                } else {
                  // 如果原来没有用时，添加它
                  return `${taskPrefix}${title}${timePart || ''}${newDuration}${dependencies ? ` -> ${dependencies}` : ''}`
                }
              }
            }
          }
          
          return line
        })
        
        // 更新Markdown内容
        markdownContent.value = updatedLines.join('\n')
        
        // 重置编辑状态
        editingTaskId.value = null
        editingField.value = ''
        editingValue.value = ''
        durationUnit.value = 'h'
        
        // 重新解析内容以确保一致性
        onContentChange()
      } catch (error) {
        console.error('更新任务字段时出错:', error)
      }
    }
    
    // 取消编辑
    const cancelEditing = () => {
      editingTaskId.value = null
      editingField.value = ''
      editingValue.value = ''
    }
    
    const checkSyntax = () => {
      syntaxErrors.value = validateSyntax(markdownContent.value)
    }
    
    const saveFile = () => {
      if (currentFile.value) {
        fileManager.saveFile(currentFile.value.name, markdownContent.value)
        alert('文件已保存')
      } else {
        alert('请先创建或打开一个文件')
      }
    }
    
    const viewGraph = () => {
      router.push('/graph')
    }
    
    // 文件管理功能
    const handleFileCommand = (command) => {
      switch (command) {
        case 'new':
          newFileDialogVisible.value = true
          break
        case 'save':
          saveFile()
          break
        case 'open':
          openFileDialogVisible.value = true
          break
      }
    }
    
    const createNewFile = () => {
      if (!newFileName.value) {
        alert('请输入文件名')
        return
      }
      
      // 创建新文件
      const file = fileManager.createFile(newFileName.value, '')
      markdownContent.value = ''
      tasks.value = []
      syntaxErrors.value = []
      newFileDialogVisible.value = false
      newFileName.value = ''
    }
    
    const openSelectedFile = () => {
      if (!selectedFile.value) {
        alert('请选择文件')
        return
      }
      
      const file = fileManager.readFile(selectedFile.value)
      if (file) {
        markdownContent.value = file.content
        onContentChange()
        openFileDialogVisible.value = false
      }
    }
    
    onMounted(() => {
      // 初始化示例内容
      const sampleContent = `- [ ] 设计数据库 @2023-09-15 2h
- [ ] 开发API接口 @2023-09-16 4h
- [ ] 前端页面开发 @2023-09-17 3h
- [x] 项目初始化 @2023-09-14 1h
- [ ] 部署测试环境 @2023-09-20 2h -> 前端页面开发`
      
      // 创建一个默认文件
      fileManager.createFile('默认待办组.md', sampleContent)
      markdownContent.value = sampleContent
      onContentChange()
    })
    
    return {
      markdownContent,
      tasks,
      syntaxErrors,
      currentFile,
      fileList,
      newFileDialogVisible,
      openFileDialogVisible,
      newFileName,
      selectedFile,
      editingTaskId,
      editingField,
      editingValue,
      durationUnit,
      onContentChange,
      onTaskStatusChange,
      startEditing,
      saveEditing,
      cancelEditing,
      checkSyntax,
      saveFile,
      viewGraph,
      handleFileCommand,
      createNewFile,
      openSelectedFile
    }
  }
}
</script>

<style scoped>
.todo-editor {
  height: 100%;
}

.el-header {
  background-color: #f5f5f5;
  color: #333;
  line-height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.file-info {
  font-size: 14px;
  color: #666;
}

.toolbar {
  display: flex;
  gap: 10px;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}

.editor-container, .preview-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-container h3, .preview-container h3 {
  margin-bottom: 15px;
}

.task-list {
  overflow-y: auto;
  flex: 1;
}

.task-card {
  margin-bottom: 15px;
}

.task-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.task-header span {
  margin-left: 10px;
  font-weight: bold;
}

.task-header .completed {
  text-decoration: line-through;
  color: #999;
}

.task-details {
  padding-left: 30px;
}

.task-details > div {
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
}

.errors {
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}
</style>