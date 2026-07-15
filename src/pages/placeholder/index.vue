<template>
  <DesktopLayout v-if="appStore.isDesktop" active="" @navigate="onSidebarNav">
    <view class="placeholder-page placeholder-desktop">
      <image class="placeholder-icon" src="/static/img/fun-deving.png" mode="aspectFit" />
      <text class="placeholder-title">{{ title }}</text>
      <text class="placeholder-desc">功能即将上线，敬请期待</text>
    </view>
  </DesktopLayout>
  <view v-else class="placeholder-page">
    <image class="placeholder-icon" src="/static/img/fun-deving.png" mode="aspectFit" />
    <text class="placeholder-title">{{ title }}</text>
    <text class="placeholder-desc">功能即将上线，敬请期待</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAppStore } from '@/stores/app'
import DesktopLayout from '@/components/DesktopLayout.vue'

const appStore = useAppStore()
function onSidebarNav(page: string) { if (page === 'ask') uni.switchTab({ url: '/pages/ask/index' }); else if (page === 'home') uni.switchTab({ url: '/pages/home' }) }

const title = ref('功能详情')

onLoad((options?: Record<string, string>) => {
  if (options?.title) {
    title.value = decodeURIComponent(options.title)
    uni.setNavigationBarTitle({ title: title.value })
  }
})
</script>

<style scoped>
.placeholder-desktop { min-height: auto; }
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
  width: 560rpx;
  height: 560rpx;
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
