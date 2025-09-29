<template>
  <div class="api-test">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Pollinations.ai API 测试</span>
        </div>
      </template>
      
      <div class="test-content">
        <el-input
          v-model="testPrompt"
          type="textarea"
          :rows="3"
          placeholder="输入测试提示词..."
        />
        
        <div class="button-group">
          <el-button 
            type="primary" 
            @click="testAPI"
            :loading="isLoading"
          >
            测试 API
          </el-button>
          <el-button @click="clearResult">清空结果</el-button>
        </div>
        
        <div v-if="result" class="result-area">
          <h4>API 响应结果：</h4>
          <div class="result-content">
            <pre>{{ result }}</pre>
          </div>
        </div>
        
        <div v-if="error" class="error-area">
          <el-alert
            :title="error"
            type="error"
            :closable="false"
            show-icon
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import pollinationsAPI from '../utils/pollinationsAPI.js'

export default {
  name: 'APITest',
  setup() {
    const testPrompt = ref('请生成一个简单的待办事项列表')
    const result = ref('')
    const error = ref('')
    const isLoading = ref(false)

    const testAPI = async () => {
      if (!testPrompt.value.trim()) {
        ElMessage.warning('请输入测试提示词')
        return
      }

      isLoading.value = true
      error.value = ''
      result.value = ''

      try {
        const response = await pollinationsAPI.generateText(testPrompt.value)
        result.value = response
        ElMessage.success('API 测试成功')
      } catch (err) {
        error.value = err.message
        ElMessage.error('API 测试失败')
      } finally {
        isLoading.value = false
      }
    }

    const clearResult = () => {
      result.value = ''
      error.value = ''
    }

    return {
      testPrompt,
      result,
      error,
      isLoading,
      testAPI,
      clearResult
    }
  }
}
</script>

<style scoped>
.api-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.test-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.result-area {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  background-color: #f9f9f9;
}

.result-area h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.result-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #303133;
}

.error-area {
  margin-top: 10px;
}
</style>