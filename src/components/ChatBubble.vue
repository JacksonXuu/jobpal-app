<template>
  <view class="chat-bubble" :class="role === 'user' ? 'bubble-user-wrap' : 'bubble-ai-wrap'">
    <!-- AI 气泡 -->
    <template v-if="role === 'assistant'">
      <view class="iconfont icon-a-jobpal-solid avatar avatar-ai avatar-logo" :class="{ 'avatar-pulse': isStreaming }" />
      <view class="bubble-ai">
        <rich-text v-if="content || isStreaming" :nodes="html"></rich-text>
        <view v-else class="typing-dots">
          <text class="dot">●</text>
          <text class="dot">●</text>
          <text class="dot">●</text>
        </view>
        <text v-if="isStreaming && content" class="cursor">|</text>
      </view>
    </template>

    <!-- 用户气泡 -->
    <template v-else>
      <view class="bubble-user">
        <text>{{ content }}</text>
      </view>
      <view class="avatar avatar-user"><image src="/static/img/avatar.png" mode="aspectFill" class="avatar-img" /></view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { renderMarkdown } from '@/utils/markdown'

const props = defineProps<{
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}>()

const html = ref('')
watchEffect(() => {
  html.value = renderMarkdown(props.content)
})
</script>

<style scoped>
.chat-bubble {
  display: flex;
  align-items: flex-start;
  margin-bottom: 32rpx;
  padding: 0 24rpx;
}

/* 头像 */
.avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  flex-shrink: 0;
}
.avatar-ai {
  background: #ecfefe;
  margin-right: 12rpx;
}
.avatar-logo {
  font-size: 50rpx !important;
  color: var(--brand-primary);
}
.avatar-user {
  width: 52rpx;
  height: 52rpx;
  background: #E8F5E9;
  margin-left: 12rpx;
}
.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
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
  background: var(--brand-primary);
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
  color: var(--brand-primary);
  animation: blink 0.8s infinite;
}

/* 头像动态效果 */
.avatar-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(61, 222, 197, 0.4); }
  50% { transform: scale(1.08); box-shadow: 0 0 0 12rpx rgba(61, 222, 197, 0); }
}
</style>
