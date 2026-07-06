<template>
  <view class="placeholder-page">
    <text class="placeholder-icon">🚀</text>
    <text class="placeholder-title">{{ title }}</text>
    <text class="placeholder-desc">功能即将上线，敬请期待</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const title = ref('功能详情')

onLoad((options?: Record<string, string>) => {
  if (options?.title) {
    title.value = decodeURIComponent(options.title)
    uni.setNavigationBarTitle({ title: title.value })
  }
})
</script>

<style scoped>
.placeholder-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  background: transparent;
}

.placeholder-icon {
  font-size: 100rpx;
  margin-bottom: 32rpx;
}

.placeholder-title {
  font-size: 34rpx;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12rpx;
}

.placeholder-desc {
  font-size: 26rpx;
  color: var(--text-secondary);
}
</style>
