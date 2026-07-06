<template>
  <view class="list-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <text class="search-icon">🔍</text>
      <input
        class="search-input"
        v-model="keyword"
        placeholder="搜索岗位或公司..."
        @input="onSearchInput"
      />
      <text v-if="keyword" class="search-clear" @tap="clearSearch">✕</text>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-item" @tap="openPicker('status')">
        <text>{{ statusLabel }}</text>
        <text class="filter-arrow">▾</text>
      </view>
      <view class="filter-item" @tap="openPicker('source')">
        <text>{{ sourceLabel }}</text>
        <text class="filter-arrow">▾</text>
      </view>
      <view class="filter-item" @tap="openPicker('sort')">
        <text>{{ sortLabel }}</text>
        <text class="filter-arrow">▾</text>
      </view>
    </view>

    <!-- 列表 -->
    <view v-if="loading" class="state-box">
      <text class="state-text">加载中...</text>
    </view>

    <view v-else-if="list.length === 0" class="state-box">
      <text class="state-icon">📋</text>
      <text class="state-text">暂无心动岗位</text>
      <text class="state-desc">点击右下角 + 添加</text>
    </view>

    <view v-else class="card-list">
      <view
        v-for="(item, index) in list"
        :key="item.id"
        class="swipe-wrapper"
      >
        <view class="swipe-actions">
          <view class="swipe-btn edit-btn" @tap.stop="handleEdit(item.id)">
            <text>编辑</text>
          </view>
          <view class="swipe-btn delete-btn" @tap.stop="handleDelete(item.id)">
            <text>删除</text>
          </view>
        </view>

        <view
          class="job-card"
          :class="{ 'swiped': swipedId === item.id }"
          :style="{ transform: swipedId === item.id ? 'translateX(-160rpx)' : 'translateX(0)' }"
          @touchstart="onTouchStart($event, item.id, index)"
          @touchmove="onTouchMove($event, item.id, index)"
          @touchend="onTouchEnd($event, item.id)"
          @tap="goDetail(item.id)"
        >
          <view class="card-top">
            <text class="card-jobname">{{ item.jobName }}</text>
            <view class="card-rating">
              <text v-for="n in 5" :key="n" class="star">{{ n <= item.rating ? '⭐' : '☆' }}</text>
            </view>
          </view>
          <text class="card-company">{{ item.companyName }}</text>
          <view class="card-bottom">
            <text class="card-salary"><text class="salary-icon">💰</text><text class="salary-num">{{ item.salary }}</text><text class="salary-unit">k</text></text>
            <text class="card-status" :class="getStatusClass(item.status)" @tap.stop="openStatusPicker(item)">{{ item.status }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- FAB -->
    <view class="fab" @tap="goForm()">
      <text class="fab-icon">+</text>
    </view>

    <!-- 筛选 Picker 弹层 -->
    <view v-if="pickerVisible" class="picker-overlay" @tap="closePicker">
      <view class="picker-sheet" @tap.stop="">
        <view class="picker-header">
          <text class="picker-cancel" @tap="closePicker">取消</text>
          <text class="picker-title">{{ pickerTitle }}</text>
          <text class="picker-confirm" @tap="confirmPicker">确定</text>
        </view>
        <view class="picker-body">
          <view
            v-for="opt in pickerOptions"
            :key="opt.value"
            class="picker-option"
            :class="{ selected: pickerTemp === opt.value }"
            @tap="pickerTemp = opt.value"
          >
            <text>{{ opt.label }}</text>
            <text v-if="pickerTemp === opt.value" class="check">✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 快速修改状态 Picker -->
    <view v-if="statusPickerVisible" class="picker-overlay" @tap="closeStatusPicker">
      <view class="picker-sheet" @tap.stop="">
        <view class="picker-header">
          <text class="picker-cancel" @tap="closeStatusPicker">取消</text>
          <text class="picker-title">修改状态</text>
          <text class="picker-confirm" @tap="confirmStatusPicker">确定</text>
        </view>
        <view class="picker-body">
          <view
            v-for="opt in allStatusOptions"
            :key="opt"
            class="picker-option"
            :class="{ selected: statusPickerTemp === opt }"
            @tap="statusPickerTemp = opt"
          >
            <text>{{ opt }}</text>
            <text v-if="statusPickerTemp === opt" class="check">✓</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import {
  getJobList,
  deleteJob,
  patchJobStatus,
  JOB_STATUS_OPTIONS,
  SOURCE_PLATFORM_OPTIONS,
  SORT_BY_OPTIONS,
  type JobPosition,
} from '@/apis/job'

// ── 列表数据 ──
const list = ref<JobPosition[]>([])
const total = ref(0)
const loading = ref(false)

// ── 筛选项 ──
const keyword = ref('')
const status = ref('')
const sourcePlatform = ref('')
const sortBy = ref('updatedAt')
const sortOrder = ref('desc')

/** 搜索防抖计时器 */
let searchTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchList()
  }, 300)
}

