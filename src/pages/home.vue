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
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'
import { request } from '@/utils/request'

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

/** 首页统计数据 */
interface HomeStats {
  resumeCount: number
  jobCount: number
  interviewCount: number
}

async function fetchStats() {
  try {
    const res = await request<HomeStats>({ url: '/v1/home/stats' })
    assetCards.value[0].count = res.data.resumeCount
    assetCards.value[1].count = res.data.jobCount
    assetCards.value[2].count = res.data.interviewCount
  } catch { /* 拦截器已 toast */ }
}

onLoad(() => fetchStats())
onShow(() => fetchStats())

/** 跳转到目标页面 */
function navigateTo(title: string) {
  if (title === '我的简历') {
    uni.navigateTo({ url: '/pages/resume/list' })
    return
  }
  if (title === '心动岗位') {
    uni.navigateTo({ url: '/pages/job/list' })
    return
  }
  if (title === '面试记录') {
    uni.navigateTo({ url: '/pages/interview/list' })
    return
  }
  if (title === '简历优化') {
    uni.navigateTo({ url: '/pages/optimize/select' })
    return
  }
  uni.navigateTo({
    url: `/pages/placeholder/index?title=${encodeURIComponent(title)}`,
  })
}
</script>

<style scoped>
.home-page {
  background: transparent;
  padding: 24rpx;
  padding-bottom: 120rpx;
}

/* ===== 问候区 ===== */
.greeting-card {
  background: var(--brand-gradient);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 28rpx;
  box-shadow: var(--brand-shadow);
}

.greeting-text {
  display: block;
  font-size: 38rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1rpx;
}

.greeting-sub {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 8rpx;
}

.greeting-text {
  display: block;
  font-size: 38rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1rpx;
}

.greeting-sub {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8rpx;
}

/* ===== 区域标题 ===== */
.section-header {
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-primary);
}

/* ===== 资产卡片 ===== */
.asset-cards {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.asset-card {
  flex: 1;
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx 12rpx;
  text-align: center;
  box-shadow: 0 2rpx 12rpx rgba(8, 201, 176, 0.08);
  transition: transform 0.15s;
}

.asset-card:active {
  transform: scale(0.96);
}

.asset-icon {
  display: block;
  font-size: 36rpx;
  margin-bottom: 8rpx;
}

.asset-count {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: #22c9b3;
  margin-bottom: 4rpx;
}

.asset-label {
  display: block;
  font-size: 22rpx;
  color: var(--text-secondary);
}

/* ===== 功能操作 ===== */
.feature-card {
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(8, 201, 176, 0.08);
  overflow: hidden;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 28rpx 28rpx;
  border-bottom: 1rpx solid var(--divider);
}

.feature-item--last {
  border-bottom: none;
}

.feature-item:active {
  background: #f0fcfb;
}

.feature-icon {
  font-size: 34rpx;
  margin-right: 20rpx;
}

.feature-text {
  flex: 1;
  font-size: 28rpx;
  font-weight: 500;
  color: var(--text-primary);
}

.feature-arrow {
  font-size: 32rpx;
  color: var(--text-secondary);
}
</style>
