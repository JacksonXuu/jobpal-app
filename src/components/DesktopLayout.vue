<template>
  <view class="desktop-root">
    <!-- 顶栏 -->
    <view class="dt-topbar">
      <text class="iconfont icon-a-jobpal-solid dt-logo" />
      <text class="dt-title">AI求职助手 JobPal</text>
      <view class="dt-spacer" />
      <text class="dt-username">{{ authStore.userInfo?.username }}</text>
      <view class="dt-avatar" @click="toggleDropdown">
        <image src="/static/img/avatar.png" mode="aspectFill" class="dt-avatar-img" />
      </view>
    </view>

    <!-- 头像下拉面板 + 蒙层（放在顶栏外层，避免层叠上下文问题） -->
    <view v-if="dropdownVisible" class="dt-dropdown">
      <text class="dd-item" @click="goPage('/pages/about/index')">关于开发者</text>
      <text class="dd-item" @click="goPage('/pages/settings/index')">设置</text>
      <view class="dd-divider" />
      <text class="dd-item dd-danger" @click="handleLogout">退出登录</text>
    </view>
    <view v-if="dropdownVisible" class="dd-mask" @click="closeDropdown" />

    <!-- 主体 -->
    <view class="dt-body">
      <view class="dt-sidebar">
        <!-- 问一问 -->
        <view class="sb-ask-btn" @click="emits('navigate', 'ask')">
          <text class="sb-ask-icon">💬</text>
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
import { ref, reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'
import { logoutApi } from '@/apis/auth'
import { request } from '@/utils/request'
import { BRAND_PRIMARY } from '@/utils/theme'

defineProps<{ active: string }>()
const emits = defineEmits<{ navigate: [page: string] }>()

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
})

function toggleDropdown() { dropdownVisible.value = !dropdownVisible.value }
function closeDropdown() { dropdownVisible.value = false }

function goPage(url: string) {
  dropdownVisible.value = false
  uni.navigateTo({ url })
}

function goPlaceholder(title: string) {
  uni.navigateTo({ url: `/pages/placeholder/index?title=${encodeURIComponent(title)}` })
}

async function handleLogout() {
  dropdownVisible.value = false
  const res = await uni.showModal({ title: '退出登录', content: '确定要退出登录吗？', confirmColor: BRAND_PRIMARY })
  if (!res.confirm) return
  try { await logoutApi() } catch { /* ignore */ }
  authStore.logout()
  uni.removeStorageSync('GREETING_SLIDE_SHOWN')
  uni.reLaunch({ url: '/pages/login/login' })
}
</script>

<style scoped>
.desktop-root {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  z-index: 99;
  background: #f5fdfc;
}

/* 顶栏 */
.dt-topbar {
  position: relative;
  z-index: 1;
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 26px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  box-sizing: border-box;
}
.dt-logo { font-size: 28px; color: var(--brand-primary); margin-right: 10px; }
.dt-title { font-size: 20px; font-weight: 600; color: var(--text-primary); }
.dt-spacer { flex: 1; }
.dt-username { font-size: 14px; color: var(--text-secondary); margin-right: 12px; }

/* 头像下拉 */
.dt-avatar { width: 36px; height: 36px; border-radius: 50%; overflow: hidden; cursor: pointer; flex-shrink: 0; }
.dt-avatar-img { width: 100%; height: 100%; }
.dt-dropdown {
  position: fixed; top: 54px; right: 26px; width: 160px;
  background: #fff; border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12); z-index: 200; padding: 8px 0;
}
.dd-item { display: block; padding: 10px 20px; font-size: 14px; color: var(--text-primary); cursor: pointer; }
.dd-item:hover { background: #f5f5f5; }
.dd-divider { height: 1px; background: #eee; margin: 4px 0; }
.dd-danger { color: #FF4757; }
.dd-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 199; }

/* 主体 */
.dt-body { flex: 1; display: flex; overflow: hidden; min-height: 0; }

/* 侧边栏 */
.dt-sidebar { width: 240px; background: #fff; border-right: 1px solid #e8e8e8; flex-shrink: 0; padding: 12px 0; overflow-y: auto; }

.sb-ask-btn { display: flex; align-items: center; margin: 8px 16px; padding: 14px 16px; background: var(--brand-gradient); border-radius: 12px; cursor: pointer; }
.sb-ask-btn:hover { opacity: 0.9; }
.sb-ask-icon { font-size: 28px; margin-right: 12px; }
.sb-ask-text { display: flex; flex-direction: column; }
.sb-ask-title { font-size: 16px; font-weight: 700; color: #fff; }
.sb-ask-sub { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 2px; }

.sb-divider { height: 1px; background: #eee; margin: 8px 16px; }
.sb-group-title { display: block; padding: 8px 28px 4px; font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

.sb-icon { font-size: 18px; margin-right: 10px; color: var(--brand-primary); }
.sb-label { font-size: 14px; color: var(--text-primary); display: flex; align-items: center; }
.sb-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 28px; cursor: pointer; transition: background 0.15s; }
.sb-item:hover { background: #f5f5f5; }
.sb-active { color: var(--brand-primary); font-weight: 600; background: var(--brand-light); }

.sb-count { font-size: 13px; font-weight: 600; color: var(--brand-primary); background: var(--brand-light); border-radius: 10px; padding: 2px 10px; min-width: 24px; text-align: center; }

/* 内容区 */
.dt-content { flex: 1; }
</style>
