<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-96 shadow-xl">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">添加任务</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">任务名称</label>
          <input
            v-model="taskData.title"
            type="text"
            placeholder="请输入任务名称"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">时间</label>
          <input
            v-model="taskData.time"
            type="text"
            placeholder="例如: 今天, 明天, 2023-12-01"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">用时</label>
          <input
            v-model="taskData.duration"
            type="text"
            placeholder="例如: 1h, 2d, 1w"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">依赖任务 (可选)</label>
          <input
            v-model="taskData.dependencies"
            type="text"
            placeholder="依赖任务名称"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>
      
      <div class="flex justify-end gap-2 mt-6">
        <button
          @click="$emit('cancel')"
          class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          取消
        </button>
        <button
          @click="onConfirm"
          class="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          确定
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'AddTaskDialog',
  emits: ['confirm', 'cancel'],
  setup(props, { emit }) {
    const taskData = ref({
      title: '',
      time: '',
      duration: '',
      dependencies: ''
    })

    const onConfirm = () => {
      if (!taskData.value.title.trim()) {
        alert('请输入任务名称')
        return
      }

      const dependencies = taskData.value.dependencies
        ? taskData.value.dependencies.split(',').map(d => d.trim()).filter(d => d)
        : []

      emit('confirm', {
        title: taskData.value.title,
        time: taskData.value.time || null,
        duration: taskData.value.duration || null,
        dependencies
      })

      taskData.value = {
        title: '',
        time: '',
        duration: '',
        dependencies: ''
      }
    }

    return {
      taskData,
      onConfirm
    }
  }
}
</script>
