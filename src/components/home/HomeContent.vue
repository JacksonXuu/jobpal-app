<template>
  <view class="home-content">
    <!-- 问候区 -->
    <view class="greeting-card">
      <view class="greeting-text" :class="{ 'greeting-slide-up': showGreetingSlide }">
        <text class="iconfont icon-a-jobpal-solid greeting-icon" />
        <text class="greeting-name">你好，{{ authStore.userInfo?.username }}</text>
      </view>
      <text class="greeting-sub">欢迎回来</text>
    </view>

    <!-- 我的资产 -->
    <view class="section-header"><text class="section-title">我的资产</text></view>
    <view class="asset-cards">
      <view v-for="card in assetCards" :key="card.title" class="asset-card" @tap="navigateTo(card.title)">
        <text v-if="card.icon.startsWith('icon-')" class="iconfont asset-icon" :class="card.icon" />
        <text v-else class="asset-icon">{{ card.icon }}</text>
        <text class="asset-count">{{ card.count }}</text>
        <text class="asset-label">{{ card.title }}</text>
      </view>
    </view>

    <!-- 功能操作 -->
    <view class="section-header"><text class="section-title">功能操作</text></view>
    <view class="feature-card">
      <view
        v-for="(item, index) in featureItems"
        :key="item.title"
        class="feature-item"
        :class="{ 'feature-item--last': index === featureItems.length - 1 }"
        @tap="navigateTo(item.title)"
      >
        <text v-if="item.icon.startsWith('icon-')" class="iconfont feature-icon" :class="item.icon" />
        <text v-else class="feature-icon">{{ item.icon }}</text>
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

const assetCards = ref([
  { icon: 'icon-a-jianli', count: 0, title: '我的简历' },
  { icon: 'icon-a-gangwei', count: 0, title: '心动岗位' },
  { icon: 'icon-lianxi2hebing_jilu', count: 0, title: '面试记录' },
])

const featureItems = ref([
  { icon: 'icon-a-jianliyouhua', title: '简历优化' },
  { icon: 'icon-a-dingxiangshuati', title: '定向刷题' },
  { icon: 'icon-a-monimianshi', title: '模拟面试' },
])

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
  } catch { /* ignore */ }
}

const showGreetingSlide = ref(false)
onLoad(() => fetchStats())
onShow(() => {
  fetchStats()
  const shown = uni.getStorageSync('GREETING_SLIDE_SHOWN')
  if (!shown) {
    showGreetingSlide.value = true
    uni.setStorageSync('GREETING_SLIDE_SHOWN', '1')
    setTimeout(() => { showGreetingSlide.value = false }, 700)
  }
})

function navigateTo(title: string) {
  if (title === '我的简历') { uni.navigateTo({ url: '/pages/resume/list' }); return }
  if (title === '心动岗位') { uni.navigateTo({ url: '/pages/job/list' }); return }
  if (title === '面试记录') { uni.navigateTo({ url: '/pages/interview/list' }); return }
  if (title === '简历优化') { uni.navigateTo({ url: '/pages/optimize/select' }); return }
  uni.navigateTo({ url: `/pages/placeholder/index?title=${encodeURIComponent(title)}` })
}
</script>

<style scoped>
.home-content {
  padding: 24rpx;
  padding-bottom: 120rpx;
}

/* 问候区 */
.greeting-card {
  background: linear-gradient(135deg, #3ddec5, #6ae8d8);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 28rpx;
  box-shadow: rgba(61, 222, 197, 0.3) 0px 8px 24px;
}
.greeting-text {
  display: flex;
  align-items: center;
  font-size: 38rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1rpx;
  overflow: hidden;
}
.greeting-icon {
  font-size: 48rpx;
  margin-right: 10rpx;
  font-weight: 400;
  flex-shrink: 0;
}
.greeting-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.greeting-sub {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 8rpx;
}
.greeting-slide-up {
  animation: slideUp 0.6s ease-out;
}
@keyframes slideUp {
  from { transform: translateY(60rpx); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 区域标题 */
.section-header { margin-bottom: 16rpx; }
.section-title { font-size: 28rpx; font-weight: 600; color: var(--text-primary); }

/* 资产卡片 */
.asset-cards { display: flex; gap: 16rpx; margin-bottom: 32rpx; }
.asset-card {
  flex: 1;
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx 12rpx;
  text-align: center;
  box-shadow: 0 2rpx 12rpx rgba(8, 201, 176, 0.08);
  transition: transform 0.15s;
}
.asset-card:active { transform: scale(0.96); }
.asset-icon { display: block; font-size: 36rpx; margin-bottom: 8rpx; color: #94a3b8; }
.asset-count { display: block; font-size: 44rpx; font-weight: 700; color: var(--brand-primary); margin-bottom: 4rpx; }
.asset-label { display: block; font-size: 22rpx; color: var(--text-secondary); }

/* 功能操作 */
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
.feature-item--last { border-bottom: none; }
.feature-item:active { background: #f0fcfb; }
.feature-icon { font-size: 34rpx; margin-right: 20rpx; color: var(--brand-primary); }
.feature-text { flex: 1; font-size: 28rpx; font-weight: 500; color: var(--text-primary); }
.feature-arrow { font-size: 32rpx; color: var(--text-secondary); }
</style>
