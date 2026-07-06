<template>
  <view class="detail-page">
    <!-- Loading -->
    <view v-if="loading" class="state-box">
      <text class="state-text">加载中...</text>
    </view>

    <!-- Error -->
    <view v-else-if="error" class="state-box">
      <text class="state-text">加载失败，请重试</text>
    </view>

    <!-- 内容 -->
    <template v-else-if="job">
      <!-- 顶部信息卡片 -->
      <view class="info-card">
        <text class="info-jobname">{{ job.jobName }}</text>
        <text class="info-company">{{ job.companyName }}</text>
        <view class="info-meta">
          <text class="meta-item">💰 {{ job.salary }}k</text>
          <text class="meta-item">
            <text v-for="n in 5" :key="n" class="star">{{ n <= job.rating ? '⭐' : '☆' }}</text>
          </text>
        </view>
        <view class="info-meta">
          <text class="tag">来源：{{ job.sourcePlatform }}</text>
          <text class="tag status-tag">状态：{{ job.status }}</text>
        </view>
        <text class="info-date">更新于 {{ formatDateTime(job.updatedAt) }}</text>
      </view>

      <!-- 岗位要求 -->
      <view v-if="job.requirements" class="section-card">
        <text class="section-title">📋 岗位要求</text>
        <text class="section-text">{{ job.requirements }}</text>
      </view>

      <!-- 岗位职责 -->
      <view v-if="job.responsibilities" class="section-card">
        <text class="section-title">📝 岗位职责</text>
        <text class="section-text">{{ job.responsibilities }}</text>
      </view>

      <!-- 心动原因 -->
      <view v-if="job.attractiveness" class="section-card">
        <text class="section-title">❤️ 心动原因</text>
        <text class="section-text">{{ job.attractiveness }}</text>
      </view>

      <!-- 无长文本时的占位 -->
      <view v-if="!job.requirements && !job.responsibilities && !job.attractiveness" class="state-box">
        <text class="state-desc">暂无更多信息</text>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getJobDetail, type JobPosition } from '@/apis/job'

const job = ref<JobPosition | null>(null)
const loading = ref(true)
const error = ref(false)

onLoad((options?: Record<string, string>) => {
  if (options?.id) {
    loadDetail(options.id)
  } else {
    error.value = true
    loading.value = false
  }
})

async function loadDetail(id: string) {
  loading.value = true
  error.value = false
  try {
    job.value = await getJobDetail(id)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

/** 格式化日期时间 */
function formatDateTime(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}
</script>

<style scoped>
.detail-page {
  background: #F5F7FA;
  min-height: 100vh;
  padding: 24rpx 24rpx 60rpx;
}

/* ── 状态提示 ── */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;
}
.state-text { font-size: 30rpx; color: #8E8E93; }
.state-desc { font-size: 26rpx; color: #C0C0C0; margin-top: 12rpx; }

/* ── 顶部信息卡片 ── */
.info-card {
  background: linear-gradient(135deg, #0cb5b2 0%, #0a9e9b 100%);
  border-radius: 20rpx;
  padding: 36rpx 32rpx;
  margin-bottom: 24rpx;
}
.info-jobname {
  display: block;
  font-size: 38rpx;
  font-weight: 700;
  color: #fff;
}
.info-company {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 6rpx;
  margin-bottom: 16rpx;
}
.info-meta {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 10rpx;
}
.meta-item {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
}
.star { font-size: 20rpx; }
.tag {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.2);
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
}
.info-date {
  display: block;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 12rpx;
}

/* ── 内容区块卡片 ── */
.section-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}
.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1A1A2E;
  margin-bottom: 16rpx;
}
.section-text {
  display: block;
  font-size: 26rpx;
  color: #4A4A5A;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
