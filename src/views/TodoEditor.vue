<template>
    <div class="todo-editor min-h-screen bg-gray-50">
        <div class="flex flex-col">
            <header class="bg-gray-100 text-gray-800 h-16 flex items-center justify-between px-5">
                <div class="header-content flex items-center gap-5">
                    <h1 class="text-xl font-bold">Markdown 待办任务编辑器</h1>
                    <div v-if="currentFile" class="text-sm text-gray-600">
                        当前文件: {{ currentFile.name }}
                    </div>
                </div>
                <div class="toolbar flex gap-2">
                    <div class="relative">
                        <button @click="toggleFileDropdown"
                                class="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2">
                            文件管理
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        <div v-if="showFileDropdown"
                             class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                            <button @click="handleFileCommand('new')"
                                    class="block w-full text-left px-4 py-2 hover:bg-gray-100">新建文件
                            </button>
                            <button @click="handleFileCommand('save')"
                                    class="block w-full text-left px-4 py-2 hover:bg-gray-100">保存文件
                            </button>
                            <button @click="handleFileCommand('open')"
                                    class="block w-full text-left px-4 py-2 hover:bg-gray-100">打开文件
                            </button>
                            <hr class="my-1"/>
                            <button @click="handleFileCommand('delete')"
                                    class="block w-full text-left px-4 py-2 hover:bg-gray-100">删除当前文件
                            </button>
                            <button @click="handleFileCommand('download')"
                                    class="block w-full text-left px-4 py-2 hover:bg-gray-100">下载文件
                            </button>
                            <button @click="handleFileCommand('export')"
                                    class="block w-full text-left px-4 py-2 hover:bg-gray-100">导出数据
                            </button>
                            <button @click="handleFileCommand('import')"
                                    class="block w-full text-left px-4 py-2 hover:bg-gray-100">导入数据
                            </button>
                            <hr class="my-1"/>
                            <button @click="handleFileCommand('demo')"
                                    class="block w-full text-left px-4 py-2 hover:bg-gray-100">加载演示内容
                            </button>
                            <button @click="handleFileCommand('clear')"
                                    class="block w-full text-left px-4 py-2 hover:bg-gray-100">清空所有数据
                            </button>
                        </div>
                    </div>
                    <button @click="checkSyntax" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        语法检查
                    </button>
                    <button @click="viewGraph" class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                        查看关系图
                    </button>
                    <div class="relative">
                        <button @click="toggleThemeDropdown"
                                class="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2">
                            主题
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        <div v-if="showThemeDropdown"
                             class="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg z-10">
                            <button @click="handleThemeCommand('vs')"
                                    class="block w-full text-left px-4 py-2 hover:bg-gray-100">浅色主题
                            </button>
                            <button @click="handleThemeCommand('vs-dark')"
                                    class="block w-full text-left px-4 py-2 hover:bg-gray-100">深色主题
                            </button>
                            <button @click="handleThemeCommand('todo-light')"
                                    class="block w-full text-left px-4 py-2 hover:bg-gray-100">Todo浅色
                            </button>
                            <button @click="handleThemeCommand('todo-dark')"
                                    class="block w-full text-left px-4 py-2 hover:bg-gray-100">Todo深色
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div class="flex flex-1">
                <main class="flex-1 bg-gray-100 p-5">
                    <div class="flex gap-5">
                        <div class="w-1/2">
                            <div class="editor-container h-full flex flex-col">
                                <h3 class="text-lg font-semibold mb-4">Markdown 编辑器</h3>
                                <monaco-editor
                                    v-model="markdownContent"
                                    :theme="currentTheme"
                                    @update:modelValue="onContentChange"
                                    @scroll="onEditorScroll"
                                    :options="editorOptions"
                                    class="h-96"
                                />
                                <div v-if="syntaxErrors.length > 0" class="errors mt-5">
                                    <h4 class="text-base font-medium mb-2">语法错误:</h4>
                                    <div
                                        v-for="(error, index) in syntaxErrors"
                                        :key="index"
                                        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-2"
                                    >
                                        <div class="flex items-center">
                                            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd"
                                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                      clip-rule="evenodd"></path>
                                            </svg>
                                            {{ error.message }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="w-1/2">
                            <div class="preview-container h-full flex flex-col">
                                <div class="preview-header flex justify-between items-center mb-4">
                                    <h3 class="text-lg font-semibold">任务预览</h3>
                                    <div class="task-controls flex items-center gap-2">
                                        <label class="flex items-center text-sm">
                                            <input
                                                type="checkbox"
                                                v-model="showCompleted"
                                                class="mr-2"
                                            />
                                            显示已完成
                                        </label>
                                        <label class="flex items-center text-sm ml-4">
                                            <input
                                                type="checkbox"
                                                v-model="separateCompleted"
                                                class="mr-2"
                                            />
                                            分类显示
                                        </label>
                                    </div>
                                </div>

                                <div class="task-list flex-1 overflow-y-auto" ref="taskListRef">
                                    <!-- 移动端滑动提示 -->
                                    <div v-if="incompleteTasks.length > 0"
                                         class="mobile-swipe-hint hidden md:block bg-blue-50 border border-blue-200 rounded-md p-2 mb-4 text-xs text-blue-600 text-center">
                                        <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd"
                                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                  clip-rule="evenodd"></path>
                                        </svg>
                                        提示：左右滑动任务卡片超过一半距离可完成任务
                                    </div>

                                    <!-- 未完成任务 -->
                                    <div v-if="!separateCompleted || incompleteTasks.length > 0">
                                        <h4 v-if="separateCompleted"
                                            class="task-section-title m-5 my-2.5 p-2 bg-gray-50 rounded text-sm font-semibold text-gray-600 flex items-center gap-2">
                                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd"
                                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                      clip-rule="evenodd"></path>
                                            </svg>
                                            待办任务 ({{ incompleteTasks.length }})
                                        </h4>
                                        <div
                                            v-for="task in separateCompleted ? incompleteTasks : filteredTasks"
                                            :key="task.id"
                                            class="task-card-wrapper"
                                            :class="{ 'completed-task': task.completed }"
                                        >
                                            <div
                                                class="task-card-container"
                                                @touchstart="onTouchStart($event, task)"
                                                @touchmove="onTouchMove($event, task)"
                                                @touchend="onTouchEnd($event, task)"
                                                @click="onTaskClick(task)"
                                            >
                                                <div class="swipe-action-left">
                                                    <i class="el-icon-check"></i>
                                                    <span>完成</span>
                                                </div>
                                                <div class="swipe-action-right">
                                                    <i class="el-icon-check"></i>
                                                    <span>完成</span>
                                                </div>
                                                <div
                                                    class="task-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                                                    :class="{ 'slide-out': task.id === slidingTaskId }">
                                                    <div class="task-content">
                                                        <div class="task-header flex items-center mb-2.5">
                                                            <input
                                                                type="checkbox"
                                                                v-model="task.completed"
                                                                @change="onTaskStatusChange(task)"
                                                                @click.stop
                                                                class="mr-2.5"
                                                            />
                                                            <span
                                                                :class="{ 'completed': task.completed, 'line-through text-gray-500': task.completed, 'font-bold': !task.completed }">{{
                                                                    task.title
                                                                }}</span>
                                                        </div>
                                                        <div class="task-details pl-7 text-sm text-gray-600">
                                                            <div v-if="task.time !== null" class="mb-1">
                                                                <svg class="w-4 h-4 inline mr-1" fill="currentColor"
                                                                     viewBox="0 0 20 20">
                                                                    <path fill-rule="evenodd"
                                                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                                          clip-rule="evenodd"></path>
                                                                </svg>
                                                                时间: {{ task.time }}
                                                            </div>
                                                            <div v-if="task.plannedTime !== null" class="mb-1">
                                                                <svg class="w-4 h-4 inline mr-1" fill="currentColor"
                                                                     viewBox="0 0 20 20">
                                                                    <path fill-rule="evenodd"
                                                                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                                                          clip-rule="evenodd"></path>
                                                                </svg>
                                                                计划时间: {{ task.plannedTime }}
                                                            </div>
                                                            <div v-if="task.dependencies.length > 0">
                                                                <svg class="w-4 h-4 inline mr-1" fill="currentColor"
                                                                     viewBox="0 0 20 20">
                                                                    <path fill-rule="evenodd"
                                                                          d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                                                                          clip-rule="evenodd"></path>
                                                                </svg>
                                                                依赖任务: {{ task.dependencies.join(', ') }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- 已完成任务 -->
                                    <div v-if="separateCompleted && showCompleted && completedTasks.length > 0">
                                        <h4 class="task-section-title completed-section m-5 my-2.5 p-2 bg-blue-50 text-green-600 rounded text-sm font-semibold flex items-center gap-2">
                                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd"
                                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                      clip-rule="evenodd"></path>
                                            </svg>
                                            已完成任务 ({{ completedTasks.length }})
                                        </h4>
                                        <div
                                            v-for="task in completedTasks"
                                            :key="task.id"
                                            class="task-card-wrapper completed-task"
                                        >
                                            <div
                                                class="task-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 opacity-80">
                                                <div class="task-content">
                                                    <div class="task-header flex items-center mb-2.5">
                                                        <input
                                                            type="checkbox"
                                                            v-model="task.completed"
                                                            @change="onTaskStatusChange(task)"
                                                            class="mr-2.5"
                                                        />
                                                        <span
                                                            :class="{ 'completed': task.completed, 'line-through text-gray-500': task.completed, 'font-bold': !task.completed }">{{
                                                                task.title
                                                            }}</span>
                                                    </div>
                                                    <div class="task-details pl-7 text-sm text-gray-600">
                                                        <div v-if="task.time !== null" class="mb-1">
                                                            <svg class="w-4 h-4 inline mr-1" fill="currentColor"
                                                                 viewBox="0 0 20 20">
                                                                <path fill-rule="evenodd"
                                                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                                      clip-rule="evenodd"></path>
                                                            </svg>
                                                            时间: {{ task.time }}
                                                        </div>
                                                        <div v-if="task.plannedTime !== null" class="mb-1">
                                                            <svg class="w-4 h-4 inline mr-1" fill="currentColor"
                                                                 viewBox="0 0 20 20">
                                                                <path fill-rule="evenodd"
                                                                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                                                      clip-rule="evenodd"></path>
                                                            </svg>
                                                            计划时间: {{ task.plannedTime }}
                                                        </div>
                                                        <div v-if="task.dependencies.length > 0">
                                                            <svg class="w-4 h-4 inline mr-1" fill="currentColor"
                                                                 viewBox="0 0 20 20">
                                                                <path fill-rule="evenodd"
                                                                      d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                                                                      clip-rule="evenodd"></path>
                                                            </svg>
                                                            依赖任务: {{ task.dependencies.join(', ') }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    </div>

    <!-- 新建文件对话框 -->
    <div v-if="newFileDialogVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-96">
            <h3 class="text-lg font-semibold mb-4">新建文件</h3>
            <input
                v-model="newFileName"
                type="text"
                placeholder="请输入文件名"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div class="flex justify-end gap-2 mt-4">
                <button @click="newFileDialogVisible = false" class="px-4 py-2 text-gray-600 hover:text-gray-800">取消
                </button>
                <button @click="createNewFile" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    确定
                </button>
            </div>
        </div>
    </div>

    <!-- 打开文件对话框 -->
    <div v-if="openFileDialogVisible"
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-96">
            <h3 class="text-lg font-semibold mb-4">打开文件</h3>
            <select
                v-model="selectedFile"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="" disabled>请选择文件</option>
                <option
                    v-for="file in fileList"
                    :key="file.name"
                    :value="file.name"
                >
                    {{ file.name }}
                </option>
            </select>
            <div class="flex justify-end gap-2 mt-4">
                <button @click="openFileDialogVisible = false" class="px-4 py-2 text-gray-600 hover:text-gray-800">
                    取消
                </button>
                <button @click="openSelectedFile" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    确定
                </button>
            </div>
        </div>
    </div>

    <!-- 导入数据对话框 -->
    <div v-if="importDialogVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-2/3 max-w-2xl">
            <h3 class="text-lg font-semibold mb-4">导入数据</h3>
            <textarea
                v-model="importData"
                :rows="10"
                placeholder="请粘贴导出的JSON数据"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
            <div class="flex justify-end gap-2 mt-4">
                <button @click="importDialogVisible = false" class="px-4 py-2 text-gray-600 hover:text-gray-800">取消
                </button>
                <button @click="importDataConfirm"
                        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">确定
                </button>
            </div>
        </div>
    </div>

    <!-- AI 助手组件 -->
    <AIAssistant></AIAssistant>

</template>

<script>
import {ref, onMounted, onUnmounted, computed, provide} from 'vue'
import {useRouter} from 'vue-router'
import {parseMarkdown, validateSyntax} from '../utils/markdownParser'
import fileManager from '../utils/fileManager'
import MonacoEditor from '../components/MonacoEditor.vue'
import AIAssistant from '../components/AIAssistant.vue'

export default {
    name: 'TodoEditor',
    components: {
        MonacoEditor,
        AIAssistant
    },
    setup() {
        const router = useRouter()
        const markdownContent = ref('')
        const tasks = ref([])
        const syntaxErrors = ref([])

        // 当前主题
        const currentTheme = ref('vs')

        // 下拉菜单状态
        const showFileDropdown = ref(false)
        const showThemeDropdown = ref(false)

        // Monaco编辑器选项
        const editorOptions = ref({
            fontSize: 14,
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            lineNumbers: 'on',
            minimap: {enabled: true},
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            renderWhitespace: 'selection',
            cursorBlinking: 'blink',
            smoothScrolling: true
        })

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
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
                isSwiping.value = true
                event.preventDefault()

                const container = event.currentTarget
                const card = container.querySelector('.task-card')
                const leftAction = container.querySelector('.swipe-action-left')
                const rightAction = container.querySelector('.swipe-action-right')

                if (card) {
                    // 获取卡片宽度，计算一半距离
                    const cardWidth = card.offsetWidth
                    const halfWidth = cardWidth / 2

                    // 限制滑动距离，最大为卡片宽度
                    const maxDistance = cardWidth * 0.8
                    const limitedDeltaX = Math.max(-maxDistance, Math.min(maxDistance, deltaX))
                    const progress = Math.min(Math.abs(deltaX) / halfWidth, 1)

                    // 移动卡片
                    card.style.transform = `translateX(${limitedDeltaX}px)`
                    card.style.transition = 'none'

                    if (deltaX > 0 && rightAction) {
                        // 右滑
                        rightAction.style.opacity = progress
                        rightAction.style.transform = 'scale(1)'
                        if (leftAction) {
                            leftAction.style.opacity = 0
                            leftAction.style.transform = 'scale(0.8)'
                        }
                    } else if (deltaX < 0 && leftAction) {
                        // 左滑
                        leftAction.style.opacity = progress
                        leftAction.style.transform = 'scale(1)'
                        if (rightAction) {
                            rightAction.style.opacity = 0
                            rightAction.style.transform = 'scale(0.8)'
                        }
                    }
                }
            }
        }

        // 触摸结束事件
        const onTouchEnd = (event, task) => {
            if (task.completed) return

            const container = event.currentTarget
            const card = container.querySelector('.task-card')
            const leftAction = container.querySelector('.swipe-action-left')
            const rightAction = container.querySelector('.swipe-action-right')
            const touchX = event.changedTouches[0].clientX
            const deltaX = touchX - touchStartX.value

            if (card) {
                // 获取卡片宽度，计算一半距离
                const cardWidth = card.offsetWidth
                const halfWidth = cardWidth / 2

                // 恢复过渡动画
                card.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease'
                if (leftAction) leftAction.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
                if (rightAction) rightAction.style.transition = 'opacity 0.3s ease, transform 0.3s ease'

                // 只有当滑动距离超过卡片宽度的一半且确实在滑动时，才标记为完成
                if (Math.abs(deltaX) > halfWidth && isSwiping.value) {
                    // 完成动画：向滑动方向继续滑出
                    const direction = deltaX > 0 ? '150%' : '-150%'
                    card.style.transform = `translateX(${direction}) scale(0.8)`
                    card.style.opacity = '0'

                    // 添加完成效果
                    container.style.transform = 'scale(0.95)'
                    container.style.transition = 'transform 0.4s ease'

                    setTimeout(() => {
                        task.completed = true
                        onTaskStatusChange(task)

                        // 重置样式
                        setTimeout(() => {
                            card.style.transform = ''
                            card.style.opacity = ''
                            card.style.transition = ''
                            container.style.transform = ''
                            container.style.transition = ''
                            if (leftAction) {
                                leftAction.style.opacity = ''
                                leftAction.style.transform = ''
                                leftAction.style.transition = ''
                            }
                            if (rightAction) {
                                rightAction.style.opacity = ''
                                rightAction.style.transform = ''
                                rightAction.style.transition = ''
                            }
                        }, 100)
                    }, 400)
                } else {
                    // 回弹到原位
                    card.style.transform = 'translateX(0)'
                    if (leftAction) {
                        leftAction.style.opacity = '0'
                        leftAction.style.transform = 'scale(0.8)'
                    }
                    if (rightAction) {
                        rightAction.style.opacity = '0'
                        rightAction.style.transform = 'scale(0.8)'
                    }

                    setTimeout(() => {
                        card.style.transition = ''
                        if (leftAction) leftAction.style.transition = ''
                        if (rightAction) rightAction.style.transition = ''
                    }, 400)
                }
            }

            isSwiping.value = false
        }

        // PC端点击事件
        const onTaskClick = (task) => {
            // 如果正在滑动，不处理点击
            if (isSwiping.value) return

            // 在触摸设备上完全禁用点击完成功能
            if ('ontouchstart' in window) return

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
                    const taskRegex = /^-\s*\[([ xX])\]\s*(.+?)\s+(\S+?)\s+(\S+?)$/
                    const match = line.match(taskRegex)

                    if (match) {
                        const [, checked, title, time, plannedTime] = match
                        // 检查标题是否匹配
                        if (title.trim() === task.title.trim()) {
                            // 根据任务状态更新复选框
                            const newCheckbox = task.completed ? 'x' : ' '
                            return line.replace(/^(-\s*\[)[ xX](\].*)$/, `$1${newCheckbox}$2`)
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
            showFileDropdown.value = false
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
                case 'download':
                    downloadFile()
                    break
                case 'export':
                    exportData()
                    break
                case 'import':
                    importDialogVisible.value = true
                    break
                case 'demo':
                    loadDemoContent()
                    break
                case 'clear':
                    clearAllData()
                    break
            }
        }

        // 下拉菜单切换
        const toggleFileDropdown = () => {
            showFileDropdown.value = !showFileDropdown.value
            showThemeDropdown.value = false
        }

        const toggleThemeDropdown = () => {
            showThemeDropdown.value = !showThemeDropdown.value
            showFileDropdown.value = false
        }

        // 主题切换处理
        const handleThemeCommand = (theme) => {
            currentTheme.value = theme
            showThemeDropdown.value = false
        }

        // 加载演示内容
        const loadDemoContent = () => {
            const demoContent = `# 简化版待办任务演示

欢迎使用简化版待办任务编辑器！

## 基本任务语法
- [ ] 学习Vue 3 新特性 今天 2小时
- [x] 搭建项目框架 昨天 1天
- [ ] 完成项目文档 明天 1小时

## 日常任务
- [ ] 晨会 09:00 15分钟
- [ ] 代码审查 下午 1小时
- [ ] 健身 晚上 1小时

## 项目任务（带依赖）
- [ ] 需求分析 周一 2天
- [ ] 系统设计 周三 3天 ->需求分析
- [ ] 编码实现 周五 1周 ->系统设计
- [ ] 测试验证 下周一 2天 ->编码实现

## 任务依赖示例
- [ ] 数据库设计 今天 3小时
- [ ] API开发 明天 4小时 ->数据库设计
- [ ] 前端界面 后天 2天 ->数据库设计
- [ ] 集成测试 下周五 1天 ->API开发,前端界面`

            if (confirm('加载演示内容将覆盖当前编辑器内容，确定继续吗？')) {
                markdownContent.value = demoContent
                onContentChange()

                // 如果有当前文件，保存演示内容
                if (currentFile.value) {
                    fileManager.saveFile(currentFile.value.name, demoContent)
                }

                alert('演示内容已加载！')
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

        // 下载文件
        const downloadFile = () => {
            if (!currentFile.value) {
                alert('没有当前文件可下载')
                return
            }

            try {
                // 创建下载链接
                const blob = new Blob([markdownContent.value], {type: 'text/markdown'})
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = currentFile.value.name
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)

                alert('文件下载成功')
            } catch (error) {
                console.error('下载文件失败:', error)
                alert('下载文件失败')
            }
        }

        // 导出数据
        const exportData = () => {
            try {
                const exportedData = fileManager.exportData()

                // 创建下载链接
                const blob = new Blob([exportedData], {type: 'application/json'})
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

        // 更新编辑器内容的方法（供AI助手使用）
        const updateEditorContent = (content) => {
            markdownContent.value = content
            onContentChange()

            // 保存到当前文件
            if (currentFile.value) {
                fileManager.saveFile(currentFile.value.name, content)
            }
        }

        // 为AI助手提供依赖注入
        provide('fileManager', fileManager)
        provide('editorContent', markdownContent)
        provide('updateEditorContent', updateEditorContent)

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
            editorOptions,
            currentTheme,
            showFileDropdown,
            showThemeDropdown,
            toggleFileDropdown,
            toggleThemeDropdown,
            onContentChange,
            onEditorScroll,
            onPreviewScroll,
            onTaskStatusChange,
            onTouchStart,
            onTouchMove,
            onTouchEnd,
            onTaskClick,
            checkSyntax,
            saveFile,
            viewGraph,
            handleFileCommand,
            handleThemeCommand,
            loadDemoContent,
            createNewFile,
            openSelectedFile,
            deleteCurrentFile,
            downloadFile,
            exportData,
            importDataConfirm,
            clearAllData,
            updateEditorContent
        }
    }
}
</script>

<style scoped>
/* 任务卡片动画 */
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

.task-card-wrapper {
    margin-bottom: 15px;
    position: relative;
    overflow: hidden;
}

.task-card-container {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

.swipe-action-left,
.swipe-action-right {
    position: absolute;
    top: 0;
    height: 100%;
    width: 80px;
    background: linear-gradient(135deg, #67c23a, #85ce61);
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
    transform: scale(0.8);
}

.swipe-action-left {
    left: 0;
}

.swipe-action-right {
    right: 0;
}

.swipe-action-left i,
.swipe-action-right i {
    font-size: 20px;
    margin-bottom: 4px;
}

.swipe-action-left span,
.swipe-action-right span {
    font-size: 10px;
    font-weight: 600;
}

/* 移动端触摸优化 */
@media (max-width: 768px) {
    .mobile-swipe-hint {
        display: block;
    }

    .task-card-container {
        touch-action: pan-y;
    }

    .task-card::after {
        content: "← 滑动超过一半完成 →";
        position: absolute;
        bottom: 5px;
        right: 10px;
        font-size: 9px;
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

    .flex.gap-5 {
        flex-direction: column;
    }

    .w-1\/2 {
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

    header {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
        padding: 10px;
        height: auto;
        min-height: auto;
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

    main {
        padding: 10px;
        overflow-y: auto;
    }

    .task-list {
        overflow-y: auto;
        max-height: calc(100vh - 200px);
    }

    .pl-7 {
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
