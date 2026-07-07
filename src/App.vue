<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

onLaunch(() => {
  console.log('App Launch')
  const authStore = useAuthStore()
  authStore.init()
  const appStore = useAppStore()
  appStore.init()
  // #ifdef H5
  if (appStore.isDesktop) {
    document.documentElement.classList.add('desktop-mode')
  }

  // QQ/微信内置浏览器：清空 <title> 并持续拦截，让浏览器标题栏不显示文字。
  // uni-app 导航栏完好无损，布局零影响。解决 QQ/微信双导航栏问题。
  const ua = navigator.userAgent
  if (/QQ\//i.test(ua) || /MicroMessenger/i.test(ua)) {
    const stripTitle = () => {
      const t = document.querySelector('title')
      if (t && t.textContent) t.textContent = ''
    }
    stripTitle()
    // 监听 <title> 元素变化（uni-app 切换页面时会更新 document.title）
    new MutationObserver(stripTitle).observe(document.head, { childList: true, subtree: true, characterData: true })
  }
  // #endif
})
</script>

<style lang="scss">
@import '@/uni.scss';
@import '@/static/iconfont/iconfont.css';

/* ── 全局 CSS 变量 ── */
page {
  --brand-primary: #3ddec5;
  --brand-secondary: #007299;
  --brand-gradient: linear-gradient(135deg, #3cd6c4, #3d9dc8);
  --brand-shadow: 0 4rpx 16rpx rgba(61, 222, 197, 0.1);
  --text-primary: #1e293b;
  --text-secondary: #94a3b8;
  --border-light: #e2e8f0;
  --divider: #f1f5f9;
  --bg-light: #f8fafc;
  --brand-light: #e6f9f7;
}

html, body, uni-page, uni-page-body {
  height: 100%;
  margin: 0;
}

page {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  color: var(--text-primary);
  background: linear-gradient(180deg, #f5fdfc 0%, #e8f6fc 100%);
}

/* ── 全局复用样式类 ── */
.brand-card {
  background: var(--brand-gradient) !important;
  border-radius: 24rpx !important;
  box-shadow: var(--brand-shadow) !important;
}

.brand-btn {
  background: var(--brand-gradient) !important;
  border-radius: 48rpx !important;
  box-shadow: var(--brand-shadow) !important;
  color: #fff !important;
}

.brand-fab {
  background: var(--brand-gradient) !important;
  box-shadow: var(--brand-shadow) !important;
}

/* #ifdef H5 */
/*
 * 桌面端模式下，用自定义顶栏替代系统导航栏。
 * uni-app H5 的导航栏渲染为 <uni-page-head> 自定义元素，
 * 这是框架的公开 Web Component 标签，版本稳定。
 */
.desktop-mode uni-page-head {
  display: none !important;
}

/* 桌面端鼠标指针 */
button,
.swipe-btn,
.fab,
.filter-item,
.picker-trigger,
.feature-item,
.asset-card,
.tab-item,
.resume-card,
.job-card,
.interview-card,
.conv-card,
.menu-item,
.batch-toggle,
.send-btn,
.pwd-toggle,
.picker-item,
.picker-option,
.search-clear,
.suggestion-item,
.suggestion-tag,
.history-btn,
.hc-result-btn,
.action-btn,
.avatar,
.fab-icon {
  cursor: pointer;
}
/* #endif */
</style>
