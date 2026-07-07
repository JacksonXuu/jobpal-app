<template>
  <!-- 桌面端：通用壳 + 问一问 -->
  <DesktopLayout v-if="appStore.isDesktop" active="ask" @navigate="onSidebarNav">
    <ChatPanel ref="chatPanelRef" mode="desktop" />
  </DesktopLayout>

  <!-- 手机端：原生布局 -->
  <HomeContent v-else />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import DesktopLayout from '@/components/DesktopLayout.vue'
import HomeContent from '@/components/home/HomeContent.vue'
import ChatPanel from '@/components/chat/ChatPanel.vue'
import { onShow } from '@dcloudio/uni-app'

const appStore = useAppStore()
const chatPanelRef = ref<InstanceType<typeof ChatPanel>>()

onShow(() => {
  // #ifdef H5
  if (appStore.isDesktop) uni.hideTabBar()
  // #endif
})

function onSidebarNav(page: string) {
  if (page === 'ask') {
    chatPanelRef.value?.newSession()
  }
}
</script>
