<template>
  <view class="about-page">
    <!-- Logo + 名称 -->
    <view class="hero">
      <text class="iconfont icon-a-jobpal logo" />
      <text class="app-name">AI求职助手 JobPal</text>
      <text class="version">v1.0.0</text>
    </view>

    <!-- 产品介绍 -->
    <view class="card">
      <text class="card-title">产品介绍</text>
      <text class="card-text">AI 驱动的求职一站式管理工具。支持简历管理、心动岗位追踪、AI 简历优化、智能面试助手，让求职更高效。</text>
    </view>

    <!-- 开发者 -->
    <view class="card">
      <text class="card-title">开发者</text>
      <view class="info-row">
        <text class="iconfont icon-yonghu info-icon" />
        <text class="info-label">姓名</text>
        <text class="info-value">徐渝松</text>
      </view>
    </view>

    <!-- 开源 -->
    <view class="card">
      <text class="card-title">开源地址</text>
      <view class="info-row">
        <text class="iconfont icon-gitee info-icon" />
        <text class="info-label">Gitee</text>
        <text class="info-value link" @tap="openLink('https://gitee.com/JacksonXuu')">JacksonXuu</text>
      </view>
      <view class="info-row">
        <text class="iconfont icon-gitee info-icon" />
        <text class="info-label">仓库</text>
        <text class="info-value link" @tap="openLink('https://gitee.com/JacksonXuu/jobpal-app')">jobpal-app</text>
      </view>
    </view>

    <!-- 技术栈 -->
    <view class="card">
      <text class="card-title">技术栈</text>
      <view class="tech-stack">
        <text class="tech-tag">uni-app</text>
        <text class="tech-tag">Vue 3</text>
        <text class="tech-tag">TypeScript</text>
        <text class="tech-tag">NestJS</text>
        <text class="tech-tag">Prisma</text>
        <text class="tech-tag">阿里云百炼</text>
        <text class="tech-tag">LangChain</text>
        <text class="tech-tag">RAG</text>
      </view>
    </view>

    <!-- 版权 -->
    <text class="copyright">© 2026 徐渝松 All Rights Reserved</text>
  </view>
</template>

<script setup lang="ts">
function openLink(url: string) {
  // #ifdef H5
  window.open(url, '_blank')
  // #endif
  // #ifndef H5
  uni.setClipboardData({
    data: url,
    success: () => uni.showToast({ title: '链接已复制', icon: 'success' }),
  })
  // #endif
}
</script>

<style scoped>
.about-page {
  background: transparent;
  min-height: 100vh;
  padding: 40rpx 24rpx 60rpx;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0;
}
.logo { font-size: 96rpx; margin-bottom: 16rpx; color: var(--brand-primary); }
.app-name { font-size: 36rpx; font-weight: 700; color: var(--text-primary); }
.version { font-size: 24rpx; color: var(--text-secondary); margin-top: 8rpx; }

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.card-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16rpx;
}
.card-text {
  font-size: 26rpx;
  color: #4A4A5A;
  line-height: 1.7;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #F8F8F8;
}
.info-row:last-child { border-bottom: none; }
.info-icon { font-size: 28rpx; flex-shrink: 0; margin-right: 8rpx; width: 44rpx; display: flex; align-items: center; justify-content: center; }
.icon-yonghu.info-icon { color: #94a3b8; }
.icon-gitee.info-icon { color: #d81e06; }
.info-label { font-size: 26rpx; color: var(--text-secondary); flex-shrink: 0; margin-right: 20rpx; width: 80rpx; }
.info-value { font-size: 26rpx; color: var(--text-primary); }
.info-value.link { color: var(--brand-primary); }

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.tech-tag {
  font-size: 24rpx;
  color: var(--brand-primary);
  background: var(--brand-light);
  padding: 8rpx 18rpx;
  border-radius: 8rpx;
}

.copyright {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: var(--text-secondary);
  padding: 32rpx 0;
}
</style>
