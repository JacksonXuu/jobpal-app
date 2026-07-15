<template>
  <!-- 桌面端壳 -->
  <DesktopLayout v-if="appStore.isDesktop" active="job" @navigate="onSidebarNav">
    <view class="detail-page detail-desktop">
      <view class="dt-back" @click="goBack()">← 返回</view>
      <view v-if="loading" class="state-box"><text class="state-text">加载中...</text></view>
      <view v-else-if="error" class="state-box"><text class="state-text">加载失败，请重试</text></view>
      <template v-else-if="job">
        <view class="info-card">
          <text class="info-jobname">{{ job.jobName }}</text>
          <text class="info-company">{{ job.companyName }}</text>
          <view class="info-meta">
            <text class="meta-item">{{ job.salary }}k</text>
            <view class="meta-item"><UniRate :value="job.rating" :max="5" readonly :size="14" /></view>
          </view>
          <view class="info-meta">
            <text class="tag">来源：{{ job.sourcePlatform }}</text>
            <text class="tag status-tag">状态：{{ job.status }}</text>
          </view>
          <text class="info-date">更新于 {{ formatDateTime(job.updatedAt) }}</text>
        </view>
        <view v-if="job.requirements" class="section-card">
          <text class="section-title">岗位要求</text>
          <text class="section-text">{{ job.requirements }}</text>
        </view>
        <view v-if="job.responsibilities" class="section-card">
          <text class="section-title">岗位职责</text>
          <text class="section-text">{{ job.responsibilities }}</text>
        </view>
        <view v-if="job.attractiveness" class="section-card">
          <text class="section-title">心动原因</text>
          <text class="section-text">{{ job.attractiveness }}</text>
        </view>
        <view v-if="!job.requirements && !job.responsibilities && !job.attractiveness" class="state-box">
          <text class="state-desc">暂无更多信息</text>
        </view>
      </template>
    </view>
  </DesktopLayout>

  <!-- 手机端 -->
  <view v-else class="detail-page">
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
          <text class="meta-item">{{ job.salary }}k</text>
          <view class="meta-item"><UniRate :value="job.rating" :max="5" readonly :size="14" /></view>
        </view>
        <view class="info-meta">
          <text class="tag">来源：{{ job.sourcePlatform }}</text>
          <text class="tag status-tag">状态：{{ job.status }}</text>
        </view>
        <text class="info-date">更新于 {{ formatDateTime(job.updatedAt) }}</text>
      </view>

      <!-- 岗位要求 -->
      <view v-if="job.requirements" class="section-card">
        <text class="section-title">岗位要求</text>
        <text class="section-text">{{ job.requirements }}</text>
      </view>

      <!-- 岗位职责 -->
      <view v-if="job.responsibilities" class="section-card">
        <text class="section-title">岗位职责</text>
        <text class="section-text">{{ job.responsibilities }}</text>
      </view>

      <!-- 心动原因 -->
      <view v-if="job.attractiveness" class="section-card">
        <text class="section-title">心动原因</text>
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
import { useAppStore } from '@/stores/app'
import DesktopLayout from '@/components/DesktopLayout.vue'
import UniRate from '@dcloudio/uni-ui/lib/uni-rate/uni-rate.vue'
import { getJobDetail, type JobPosition } from '@/apis/job'
import { useTracking } from '@/composables/useTracking'

const appStore = useAppStore()

function onSidebarNav(page: string) {
  if (page === 'ask') { uni.switchTab({ url: '/pages/ask/index' }); return }
  if (page === 'home') { uni.switchTab({ url: '/pages/home' }); return }
}

function goBack() {
  const pages = getCurrentPages()
  if (pages.length <= 1) {
    uni.redirectTo({ url: '/pages/job/list' })
  } else {
    uni.navigateBack()
  }
}

useTracking({ module: 'job' })

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
  background: transparent;
  min-height: 100vh;
  padding: 24rpx 24rpx 60rpx;
}
.detail-desktop {
  padding: 24rpx 32rpx;
  min-height: auto;
}
.dt-back {
  font-size: 14px;
  color: var(--brand-primary);
  cursor: pointer;
  margin-bottom: 16rpx;
}

/* ── 状态提示 ── */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;
}
.state-text { font-size: 30rpx; color: var(--text-secondary); }
.state-desc { font-size: 26rpx; color: var(--text-secondary); margin-top: 12rpx; }

/* ── 顶部信息卡片 ── */
.info-card {
  background: linear-gradient(135deg, #3ddec5, #6ae8d8);
  border-radius: 24rpx;
  padding: 36rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: var(--brand-shadow);
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
  color: var(--text-primary);
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
