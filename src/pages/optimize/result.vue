<template>
  <view class="result-page">
    <!-- 头部信息 -->
    <view class="info-bar">
      <text class="info-text">{{ subtitle }}</text>
    </view>

    <!-- 内容区 -->
    <scroll-view class="content-area" scroll-y>
      <view v-if="loading" class="state-box">
        <text class="state-text">加载中...</text>
      </view>

      <template v-else>
        <view class="md-body">
          <rich-text v-if="displayText" :nodes="html"></rich-text>
          <text v-if="!displayText && !loading" class="state-text">暂无内容</text>
        </view>
      </template>

    </scroll-view>

    <!-- 底部操作栏（仅完成/历史模式显示） -->
    <view v-if="displayText" class="action-bar">
      <text class="action-btn" @tap="copyResult">📋 复制</text>
      <text class="action-btn" @tap="goBack">🔄 重新优化</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { marked } from 'marked'
import { getOptimizeDetail } from '@/apis/optimize'

const loading = ref(false)
const displayText = ref('')
const subtitle = ref('')

onLoad((options?: Record<string, string>) => {
  if (options?.id) loadDetail(options.id)
})

async function loadDetail(id: string) {
  loading.value = true
  try {
    const detail = await getOptimizeDetail(id)
    displayText.value = detail.optimizedText || detail.originalText
    subtitle.value = `${detail.resume.title} → ${detail.jobPosition.jobName}`
  } catch { /* 拦截器已 toast */ }
  finally { loading.value = false }
}

const html = computed(() => {
  if (!displayText.value) return ''
  return marked.parse(displayText.value) as string
})

function copyResult() {
  uni.setClipboardData({
    data: displayText.value,
    success: () => uni.showToast({ title: '已复制', icon: 'success' }),
  })
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.result-page {
  background: transparent;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.info-bar {
  padding: 16rpx 32rpx;
  flex-shrink: 0;
}
.info-text {
  font-size: 24rpx;
  color: var(--text-secondary);
}

.content-area {
  position: fixed;
  top: 80rpx;
  bottom: 100rpx;
  left: 0;
  right: 0;
}

.state-box {
  display: flex;
  justify-content: center;
  padding: 200rpx 0;
}
.state-text { font-size: 30rpx; color: var(--text-secondary); }

/* Markdown */
.md-body {
  background: #fff;
  border-radius: 0;
  padding: 32rpx 24rpx;
  box-sizing: border-box;
  width: 100%;
  line-height: 1.8;
  font-size: 28rpx;
  color: var(--text-primary);
  word-break: break-all;
}
.md-body :deep(h1) { font-size: 40rpx; font-weight: 700; margin: 24rpx 0 16rpx; }
.md-body :deep(h2) { font-size: 34rpx; font-weight: 600; margin: 20rpx 0 12rpx; }
.md-body :deep(h3) { font-size: 30rpx; font-weight: 600; margin: 16rpx 0 8rpx; }
.md-body :deep(p) { margin: 8rpx 0; }
.md-body :deep(ul), .md-body :deep(ol) { padding-left: 40rpx; margin: 8rpx 0; }
.md-body :deep(li) { margin: 4rpx 0; }
.md-body :deep(strong) { font-weight: 700; }
.md-body :deep(code) { background: var(--divider); padding: 2rpx 8rpx; border-radius: 4rpx; font-size: 26rpx; }
.md-body :deep(pre) { background: transparent; padding: 20rpx; border-radius: 12rpx; margin: 12rpx 0; white-space: pre-wrap; word-break: break-all; }
.md-body :deep(blockquote) { border-left: 6rpx solid var(--brand-primary); padding-left: 20rpx; color: #666; margin: 12rpx 0; }
.md-body :deep(a) { color: var(--brand-primary); }

/* 操作栏 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 16rpx 32rpx 24rpx;
  gap: 24rpx;
  background: #fff;
  border-top: 1rpx solid var(--divider);
}
.action-btn {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: var(--brand-primary);
  font-weight: 600;
  padding: 16rpx 0;
  border-radius: 12rpx;
  background: var(--brand-light);
}
</style>
