import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 引入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 开发环境下引入Vue DevTools
if (process.env.NODE_ENV === 'development') {
  import('@vue/devtools').then(devtools => {
    devtools.connect()
  }).catch(err => {
    console.log('Vue DevTools not available', err)
  })
}

const app = createApp(App)

app.use(ElementPlus)
app.use(router)

app.mount('#app')