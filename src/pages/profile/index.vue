<template>
  <view class="profile-page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="avatar">👤</view>
      <text class="username">{{ authStore.userInfo?.username }}</text>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-list">
      <view class="menu-item" @tap="showAbout">
        <text>关于开发者</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @tap="goSettings">
        <text>设置</text>
        <text class="arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

function showAbout() {
  uni.navigateTo({ url: '/pages/about/index' })
}

function goSettings() {
  uni.navigateTo({ url: '/pages/settings/index' })
}
</script>

<style scoped>
.profile-page {
  background: #F5F7FA;
  padding: 32rpx;
  padding-bottom: 100rpx;
}

.user-card {
  display: flex;
  align-items: center;
  background: #0cb5b2;
  border-radius: 20rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 32rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 24rpx;
}

.username {
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
}

.menu-list {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 48rpx;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  font-size: 30rpx;
  color: #1A1A2E;
  border-bottom: 1rpx solid #F0F0F0;
}

.menu-item:last-child {
  border-bottom: none;
}

.arrow {
  color: #C0C0C0;
  font-size: 36rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #fff;
  color: #FF4757;
  font-size: 30rpx;
  border-radius: 16rpx;
  border: none;
}

.logout-btn::after {
  border: none;
}
</style>
