<template>
  <view class="auth-page" :class="{ 'auth-desktop': appStore.isDesktop }">
    <!-- 桌面端顶栏 -->
    <view v-if="appStore.isDesktop" class="desktop-topbar">
      <text class="iconfont icon-a-jobpal topbar-logo" />
      <text class="topbar-title">AI求职助手 JobPal</text>
    </view>

    <!-- 渐变头部（手机端） -->
    <view v-if="!appStore.isDesktop" class="header">
      <view class="header-title-row">
        <text class="iconfont icon-a-jobpal header-logo" />
        <text class="header-title">欢迎使用AI求职助手</text>
      </view>
      <text class="header-subtitle">简历管理 · AI简历优化 · 智能助手</text>
    </view>

    <!-- 主体卡片 -->
    <view class="card" :class="{ 'card-desktop': appStore.isDesktop }">
      <!-- Tab 切换 -->
      <view class="tabs">
        <view
          class="tab-item"
          :class="{ active: activeTab === 'login' }"
          @tap="switchAuthTab('login')"
        >
          登录
          <view v-if="activeTab === 'login'" class="tab-underline" />
        </view>
        <view
          class="tab-item"
          :class="{ active: activeTab === 'register' }"
          @tap="switchAuthTab('register')"
        >
          注册
          <view v-if="activeTab === 'register'" class="tab-underline" />
        </view>
      </view>

      <!-- 表单 -->
      <view class="form">
        <view class="input-wrap">
          <image class="input-icon" src="/static/icon-img/user.png" mode="aspectFit" />
          <input
            class="input"
            v-model="form.username"
            placeholder="请输入用户名"
            maxlength="20"
          />
        </view>

        <view class="input-wrap">
          <image class="input-icon" src="/static/icon-img/password.png" mode="aspectFit" />
          <input
            class="input"
            v-model="form.password"
            placeholder="请输入密码"
            :password="!showPwd"
            maxlength="20"
          />
          <image
            class="pwd-toggle"
            :src="showPwd ? '/static/icon-img/preview-open.png' : '/static/icon-img/preview-close.png'"
            mode="aspectFit"
            @tap="showPwd = !showPwd"
          />
        </view>

        <!-- 提交按钮 -->
        <button class="submit-btn" :loading="loading" @tap="handleSubmit">
          {{ activeTab === 'login' ? '立即登录' : '立即注册' }}
        </button>

        <!-- 开发者信息 -->
        <view class="dev-info">
          <text class="dev-text">© {{ currentYear }} JobPal · 徐渝松 个人项目</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { login, register, validateUsername, validatePassword } from '@/apis/auth'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { useTracking } from '@/composables/useTracking'

const authStore = useAuthStore()
const appStore = useAppStore()
const currentYear = new Date().getFullYear()
const { trackClick, trackAction } = useTracking({ module: 'auth' })

onLoad(() => {
  // 已登录则直接跳转首页
  if (authStore.isLogin) {
    uni.switchTab({ url: '/pages/home' })
  }
})

const activeTab = ref<'login' | 'register'>('login')
const showPwd = ref(false)
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
})

/** 切换 Tab，清空表单 */
function switchAuthTab(tab: 'login' | 'register') {
  activeTab.value = tab
  form.username = ''
  form.password = ''
  trackClick(tab === 'login' ? 'switch_tab_login' : 'switch_tab_register')
}

/**
 * 前端校验（复用 API 层共享验证函数），失败时 toast 提示
 * @returns true 表示通过
 */
function validate(): boolean {
  const nameErr = validateUsername(form.username)
  if (nameErr && !(activeTab.value === 'login' && nameErr === '该用户名已被保留')) {
    uni.showToast({ title: nameErr, icon: 'none' })
    return false
  }
  const pwdErr = validatePassword(form.password)
  if (pwdErr) {
    uni.showToast({ title: pwdErr, icon: 'none' })
    return false
  }
  return true
}

