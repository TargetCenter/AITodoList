<script setup>
import {onMounted, ref} from 'vue'
import Head from "@/components/Head.vue";
import Footer from "@/components/Footer.vue";
import CodeMirrorEditor from "@/components/CodeMirrorEditor.vue";

import fileManager from '../utils/fileManager'
import {parseMarkdown, validateSyntax} from "@/utils/markdownParser";

const todos = ref([])
const mdTodoList = ref('')

const onContentChange = () => {
    try {
        const tasks = parseMarkdown(mdTodoList.value)
        const syntaxErrors = validateSyntax(mdTodoList.value)
        console.log('解析任务:', tasks)
        console.log('语法错误:', syntaxErrors)
    } catch (error) {
        console.error('解析错误:', error)
    }
}

const onEditorScroll = (scrollInfo) => {
}

onMounted(() => {
    console.log('Main page mounted')
})
</script>

<template>
    <div class="min-h-screen flex flex-col ">
        <Head/>
        <!-- 主要内容区域 -->
        <main class="grid grid-cols-1 lg:grid-cols-2 flex-1">
            <!-- 编辑器区域：PC端显示，移动端隐藏 -->
            <div class="hidden lg:block">
                <div class=" h-full">
                    <CodeMirrorEditor
                        v-model="mdTodoList"
                        @update:modelValue="onContentChange"
                        @scroll="onEditorScroll"
                        class="w-full"
                    />
                </div>
            </div>

            <!-- 预览区域：所有设备都显示 -->
            <div>
                <div class="bg-white rounded-lg shadow-md p-4 h-full">
                    <h2 class="text-lg font-semibold mb-4 text-gray-800">
                        <span class="lg:hidden">内容</span>
                    </h2>
                    <div class="prose prose-sm max-w-none h-96 lg:h-full overflow-auto">
                        {{ mdTodoList }}
                        <ul>
                            <li v-for="todo in todos" :key="todo.id">{{ todo.name }}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
        <Footer/>
    </div>
</template>