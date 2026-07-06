<template>
  <view class="ask-page">
    <text class="ask-icon">💬</text>
    <text class="ask-title">问一问</text>
    <text class="ask-desc">功能即将上线，敬请期待</text>
  </view>
</template>

<script setup lang="ts">
</script>

<style scoped>
.ask-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  background: #F5F7FA;
}

.ask-icon {
  font-size: 100rpx;
  margin-bottom: 32rpx;
}

.ask-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1A1A2E;
  margin-bottom: 12rpx;
}

.ask-desc {
  font-size: 26rpx;
  color: #8E8E93;
}
</style>