/** 提交 */
async function handleSubmit() {
  if (!validate()) return

  loading.value = true
  try {
    const isLogin = activeTab.value === 'login'
    const api = isLogin ? login : register
    const res = await api({
      username: form.username,
      password: form.password,
    })

    if (isLogin) {
      trackAction('login_success')
      authStore.setLogin(res.token, res.userInfo)
      uni.switchTab({ url: '/pages/home' })
    } else {
      trackAction('register_success')
      uni.showToast({ title: '注册成功', icon: 'success' })
      authStore.setLogin(res.token, res.userInfo)
      uni.switchTab({ url: '/pages/home' })
    }
  } catch {
    // request.ts 拦截器已统一 toast 错误信息，此处不再重复
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--brand-gradient);
}

.header {
  padding: 160rpx 48rpx 60rpx;
}

.header-title-row {
  display: flex;
  align-items: center;
}

.header-logo {
  font-size: 68rpx;
  color: #fff;
  margin-right: 16rpx;
  font-weight: 400;
}

.header-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2rpx;
}

.header-subtitle {
  display: block;
  font-size: 26rpx;
  color: rgba(255,255,255,0.8);
  margin-top: 16rpx;
}

.card {
  background: var(--bg-light);
  border-radius: 40rpx 40rpx 0 0;
  padding: 200rpx 40rpx 48rpx;
  flex: 1;
}

/* === Tabs === */
.tabs {
  display: flex;
  justify-content: center;
  gap: 80rpx;
  margin-bottom: 48rpx;
}

.tab-item {
  position: relative;
  font-size: 34rpx;
  color: #8E8E93;
  padding-bottom: 12rpx;
  transition: all 0.3s;
}

.tab-item.active {
  color: #0cb5b2;
  font-weight: 600;
}

.tab-underline {
  width: 48rpx;
  height: 6rpx;
  background: #0cb5b2;
  border-radius: 3rpx;
  margin: 8rpx auto 0;
}

/* === Form === */
.input-wrap {
  display: flex;
  align-items: center;
  background: transparent;
  border-radius: 16rpx;
  padding: 0 24rpx;
  margin-bottom: 24rpx;
  border: 2rpx solid var(--border-light);
  transition: border-color 0.3s;
}

.input-wrap:focus-within {
  border-color: #0cb5b2;
}

.input-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.input {
  flex: 1;
  height: 96rpx;
  font-size: 30rpx;
  color: #1A1A2E;
}

.pwd-toggle {
  width: 30rpx;
  height: 30rpx;
  padding: 12rpx;
  flex-shrink: 0;
}

/* === Button === */
.submit-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: var(--brand-gradient);
  color: #fff;
  font-size: 34rpx;
  font-weight: 600;
  border-radius: 48rpx;
  border: none;
  margin-top: 48rpx;
  box-shadow: 0 8rpx 24rpx rgba(12, 181, 178, 0.3);
}

.submit-btn::after {
  border: none;
}

.submit-btn[loading] {
  opacity: 0.7;
}

/* === 开发者信息 === */
.dev-info {
  margin-top: 60rpx;
  text-align: center;
}

.dev-text {
  font-size: 22rpx;
  color: #B0B0B0;
  letter-spacing: 1rpx;
  font-weight: 400;
}

/* ===== 桌面端适配 ===== */
.auth-desktop {
  background: linear-gradient(180deg, #f5fdfc 0%, #e8f6fc 100%);
}

.desktop-topbar {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 26px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
  box-sizing: border-box;
}

.topbar-logo {
  font-size: 28px;
  color: var(--brand-primary);
  margin-right: 10px;
}

.topbar-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-desktop {
  background: #fff;
  border-radius: 16rpx;
  padding: 72rpx 64rpx 64rpx;
  flex: none;
  width: 480px;
  max-width: 90vw;
  margin: auto;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
}

.card-desktop .tabs {
  margin-bottom: 56rpx;
}

.card-desktop .input-wrap {
  margin-bottom: 32rpx;
}

.card-desktop .input {
  height: 108rpx;
}

.card-desktop .submit-btn {
  margin-top: 72rpx;
}

.card-desktop .dev-info {
  margin-top: 48rpx;
}
</style>
