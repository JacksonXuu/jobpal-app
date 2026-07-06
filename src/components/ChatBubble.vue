<template>
  <view class="chat-bubble" :class="role === 'user' ? 'bubble-user-wrap' : 'bubble-ai-wrap'">
    <!-- AI 气泡 -->
    <view v-if="role === 'assistant'" class="bubble-ai">
      <rich-text v-if="content || isStreaming" :nodes="html"></rich-text>
      <view v-else class="typing-dots">
        <text class="dot">●</text>
        <text class="dot">●</text>
        <text class="dot">●</text>
      </view>
      <text v-if="isStreaming && content" class="cursor">|</text>
    </view>

    <!-- 用户气泡 -->
    <view v-else class="bubble-user">
      <text>{{ content }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps<{
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}>()

const html = computed(() => {
  if (!props.content) return ''
  return marked.parse(props.content) as string
})
</script>

<style scoped>
.chat-bubble {
  margin-bottom: 32rpx;
  padding: 0 24rpx;
}

/* AI 气泡 */
.bubble-ai-wrap {
  display: flex;
  justify-content: flex-start;
}
.bubble-ai {
  max-width: 85%;
  background: #fff;
  border-radius: 0 16rpx 16rpx 16rpx;
  padding: 20rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
  line-height: 1.7;
  font-size: 28rpx;
  color: #1A1A2E;
  word-break: break-all;
}
.bubble-ai :deep(h1), .bubble-ai :deep(h2), .bubble-ai :deep(h3) {
  margin: 12rpx 0 8rpx;
  font-weight: 600;
}
.bubble-ai :deep(p) { margin: 6rpx 0; }
.bubble-ai :deep(ul), .bubble-ai :deep(ol) { padding-left: 32rpx; margin: 6rpx 0; }
.bubble-ai :deep(strong) { font-weight: 700; }
.bubble-ai :deep(code) { background: #F0F0F0; padding: 2rpx 8rpx; border-radius: 4rpx; font-size: 24rpx; }
.bubble-ai :deep(pre) { background: #F5F7FA; padding: 16rpx; border-radius: 8rpx; overflow-x: auto; margin: 8rpx 0; }

/* 用户气泡 */
.bubble-user-wrap {
  display: flex;
  justify-content: flex-end;
}
.bubble-user {
  max-width: 80%;
  background: #0cb5b2;
  color: #fff;
  border-radius: 16rpx 0 16rpx 16rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  line-height: 1.6;
  word-break: break-all;
}

/* 打字动画 */
.typing-dots {
  display: flex;
  gap: 8rpx;
  padding: 8rpx 0;
}
.dot {
  font-size: 16rpx;
  color: #C0C0C0;
  animation: blink 1.4s infinite;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%,100% { opacity: 0.2; } 50% { opacity: 1; } }

.cursor {
  font-size: 28rpx;
  color: #0cb5b2;
  animation: blink 0.8s infinite;
}
</style>
