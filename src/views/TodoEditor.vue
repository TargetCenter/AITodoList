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
                <el-dropdown-item command="delete" divided>删除当前文件</el-dropdown-item>
                <el-dropdown-item command="export">导出数据</el-dropdown-item>
                <el-dropdown-item command="import">导入数据</el-dropdown-item>
                <el-dropdown-item command="clear" divided>清空所有数据</el-dropdown-item>
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
                  @scroll="onEditorScroll"
                  style="height: 500px;"
                />
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
            
            <el-col :span="12">
              <div class="preview-container">
                <div class="preview-header">
                  <h3>任务预览</h3>
                  <div class="task-controls">
                    <el-switch
                      v-model="showCompleted"
                      active-text="显示已完成"
                      inactive-text="隐藏已完成"
                      size="small"
                    />
                    <el-switch
                      v-model="separateCompleted"
                      active-text="分类显示"
                      inactive-text="混合显示"
                      size="small"
                      style="margin-left: 10px;"
                    />
                  </div>
                </div>
                
                <div class="task-list" ref="taskListRef">
                  <!-- 移动端滑动提示 -->
                  <div class="mobile-swipe-hint" v-if="incompleteTasks.length > 0">
                    <i class="el-icon-info"></i>
                    提示：左右滑动任务卡片可快速完成任务
                  </div>
                  
                  <!-- 未完成任务 -->
                  <div v-if="!separateCompleted || incompleteTasks.length > 0">
                    <h4 v-if="separateCompleted" class="task-section-title">
                      <i class="el-icon-time"></i>
                      待办任务 ({{ incompleteTasks.length }})
                    </h4>
                    <div
                      v-for="task in separateCompleted ? incompleteTasks : filteredTasks"
                      :key="task.id"
                      class="task-card-wrapper"
                      :class="{ 'completed-task': task.completed }"
                    >
                      <el-card 
                        class="task-card"
                        :class="{ 'slide-out': task.id === slidingTaskId }"
                        @touchstart.passive="onTouchStart($event, task)"
                        @touchmove.passive="onTouchMove($event, task)"
                        @touchend.passive="onTouchEnd($event, task)"
                        @click="onTaskClick(task)"
                      >
                        <div class="task-content">
                          <div class="task-header">
                            <el-checkbox 
                              v-model="task.completed" 
                              @change="onTaskStatusChange(task)"
                              @click.stop
                            ></el-checkbox>
                            <span :class="{ 'completed': task.completed }">{{ task.title }}</span>
                          </div>
                          <div class="task-details">
                            <div v-if="task.startTime !== null">
                              <i class="el-icon-time"></i>
                              开始时间: 
                              <span v-if="editingTaskId !== task.id || editingField !== 'startTime'" @click.stop="startEditing(task, 'startTime')">
                                {{ task.startTime || '未设置' }}
                              </span>
                              <span v-else>
                                <el-date-picker
                                  v-model="editingValue"
                                  type="date"
                                  placeholder="选择日期"
                                  size="small"
                                  style="width: 120px;"
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
                              <span v-if="editingTaskId !== task.id || editingField !== 'duration'" @click.stop="startEditing(task, 'duration')">
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
                        </div>
                        <div class="swipe-action-left">
                          <i class="el-icon-check"></i>
                          完成
                        </div>
                        <div class="swipe-action-right">
                          <i class="el-icon-check"></i>
                          完成
                        </div>
                      </el-card>
                    </div>
                  </div>

                  <!-- 已完成任务 -->
                  <div v-if="separateCompleted && showCompleted && completedTasks.length > 0">
                    <h4 class="task-section-title completed-section">
                      <i class="el-icon-check"></i>
                      已完成任务 ({{ completedTasks.length }})
                    </h4>
                    <div
                      v-for="task in completedTasks"
                      :key="task.id"
                      class="task-card-wrapper completed-task"
                    >
                      <el-card class="task-card">
                        <div class="task-content">
                          <div class="task-header">
                            <el-checkbox 
                              v-model="task.completed" 
                              @change="onTaskStatusChange(task)"
                            ></el-checkbox>
                            <span :class="{ 'completed': task.completed }">{{ task.title }}</span>
                          </div>
                          <div class="task-details">
                            <div v-if="task.startTime !== null">
                              <i class="el-icon-time"></i>
                              开始时间: {{ task.startTime || '未设置' }}
                            </div>
                            <div v-if="task.duration !== null">
                              <i class="el-icon-timer"></i>
                              用时: {{ task.duration || '未设置' }}
                            </div>
                            <div v-if="task.dependencies.length > 0">
                              <i class="el-icon-link"></i>
                              依赖任务: {{ task.dependencies.join(', ') }}
                            </div>
                          </div>
                        </div>
                      </el-card>
                    </div>
                  </div>
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

    <!-- 导入数据对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入数据" width="50%">
      <el-input
        v-model="importData"
        type="textarea"
        :rows="10"
        placeholder="请粘贴导出的JSON数据">
      </el-input>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="importDataConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
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
    const importDialogVisible = ref(false)
    const newFileName = ref('')
    const selectedFile = ref('')
    const importData = ref('')
    
    // 任务显示控制
    const showCompleted = ref(true)
    const separateCompleted = ref(false)
    
    // 滑动相关状态
    const slidingTaskId = ref(null)
    const touchStartX = ref(0)
    const touchStartY = ref(0)
    const isSwiping = ref(false)
    
    // 编辑状态管理
    const editingTaskId = ref(null)
    const editingField = ref('')
    const editingValue = ref('')
    const durationUnit = ref('h')
    const taskListRef = ref(null)
    
    // 滚动同步相关变量
    const isScrollingEditor = ref(false)
    const isScrollingPreview = ref(false)
    
    // 计算属性
    const currentFile = computed(() => fileManager.getCurrentFile())
    const fileList = computed(() => fileManager.getFileList())
    
    // 任务过滤计算属性
    const filteredTasks = computed(() => {
      if (showCompleted.value) {
        return tasks.value
      } else {
        return tasks.value.filter(task => !task.completed)
      }
    })
    
    const incompleteTasks = computed(() => {
      return tasks.value.filter(task => !task.completed)
    })
    
    const completedTasks = computed(() => {
      return tasks.value.filter(task => task.completed)
    })
    
    const onContentChange = () => {
      // 实时解析Markdown内容
      try {
        tasks.value = parseMarkdown(markdownContent.value)
        syntaxErrors.value = validateSyntax(markdownContent.value)
        
        // 自动保存到localStorage
        if (currentFile.value) {
          fileManager.saveFile(currentFile.value.name, markdownContent.value)
        }
      } catch (error) {
        console.error('解析错误:', error)
      }
    }
    
    // 编辑器滚动处理函数
    const onEditorScroll = (scrollInfo) => {
      if (!taskListRef.value || isScrollingPreview.value) return;
      
      isScrollingEditor.value = true;
      
      // 计算滚动比例
      const scrollRatio = scrollInfo.scrollTop / (scrollInfo.scrollHeight - scrollInfo.clientHeight);
      
      // 同步预览区域滚动
      const previewScrollTop = scrollRatio * (taskListRef.value.scrollHeight - taskListRef.value.clientHeight);
      taskListRef.value.scrollTop = previewScrollTop;
      
      // 重置滚动标志
      setTimeout(() => {
        isScrollingEditor.value = false;
      }, 100);
    }
    
    // 预览区域滚动处理函数
    const onPreviewScroll = () => {
      if (!taskListRef.value || isScrollingEditor.value) return;
      
      isScrollingPreview.value = true;
      
      // 获取CodeMirror编辑器的滚动DOM元素
      const editorDOM = document.querySelector('.codemirror-editor .cm-scroller');
      if (!editorDOM) return;
      
      // 计算滚动比例
      const scrollRatio = taskListRef.value.scrollTop / (taskListRef.value.scrollHeight - taskListRef.value.clientHeight);
      
      // 同步编辑器滚动
      const editorScrollTop = scrollRatio * (editorDOM.scrollHeight - editorDOM.clientHeight);
      editorDOM.scrollTop = editorScrollTop;
      
      // 重置滚动标志
      setTimeout(() => {
        isScrollingPreview.value = false;
      }, 100);
    }
    
    const onTaskStatusChange = (changedTask) => {
      // 添加完成动画效果
      if (changedTask.completed) {
        slidingTaskId.value = changedTask.id
        setTimeout(() => {
          slidingTaskId.value = null
        }, 500)
      }
      
      // 更新Markdown内容以反映任务状态变化
      try {
        // 将当前的Markdown内容分割成行
        const lines = markdownContent.value.split('\n')
        
        // 查找并更新对应的任务行
        const updatedLines = lines.map(line => {
          // 使用与markdownParser.js中相同的正则表达式来匹配任务
          const taskRegex = /^-\s*\[([ xX])\]\s*(.+?)(?:\s+@(.*?))?(?:\s+(.*?))?(?:\s*->(.*?))?$/
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

    // 触摸开始事件
    const onTouchStart = (event, task) => {
      if (task.completed) return
      
      touchStartX.value = event.touches[0].clientX
      touchStartY.value = event.touches[0].clientY
      isSwiping.value = false
    }

    // 触摸移动事件
    const onTouchMove = (event, task) => {
      if (task.completed) return
      
      const touchX = event.touches[0].clientX
      const touchY = event.touches[0].clientY
      const deltaX = touchX - touchStartX.value
      const deltaY = touchY - touchStartY.value
      
      // 判断是否为水平滑动（阈值提高，避免误触）
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
        isSwiping.value = true
        event.preventDefault()
        
        const card = event.currentTarget.querySelector('.task-content')
        const leftAction = event.currentTarget.querySelector('.swipe-action-left')
        const rightAction = event.currentTarget.querySelector('.swipe-action-right')
        
        if (card) {
          // 左滑或右滑都显示完成操作
          const progress = Math.min(Math.abs(deltaX) / 100, 1)
          card.style.transform = `translateX(${deltaX}px)`
          card.style.transition = 'none'
          
          if (deltaX > 0 && rightAction) {
            // 右滑
            rightAction.style.opacity = progress
            if (leftAction) leftAction.style.opacity = 0
          } else if (deltaX < 0 && leftAction) {
            // 左滑
            leftAction.style.opacity = progress
            if (rightAction) rightAction.style.opacity = 0
          }
        }
      }
    }

    // 触摸结束事件
    const onTouchEnd = (event, task) => {
      if (task.completed) return
      
      const card = event.currentTarget.querySelector('.task-content')
      const leftAction = event.currentTarget.querySelector('.swipe-action-left')
      const rightAction = event.currentTarget.querySelector('.swipe-action-right')
      const touchX = event.changedTouches[0].clientX
      const deltaX = touchX - touchStartX.value
      
      if (card) {
        // 恢复过渡动画
        card.style.transition = 'transform 0.3s ease, opacity 0.3s ease'
        
        // 如果滑动距离足够（左滑或右滑都可以），标记为完成
        if (Math.abs(deltaX) > 80 && isSwiping.value) {
          // 完成动画：向滑动方向继续滑出
          const direction = deltaX > 0 ? '100%' : '-100%'
          card.style.transform = `translateX(${direction})`
          card.style.opacity = '0'
          
          setTimeout(() => {
            task.completed = true
            onTaskStatusChange(task)
            
            // 重置样式
            card.style.transform = ''
            card.style.opacity = ''
            card.style.transition = ''
            if (leftAction) leftAction.style.opacity = ''
            if (rightAction) rightAction.style.opacity = ''
          }, 300)
        } else {
          // 回弹到原位
          card.style.transform = ''
          if (leftAction) leftAction.style.opacity = ''
          if (rightAction) rightAction.style.opacity = ''
          
          setTimeout(() => {
            card.style.transition = ''
          }, 300)
        }
      }
      
      isSwiping.value = false
    }

    // PC端点击事件
    const onTaskClick = (task) => {
      // 如果正在滑动或者是触摸设备，不处理点击
      if (isSwiping.value || 'ontouchstart' in window) return
      
      // 仅在PC端（非触摸设备）点击切换完成状态
      task.completed = !task.completed
      onTaskStatusChange(task)
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
          const taskRegex = /^(-\s*\[([ xX])\]\s*)(.+?)(\s+@(.*?))?(?:\s+(.*?))?(?:\s*->(.*?))?$/
          const match = line.match(taskRegex)
          
          if (match) {
            const [, taskPrefix, checked, title, timePart, time, duration, dependencies] = match
            // 检查标题是否匹配
            if (title.trim() === task.title.trim()) {
              // 根据编辑的字段更新相应内容
              if (editingField.value === 'startTime') {
                // 更新时间
                let timeValue = editingValue.value
                // 如果是日期对象，格式化为 YYYY-MM-DD
                if (timeValue instanceof Date) {
                  const year = timeValue.getFullYear()
                  const month = String(timeValue.getMonth() + 1).padStart(2, '0')
                  const day = String(timeValue.getDate()).padStart(2, '0')
                  timeValue = `${year}-${month}-${day}`
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
        case 'delete':
          deleteCurrentFile()
          break
        case 'export':
          exportData()
          break
        case 'import':
          importDialogVisible.value = true
          break
        case 'clear':
          clearAllData()
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

    // 删除当前文件
    const deleteCurrentFile = () => {
      if (!currentFile.value) {
        alert('没有当前文件可删除')
        return
      }
      
      if (confirm(`确定要删除文件 "${currentFile.value.name}" 吗？`)) {
        fileManager.deleteFile(currentFile.value.name)
        
        // 删除后尝试打开其他文件
        const files = fileManager.getFileList()
        if (files.length > 0) {
          const firstFile = files[0]
          fileManager.setCurrentFile(firstFile.name)
          markdownContent.value = firstFile.content
          onContentChange()
        } else {
          // 如果没有其他文件，清空编辑器
          markdownContent.value = ''
          tasks.value = []
          syntaxErrors.value = []
        }
        
        alert('文件已删除')
      }
    }

    // 导出数据
    const exportData = () => {
      try {
        const exportedData = fileManager.exportData()
        
        // 创建下载链接
        const blob = new Blob([exportedData], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        alert('数据导出成功')
      } catch (error) {
        console.error('导出数据失败:', error)
        alert('导出数据失败')
      }
    }

    // 导入数据确认
    const importDataConfirm = () => {
      if (!importData.value.trim()) {
        alert('请输入要导入的数据')
        return
      }
      
      if (confirm('导入数据将覆盖现有所有数据，确定继续吗？')) {
        const success = fileManager.importData(importData.value)
        if (success) {
          // 导入成功后刷新界面
          const files = fileManager.getFileList()
          if (files.length > 0) {
            const firstFile = files[0]
            fileManager.setCurrentFile(firstFile.name)
            markdownContent.value = firstFile.content
            onContentChange()
          }
          
          importDialogVisible.value = false
          importData.value = ''
          alert('数据导入成功')
        } else {
          alert('数据导入失败，请检查数据格式')
        }
      }
    }

    // 清空所有数据
    const clearAllData = () => {
      if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
        fileManager.clearAll()
        
        // 重新加载默认文件
        const currentFileData = fileManager.getCurrentFile()
        if (currentFileData) {
          markdownContent.value = currentFileData.content
          onContentChange()
        }
        
        alert('所有数据已清空')
      }
    }
    
    onMounted(() => {
      // 从localStorage加载数据，如果有当前文件则加载其内容
      const currentFileData = fileManager.getCurrentFile()
      if (currentFileData) {
        markdownContent.value = currentFileData.content
        onContentChange()
      } else {
        // 如果没有当前文件，检查是否有文件列表
        const files = fileManager.getFileList()
        if (files.length > 0) {
          // 加载第一个文件
          const firstFile = files[0]
          fileManager.setCurrentFile(firstFile.name)
          markdownContent.value = firstFile.content
          onContentChange()
        }
        // 如果没有任何文件，fileManager会自动创建默认文件
      }
      
      // 添加预览区域滚动事件监听
      setTimeout(() => {
        if (taskListRef.value) {
          taskListRef.value.addEventListener('scroll', onPreviewScroll)
        }
      }, 0)
    })
    
    onUnmounted(() => {
      // 清理预览区域滚动事件监听
      if (taskListRef.value) {
        taskListRef.value.removeEventListener('scroll', onPreviewScroll)
      }
    })
    
    return {
      markdownContent,
      tasks,
      syntaxErrors,
      currentFile,
      fileList,
      newFileDialogVisible,
      openFileDialogVisible,
      importDialogVisible,
      newFileName,
      selectedFile,
      importData,
      editingTaskId,
      editingField,
      editingValue,
      durationUnit,
      taskListRef,
      showCompleted,
      separateCompleted,
      slidingTaskId,
      filteredTasks,
      incompleteTasks,
      completedTasks,
      onContentChange,
      onEditorScroll,
      onPreviewScroll,
      onTaskStatusChange,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTaskClick,
      startEditing,
      saveEditing,
      cancelEditing,
      checkSyntax,
      saveFile,
      viewGraph,
      handleFileCommand,
      createNewFile,
      openSelectedFile,
      deleteCurrentFile,
      exportData,
      importDataConfirm,
      clearAllData
    }
  }
}
</script>

<style scoped>
.todo-editor {
  height: 100%;
  overflow-y: auto;
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

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.task-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-list {
  overflow-y: auto;
  flex: 1;
}

.task-section-title {
  margin: 20px 0 10px 0;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-section-title.completed-section {
  background: #f0f9ff;
  color: #67c23a;
}

.task-card-wrapper {
  margin-bottom: 15px;
  position: relative;
  overflow: hidden;
}

.task-card-wrapper.completed-task {
  opacity: 0.8;
}

.task-card {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.task-card.slide-out {
  animation: slideOutRight 0.5s ease-in-out;
}

@keyframes slideOutRight {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

.task-content {
  position: relative;
  z-index: 2;
  background: white;
  transition: transform 0.2s ease;
}

.swipe-action {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 80px;
  background: #67c23a;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.swipe-action i {
  font-size: 20px;
  margin-bottom: 4px;
}

.task-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.task-header span {
  margin-left: 10px;
  font-weight: bold;
  transition: all 0.3s ease;
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

/* 移动端触摸优化 */
@media (max-width: 768px) {
  .task-card {
    touch-action: pan-y;
    position: relative;
  }
  
  .task-card::after {
    content: "← 滑动完成 →";
    position: absolute;
    bottom: 5px;
    right: 10px;
    font-size: 10px;
    color: #ccc;
    pointer-events: none;
    opacity: 0.6;
  }
  
  .task-controls {
    flex-direction: column;
    gap: 5px;
  }
  
  .preview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .task-section-title {
    margin: 15px 0 8px 0;
    font-size: 13px;
  }

  .el-row {
    display: flex;
    flex-direction: column;
  }
  
  .el-col {
    width: 100% !important;
    max-width: 100% !important;
    margin-bottom: 20px;
  }
  
  .editor-container {
    display: none !important;
  }
  
  .preview-container {
    width: 100%;
  }
  
  .el-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 10px;
    line-height: normal;
  }
  
  .header-content {
    width: 100%;
    justify-content: space-between;
  }
  
  .toolbar {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .el-main {
    padding: 10px;
    overflow-y: auto;
  }
  
  .task-list {
    overflow-y: auto;
    max-height: calc(100vh - 200px);
  }
  
  .task-details {
    padding-left: 20px;
  }
  
  .task-card {
    margin-bottom: 10px;
  }
  
  .task-header {
    flex-wrap: wrap;
  }
  
  .task-header span {
    margin-left: 8px;
    font-size: 14px;
  }
  
  h3 {
    font-size: 16px;
    margin-bottom: 10px;
  }
}
</style>