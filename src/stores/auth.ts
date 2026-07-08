import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTrackingStore } from '@/stores/tracking'

interface UserInfo {
  id: string
  username: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)

  const isLogin = computed(() => !!token.value)

  /** 初始化：从本地存储恢复登录态 */
  function init() {
    token.value = uni.getStorageSync('token') || ''
    const cached = uni.getStorageSync('userInfo')
    if (cached) {
      try {
        userInfo.value = JSON.parse(cached)
      } catch {
        // 存储数据损坏，丢弃并重置
        userInfo.value = null
      }
    }
  }

  /** 设置登录态 */
  function setLogin(t: string, info: UserInfo) {
    token.value = t
    userInfo.value = info
    uni.setStorageSync('token', t)
    uni.setStorageSync('userInfo', JSON.stringify(info))
    // 登录成功后启用行为追踪
    useTrackingStore().init()
  }

  /** 退出登录 */
  function logout() {
    // 登出前停用追踪（内部自动 flush 缓冲区）
    useTrackingStore().destroy()
    token.value = ''
    userInfo.value = null
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
  }

  return { token, userInfo, isLogin, init, setLogin, logout }
})
