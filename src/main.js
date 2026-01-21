import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import pollinationsAPI from './utils/pollinationsAPI.js'

// 配置 Pollinations AI API Key
// 从 https://enter.pollinations.ai 获取
const API_KEY = import.meta.env.VITE_POLLINATIONS_API_KEY || localStorage.getItem('pollinations_api_key')
if (API_KEY) {
  pollinationsAPI.setAPIKey(API_KEY)
}

const app = createApp(App)

app.use(router)

app.mount('#app')