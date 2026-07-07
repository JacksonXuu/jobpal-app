<template>
  <!-- 桌面端：顶栏 + 侧边栏 + 内容 -->
  <view v-if="appStore.isDesktop" class="desktop-root">
    <view class="dt-topbar">
      <text class="iconfont icon-a-jobpal dt-logo" />
      <text class="dt-title">AI求职助手 JobPal</text>
      <view class="dt-spacer" />
      <text class="dt-username">{{ authStore.userInfo?.username }}</text>
      <view class="dt-avatar" @click="toggleDropdown">
        <image src="/static/img/avatar.png" mode="aspectFill" class="dt-avatar-img" />
      </view>
      <view v-if="dropdownVisible" class="dt-dropdown">
        <text class="dd-item" @click="navigateTo('/pages/about/index')">关于开发者</text>
        <text class="dd-item" @click="navigateTo('/pages/settings/index')">设置</text>
        <view class="dd-divider" />
        <text class="dd-item dd-danger" @click="handleLogout">退出登录</text>
      </view>
    </view>
    <!-- 下拉遮罩 -->
    <view v-if="dropdownVisible" class="dd-mask" @click="closeDropdown" />
    <view class="dt-body">
      <view class="dt-sidebar">
        <!-- 问一问（突出入口） -->
        <view class="sb-ask-btn" @click="switchTab('/pages/ask/index')">
          <text class="sb-ask-icon">💬</text>
          <view class="sb-ask-text">
            <text class="sb-ask-title">问一问</text>
            <text class="sb-ask-sub">AI 智能求职助手</text>
          </view>
        </view>

        <view class="sb-divider" />

        <!-- 求职管理（含数据仪表盘） -->
        <text class="sb-group-title">求职管理</text>
        <view class="sb-item" @click="navigateTo('/pages/resume/list')">
          <view class="sb-label"><text class="iconfont icon-a-jianli sb-icon" />我的简历</view>
          <text class="sb-count">{{ stats.resumeCount }}</text>
        </view>
        <view class="sb-item" @click="navigateTo('/pages/job/list')">
          <view class="sb-label"><text class="iconfont icon-a-gangwei sb-icon" />心动岗位</view>
          <text class="sb-count">{{ stats.jobCount }}</text>
        </view>
        <view class="sb-item" @click="navigateTo('/pages/interview/list')">
          <view class="sb-label"><text class="iconfont icon-lianxi2hebing_jilu sb-icon" />面试记录</view>
          <text class="sb-count">{{ stats.interviewCount }}</text>
        </view>

        <view class="sb-divider" />

        <!-- AI 工具 -->
        <text class="sb-group-title">AI 工具</text>
        <view class="sb-item" @click="navigateTo('/pages/optimize/select')"><view class="sb-label"><text class="iconfont icon-a-jianliyouhua sb-icon" />简历优化</view></view>
        <view class="sb-item" @click="goPlaceholder('定向刷题')"><view class="sb-label"><text class="iconfont icon-a-dingxiangshuati sb-icon" />定向刷题</view></view>
        <view class="sb-item" @click="goPlaceholder('模拟面试')"><view class="sb-label"><text class="iconfont icon-a-monimianshi sb-icon" />模拟面试</view></view>
      </view>
      <scroll-view class="dt-content" scroll-y>
        <HomeContent />
      </scroll-view>
    </view>
  </view>

  <!-- 手机端：原生布局 -->
  <HomeContent v-else />
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { logoutApi } from '@/apis/auth'
import { request } from '@/utils/request'
import HomeContent from '@/components/home/HomeContent.vue'

const appStore = useAppStore()
const authStore = useAuthStore()

const dropdownVisible = ref(false)

const stats = reactive({ resumeCount: 0, jobCount: 0, interviewCount: 0 })

async function fetchStats() {
  try {
    const res = await request<{ resumeCount: number; jobCount: number; interviewCount: number }>({ url: '/v1/home/stats' })
    Object.assign(stats, res.data)
  } catch { /* ignore */ }
}

onShow(() => {
  fetchStats()
  // #ifdef H5
  if (appStore.isDesktop) uni.hideTabBar()
  // #endif
})

function switchTab(url: string) {
  uni.switchTab({ url })
}

function navigateTo(url: string) {
  dropdownVisible.value = false
  uni.navigateTo({ url })
}

function toggleDropdown() {
  dropdownVisible.value = !dropdownVisible.value
}

function closeDropdown() {
  dropdownVisible.value = false
}

function goPlaceholder(title: string) {
  uni.navigateTo({ url: `/pages/placeholder/index?title=${encodeURIComponent(title)}` })
}

async function handleLogout() {
  dropdownVisible.value = false
  const res = await uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    confirmColor: '#3ddec5',
  })
  if (!res.confirm) return
  try { await logoutApi() } catch { /* ignore */ }
  authStore.logout()
  uni.removeStorageSync('GREETING_SLIDE_SHOWN')
  uni.reLaunch({ url: '/pages/login/login' })
}
</script>

<style scoped>
/* ===== 桌面端布局壳 ===== */
.desktop-root {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
}

.dt-topbar {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 26px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
  box-sizing: border-box;
}
.dt-logo { font-size: 28px; color: var(--brand-primary); margin-right: 10px; }
.dt-title { font-size: 20px; font-weight: 600; color: var(--text-primary); }
.dt-spacer { flex: 1; }
.dt-username {
  font-size: 14px;
  color: var(--text-secondary);
  margin-right: 12px;
}

/* 头像 & 下拉 */
.dt-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
}
.dt-avatar-img {
  width: 100%;
  height: 100%;
}
.dt-dropdown {
  position: fixed;
  top: 54px;
  right: 26px;
  width: 160px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 200;
  padding: 8px 0;
}
.dd-item {
  display: block;
  padding: 10px 20px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.15s;
}
.dd-item:hover { background: #f5f5f5; }
.dd-divider { height: 1px; background: #eee; margin: 4px 0; }
.dd-danger { color: #FF4757; }

.dd-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 199;
}

.dt-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.dt-sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  flex-shrink: 0;
  padding: 12px 0;
  overflow-y: auto;
}

/* 问一问入口按钮 */
.sb-ask-btn {
  display: flex;
  align-items: center;
  margin: 8px 16px;
  padding: 14px 16px;
  background: var(--brand-gradient);
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.sb-ask-btn:hover { opacity: 0.9; }
.sb-ask-icon { font-size: 28px; margin-right: 12px; }
.sb-ask-text { display: flex; flex-direction: column; }
.sb-ask-title { font-size: 16px; font-weight: 700; color: #fff; }
.sb-ask-sub { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 2px; }

.sb-divider {
  height: 1px;
  background: #eee;
  margin: 8px 16px;
}

/* 分组标题 */
.sb-group-title {
  display: block;
  padding: 8px 28px 4px;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 导航项 */
.sb-icon { font-size: 18px; margin-right: 10px; color: var(--brand-primary); }
.sb-label { font-size: 14px; color: var(--text-primary); display: flex; align-items: center; }
.sb-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 28px;
  cursor: pointer;
  transition: background 0.15s;
}
.sb-item:hover { background: #f5f5f5; }
.sb-active { color: var(--brand-primary); font-weight: 600; background: var(--brand-light); }
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

.dt-content {
  flex: 1;
}
</style>
