<template>
  <view class="home-page">
    <!-- 第一栏：问候区 -->
    <view class="greeting-card">
      <text class="greeting-text">👋 你好，{{ authStore.userInfo?.username }}</text>
      <text class="greeting-sub">欢迎回来</text>
    </view>

    <!-- 第二栏：资产卡片 -->
    <view class="section-header">
      <text class="section-title">我的资产</text>
    </view>
    <view class="asset-cards">
      <view
        v-for="card in assetCards"
        :key="card.title"
        class="asset-card"
        @tap="navigateTo(card.title)"
      >
        <text class="asset-icon">{{ card.icon }}</text>
        <text class="asset-count">{{ card.count }}</text>
        <text class="asset-label">{{ card.title }}</text>
      </view>
    </view>

    <!-- 第三栏：功能操作 -->
    <view class="section-header">
      <text class="section-title">功能操作</text>
    </view>
    <view class="feature-card">
      <view
        v-for="(item, index) in featureItems"
        :key="item.title"
        class="feature-item"
        :class="{ 'feature-item--last': index === featureItems.length - 1 }"
        @tap="navigateTo(item.title)"
      >
        <text class="feature-icon">{{ item.icon }}</text>
        <text class="feature-text">{{ item.title }}</text>
        <text class="feature-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

/** 资产卡片数据：图标、数量、标题 */
const assetCards = ref([
  { icon: '📄', count: 0, title: '我的简历' },
  { icon: '💼', count: 0, title: '心动岗位' },
  { icon: '📝', count: 0, title: '面试记录' },
])

/** 功能操作列表数据 */
const featureItems = ref([
  { icon: '✨', title: '简历优化' },
  { icon: '🎯', title: '定向刷题' },
  { icon: '💬', title: '模拟面试' },
])

/** 跳转到占位页面，传递标题参数 */
function navigateTo(title: string) {
  uni.navigateTo({
    url: `/pages/placeholder/index?title=${encodeURIComponent(title)}`,
  })
}
</script>

<style scoped>
.home-page {
  background: #F5F7FA;
  padding: 32rpx;
  padding-bottom: 120rpx;
}

/* ===== 第一栏：问候区 ===== */
.greeting-card {
  background: linear-gradient(135deg, #0cb5b2 0%, #0a9e9b 100%);
  border-radius: 20rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 36rpx;
}

.greeting-text {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
}

.greeting-sub {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 8rpx;
}

/* ===== 区域标题 ===== */
.section-header {
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A2E;
}

/* ===== 第二栏：资产卡片 ===== */
.asset-cards {
  display: flex;
  gap: 14rpx;
  margin-bottom: 36rpx;
}

.asset-card {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 10rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.asset-card:active {
  transform: scale(0.96);
}

.asset-icon {
  display: block;
  font-size: 44rpx;
  margin-bottom: 10rpx;
}

.asset-count {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #0cb5b2;
  margin-bottom: 4rpx;
}

.asset-label {
  display: block;
  font-size: 22rpx;
  color: #8E8E93;
}

/* ===== 第三栏：功能操作 ===== */
.feature-card {
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.feature-item--last {
  border-bottom: none;
}

.feature-item:active {
  background: #F8F8F8;
}

.feature-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.feature-text {
  flex: 1;
  font-size: 28rpx;
  font-weight: 500;
  color: #1A1A2E;
}

.feature-arrow {
  font-size: 36rpx;
  color: #C0C0C0;
}
</style>
