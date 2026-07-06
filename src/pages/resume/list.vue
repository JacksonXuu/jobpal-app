<template>
  <view class="list-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <text class="search-icon">🔍</text>
      <input
        class="search-input"
        v-model="keyword"
        placeholder="搜索简历标题..."
        @input="onSearchInput"
      />
      <text v-if="keyword" class="search-clear" @tap="clearSearch">✕</text>
    </view>

    <!-- 列表 -->
    <view v-if="loading" class="state-box">
      <text class="state-text">加载中...</text>
    </view>

    <view v-else-if="list.length === 0" class="state-box">
      <text class="state-icon">📋</text>
      <text class="state-text">暂无简历</text>
      <text class="state-desc">点击右下角 + 创建第一份简历</text>
    </view>

    <view v-else class="card-list">
      <view
        v-for="(item, index) in list"
        :key="item.id"
        class="swipe-wrapper"
      >
        <!-- 操作按钮 -->
        <view class="swipe-actions">
          <view class="swipe-btn edit-btn" @tap.stop="handleEdit(item.id)">
            <text>编辑</text>
          </view>
          <view class="swipe-btn delete-btn" @tap.stop="handleDelete(item.id)">
            <text>删除</text>
          </view>
        </view>

        <!-- 卡片 -->
        <view
          class="resume-card"
          :class="{ 'swiped': swipedId === item.id }"
          :style="{ transform: swipedId === item.id ? 'translateX(-160rpx)' : 'translateX(0)' }"
          @touchstart="onTouchStart($event, item.id, index)"
          @touchmove="onTouchMove($event, item.id, index)"
          @touchend="onTouchEnd($event, item.id)"
          @tap="goDetail(item.id)"
        >
          <view class="card-title-row">
            <text class="card-icon">📄</text>
            <text class="card-title">{{ item.title }}</text>
          </view>
          <text v-if="item.description" class="card-desc">{{ item.description }}</text>
          <text class="card-date">最近更新：{{ formatDateTime(item.updatedAt) }}</text>
        </view>
      </view>
    </view>

    <!-- FAB -->
    <view class="fab" @tap="goForm()">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getResumeList, deleteResume, type Resume } from '@/apis/resume'

// ── 列表数据 ──
const list = ref<Resume[]>([])
const total = ref(0)
const loading = ref(false)
const keyword = ref('')

let searchTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchList(), 300)
}

function clearSearch() {
  keyword.value = ''
  fetchList()
}

// ── 请求 ──
async function fetchList() {
  loading.value = true
  try {
    const res = await getResumeList({ keyword: keyword.value })
    list.value = res.list
    total.value = res.total
  } catch {
    // 拦截器已 toast
  } finally {
    loading.value = false
  }
}

let initialLoaded = false
onLoad(() => {
  fetchList().then(() => { initialLoaded = true })
})

onShow(() => {
  if (initialLoaded) fetchList()
})

// ── 左滑 ──
const swipedId = ref('')
let touchStartX = 0
let touchStartY = 0
const SWIPE_THRESHOLD = 60

function onTouchStart(e: TouchEvent, _id: string, _index: number) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

function onTouchMove(e: TouchEvent, id: string, _index: number) {
  const dx = e.touches[0].clientX - touchStartX
  const dy = e.touches[0].clientY - touchStartY
  if (Math.abs(dx) > Math.abs(dy) && dx < -SWIPE_THRESHOLD) {
    swipedId.value = id
  } else if (dx > SWIPE_THRESHOLD) {
    swipedId.value = ''
  }
}

function onTouchEnd(_e: TouchEvent, _id: string) {}

// ── 导航 ──
function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/resume/detail?id=${id}` })
}

function goForm(id?: string) {
  uni.navigateTo({ url: id ? `/pages/resume/form?id=${id}` : '/pages/resume/form' })
}

function handleEdit(id: string) {
  swipedId.value = ''
  goForm(id)
}

async function handleDelete(id: string) {
  swipedId.value = ''
  const res = await uni.showModal({
    title: '确认删除',
    content: '确定要删除该简历吗？',
    confirmColor: '#FF4757',
  })
  if (!res.confirm) return
  try {
    await deleteResume(id)
    uni.showToast({ title: '已删除', icon: 'success' })
    fetchList()
  } catch { /* 拦截器已 toast */ }
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const sec = String(d.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}:${sec}`
}
</script>

<style scoped>
.list-page {
  background: #F5F7FA;
  min-height: 100vh;
  padding: 24rpx 24rpx 160rpx;
}

/* ── 搜索栏 ── */
.search-bar {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 0 20rpx;
  margin-bottom: 20rpx;
  height: 72rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}
.search-icon { font-size: 28rpx; margin-right: 12rpx; }
.search-input { flex: 1; font-size: 28rpx; color: #1A1A2E; height: 72rpx; }
.search-clear { font-size: 28rpx; color: #C0C0C0; padding: 8rpx; }

/* ── 状态 ── */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0;
}
.state-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.state-text { font-size: 30rpx; color: #1A1A2E; font-weight: 500; }
.state-desc { font-size: 26rpx; color: #8E8E93; margin-top: 12rpx; }

/* ── 左滑 ── */
.swipe-wrapper {
  position: relative;
  margin-bottom: 16rpx;
  overflow: hidden;
  border-radius: 16rpx;
}
.swipe-actions {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  width: 160rpx;
}
.swipe-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #fff;
  font-weight: 500;
}
.edit-btn { background: #0cb5b2; }
.delete-btn { background: #FF4757; }

/* ── 卡片 ── */
.resume-card {
  position: relative;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  transition: transform 0.2s ease;
  z-index: 1;
}
.card-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}
.card-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
  flex-shrink: 0;
}
.card-title {
  flex: 1;
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A2E;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-desc {
  display: block;
  font-size: 24rpx;
  color: #8E8E93;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-date {
  display: block;
  font-size: 22rpx;
  color: #C0C0C0;
}

/* ── FAB ── */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 72rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #0cb5b2, #0a9e9b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(12, 181, 178, 0.4);
  z-index: 100;
}
.fab-icon { font-size: 36rpx; color: #fff; font-weight: 300; line-height: 0; margin-top: -2rpx; }
</style>
