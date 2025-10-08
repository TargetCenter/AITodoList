<template>
  <div class="api-test p-5 max-w-4xl mx-auto">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="card-header font-bold text-lg">
          Pollinations.ai API 测试
        </div>
      </div>
      
      <div class="test-content p-6 space-y-4">
        <textarea
          v-model="testPrompt"
          :rows="3"
          placeholder="输入测试提示词..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <div class="button-group flex gap-2">
          <button 
            @click="testAPI"
            :disabled="isLoading"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <span v-if="!isLoading">测试 API</span>
            <span v-else>测试中...</span>
          </button>
          <button @click="clearResult" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">清空结果</button>
        </div>
        
        <div v-if="result" class="result-area border border-gray-200 rounded-md p-4 bg-gray-50">
          <h4 class="text-base font-semibold mb-2 text-gray-800">API 响应结果：</h4>
          <div class="result-content">
            <pre class="m-0 whitespace-pre-wrap break-words font-mono text-sm leading-6 text-gray-700">{{ result }}</pre>
          </div>
        </div>
        
        <div v-if="error" class="error-area mt-2">
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
              {{ error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
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
        alert('请输入测试提示词')
        return
      }

      isLoading.value = true
      error.value = ''
      result.value = ''

      try {
        const response = await pollinationsAPI.generateText(testPrompt.value)
        result.value = response
        alert('API 测试成功')
      } catch (err) {
        error.value = err.message
        alert('API 测试失败')
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
/* 样式已通过 Tailwind CSS 类处理 */
</style>