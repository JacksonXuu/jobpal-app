<template>
  <view class="settings-page">
    <view class="menu-list">
      <view class="menu-item" @tap="handleDeleteAccount">
        <text class="menu-text danger">注销账号</text>
        <text class="menu-desc">永久删除账号及所有数据</text>
        <text class="arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { deleteAccount } from '@/apis/auth'
import { useTracking } from '@/composables/useTracking'

const { trackAction } = useTracking({ module: 'settings' })

const authStore = useAuthStore()

async function handleDeleteAccount() {
  const res = await uni.showModal({
    title: '注销账号',
    content: '注销后所有数据将被永久删除且不可恢复。\n\n确定要注销账号吗？',
    confirmText: '确认注销',
    confirmColor: '#3ddec5',
  })
  if (!res.confirm) return

  try {
    trackAction('delete_account')
    await deleteAccount()
    authStore.logout()
    uni.showToast({ title: '账号已注销', icon: 'success' })
    setTimeout(() => uni.reLaunch({ url: '/pages/login/login' }), 1000)
  } catch { /* 拦截器已 toast */ }
}
</script>

<style scoped>
.settings-page {
  background: transparent;
  min-height: 100vh;
  padding: 24rpx;
}

.menu-list {
  background: #fff;
  border-radius: 16rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
}
.menu-text {
  font-size: 30rpx;
  color: var(--text-primary);
}
.menu-text.danger {
  color: #FF4757;
}
.menu-desc {
  flex: 1;
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-left: 20rpx;
}
.arrow {
  font-size: 36rpx;
  color: var(--text-secondary);
}
</style>
