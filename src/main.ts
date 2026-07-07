import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'

export function createApp() {
  const app = createSSRApp(App)
  // 全局注册 uni-icons（uni-rate 等组件内部依赖）
  app.component('uni-icons', UniIcons)
  // 注册 Pinia 状态管理
  app.use(createPinia())
  return {
    app,
  }
}
