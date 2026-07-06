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

const authStore = useAuthStore()

async function handleDeleteAccount() {
  const res = await uni.showModal({
    title: '注销账号',
    content: '注销后所有数据将被永久删除且不可恢复。\n\n确定要注销账号吗？',
    confirmText: '确认注销',
    confirmColor: '#FF4757',
  })
  if (!res.confirm) return

  try {
    await deleteAccount()
    authStore.logout()
    uni.showToast({ title: '账号已注销', icon: 'success' })
    setTimeout(() => uni.reLaunch({ url: '/pages/login/login' }), 1000)
  } catch { /* 拦截器已 toast */ }
}
</script>

<style scoped>
.settings-page {
  background: #F5F7FA;
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
  color: #1A1A2E;
}
.menu-text.danger {
  color: #FF4757;
}
.menu-desc {
  flex: 1;
  font-size: 24rpx;
  color: #C0C0C0;
  margin-left: 20rpx;
}
.arrow {
  font-size: 36rpx;
  color: #C0C0C0;
}
</style>
