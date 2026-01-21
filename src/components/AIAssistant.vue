<template>
    <div class="ai-assistant">
        <!-- AI助手触发按钮 -->
        <button
            class="ai-trigger-btn bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 transition-colors flex items-center justify-center"
            @click="showDialog = true"
            :disabled="isGenerating"
        >
            <svg v-if="!isGenerating" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
            <svg v-else class="w-6 h-6 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clip-rule="evenodd"></path>
            </svg>
        </button>

        <!-- AI助手对话框 -->
        <div v-if="showDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg w-4/5 max-w-4xl max-h-90vh overflow-hidden flex flex-col">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 class="text-xl font-semibold">AI 待办助手</h2>
                    <button @click="handleClose" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto p-6">
                    <div class="ai-dialog-content">
                        <!-- 功能选择标签页 -->
                        <div class="border-b border-gray-200">
                            <div class="flex space-x-8">
                                <button
                                    @click="activeTab = 'optimize'"
                                    :class="activeTab === 'optimize' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                                    class="py-2 px-1 border-b-2 font-medium text-sm"
                                >
                                    优化内容
                                </button>
                                <button
                                    @click="activeTab = 'generate'"
                                    :class="activeTab === 'generate' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                                    class="py-2 px-1 border-b-2 font-medium text-sm"
                                >
                                    生成待办
                                </button>
                                <button
                                    @click="activeTab = 'breakdown'"
                                    :class="activeTab === 'breakdown' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                                    class="py-2 px-1 border-b-2 font-medium text-sm"
                                >
                                    任务分解
                                </button>
                                <button
                                    @click="activeTab = 'project'"
                                    :class="activeTab === 'project' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                                    class="py-2 px-1 border-b-2 font-medium text-sm"
                                >
                                    项目规划
                                </button>
                                <button
                                    @click="activeTab = 'suggestions'"
                                    :class="activeTab === 'suggestions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                                    class="py-2 px-1 border-b-2 font-medium text-sm"
                                >
                                    智能建议
                                </button>
                            </div>
                        </div>
                        <div class="mt-6">
                            <!-- 优化内容 -->
                            <div v-if="activeTab === 'optimize'" class="tab-content">
                                <p class="text-gray-600 mb-4">AI将分析并优化您当前的待办事项内容</p>
                                <button
                                    @click="optimizeCurrentContent"
                                    :disabled="isGenerating || !hasContent"
                                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    优化当前内容
                                </button>
                            </div>

                            <!-- 生成待办 -->
                            <div v-if="activeTab === 'generate'" class="tab-content">
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">主题</label>
                                        <input
                                            v-model="generateForm.topic"
                                            type="text"
                                            placeholder="请输入项目或任务主题"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">时间范围</label>
                                        <select v-model="generateForm.timeframe"
                                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="今天">今天</option>
                                            <option value="一周">本周</option>
                                            <option value="一个月">本月</option>
                                            <option value="三个月">本季度</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                                        <select v-model="generateForm.priority"
                                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="低">低</option>
                                            <option value="中等">中等</option>
                                            <option value="高">高</option>
                                            <option value="紧急">紧急</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="flex items-center">
                                            <input
                                                type="checkbox"
                                                v-model="generateForm.includeSubtasks"
                                                class="mr-2"
                                            />
                                            包含子任务分解
                                        </label>
                                    </div>
                                    <div>
                                        <label class="flex items-center">
                                            <input
                                                type="checkbox"
                                                v-model="generateForm.estimateTime"
                                                class="mr-2"
                                            />
                                            估算时间
                                        </label>
                                    </div>
                                </div>
                                <button
                                    @click="generateTodos"
                                    :disabled="isGenerating || !generateForm.topic"
                                    class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    生成待办任务
                                </button>
                            </div>

                            <!-- 任务分解 -->
                            <div v-if="activeTab === 'breakdown'" class="tab-content">
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">主任务</label>
                                        <input
                                            v-model="breakdownTaskText"
                                            type="text"
                                            placeholder="请输入要分解的主任务"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <button
                                        @click="breakdownLargeTask"
                                        :disabled="isGenerating || !breakdownTaskText"
                                        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        分解任务
                                    </button>
                                </div>
                            </div>

                            <!-- 项目规划 -->
                            <div v-if="activeTab === 'project'" class="tab-content">
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
                                        <input v-model="projectForm.name" type="text" placeholder="请输入项目名称"
                                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">项目描述</label>
                                        <textarea
                                            v-model="projectForm.description"
                                            :rows="3"
                                            placeholder="请输入项目描述"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                                        <input
                                            v-model="projectForm.deadline"
                                            type="date"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <button
                                    @click="generateProjectPlan"
                                    :disabled="isGenerating || !projectForm.name"
                                    class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    生成项目规划
                                </button>
                            </div>

                            <!-- 智能建议 -->
                            <div v-if="activeTab === 'suggestions'" class="tab-content">
                                <p class="text-gray-600 mb-4">基于您当前的任务内容，AI将提供智能建议</p>
                                <button
                                    @click="getSuggestions"
                                    :disabled="isGenerating || !hasContent"
                                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    获取智能建议
                                </button>
                            </div>

                            <!-- 生成结果显示区域 -->
                            <div v-if="generatedContent" class="result-area mt-6 border-t border-gray-200 pt-6">
                                <div class="result-header flex justify-between items-center mb-4">
                                    <h4 class="text-lg font-semibold">AI 生成结果</h4>
                                    <div class="result-actions flex gap-2">
                                        <button @click="copyToClipboard"
                                                class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                                            复制
                                        </button>
                                        <button @click="applyToEditor"
                                                class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                            应用到编辑器
                                        </button>
                                    </div>
                                </div>
                                <div class="result-content bg-gray-50 p-4 rounded-md">
                                    <pre class="whitespace-pre-wrap text-sm">{{ generatedContent }}</pre>
                                </div>
                            </div>

                            <!-- 流式生成显示区域 -->
                            <div v-if="isStreaming" class="streaming-area mt-6 border-t border-gray-200 pt-6">
                                <div class="streaming-header flex justify-between items-center mb-4">
                                    <h4 class="text-lg font-semibold">AI 正在生成...</h4>
                                    <button @click="stopStreaming"
                                            class="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">
                                        停止生成
                                    </button>
                                </div>
                                <div class="streaming-content bg-gray-50 p-4 rounded-md">
                                    <pre class="whitespace-pre-wrap text-sm">{{ streamingContent }}</pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                        <button @click="showDialog = false" class="px-4 py-2 text-gray-600 hover:text-gray-800">关闭
                        </button>
                        <button @click="clearResults"
                                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">清空结果
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {ref, computed, inject} from 'vue'
import pollinationsAPI from '../utils/pollinationsAPI.js'

