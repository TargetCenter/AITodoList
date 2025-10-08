<script setup>
import {ref} from 'vue'
import Head from "@/components/Head.vue";
import Footer from "@/components/Footer.vue";
import MonacoEditor from "@/components/MonacoEditor.vue";

const code = ref('')
</script>

<template>
    <div class="min-h-screen flex flex-col bg-gray-50">
        <Head />
        <!-- 主要内容区域 -->
        <main class="flex-1 container mx-auto px-4 py-6">
            <!-- 主要内容区域 - 使用flexbox布局 -->
            <div class="flex flex-col md:flex-row gap-6 h-full">
                <!-- 编辑器区域：PC端显示，移动端隐藏 -->
                <div class="block md:flex-1 md:hidden">
                    <div class="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
                        <h2 class="text-lg font-semibold mb-4 text-gray-800">编辑器</h2>
                        <div class="flex-1 min-h-0 bg-blue-200 p-4">
                            <!-- 暂时用简单的div测试布局 -->
                            <div>编辑器区域 (PC端显示)</div>
                            <!-- MonacoEditor v-model="code" class="w-full h-full"/ -->
                        </div>
                    </div>
                </div>
                
                <!-- 预览区域：所有设备都显示 -->
                <div class="flex-1">
                    <div class="bg-white rounded-lg shadow-md p-4 h-full">
                        <h2 class="text-lg font-semibold mb-4 text-gray-800">
                            <span class="md:hidden">内容</span>
                            <span class="hidden md:inline">预览</span>
                        </h2>
                        <div class="prose prose-sm max-w-none h-96 md:h-full overflow-auto">
                            {{code}}
                        </div>
                    </div>
                </div>
            </div>
        </main>
        <Footer />
    </div>
</template>

