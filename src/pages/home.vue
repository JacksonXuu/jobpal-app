<template>
  <view class="home-page">
    <view class="header">
      <text class="greeting">👋 你好，{{ authStore.userInfo?.username }}</text>
      <text class="welcome">欢迎回来</text>
    </view>

    <view class="placeholder">
      <text class="placeholder-icon">🚀</text>
      <text class="placeholder-text">更多功能即将上线</text>
      <text class="placeholder-desc">简历管理 · 心动岗位 · AI优化</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<style scoped>
.home-page {
  background: #F5F7FA;
  padding: 32rpx;
  padding-bottom: 100rpx;
}

.header {
  background: #0cb5b2;
  border-radius: 20rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 48rpx;
}

.greeting {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
}

.welcome {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.placeholder-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.placeholder-text {
  font-size: 30rpx;
  color: #1A1A2E;
  font-weight: 500;
}

.placeholder-desc {
  font-size: 26rpx;
  color: #8E8E93;
  margin-top: 12rpx;
}
</style>
