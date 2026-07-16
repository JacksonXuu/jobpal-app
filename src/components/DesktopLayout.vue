<template>
  <view class="desktop-root">
    <!-- 顶栏 -->
    <DesktopTopbar>
      <text class="dt-username">{{ authStore.userInfo?.username }}</text>
    </DesktopTopbar>

    <!-- 主体 -->
    <view class="dt-body">
      <view class="dt-sidebar">
        <!-- 问一问 -->
        <view class="sb-ask-btn" @click="emits('navigate', 'ask')">
          <text class="iconfont icon-chat-ai-4-line sb-ask-icon" />
          <view class="sb-ask-text">
            <text class="sb-ask-title">问一问</text>
            <text class="sb-ask-sub">AI 智能求职助手</text>
          </view>
        </view>

        <view class="sb-divider" />

        <!-- 求职管理 -->
        <text class="sb-group-title">求职管理</text>
        <view class="sb-item" :class="{ 'sb-active': active === 'resume' }" @click="goPage('/pages/resume/list')">
          <view class="sb-label"><text class="iconfont icon-a-jianli sb-icon" />我的简历</view>
          <text class="sb-count">{{ stats.resumeCount }}</text>
        </view>
        <view class="sb-item" :class="{ 'sb-active': active === 'job' }" @click="goPage('/pages/job/list')">
          <view class="sb-label"><text class="iconfont icon-a-gangwei sb-icon" />心动岗位</view>
          <text class="sb-count">{{ stats.jobCount }}</text>
        </view>
        <view class="sb-item" :class="{ 'sb-active': active === 'interview' }" @click="goPage('/pages/interview/list')">
          <view class="sb-label"><text class="iconfont icon-lianxi2hebing_jilu sb-icon" />面试记录</view>
          <text class="sb-count">{{ stats.interviewCount }}</text>
        </view>

        <view class="sb-divider" />

        <!-- AI 工具 -->
        <text class="sb-group-title">AI 工具</text>
        <view class="sb-item" :class="{ 'sb-active': active === 'optimize' }" @click="goPage('/pages/optimize/select')"><view class="sb-label"><text class="iconfont icon-a-jianliyouhua sb-icon" />简历优化</view></view>
        <view class="sb-item" @click="goPlaceholder('定向刷题')"><view class="sb-label"><text class="iconfont icon-a-dingxiangshuati sb-icon" />定向刷题</view></view>
        <view class="sb-item" @click="goPlaceholder('模拟面试')"><view class="sb-label"><text class="iconfont icon-a-monimianshi sb-icon" />模拟面试</view></view>
      </view>

      <scroll-view class="dt-content" scroll-y>
        <slot />
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'
import { request } from '@/utils/request'
import DesktopTopbar from '@/components/DesktopTopbar.vue'

defineProps<{ active: string }>()
const emits = defineEmits<{ navigate: [page: string] }>()

const authStore = useAuthStore()

const stats = reactive({ resumeCount: 0, jobCount: 0, interviewCount: 0 })

async function fetchStats() {
  try {
    const res = await request<{ resumeCount: number; jobCount: number; interviewCount: number }>({ url: '/v1/home/stats' })
    Object.assign(stats, res.data)
  } catch { /* ignore */ }
}

onShow(() => {
  fetchStats()
})

function goPage(url: string) {
  uni.navigateTo({ url })
}

function goPlaceholder(title: string) {
  uni.navigateTo({ url: `/pages/placeholder/index?title=${encodeURIComponent(title)}` })
}
</script>

<style lang="scss" scoped>
.desktop-root {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  z-index: 99;
  background: #fff;
}

/* 主体 */
.dt-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

/* 侧边栏 */
.dt-sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  flex-shrink: 0;
  padding: 12px 0;
  overflow-y: auto;
}

.sb-ask-btn {
  display: flex;
  align-items: center;
  margin: 8px 12px;
  padding: 14px 16px;
  background: var(--brand-primary);
  border-radius: 12px;
  cursor: pointer;
  box-shadow: rgba(61, 222, 197, 0.3) 0px 8px 24px;
  transition: background 0.3s;

  &:hover { background: #80ede0; }
}

.sb-ask-icon {
  font-size: 24px;
  margin-right: 12px;
  color: #fff;
}

.sb-ask-text {
  display: flex;
  flex-direction: column;
}

.sb-ask-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.sb-ask-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 2px;
}

.sb-divider {
  height: 1px;
  background: #eee;
  margin: 8px 16px;
}

.sb-group-title {
  display: block;
  padding: 8px 28px 4px;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sb-icon {
  font-size: 18px;
  margin-right: 10px;
  color: var(--brand-primary);
}

.sb-label {
  font-size: 14px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
}

.sb-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 28px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #f5f5f5;

    .sb-icon { filter: brightness(1.1); }
  }
}

.sb-active {
  color: var(--brand-primary);
  background: var(--brand-light);

  .sb-icon { filter: brightness(1.1); }
}

.sb-count {
  font-size: 13px;
  font-weight: 600;
  color: var(--brand-primary);
  background: var(--brand-light);
  border-radius: 10px;
  padding: 2px 10px;
  min-width: 24px;
  text-align: center;
}

/* 内容区 */
.dt-content {
  flex: 1;
  background: #f5fdfc;
}
</style>
