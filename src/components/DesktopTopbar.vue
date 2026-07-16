<template>
  <view class="dt-topbar">
    <text class="iconfont icon-a-jobpal-solid dt-logo" />
    <text class="dt-title">JobPal 求职助手</text>
    <view class="dt-spacer" />
    <!-- 右侧用户区插槽：DesktopLayout 传入用户名 -->
    <slot />
    <!-- 头像下拉：仅登录后显示 -->
    <view v-if="authStore.isLogin" class="dt-avatar" @click="toggleDropdown">
      <image src="/static/img/avatar.png" mode="aspectFill" class="dt-avatar-img" />
    </view>
  </view>

  <!-- 下拉面板 + 蒙层 -->
  <view v-if="dropdownVisible" class="dt-dropdown">
    <text class="dd-item" @click="goPage('/pages/about/index')">关于开发者</text>
    <text class="dd-item" @click="goPage('/pages/settings/index')">设置</text>
    <view class="dd-divider" />
    <text class="dd-item dd-danger" @click="handleLogout">退出登录</text>
  </view>
  <view v-if="dropdownVisible" class="dd-mask" @click="closeDropdown" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { logoutApi } from '@/apis/auth'
import { BRAND_PRIMARY } from '@/utils/theme'

const authStore = useAuthStore()

const dropdownVisible = ref(false)

function toggleDropdown() { dropdownVisible.value = !dropdownVisible.value }
function closeDropdown() { dropdownVisible.value = false }

function goPage(url: string) {
  dropdownVisible.value = false
  uni.navigateTo({ url })
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

<style lang="scss" scoped>
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

.dt-logo {
  font-size: 28px;
  color: var(--brand-primary);
  margin-right: 10px;
}

.dt-title {
  font-size: 20px;
  font-weight: 800;
  color: #475569;
}

.dt-spacer { flex: 1; }

/* 插槽内容：用户名 */
:slotted(.dt-username) {
  font-size: 14px;
  color: var(--text-secondary);
  margin-right: 12px;
}

/* 头像下拉 */
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

  &:hover { background: #f5f5f5; }
}

.dd-divider {
  height: 1px;
  background: #eee;
  margin: 4px 0;
}

.dd-danger { color: #FF4757; }

.dd-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 199;
}
</style>
