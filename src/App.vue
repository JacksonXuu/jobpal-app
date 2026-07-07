<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'

onLaunch(() => {
  console.log('App Launch')
  const authStore = useAuthStore()
  authStore.init()
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
</style>
