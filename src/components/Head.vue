<script setup>

</script>

<template>
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
                    <router-link to="/graph" class="text-gray-600 hover:text-blue-600 transition-colors">图表</router-link>
                </div>

            </div>
        </nav>
    </header>
</template>

