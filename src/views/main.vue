<script setup>
import { ref } from 'vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- 头部 -->
    <header class="bg-white shadow-md">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center space-x-2">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
            <h1 class="text-2xl font-bold text-gray-800">TodoList</h1>
          </div>

          <!-- 导航菜单 -->
          <div class="hidden md:flex items-center space-x-6">
            <router-link to="/" class="text-gray-600 hover:text-blue-600 transition-colors duration-200">编辑器</router-link>
            <router-link to="/graph" class="text-gray-600 hover:text-blue-600 transition-colors duration-200">图表</router-link>
            <router-link to="/test" class="text-gray-600 hover:text-blue-600 transition-colors duration-200">测试</router-link>
          </div>

          <!-- 移动端菜单按钮 -->
          <button class="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </nav>
    </header>

    <!-- 主要内容区域 -->
    <main class="flex-grow container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <section class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-800 mb-4">欢迎使用 TodoList</h2>
          <p class="text-lg text-gray-600 mb-8">基于 Markdown 语法的任务管理工具</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link to="/" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              开始使用
            </router-link>
            <router-link to="/graph" class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              查看图表
            </router-link>
          </div>
        </section>

        <section class="grid md:grid-cols-3 gap-8">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Markdown 编辑</h3>
            <p class="text-gray-600">使用熟悉的 Markdown 语法创建和管理任务</p>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">数据可视化</h3>
            <p class="text-gray-600">通过图表直观查看任务依赖关系和时间安排</p>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">智能助手</h3>
            <p class="text-gray-600">AI 助手帮助您优化任务规划和时间管理</p>
          </div>
        </section>
      </div>
    </main>

    <!-- 底部 -->
    <footer class="bg-gray-800 text-white mt-auto">
      <div class="container mx-auto px-4 py-8">
        <div class="grid md:grid-cols-4 gap-8">
          <!-- 关于 -->
          <div>
            <h3 class="text-lg font-semibold mb-4">关于 TodoList</h3>
            <p class="text-gray-400 text-sm">基于 Vue 3 和 Markdown 语法的现代化任务管理工具，帮助您更好地组织和跟踪任务。</p>
          </div>

          <!-- 功能 -->
          <div>
            <h3 class="text-lg font-semibold mb-4">主要功能</h3>
            <ul class="text-gray-400 text-sm space-y-2">
              <li>Markdown 语法支持</li>
              <li>任务依赖关系</li>
              <li>数据可视化</li>
              <li>本地存储</li>
            </ul>
          </div>

          <!-- 技术栈 -->
          <div>
            <h3 class="text-lg font-semibold mb-4">技术栈</h3>
            <ul class="text-gray-400 text-sm space-y-2">
              <li>Vue 3</li>
              <li>Vite</li>
              <li>Element Plus</li>
              <li>ECharts</li>
            </ul>
          </div>

          <!-- 联系方式 -->
          <div>
            <h3 class="text-lg font-semibold mb-4">联系我们</h3>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-700 mt-8 pt-8 text-center">
          <p class="text-gray-400 text-sm">© 2024 TodoList. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* 自定义动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

section > div {
  animation: fadeIn 0.6s ease-out;
}

section > div:nth-child(2) { animation-delay: 0.1s; }
section > div:nth-child(3) { animation-delay: 0.2s; }
section > div:nth-child(4) { animation-delay: 0.3s; }
</style>