export default {
    name: 'AIAssistant',
    setup() {
        // 注入文件管理器和编辑器内容
        const fileManager = inject('fileManager')
        const editorContent = inject('editorContent', ref(''))
        const updateEditorContent = inject('updateEditorContent', () => {
        })

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

        const breakdownTaskText = ref('')

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
                confirm('AI正在生成内容，确定要关闭吗？')
                    .then(() => {
                        stopStreaming()
                        done()
                    })
                    .catch(() => {
                    })
            } else {
                done()
            }
        }

        const optimizeCurrentContent = async () => {
            if (!hasContent.value) {
                alert('请先在编辑器中输入一些内容')
                return
            }

            isGenerating.value = true
            try {
                const result = await pollinationsAPI.optimizeTodoContent(editorContent.value)
                generatedContent.value = result
                alert('内容优化完成')
            } catch (error) {
                alert(`优化失败: ${error.message}`)
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
                alert('待办清单生成完成')
            } catch (error) {
                alert(`生成失败: ${error.message}`)
            } finally {
                isGenerating.value = false
            }
        }

        const breakdownLargeTask = async () => {
            if (!breakdownTaskText.value || breakdownTaskText.value.trim().length === 0) {
                alert('请输入要分解的任务')
                return
            }

            isGenerating.value = true
            try {
                const result = await pollinationsAPI.breakdownTask(breakdownTaskText.value)
                generatedContent.value = result
                alert('任务分解完成')
            } catch (error) {
                alert(`分解失败: ${error.message}`)
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
                alert('项目计划生成完成')
            } catch (error) {
                alert(`生成失败: ${error.message}`)
            } finally {
                isGenerating.value = false
            }
        }

        const getSuggestions = async () => {
            if (!hasContent.value) {
                alert('请先在编辑器中输入一些内容')
                return
            }

            isGenerating.value = true
            try {
                const result = await pollinationsAPI.getSuggestions(editorContent.value)
                generatedContent.value = result
                alert('建议获取完成')
            } catch (error) {
                alert(`获取建议失败: ${error.message}`)
            } finally {
                isGenerating.value = false
            }
        }

        const copyToClipboard = async () => {
            try {
                await navigator.clipboard.writeText(generatedContent.value)
                alert('已复制到剪贴板')
            } catch (error) {
                alert('复制失败')
            }
        }

        const applyToEditor = () => {
            if (generatedContent.value) {
                updateEditorContent(generatedContent.value)
                alert('内容已应用到编辑器')
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

        // 添加方法别名以保持向后兼容
        const generateTodos = generateTodoList

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
            breakdownTaskText,

            // 计算属性
            hasContent,

            // 方法
            handleTabClick,
            handleClose,
            optimizeCurrentContent,
            generateTodos,
            generateTodoList,
            breakdownLargeTask,
            generateProjectPlan,
            getSuggestions,
            copyToClipboard,
            applyToEditor,
            stopStreaming,
            clearResults,

            // 图标
            MagicStick
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

</style>