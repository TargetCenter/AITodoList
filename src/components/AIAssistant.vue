<template>
  <div class="ai-assistant">
    <!-- AI助手触发按钮 -->
    <el-button 
      type="primary" 
      :icon="Wand2" 
      circle 
      class="ai-trigger-btn"
      @click="showDialog = true"
      :loading="isGenerating"
    />

    <!-- AI助手对话框 -->
    <el-dialog
      v-model="showDialog"
      title="AI 待办助手"
      width="800px"
      :before-close="handleClose"
    >
      <div class="ai-dialog-content">
        <!-- 功能选择标签页 -->
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="优化内容" name="optimize">
            <div class="tab-content">
              <p class="tab-description">AI将分析并优化您当前的待办事项内容</p>
              <el-button 
                type="primary" 
                @click="optimizeCurrentContent"
                :loading="isGenerating"
                :disabled="!hasContent"
              >
                优化当前内容
              </el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="生成待办" name="generate">
            <div class="tab-content">
              <el-form :model="generateForm" label-width="80px">
                <el-form-item label="主题">
                  <el-input 
                    v-model="generateForm.topic" 
                    placeholder="请输入项目或任务主题"
                  />
                </el-form-item>
                <el-form-item label="时间范围">
                  <el-select v-model="generateForm.timeframe">
                    <el-option label="今天" value="今天" />
                    <el-option label="本周" value="一周" />
                    <el-option label="本月" value="一个月" />
                    <el-option label="本季度" value="三个月" />
                  </el-select>
                </el-form-item>
                <el-form-item label="优先级">
                  <el-select v-model="generateForm.priority">
                    <el-option label="低" value="低" />
                    <el-option label="中等" value="中等" />
                    <el-option label="高" value="高" />
                    <el-option label="紧急" value="紧急" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-checkbox v-model="generateForm.includeSubtasks">
                    包含子任务分解
                  </el-checkbox>
                </el-form-item>
                <el-form-item>
                  <el-checkbox v-model="generateForm.estimateTime">
                    包含时间估算
                  </el-checkbox>
                </el-form-item>
              </el-form>
              <el-button 
                type="primary" 
                @click="generateTodoList"
                :loading="isGenerating"
                :disabled="!generateForm.topic"
              >
                生成待办清单
              </el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="任务分解" name="breakdown">
            <div class="tab-content">
              <el-input
                v-model="breakdownTask"
                type="textarea"
                :rows="3"
                placeholder="请输入需要分解的大任务..."
              />
              <div class="button-group">
                <el-button 
                  type="primary" 
                  @click="breakdownLargeTask"
                  :loading="isGenerating"
                  :disabled="!breakdownTask"
                >
                  智能分解
                </el-button>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="项目规划" name="project">
            <div class="tab-content">
              <el-form :model="projectForm" label-width="80px">
                <el-form-item label="项目名称">
                  <el-input v-model="projectForm.name" placeholder="请输入项目名称" />
                </el-form-item>
                <el-form-item label="项目描述">
                  <el-input 
                    v-model="projectForm.description" 
                    type="textarea"
                    :rows="3"
                    placeholder="请描述项目的目标和要求..."
                  />
                </el-form-item>
                <el-form-item label="截止日期">
                  <el-date-picker
                    v-model="projectForm.deadline"
                    type="date"
                    placeholder="选择截止日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-form>
              <el-button 
                type="primary" 
                @click="generateProjectPlan"
                :loading="isGenerating"
                :disabled="!projectForm.name || !projectForm.description"
              >
                生成项目计划
              </el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="智能建议" name="suggestions">
            <div class="tab-content">
              <p class="tab-description">AI将分析您的待办事项并提供改进建议</p>
              <el-button 
                type="primary" 
                @click="getSuggestions"
                :loading="isGenerating"
                :disabled="!hasContent"
              >
                获取建议
              </el-button>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 生成结果显示区域 -->
        <div v-if="generatedContent" class="result-area">
          <div class="result-header">
            <h4>AI 生成结果</h4>
            <div class="result-actions">
              <el-button size="small" @click="copyToClipboard">复制</el-button>
              <el-button size="small" type="primary" @click="applyToEditor">
                应用到编辑器
              </el-button>
            </div>
          </div>
          <div class="result-content">
            <pre>{{ generatedContent }}</pre>
          </div>
        </div>

        <!-- 流式生成显示区域 -->
        <div v-if="isStreaming" class="streaming-area">
          <div class="streaming-header">
            <h4>AI 正在生成...</h4>
            <el-button size="small" @click="stopStreaming">停止生成</el-button>
          </div>
          <div class="streaming-content">
            <pre>{{ streamingContent }}</pre>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDialog = false">关闭</el-button>
          <el-button type="primary" @click="clearResults">清空结果</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, inject } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Wand2 } from '@element-plus/icons-vue'
import pollinationsAPI from '../utils/pollinationsAPI.js'