function clearSearch() {
  keyword.value = ''
  fetchList()
}

// ── 筛选标签 ──
const statusLabel = computed(() => status.value || '全部状态')
const sourceLabel = computed(() => sourcePlatform.value || '全部来源')

const sortOrderLabels: Record<string, string> = {
  'updatedAt-desc': '最近更新',
  'updatedAt-asc': '最早更新',
  'salary-desc': '薪资从高到低',
  'salary-asc': '薪资从低到高',
  'rating-desc': '心动从高到低',
  'rating-asc': '心动从低到高',
}
const sortLabel = computed(() => {
  const key = `${sortBy.value}-${sortOrder.value}`
  return sortOrderLabels[key] || '排序'
})

// ── Picker 弹层 ──
const pickerVisible = ref(false)
type PickerType = 'status' | 'source' | 'sort'
const pickerType = ref<PickerType>('status')
const pickerTemp = ref('')

const pickerTitle = computed(() => {
  const titles: Record<PickerType, string> = { status: '选择状态', source: '选择来源', sort: '选择排序' }
  return titles[pickerType.value]
})

const pickerOptions = computed(() => {
  if (pickerType.value === 'status') {
    return [{ label: '全部状态', value: '' }, ...JOB_STATUS_OPTIONS.map((s) => ({ label: s, value: s }))]
  }
  if (pickerType.value === 'source') {
    return [{ label: '全部来源', value: '' }, ...SOURCE_PLATFORM_OPTIONS.map((s) => ({ label: s, value: s }))]
  }
  // sort
  const sortOptions = [
    { label: '最近更新', value: 'updatedAt-desc' },
    { label: '最早更新', value: 'updatedAt-asc' },
    { label: '薪资从高到低', value: 'salary-desc' },
    { label: '薪资从低到高', value: 'salary-asc' },
    { label: '心动从高到低', value: 'rating-desc' },
    { label: '心动从低到高', value: 'rating-asc' },
  ]
  return sortOptions
})

function openPicker(type: PickerType) {
  pickerType.value = type
  if (type === 'status') pickerTemp.value = status.value
  else if (type === 'source') pickerTemp.value = sourcePlatform.value
  else pickerTemp.value = `${sortBy.value}-${sortOrder.value}`
  pickerVisible.value = true
}

function closePicker() {
  pickerVisible.value = false
}

function confirmPicker() {
  if (pickerType.value === 'status') {
    status.value = pickerTemp.value
  } else if (pickerType.value === 'source') {
    sourcePlatform.value = pickerTemp.value
  } else {
    const [by, order] = pickerTemp.value.split('-')
    sortBy.value = by
    sortOrder.value = order
  }
  pickerVisible.value = false
  fetchList()
}

