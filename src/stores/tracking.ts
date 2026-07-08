/**
 * 追踪状态管理 Store
 *
 * 封装 tracking 引擎的生命周期：
 * - 登录时 init()：启用追踪 + 生成 session
 * - 登出时 destroy()：flush 缓冲 + 停用追踪
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enable, disable, getSessionId, getBufferLength, flush } from '@/utils/tracking'

export const useTrackingStore = defineStore('tracking', () => {
  const sessionId = ref('')
  const bufferSize = ref(0)

  let pollTimer: ReturnType<typeof setInterval> | null = null

  /** 初始化追踪（登录成功后调用） */
  function init() {
    enable()
    sessionId.value = getSessionId()
    // 定时同步 buffer 大小到响应式状态（调试/监控用）
    pollTimer = setInterval(() => {
      bufferSize.value = getBufferLength()
    }, 5000)
  }

  /** 销毁追踪（登出时调用） */
  function destroy() {
    // 先 flush 确保数据不丢，再停用
    flush()
    disable()
    sessionId.value = ''
    bufferSize.value = 0
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  return { sessionId, bufferSize, init, destroy }
})
