<template>
  <!-- 桌面端壳 -->
  <DesktopLayout v-if="appStore.isDesktop" active="resume" @navigate="onSidebarNav">
    <view class="detail-page detail-desktop">
      <view class="dt-back" @click="goBack()">← 返回</view>
      <view v-if="loading" class="state-box">
        <text class="state-text">加载中...</text>
      </view>
      <view v-else-if="error" class="state-box">
        <text class="state-text">加载失败，请重试</text>
      </view>
      <template v-else-if="resume">
        <view class="header-card">
          <text class="header-title">{{ resume.title }}</text>
          <text v-if="resume.description" class="header-desc">{{ resume.description }}</text>
          <text class="header-date">更新于 {{ formatDateTime(resume.updatedAt) }}</text>
        </view>
        <view class="content-card">
          <rich-text v-if="html" :nodes="html"></rich-text>
          <text v-else class="content-empty">暂无正文内容</text>
        </view>
      </template>
    </view>
  </DesktopLayout>

  <!-- 手机端 -->
  <view v-else class="detail-page">
    <view v-if="loading" class="state-box">
      <text class="state-text">加载中...</text>
    </view>

    <view v-else-if="error" class="state-box">
      <text class="state-text">加载失败，请重试</text>
    </view>

    <template v-else-if="resume">
      <!-- 头部 -->
      <view class="header-card">
        <text class="header-title">{{ resume.title }}</text>
        <text v-if="resume.description" class="header-desc">{{ resume.description }}</text>
        <text class="header-date">更新于 {{ formatDateTime(resume.updatedAt) }}</text>
      </view>

      <!-- Markdown 正文 -->
      <view class="content-card">
        <rich-text v-if="html" :nodes="html"></rich-text>
        <text v-else class="content-empty">暂无正文内容</text>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAppStore } from '@/stores/app'
import DesktopLayout from '@/components/DesktopLayout.vue'
import { renderMarkdown } from '@/utils/markdown'
import { getResumeDetail, type Resume } from '@/apis/resume'
import { useTracking } from '@/composables/useTracking'

const appStore = useAppStore()

function onSidebarNav(page: string) {
  if (page === 'ask') { uni.switchTab({ url: '/pages/ask/index' }); return }
  if (page === 'home') { uni.switchTab({ url: '/pages/home' }); return }
}

function goBack() {
  const pages = getCurrentPages()
  if (pages.length <= 1) {
    uni.redirectTo({ url: '/pages/resume/list' })
  } else {
    uni.navigateBack()
  }
}

useTracking({ module: 'resume' })

const resume = ref<Resume | null>(null)
const loading = ref(true)
const error = ref(false)

/** Markdown → HTML */
const html = ref('')
async function updateHtml() {
  html.value = await renderMarkdown(resume.value?.content || '')
}

onLoad((options?: Record<string, string>) => {
  if (options?.id) loadDetail(options.id)
  else { error.value = true; loading.value = false }
})

async function loadDetail(id: string) {
  loading.value = true
  error.value = false
  try {
    resume.value = await getResumeDetail(id)
    updateHtml()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

// 监听 resume 内容变化重新渲染
watch(() => resume.value?.content, updateHtml)

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

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;
}
.state-text { font-size: 30rpx; color: var(--text-secondary); }

/* ── 头部 ── */
.header-card {
  background: linear-gradient(135deg, #3ddec5, #6ae8d8);
  border-radius: 24rpx;
  padding: 36rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: var(--brand-shadow);
}
.header-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
}
.header-desc {
  display: block;
  font-size: 26rpx;
  color: rgba(255,255,255,0.8);
  margin-top: 8rpx;
}
.header-date {
  display: block;
  font-size: 22rpx;
  color: rgba(255,255,255,0.55);
  margin-top: 14rpx;
}

/* ── Markdown 正文 ── */
.content-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.04);
  line-height: 1.8;
  font-size: 28rpx;
  color: var(--text-primary);
  word-break: break-all;
}
/* 富文本内部样式 */
.content-card :deep(h1) { font-size: 40rpx; font-weight: 700; margin: 24rpx 0 16rpx; }
.content-card :deep(h2) { font-size: 34rpx; font-weight: 600; margin: 20rpx 0 12rpx; }
.content-card :deep(h3) { font-size: 30rpx; font-weight: 600; margin: 16rpx 0 8rpx; }
.content-card :deep(p) { margin: 8rpx 0; }
.content-card :deep(ul), .content-card :deep(ol) { padding-left: 40rpx; margin: 8rpx 0; }
.content-card :deep(li) { margin: 4rpx 0; }
.content-card :deep(strong) { font-weight: 700; }
.content-card :deep(em) { font-style: italic; }
.content-card :deep(code) {
  background: var(--divider);
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
  font-family: 'Courier New', monospace;
  font-size: 26rpx;
}
.content-card :deep(pre) {
  background: transparent;
  padding: 20rpx;
  border-radius: 12rpx;
  overflow-x: auto;
  margin: 12rpx 0;
}
.content-card :deep(pre code) {
  background: none;
  padding: 0;
}
.content-card :deep(blockquote) {
  border-left: 6rpx solid var(--brand-primary);
  padding-left: 20rpx;
  color: #666;
  margin: 12rpx 0;
}
.content-card :deep(hr) {
  border: none;
  border-top: 1rpx solid #E0E0E0;
  margin: 24rpx 0;
}
.content-card :deep(a) { color: var(--brand-primary); }
.content-empty {
  font-size: 26rpx;
  color: var(--text-secondary);
}
</style>