// ── 请求 ──
async function fetchList() {
  loading.value = true
  try {
    const res = await getJobList({
      keyword: keyword.value,
      status: status.value,
      sourcePlatform: sourcePlatform.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
    })
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

// 从表单页返回时刷新（跳过首次 onLoad 后的 onShow）
onShow(() => {
  if (initialLoaded) {
    fetchList()
  }
})

// ── 左滑交互 ──
const swipedId = ref('')
let touchStartX = 0
let touchStartY = 0
const SWIPE_THRESHOLD = 60

function onTouchStart(e: TouchEvent, id: string, _index: number) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

function onTouchMove(e: TouchEvent, id: string, _index: number) {
  const deltaX = e.touches[0].clientX - touchStartX
  const deltaY = e.touches[0].clientY - touchStartY

  // 水平滑动且超过阈值
  if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < -SWIPE_THRESHOLD) {
    swipedId.value = id
  } else if (deltaX > SWIPE_THRESHOLD) {
    swipedId.value = ''
  }
}

function onTouchEnd(_e: TouchEvent, id: string) {
  // 复用 move 中设置的 swipedId
}

// ── 操作 ──
function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/job/detail?id=${id}` })
}

function goForm(id?: string) {
  const url = id ? `/pages/job/form?id=${id}` : '/pages/job/form'
  uni.navigateTo({ url })
}

function handleEdit(id: string) {
  swipedId.value = ''
  goForm(id)
}

// ── 快速修改状态 ──
const statusPickerVisible = ref(false)
const statusPickerTemp = ref('')
let statusTarget: JobPosition | null = null
const allStatusOptions = JOB_STATUS_OPTIONS as readonly string[]

function openStatusPicker(item: JobPosition) {
  statusTarget = item
  statusPickerTemp.value = item.status
  statusPickerVisible.value = true
}

function closeStatusPicker() {
  statusPickerVisible.value = false
  statusTarget = null
}

async function confirmStatusPicker() {
  if (!statusTarget || statusPickerTemp.value === statusTarget.status) {
    statusPickerVisible.value = false
    return
  }
  try {
    await patchJobStatus(statusTarget.id, statusPickerTemp.value)
    statusPickerVisible.value = false
    statusTarget = null
    fetchList()
  } catch { /* 拦截器已 toast */ }
}

async function handleDelete(id: string) {
  swipedId.value = ''
  const modalRes = await uni.showModal({
    title: '确认删除',
    content: '确定要删除该岗位吗？此操作不可撤销。',
    confirmColor: '#FF4757',
  })
  if (!modalRes.confirm) return

  try {
    await deleteJob(id)
    uni.showToast({ title: '已删除', icon: 'success' })
    fetchList()
  } catch {
    // 拦截器已 toast
  }
}

// ── 工具 ──
/** 根据状态返回对应样式类名 */
function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    '待投递': 'status-gray',
    '已投递': 'status-blue',
    '待面试': 'status-yellow',
    '面试中': 'status-yellow',
    '面试结果待反馈': 'status-yellow',
    '面试通过': 'status-green',
    '面试失败': 'status-red',
    '已归档': 'status-gray',
  }
  return map[status] || ''
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
  margin-bottom: 16rpx;
  height: 72rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}
.search-icon { font-size: 28rpx; margin-right: 12rpx; }
.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #1A1A2E;
  height: 72rpx;
}
.search-clear {
  font-size: 28rpx;
  color: #C0C0C0;
  padding: 8rpx;
}

/* ── 筛选栏 ── */
.filter-bar {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
  position: sticky;
  top: 88rpx;
  z-index: 9;
}
.filter-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12rpx;
  padding: 12rpx 18rpx;
  font-size: 24rpx;
  color: #1A1A2E;
}
.filter-arrow {
  font-size: 20rpx;
  color: #8E8E93;
  margin-left: 6rpx;
}

/* ── 状态提示 ── */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0;
}
.state-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.state-text { font-size: 30rpx; color: #1A1A2E; font-weight: 500; }
.state-desc { font-size: 26rpx; color: #8E8E93; margin-top: 12rpx; }

/* ── 左滑容器 ── */
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
.job-card {
  position: relative;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  transition: transform 0.2s ease;
  z-index: 1;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}
.card-jobname {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A2E;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-rating { flex-shrink: 0; margin-left: 8rpx; }
.star { font-size: 22rpx; }

.card-company {
  display: block;
  font-size: 24rpx;
  color: #8E8E93;
  margin-bottom: 12rpx;
}

.card-bottom {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.card-salary {
  color: #0cb5b2;
  font-weight: 600;
}
.salary-icon { font-size: 22rpx; }
.salary-num { font-size: 32rpx; margin: 0 5rpx; }
.salary-unit { font-size: 22rpx; }
.card-status {
  font-size: 22rpx;
  color: #fff;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  white-space: nowrap;
  margin-left: auto;
}
/* 状态颜色 */
.status-gray { background: #8E8E93; }
.status-blue { background: #4A90D9; }
.status-yellow { background: #F5A623; }
.status-green { background: #27AE60; }
.status-red { background: #FF4757; }

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
.fab-icon {
  font-size: 36rpx;
  color: #fff;
  font-weight: 300;
  line-height: 0;
  margin-top: -2rpx;
}

/* ── Picker 弹层 ── */
.picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}
.picker-sheet {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
}
.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #F0F0F0;
}
.picker-cancel { font-size: 28rpx; color: #8E8E93; }
.picker-title { font-size: 30rpx; font-weight: 600; color: #1A1A2E; }
.picker-confirm { font-size: 28rpx; color: #0cb5b2; font-weight: 600; }
.picker-body { overflow-y: auto; padding: 16rpx 0; }
.picker-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 40rpx;
  font-size: 28rpx;
  color: #1A1A2E;
}
.picker-option.selected { color: #0cb5b2; font-weight: 600; }
.check { font-size: 32rpx; }
</style>
