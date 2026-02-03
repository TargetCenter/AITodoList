<template>
  <div class="simple-todo min-h-screen bg-gray-50">
    <div class="flex flex-col h-screen">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-5">
        <h1 class="text-xl font-bold text-gray-800">TODOList</h1>
      </header>

      <main class="flex-1 p-5 overflow-hidden">
        <div class="flex h-full gap-5">
          <div class="w-1/2 flex flex-col">
            <h3 class="text-base font-semibold text-gray-700 mb-3">编辑器</h3>
            <div class="flex-1 editor-container">
              <NotionEditor
                v-model="markdownContent"
                @update:modelValue="onContentChange"
              />
            </div>
          </div>

          <div class="w-1/2 flex flex-col">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-base font-semibold text-gray-700">任务列表</h3>
              <button
                @click="showAddDialog = true"
                class="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                添加任务
              </button>
            </div>
            <div class="flex-1 task-list overflow-y-auto">
              <div v-if="filteredTasks.length === 0" class="text-center text-gray-500 py-8">
                暂无任务
              </div>
              <div
                v-for="task in filteredTasks"
                :key="task.id"
                class="task-card bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-all"
              >
                <div class="flex items-start gap-3">
                  <input
                    type="checkbox"
                    v-model="task.completed"
                    @change="onTaskStatusChange(task)"
                    class="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div class="flex-1">
                    <div
                      class="text-sm font-medium"
                      :class="{ 'line-through text-gray-400': task.completed }"
                    >
                      {{ task.title }}
                    </div>
                    <div v-if="task.time" class="text-xs text-gray-500 mt-1">
                      <span class="inline-flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                        </svg>
                        {{ task.time }}
                      </span>
                    </div>
                  </div>
                  <button
                    @click="deleteTask(task.id)"
                    class="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <AddTaskDialog
      v-if="showAddDialog"
      @confirm="onAddTask"
      @cancel="showAddDialog = false"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { parseMarkdown } from '@/utils/markdownParser'
import NotionEditor from '@/components/NotionEditor.vue'
import AddTaskDialog from '@/components/AddTaskDialog.vue'
import { generateTaskMarkdown } from '@/utils/taskGenerator'

export default {
  name: 'SimpleTodo',
  components: {
    NotionEditor,
    AddTaskDialog
  },
  setup() {
    const markdownContent = ref('')
    const tasks = ref([])
    const showAddDialog = ref(false)

    const filteredTasks = computed(() => {
      return tasks.value
    })

    const onContentChange = () => {
      try {
        tasks.value = parseMarkdown(markdownContent.value)
      } catch (error) {
        console.error('解析错误:', error)
      }
    }

    const onTaskStatusChange = (changedTask) => {
      try {
        const lines = markdownContent.value.split('\n')
        const taskRegex1 = /^-\s*\[([ xX])\]\s*(.+?)\s+@(\S+?)\s+T:(\S+?)(?:\s*->\s*(.+))?$/
        const taskRegex2 = /^-\s*\[([ xX])\]\s*(.+?)\s+(\S+?)\s+(\S+?)(?:\s*->\s*(.+))?$/

        const updatedLines = lines.map(line => {
          let match = line.match(taskRegex1)
          if (!match) {
            match = line.match(taskRegex2)
          }

          if (match) {
            const [, checked, title] = match
            if (title.trim() === changedTask.title.trim()) {
              const newCheckbox = changedTask.completed ? 'x' : ' '
              return line.replace(/^(-\s*\[)[ xX](\].*)$/, `$1${newCheckbox}$2`)
            }
          }
          return line
        })

        markdownContent.value = updatedLines.join('\n')
        onContentChange()
      } catch (error) {
        console.error('更新任务状态时出错:', error)
      }
    }

    const onAddTask = (taskData) => {
      const markdown = generateTaskMarkdown(taskData)
      markdownContent.value += '\n' + markdown
      showAddDialog.value = false
      onContentChange()
    }

    const deleteTask = (taskId) => {
      const taskToDelete = tasks.value.find(t => t.id === taskId)
      if (!taskToDelete) return

      const lines = markdownContent.value.split('\n')
      const taskRegex1 = /^-\s*\[([ xX])\]\s*(.+?)\s+@(\S+?)\s+T:(\S+?)(?:\s*->\s*(.+))?$/
      const taskRegex2 = /^-\s*\[([ xX])\]\s*(.+?)\s+(\S+?)\s+(\S+?)(?:\s*->\s*(.+))?$/

      const updatedLines = lines.filter(line => {
        let match = line.match(taskRegex1)
        if (!match) {
          match = line.match(taskRegex2)
        }
        if (match) {
          const [, , title] = match
          return title.trim() !== taskToDelete.title.trim()
        }
        return true
      })

      markdownContent.value = updatedLines.join('\n')
      onContentChange()
    }

    return {
      markdownContent,
      tasks,
      filteredTasks,
      showAddDialog,
      onContentChange,
      onTaskStatusChange,
      onAddTask,
      deleteTask
    }
  }
}
</script>

<style scoped>
.editor-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.task-list {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  background: #ffffff;
}

.task-card {
  transition: all 0.2s ease;
}

.task-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
</style>
