<template>
  <view class="list-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <text class="iconfont icon-sousuotubiao search-icon" />
      <input
        class="search-input"
        v-model="keyword"
        placeholder="搜索岗位或公司"
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
      <text class="batch-toggle" @tap="toggleBatchMode">{{ batchMode ? '取消' : '批量删除' }}</text>
    </view>

    <!-- 列表 -->
    <view v-if="loading" class="state-box">
      <text class="state-text">加载中...</text>
    </view>

    <view v-else-if="list.length === 0" class="state-box">
      <text class="iconfont icon-a-gangwei state-icon" />
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
          :class="{ 'swiped': swipedId === item.id, 'batch-selected': selectedIds.includes(item.id) }"
          :style="{ transform: swipedId === item.id ? 'translateX(-160rpx)' : 'translateX(0)' }"
          @touchstart="onTouchStart($event, item.id, index)"
          @touchmove="onTouchMove($event, item.id, index)"
          @touchend="onTouchEnd($event, item.id)"
          @tap="batchMode ? toggleSelect(item.id) : goDetail(item.id)"
        >
          <view v-if="batchMode" class="card-checkbox" @tap.stop="toggleSelect(item.id)">
            <text>{{ selectedIds.includes(item.id) ? '☑' : '☐' }}</text>
          </view>
          <view class="card-inner">
            <view class="card-top">
              <text class="card-jobname">{{ item.companyName }}<text class="card-jobname-sub">（{{ item.jobName }}）</text></text>
              <view class="card-rating" @tap.stop="">
                <UniRate :value="item.rating" :max="5" readonly :size="16" />
              </view>
            </view>
            <view class="card-bottom">
              <text class="card-salary"><text class="salary-num">{{ item.salary }}</text><text class="salary-unit">k</text></text>
              <view class="card-status" @tap.stop="openStatusPicker(item)"><UniTag :text="item.status" :type="getTagType(item.status)" size="mini" /></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 批量操作栏 -->
    <view v-if="batchMode" class="batch-bar">
      <text class="batch-select-all" @tap="toggleSelectAll">
        {{ isAllSelected ? '☑' : '☐' }} 全选
      </text>
      <text class="batch-delete" :class="{ disabled: selectedIds.length === 0 }" @tap="handleBatchDelete">
        删除 ({{ selectedIds.length }})
      </text>
    </view>

    <!-- FAB -->
    <view v-if="!batchMode" class="fab" @tap="goForm()">
      <text class="iconfont icon-add fab-icon" />
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
import UniRate from '@dcloudio/uni-ui/lib/uni-rate/uni-rate.vue'
import UniTag from '@dcloudio/uni-ui/lib/uni-tag/uni-tag.vue'
import {
  getJobList,
  deleteJob,
  deleteJobsBatch,
  patchJobStatus,
  JOB_STATUS_OPTIONS,
  SOURCE_PLATFORM_OPTIONS,
  SORT_BY_OPTIONS,
  type JobPosition,
} from '@/apis/job'
import { BRAND_PRIMARY } from '@/utils/theme'

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
    trackAction('search')
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

import { useTracking } from '@/composables/useTracking'

const { trackAction } = useTracking({ module: 'job' })

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
  if (batchMode.value) return
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
  trackAction('view_detail')
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
    trackAction('change_status')
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
    confirmColor: BRAND_PRIMARY,
  })
  if (!modalRes.confirm) return

  try {
    trackAction('delete')
    await deleteJob(id)
    uni.showToast({ title: '已删除', icon: 'success' })
    fetchList()
  } catch {
    // 拦截器已 toast
  }
}

// ── 批量删除 ──
const batchMode = ref(false)
const selectedIds = ref<string[]>([])

const isAllSelected = computed(() => {
  return list.value.length > 0 && selectedIds.value.length === list.value.length
})

function toggleBatchMode() {
  batchMode.value = !batchMode.value
  selectedIds.value = []
  swipedId.value = ''
}

