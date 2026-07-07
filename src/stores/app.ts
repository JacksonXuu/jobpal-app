import { ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * 全局应用状态 Store
 * 管理设备类型、桌面/移动端适配等全局配置
 */
export const useAppStore = defineStore('app', () => {
  /** 是否为桌面端浏览器（基于 UA 检测，非屏幕宽度） */
  const isDesktop = ref(false)

  /** 初始化设备检测（仅 H5 端生效） */
  function init() {
    // #ifdef H5
    isDesktop.value = !/Mobile|Android|iPhone|iPad/i.test(navigator.userAgent)
    // #endif
  }

  return { isDesktop, init }
})
