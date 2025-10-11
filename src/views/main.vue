<script setup>
import {ref} from 'vue'
import Head from "@/components/Head.vue";
import Footer from "@/components/Footer.vue";
import MonacoEditor from "@/components/MonacoEditor.vue";

const code = ref('')
</script>

<template>
    <div class="min-h-screen flex flex-col bg-gray-50">
        <Head/>
        <!-- 主要内容区域 -->
        <main class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 flex-1 bg-blue-100 md:bg-red-100">
            <!-- 主要内容区域 - 使用flexbox布局 -->
            <!-- 编辑器区域：PC端显示，移动端隐藏 -->
            <div class="bg-[#020] hidden md:block">
                <div class="bg-white rounded-lg shadow-md p-4 h-full">
                    <h2 class="text-lg font-semibold mb-4 text-gray-800">编辑器</h2>
                    <div class="min-h-0 bg-blue-200 p-4">
                        <!-- 暂时用简单的div测试布局 -->
                        <div>编辑器区域 (PC端显示)</div>
                        <!-- MonacoEditor v-model="code" class="w-full h-full"/ -->
                    </div>
                </div>
            </div>

            <!-- 预览区域：所有设备都显示 -->
            <div class="bg-[#ef4444]">
                <div class="bg-white rounded-lg shadow-md p-4 h-full">
                    <h2 class="text-lg font-semibold mb-4 text-gray-800">
                        <span class="md:hidden">内容</span>
                    </h2>
                    <div class="prose prose-sm max-w-none h-96 md:h-full overflow-auto">
                        {{ code }}
                    </div>
                </div>
            </div>
        </main>
        <Footer/>
    </div>
</template>

