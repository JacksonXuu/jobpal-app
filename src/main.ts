import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  // 注册 Pinia 状态管理（必须在 createSSRApp 之后、mount 之前）
  app.use(createPinia())
  return {
    app,
  }
}
