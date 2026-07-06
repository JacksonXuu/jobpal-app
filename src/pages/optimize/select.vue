<template>
  <view class="select-page">
    <!-- 简历列表 -->
    <view class="section">
      <text class="section-title">选择简历</text>
      <view v-if="resumes.length === 0" class="empty-tip">
        <text>暂无简历，请先创建</text>
      </view>
      <view
        v-for="r in resumes"
        :key="r.id"
        class="select-card"
        :class="{ selected: selectedResumeId === r.id }"
        @tap="selectedResumeId = r.id"
      >
        <text class="card-icon">📄</text>
        <text class="card-text">{{ r.title }}</text>
        <text v-if="selectedResumeId === r.id" class="check-mark">✓</text>
      </view>
    </view>

    <!-- 岗位列表 -->
    <view class="section">
      <text class="section-title">选择心动岗位</text>
      <view v-if="jobs.length === 0" class="empty-tip">
        <text>暂无岗位，请先添加</text>
      </view>
      <view
        v-for="j in jobs"
        :key="j.id"
        class="select-card"
        :class="{ selected: selectedJobId === j.id }"
        @tap="selectedJobId = j.id"
      >
        <text class="card-icon">💼</text>
        <view class="card-info">
          <text class="card-text">{{ j.jobName }}</text>
          <text class="card-sub">{{ j.companyName }} · {{ j.salary }}k</text>
        </view>
        <text v-if="selectedJobId === j.id" class="check-mark">✓</text>
      </view>
    </view>

    <!-- 立即优化 -->
    <button
      class="optimize-btn"
      :class="{ disabled: !canOptimize }"
      :disabled="!canOptimize"
      @tap="startOptimize"
    >
      ✨ 立即优化
    </button>

    <!-- 历史记录 -->
    <view class="section">
      <text class="section-title">优化历史</text>
      <view v-if="history.length === 0" class="empty-tip">
        <text>暂无优化记录</text>
      </view>
      <view
        v-for="h in history"
        :key="h.id"
        class="history-item"
        @tap="goResult(h.id)"
      >
        <text class="history-title">{{ h.resume.title }} → {{ h.jobPosition.jobName }}</text>
        <text class="history-date">{{ formatDate(h.createdAt) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getResumeList, type Resume } from '@/apis/resume'
import { getJobList, type JobPosition } from '@/apis/job'
import { getOptimizeHistory, type OptimizeHistoryItem } from '@/apis/optimize'

// ── 选择 ──
const selectedResumeId = ref('')
const selectedJobId = ref('')
const canOptimize = computed(() => selectedResumeId.value && selectedJobId.value)

// ── 列表 ──
const resumes = ref<Resume[]>([])
const jobs = ref<JobPosition[]>([])
const history = ref<OptimizeHistoryItem[]>([])

async function fetchData() {
  try {
    const [r, j, h] = await Promise.all([
      getResumeList(),
      getJobList(),
      getOptimizeHistory(),
    ])
    resumes.value = r.list
    jobs.value = j.list
    history.value = h.list
  } catch { /* 拦截器已 toast */ }
}

onLoad(() => fetchData())
onShow(() => fetchData())

function startOptimize() {
  if (!canOptimize.value) return
  uni.navigateTo({
    url: `/pages/optimize/result?resumeId=${selectedResumeId.value}&jobId=${selectedJobId.value}`,
  })
}

function goResult(id: string) {
  uni.navigateTo({ url: `/pages/optimize/result?id=${id}` })
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${m}-${day}`
}
</script>

<style scoped>
.select-page {
  background: #F5F7FA;
  min-height: 100vh;
  padding: 24rpx 24rpx 80rpx;
}

.section { margin-bottom: 32rpx; }
.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1A1A2E;
  margin-bottom: 16rpx;
  padding-left: 4rpx;
}

.empty-tip {
  padding: 32rpx;
  text-align: center;
  font-size: 26rpx;
  color: #C0C0C0;
}

/* 选择卡片 */
.select-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 12rpx;
  border: 3rpx solid transparent;
  transition: border-color 0.2s;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.select-card.selected {
  border-color: #0cb5b2;
  background: #f8fffe;
}
.card-icon { font-size: 36rpx; margin-right: 16rpx; flex-shrink: 0; }
.card-info { flex: 1; }
.card-text { font-size: 28rpx; color: #1A1A2E; font-weight: 500; }
.card-sub { font-size: 22rpx; color: #8E8E93; margin-top: 4rpx; display: block; }
.check-mark {
  font-size: 32rpx;
  color: #0cb5b2;
  font-weight: 700;
  flex-shrink: 0;
  margin-left: 8rpx;
}

/* 按钮 */
.optimize-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: #0cb5b2;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 48rpx;
  border: none;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(12,181,178,0.3);
}
.optimize-btn::after { border: none; }
.optimize-btn.disabled {
  background: #C0C0C0;
  box-shadow: none;
  opacity: 0.6;
}

/* 历史 */
.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 10rpx;
}
.history-title { font-size: 26rpx; color: #1A1A2E; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.history-date { font-size: 22rpx; color: #C0C0C0; margin-left: 16rpx; flex-shrink: 0; }
</style>
