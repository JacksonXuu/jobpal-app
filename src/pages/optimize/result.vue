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
        <!-- Markdown 渲染（流式时显示 streamingText，完成后显示 displayText） -->
        <view class="md-body">
          <rich-text v-if="isStreaming || displayText" :nodes="streamingHtml"></rich-text>
          <text v-if="isStreaming" class="stream-cursor">|</text>
          <text v-if="!isStreaming && !displayText && !loading" class="state-text">暂无内容</text>
        </view>
      </template>

      <view style="height: 40rpx" />
    </scroll-view>

    <!-- 底部操作栏（仅完成/历史模式显示） -->
    <view v-if="!isStreaming && displayText" class="action-bar">
      <text class="action-btn" @tap="copyResult">📋 复制</text>
      <text class="action-btn" @tap="goBack">🔄 重新优化</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { marked } from 'marked'
import { useSSE } from '@/composables/useSSE'
import { getOptimizeDetail } from '@/apis/optimize'

const { streamingText, isStreaming, connect } = useSSE()

const loading = ref(false)
const displayText = ref('')
const subtitle = ref('')
const isHistoryMode = ref(false)

onLoad((options?: Record<string, string>) => {
  if (options?.id) {
    // 历史模式：查看详情
    isHistoryMode.value = true
    loadDetail(options.id)
  } else if (options?.resumeId && options?.jobId) {
    // 优化模式：SSE 流式
    subtitle.value = '正在优化...'
    startSSE(options.resumeId, options.jobId)
  }
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

async function startSSE(resumeId: string, jobId: string) {
  await connect({
    url: '/v1/optimize',
    body: { resumeId, jobPositionId: jobId },
    onStart() {
      displayText.value = ''
    },
    onComplete() {
      displayText.value = streamingText.value
      subtitle.value = '优化完成'
    },
    onError() {
      if (streamingText.value) {
        displayText.value = streamingText.value
      }
      subtitle.value = '优化中断'
    },
  })
  // SSE 结束后同步 displayText
  if (!displayText.value) {
    displayText.value = streamingText.value
  }
}

/** 流式时渲染 streamingText，完成后渲染 displayText */
const streamingHtml = computed(() => {
  const text = isStreaming.value ? streamingText.value : displayText.value
  if (!text) return ''
  return marked.parse(text) as string
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
  background: #F5F7FA;
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
  color: #8E8E93;
}

.content-area {
  position: fixed;
  top: 80rpx;
  bottom: 100rpx;
  left: 0;
  right: 0;
  padding: 0 24rpx;
}

.state-box {
  display: flex;
  justify-content: center;
  padding: 200rpx 0;
}
.state-text { font-size: 30rpx; color: #8E8E93; }

/* Markdown */
.md-body {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.04);
  line-height: 1.8;
  font-size: 28rpx;
  color: #1A1A2E;
  word-break: break-all;
}
.md-body :deep(h1) { font-size: 40rpx; font-weight: 700; margin: 24rpx 0 16rpx; }
.md-body :deep(h2) { font-size: 34rpx; font-weight: 600; margin: 20rpx 0 12rpx; }
.md-body :deep(h3) { font-size: 30rpx; font-weight: 600; margin: 16rpx 0 8rpx; }
.md-body :deep(p) { margin: 8rpx 0; }
.md-body :deep(ul), .md-body :deep(ol) { padding-left: 40rpx; margin: 8rpx 0; }
.md-body :deep(li) { margin: 4rpx 0; }
.md-body :deep(strong) { font-weight: 700; }
.md-body :deep(code) { background: #F0F0F0; padding: 2rpx 8rpx; border-radius: 4rpx; font-size: 26rpx; }
.md-body :deep(pre) { background: #F5F7FA; padding: 20rpx; border-radius: 12rpx; overflow-x: auto; margin: 12rpx 0; }
.md-body :deep(blockquote) { border-left: 6rpx solid #0cb5b2; padding-left: 20rpx; color: #666; margin: 12rpx 0; }
.md-body :deep(a) { color: #0cb5b2; }

.stream-cursor {
  font-size: 28rpx;
  color: #0cb5b2;
  animation: blink 0.8s infinite;
}
@keyframes blink { 0%,100% { opacity: 0.2; } 50% { opacity: 1; } }

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
  border-top: 1rpx solid #F0F0F0;
}
.action-btn {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #0cb5b2;
  font-weight: 600;
  padding: 16rpx 0;
  border-radius: 12rpx;
  background: #ecfefe;
}
</style>
