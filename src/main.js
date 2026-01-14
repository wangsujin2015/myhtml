import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import App from './App.vue'
import './style.css'

// 配置 dayjs 为中文
dayjs.locale('zh-cn')

const app = createApp(App)

// 使用 Element Plus，配置中文语言
app.use(ElementPlus, {
  locale: zhCn,
})

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
