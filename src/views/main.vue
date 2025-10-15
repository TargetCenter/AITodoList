<script setup>
import {onMounted, ref} from 'vue'
import Head from "@/components/Head.vue";
import Footer from "@/components/Footer.vue";
import MonacoEditor from "@/components/MonacoEditor.vue";

import fileManager from '../utils/fileManager'
import AIAssistant from '../components/AIAssistant.vue'
import {parseMarkdown, validateSyntax} from "@/utils/markdownParser";

import { supabaseClient, checkTableExists } from '@/utils/supabaseClient.ts'

const todos = ref([])

async function createTodoListTable() {
    console.log('请在Supabase控制台的SQL编辑器中执行以下SQL语句来创建表格:')
    console.log(`
        CREATE TABLE IF NOT EXISTS todoList (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- 创建自动更新updated_at的触发器
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_todoList_updated_at
            BEFORE UPDATE ON todoList
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    `)
    return false // 因为无法通过客户端创建表格，返回false
}

async function getTodos() {
    if (!await checkTableExists("todoList")) {
        console.log('todoList表格不存在，正在创建...')
        await createTodoListTable()
    }
    
    const { data, error } = await supabaseClient
        .from('todoList')
        .select('*')
        .order('created_at', { ascending: false })
    
    if (error) {
        console.error('获取todos失败:', error)
        todos.value = []
    } else {
        todos.value = data || []
    }
}

onMounted(() => {
    getTodos()
})

const mdTodoList = ref('');
// const currentFile = ref('');

const onContentChange = () => {
    // // 实时解析Markdown内容
    // try {
    //     tasks.value = parseMarkdown(mdTodoList.value)
    //     syntaxErrors.value = validateSyntax(mdTodoList.value)
    //
    //     // 自动保存到localStorage
    //     if (currentFile.value) {
    //         fileManager.saveFile(currentFile.value.name, mdTodoList.value)
    //     }
    // } catch (error) {
    //     console.error('解析错误:', error)
    // }
}

// 编辑器滚动处理函数
const onEditorScroll = (scrollInfo) => {
    // if (!taskListRef.value || isScrollingPreview.value) return;
    //
    // isScrollingEditor.value = true;
    //
    // // 计算滚动比例
    // const scrollRatio = scrollInfo.scrollTop / (scrollInfo.scrollHeight - scrollInfo.clientHeight);
    //
    // // 同步预览区域滚动
    // const previewScrollTop = scrollRatio * (taskListRef.value.scrollHeight - taskListRef.value.clientHeight);
    // taskListRef.value.scrollTop = previewScrollTop;
    //
    // // 重置滚动标志
    // setTimeout(() => {
    //     isScrollingEditor.value = false;
    // }, 100);
}

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

</script>

<template>
    <div class="min-h-screen flex flex-col ">
        <Head/>
        <!-- 主要内容区域 -->
        <main class="grid grid-cols-1 lg:grid-cols-2 flex-1">
            <!-- 编辑器区域：PC端显示，移动端隐藏 -->
            <div class="hidden lg:block">
                <div class=" h-full">
                    <MonacoEditor
                        v-model="mdTodoList"
                        @update:modelValue="onContentChange"
                        @scroll="onEditorScroll"
                        :options="editorOptions"
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