function toggleSelect(id: string) {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = list.value.map((item) => item.id)
  }
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) return
  const res = await uni.showModal({
    title: '批量删除',
    content: `确定要删除 ${selectedIds.value.length} 个岗位吗？`,
    confirmColor: BRAND_PRIMARY,
  })
  if (!res.confirm) return
  try {
    trackAction('batch_delete')
    await deleteJobsBatch(selectedIds.value)
    uni.showToast({ title: `已删除 ${selectedIds.value.length} 个`, icon: 'success' })
    batchMode.value = false
    selectedIds.value = []
    fetchList()
  } catch { /* 拦截器已 toast */ }
}

// ── 工具 ──
/** 将状态映射为 UniTag type */
function getTagType(status: string): string {
  const map: Record<string, string> = {
    '待投递': 'default',
    '已投递': 'primary',
    '待面试': 'warning',
    '面试中': 'warning',
    '面试结果待反馈': 'warning',
    '面试通过': 'success',
    '面试失败': 'error',
    '已归档': 'default',
  }
  return map[status] || 'default'
}
</script>

<style scoped>
.list-page {
  background: transparent;
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
  color: var(--text-primary);
  height: 72rpx;
}
.search-clear {
  font-size: 28rpx;
  color: var(--text-secondary);
  padding: 8rpx;
}

/* ── 筛选栏 ── */
.filter-bar {
  display: flex;
  align-items: center;
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
  color: var(--text-primary);
}
.filter-arrow {
  font-size: 20rpx;
  color: var(--text-secondary);
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
.state-text { font-size: 30rpx; color: var(--text-primary); font-weight: 500; }
.state-desc { font-size: 26rpx; color: var(--text-secondary); margin-top: 12rpx; }

/* ── 左滑容器 ── */
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

.swipe-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 500;
}
.edit-btn { color: var(--brand-primary); }
.delete-btn { color: #FF4757; position: relative; }
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
.job-card {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 16rpx;
  box-sizing: border-box;
  overflow: hidden;
  padding: 32rpx 24rpx;
  transition: transform 0.2s ease;
  z-index: 1;
  display: flex;
  align-items: center;
}
.job-card.batch-selected {
  background: #f8fffe;
  border: 2rpx solid var(--brand-primary);
}
.card-checkbox {
  font-size: 36rpx;
  color: var(--brand-primary);
  margin-right: 12rpx;
  flex-shrink: 0;
}
.card-inner {
  flex: 1;
  min-width: 0;
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
  color: var(--text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-jobname-sub {
  font-size: 24rpx;
  font-weight: 400;
  color: var(--text-secondary);
}
.card-rating { flex-shrink: 0; margin-left: 8rpx; }

.card-company {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: 12rpx;
}

.card-bottom {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.card-salary {
  color: var(--brand-primary);
  font-weight: 600;
}
.salary-icon { font-size: 22rpx; }
.salary-num { font-size: 36rpx; margin: 0 5rpx; font-weight: 700; }
.salary-unit { font-size: 22rpx; }
.card-status {
  margin-left: auto;
}

/* ── 批量操作 ── */
.batch-toggle {
  font-size: 24rpx;
  color: var(--brand-primary);
  font-weight: 500;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  background: var(--brand-light);
  margin-left: auto;
}

.batch-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #fff;
  border-top: 1rpx solid var(--divider);
  z-index: 100;
}
.batch-select-all {
  font-size: 26rpx;
  color: var(--text-primary);
}
.batch-delete {
  font-size: 26rpx;
  color: #FF4757;
  font-weight: 600;
}
.batch-delete.disabled {
  color: var(--text-secondary);
}

/* ── FAB ── */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 72rpx;
  height: 72rpx;
  background: #3ddec5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx  rgba(8, 201, 176, 0.4);
  z-index: 100;
}
.fab-icon {
  font-size: 32rpx;
  color: #fff;
  font-weight: 400;
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
  border-bottom: 1rpx solid var(--divider);
}
.picker-cancel { font-size: 28rpx; color: var(--text-secondary); }
.picker-title { font-size: 30rpx; font-weight: 600; color: var(--text-primary); }
.picker-confirm { font-size: 28rpx; color: var(--brand-primary); font-weight: 600; }
.picker-body { overflow-y: auto; padding: 16rpx 0; }
.picker-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 40rpx;
  font-size: 28rpx;
  color: var(--text-primary);
}
.picker-option.selected { color: var(--brand-primary); font-weight: 600; }
.check { font-size: 32rpx; }
</style>