export default {
  name: 'AIAssistant',
  components: {
    Wand2
  },
  setup() {
    // 注入文件管理器和编辑器内容
    const fileManager = inject('fileManager')
    const editorContent = inject('editorContent', ref(''))
    const updateEditorContent = inject('updateEditorContent', () => {})

    // 响应式数据
    const showDialog = ref(false)
    const activeTab = ref('optimize')
    const isGenerating = ref(false)
    const isStreaming = ref(false)
    const generatedContent = ref('')
    const streamingContent = ref('')

    // 表单数据
    const generateForm = ref({
      topic: '',
      timeframe: '一周',
      priority: '中等',
      includeSubtasks: true,
      estimateTime: true
    })

    const projectForm = ref({
      name: '',
      description: '',
      deadline: ''
    })

    const breakdownTask = ref('')

    // 计算属性
    const hasContent = computed(() => {
      return editorContent.value && editorContent.value.trim().length > 0
    })

    // 方法
    const handleTabClick = (tab) => {
      clearResults()
    }

    const handleClose = (done) => {
      if (isGenerating.value) {
        ElMessageBox.confirm('AI正在生成内容，确定要关闭吗？')
          .then(() => {
            stopStreaming()
            done()
          })
          .catch(() => {})
      } else {
        done()
      }
    }

    const optimizeCurrentContent = async () => {
      if (!hasContent.value) {
        ElMessage.warning('请先在编辑器中输入一些内容')
        return
      }

      isGenerating.value = true
      try {
        const result = await pollinationsAPI.optimizeTodoContent(editorContent.value)
        generatedContent.value = result
        ElMessage.success('内容优化完成')
      } catch (error) {
        ElMessage.error(`优化失败: ${error.message}`)
      } finally {
        isGenerating.value = false
      }
    }

    const generateTodoList = async () => {
      isGenerating.value = true
      try {
        const result = await pollinationsAPI.generateTodoByTopic(
          generateForm.value.topic,
          generateForm.value
        )
        generatedContent.value = result
        ElMessage.success('待办清单生成完成')
      } catch (error) {
        ElMessage.error(`生成失败: ${error.message}`)
      } finally {
        isGenerating.value = false
      }
    }

    const breakdownLargeTask = async () => {
      isGenerating.value = true
      try {
        const result = await pollinationsAPI.breakdownTask(breakdownTask.value)
        generatedContent.value = result
        ElMessage.success('任务分解完成')
      } catch (error) {
        ElMessage.error(`分解失败: ${error.message}`)
      } finally {
        isGenerating.value = false
      }
    }

    const generateProjectPlan = async () => {
      isGenerating.value = true
      try {
        const result = await pollinationsAPI.generateProjectPlan(
          projectForm.value.name,
          projectForm.value.description,
          projectForm.value.deadline
        )
        generatedContent.value = result
        ElMessage.success('项目计划生成完成')
      } catch (error) {
        ElMessage.error(`生成失败: ${error.message}`)
      } finally {
        isGenerating.value = false
      }
    }

    const getSuggestions = async () => {
      if (!hasContent.value) {
        ElMessage.warning('请先在编辑器中输入一些内容')
        return
      }

      isGenerating.value = true
      try {
        const result = await pollinationsAPI.getSuggestions(editorContent.value)
        generatedContent.value = result
        ElMessage.success('建议获取完成')
      } catch (error) {
        ElMessage.error(`获取建议失败: ${error.message}`)
      } finally {
        isGenerating.value = false
      }
    }

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(generatedContent.value)
        ElMessage.success('已复制到剪贴板')
      } catch (error) {
        ElMessage.error('复制失败')
      }
    }

    const applyToEditor = () => {
      if (generatedContent.value) {
        updateEditorContent(generatedContent.value)
        ElMessage.success('内容已应用到编辑器')
        showDialog.value = false
      }
    }

    const stopStreaming = () => {
      isStreaming.value = false
      isGenerating.value = false
    }

    const clearResults = () => {
      generatedContent.value = ''
      streamingContent.value = ''
    }

    return {
      // 响应式数据
      showDialog,
      activeTab,
      isGenerating,
      isStreaming,
      generatedContent,
      streamingContent,
      generateForm,
      projectForm,
      breakdownTask,
      
      // 计算属性
      hasContent,
      
      // 方法
      handleTabClick,
      handleClose,
      optimizeCurrentContent,
      generateTodoList,
      breakdownLargeTask,
      generateProjectPlan,
      getSuggestions,
      copyToClipboard,
      applyToEditor,
      stopStreaming,
      clearResults,
      
      // 图标
      Wand2
    }
  }
}
</script>

<style scoped>
.ai-assistant {
  position: relative;
}

.ai-trigger-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  width: 60px;
  height: 60px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ai-dialog-content {
  min-height: 400px;
}

.tab-content {
  padding: 20px 0;
}

.tab-description {
  color: #666;
  margin-bottom: 15px;
  font-size: 14px;
}

.button-group {
  margin-top: 15px;
}

.result-area, .streaming-area {
  margin-top: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.result-header, .streaming-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.result-header h4, .streaming-header h4 {
  margin: 0;
  font-size: 14px;
  color: #303133;
}

.result-actions {
  display: flex;
  gap: 8px;
}

.result-content, .streaming-content {
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.result-content pre, .streaming-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #303133;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.el-form-item {
  margin-bottom: 18px;
}

.el-select, .el-date-picker {
  width: 100%;
}
</style>