<template>
  <!-- 桌面端壳 -->
  <DesktopLayout v-if="appStore.isDesktop" active="resume" @navigate="onSidebarNav">
    <view class="list-page list-desktop">
      <!-- 桌面端操作栏 -->
      <view class="dt-action-bar">
        <view class="dt-actions">
          <button class="dt-btn" @click="goForm()" size="mini"><text class="iconfont icon-tianjia" /> 新建简历</button>
          <button class="dt-btn dt-btn-refresh" @click="fetchList" size="mini"><text class="iconfont icon-shuaxin" /> 刷新</button>
        </view>
        <view class="dt-search">
          <text class="iconfont icon-sousuotubiao search-icon" />
          <input class="search-input" v-model="keyword" placeholder="搜索简历标题" @input="onSearchInput" />
          <text v-if="keyword" class="search-clear" @tap="clearSearch">✕</text>
        </view>
      </view>

    <!-- 列表 -->
    <view v-if="loading" class="state-box">
      <text class="state-text">加载中...</text>
    </view>

    <view v-else-if="list.length === 0" class="state-box">
      <text class="iconfont icon-a-jianli state-icon" />
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
          <view class="swipe-btn edit-btn" @tap.stop="handleEdit(item.id)"><button size="mini">编辑</button></view>
          <view class="swipe-btn delete-btn" @tap.stop="handleDelete(item.id)"><button size="mini">删除</button></view>
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
            <text class="iconfont icon-a-jianli card-icon" />
            <text class="card-title">{{ item.title }}</text>
            <view class="card-actions">
              <button class="card-action-edit" size="mini" @tap.stop="handleEdit(item.id)">编辑</button>
              <button class="card-action-delete" size="mini" @tap.stop="handleDelete(item.id)">删除</button>
            </view>
          </view>
          <text v-if="item.description" class="card-desc">{{ item.description }}</text>
          <text class="card-date">最近更新：{{ formatDateTime(item.updatedAt) }}</text>
        </view>
      </view>
    </view>

    <!-- FAB -->
    <view class="fab" @tap="goForm()">
      <text class="iconfont icon-add fab-icon" />
    </view>
  </view>
  </DesktopLayout>

  <!-- 手机端 -->
  <view v-else class="list-page">
    <view class="search-bar">
      <text class="iconfont icon-sousuotubiao search-icon" />
      <input class="search-input" v-model="keyword" placeholder="搜索简历标题" @input="onSearchInput" />
      <text v-if="keyword" class="search-clear" @tap="clearSearch">✕</text>
    </view>
    <view v-if="loading" class="state-box"><text class="state-text">加载中...</text></view>
    <view v-else-if="list.length === 0" class="state-box">
      <text class="iconfont icon-a-jianli state-icon" />
      <text class="state-text">暂无简历</text>
      <text class="state-desc">点击右下角 + 创建第一份简历</text>
    </view>
    <view v-else class="card-list">
      <view v-for="(item, index) in list" :key="item.id" class="swipe-wrapper">
        <view class="swipe-actions">
          <view class="swipe-btn edit-btn" @tap.stop="handleEdit(item.id)"><button size="mini">编辑</button></view>
          <view class="swipe-btn delete-btn" @tap.stop="handleDelete(item.id)"><button size="mini">删除</button></view>
        </view>
        <view class="resume-card" :class="{ 'swiped': swipedId === item.id }" :style="{ transform: swipedId === item.id ? 'translateX(-160rpx)' : 'translateX(0)' }" @touchstart="onTouchStart($event, item.id, index)" @touchmove="onTouchMove($event, item.id, index)" @touchend="onTouchEnd($event, item.id)" @tap="goDetail(item.id)">
          <view class="card-title-row"><text class="iconfont icon-a-jianli card-icon" /><text class="card-title">{{ item.title }}</text></view>
          <text v-if="item.description" class="card-desc">{{ item.description }}</text>
          <text class="card-date">最近更新：{{ formatDateTime(item.updatedAt) }}</text>
        </view>
      </view>
    </view>
    <view class="fab" @tap="goForm()"><text class="iconfont icon-add fab-icon" /></view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useAppStore } from '@/stores/app'
import DesktopLayout from '@/components/DesktopLayout.vue'

const appStore = useAppStore()
import { getResumeList, deleteResume, type Resume } from '@/apis/resume'
import { useTracking } from '@/composables/useTracking'
import { BRAND_PRIMARY } from '@/utils/theme'

const { trackAction } = useTracking({ module: 'resume' })

// ── 列表数据 ──
const list = ref<Resume[]>([])
const total = ref(0)
const loading = ref(false)
const keyword = ref('')

let searchTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    trackAction('search')
    fetchList()
  }, 300)
}

function clearSearch() {
  trackAction('clear_search')
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
  trackAction('view_detail')
  uni.navigateTo({ url: `/pages/resume/detail?id=${id}` })
}

function onSidebarNav(page: string) {
  if (page === 'ask') { uni.switchTab({ url: '/pages/ask/index' }); return }
  if (page === 'home') { uni.switchTab({ url: '/pages/home' }); return }
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
    confirmColor: BRAND_PRIMARY,
  })
  if (!res.confirm) return
  try {
    trackAction('delete')
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
  background: transparent;
  min-height: 100vh;
  padding: 24rpx 24rpx 160rpx;
}
.list-desktop {
  padding: 32rpx;
  min-height: auto;
}

/* 桌面端操作栏 */
.dt-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}
.dt-actions {
  display: flex;
  gap: 24rpx;
  flex-shrink: 0;
}
.dt-btn {
  padding: 0 15px;
  height: 32px;
  line-height: 30px;
  font-size: 14px;
  color: var(--brand-primary);
  background: transparent;
  border: 1px solid var(--brand-primary);
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}
.dt-btn:hover { color: #80ede0; border-color: #80ede0; }
.dt-btn::after { border: none; }
.dt-btn-refresh {
  background: transparent;
  color: var(--brand-primary);
  border: 1px solid var(--brand-primary);
}
.dt-btn-refresh:hover { color: #80ede0; border-color: #80ede0; }
.dt-search {
  display: flex;
  align-items: center;
  width: 680rpx;
  background: #fff;
  border-radius: 8rpx;
  padding: 0 16rpx;
  height: 40px;
  box-sizing: border-box;
}
.dt-search .search-input {
  flex: 1;
  height: 40px;
  font-size: 14px;
}
.dt-search .search-icon { font-size: 28rpx; margin-right: 8rpx; }
.dt-search .search-clear { font-size: 24rpx; color: var(--text-secondary); padding: 4rpx; cursor: pointer; }

/* 桌面端隐藏 FAB */
.list-desktop .fab { display: none !important; }

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
.search-input { flex: 1; font-size: 28rpx; color: var(--text-primary); height: 72rpx; }
.search-clear { font-size: 28rpx; color: var(--text-secondary); padding: 8rpx; }

/* ── 状态 ── */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0;
}
.state-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.state-text { font-size: 30rpx; color: var(--text-primary); font-weight: 500; }
.state-desc { font-size: 26rpx; color: var(--text-secondary); margin-top: 12rpx; }

/* ── 左滑 ── */
.swipe-wrapper {
  position: relative;
  margin-bottom: 16rpx;
  border-radius: 16rpx;
}
.swipe-actions {
  position: absolute;
  right: 1rpx;
  top: 0;
  bottom: 0;
  display: flex;
  width: 160rpx;
  border-radius: 0 16rpx 16rpx 0;
  overflow: hidden;
}
.list-desktop .swipe-actions { display: none; }
.swipe-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.swipe-btn button {
  font-size: 26rpx;
  font-weight: 500;
  background: transparent;
  border: none;
  padding: 0;
  height: 64rpx;
  line-height: 64rpx;
}
.swipe-btn button::after { border: none; }
.edit-btn button { color: var(--brand-primary); }
.delete-btn { position: relative; }
.delete-btn button { color: #FF4757; }
.delete-btn::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 2rpx;
  height: 28rpx;
  background: var(--divider);
}

/* ── 卡片 ── */
.resume-card {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  transition: transform 0.2s ease;
  z-index: 1;
  box-sizing: border-box;
  overflow: hidden;
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
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-actions {
  flex-shrink: 0;
  gap: 16rpx;
  margin-left: auto;
}
.card-action-edit, .card-action-delete {
  font-size: 13px;
  cursor: pointer;
  padding: 0 16rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 4rpx;
  border: none;
  background: transparent;
}
.card-action-edit::after, .card-action-delete::after { border: none; }
.card-action-edit { color: var(--brand-primary); }
.card-action-edit:hover { background: var(--brand-light); }
.card-action-delete { color: #FF4757; }
.card-action-delete:hover { background: #fff0f0; }
.card-desc {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-date {
  display: block;
  font-size: 22rpx;
  color: var(--text-secondary);
}

/* ── FAB ── */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 72rpx;
  height: 72rpx;
  background: var(--brand-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx  rgba(8, 201, 176, 0.4);
  z-index: 100;
}
.fab-icon { font-size: 28rpx; color: #fff; font-weight: 400; }
</style>
