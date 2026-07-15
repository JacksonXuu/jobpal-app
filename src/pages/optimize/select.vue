<template>
  <DesktopLayout v-if="appStore.isDesktop" active="optimize" @navigate="onSidebarNav">
    <view class="select-page select-desktop">
    <!-- 选择简历 -->
    <view class="picker-trigger" @tap="openPicker('resume')">
      <text class="iconfont icon-a-jianli trigger-icon" />
      <text class="trigger-label" :class="{ placeholder: !selectedResume }">
        {{ selectedResume ? selectedResume.title : '点击选择简历' }}
      </text>
      <text class="trigger-arrow">▾</text>
    </view>

    <!-- 选择岗位 -->
    <view class="picker-trigger" @tap="openPicker('job')">
      <text class="iconfont icon-a-gangwei trigger-icon" />
      <text class="trigger-label" :class="{ placeholder: !selectedJob }">
        {{ selectedJob ? `${selectedJob.companyName}（${selectedJob.jobName}） · ${selectedJob.salary}k` : '点击选择心动岗位' }}
      </text>
      <text class="trigger-arrow">▾</text>
    </view>

    <!-- 立即优化 -->
    <button
      class="optimize-btn"
      @tap="startOptimize"
    >
      立即优化
    </button>

    <!-- 优化历史 -->
    <view class="history-section">
      <view class="history-header">
        <text class="section-title">优化历史</text>
        <view class="history-actions">
          <text class="batch-toggle" @tap="toggleBatchMode">
            {{ batchMode ? '取消' : '批量删除' }}
          </text>
        </view>
      </view>
      <scroll-view class="history-list" scroll-y>
        <view v-if="filteredHistory.length === 0" class="empty-tip">暂无匹配记录</view>
        <view v-for="h in filteredHistory" :key="h.id" class="history-card" :class="{ 'batch-selected': selectedIds.includes(h.id) }" @tap="batchMode ? toggleSelect(h.id) : null">
          <view v-if="batchMode" class="hc-checkbox" @tap.stop="toggleSelect(h.id)">
            <text>{{ selectedIds.includes(h.id) ? '☑' : '☐' }}</text>
          </view>
          <view class="hc-names">
            <text class="hc-resume">{{ h.resume?.title }}</text>
            <text class="iconfont icon-lianjie hc-x" />
            <text class="hc-job">{{ h.jobPosition?.companyName }}<text class="hc-job-sub">（{{ h.jobPosition?.jobName }}）</text></text>
            <text class="hc-x">=</text>
            <text class="hc-result-btn" @tap="generatingIds.has(h.id) ? onGeneratingClick() : (batchMode ? null : goResult(h.id))">
              <view v-if="generatingIds.has(h.id)" class="spinner-dot" />
              <text v-else class="iconfont icon-a-jianliyouhua hc-result-icon" />
            </text>
          </view>
        </view>
      </scroll-view>

      <!-- 批量操作栏 -->
      <view v-if="batchMode" class="batch-bar">
        <text class="batch-select-all" @tap="toggleSelectAll">
          {{ isAllSelected ? '☑' : '☐' }} 全选
        </text>
        <text class="batch-delete" :class="{ disabled: selectedIds.length === 0 }" @tap="handleBatchDelete">
          删除 ({{ selectedIds.length }})
        </text>
      </view>
    </view>

    <!-- 选择器弹层 -->
    <view v-if="pickerVisible" class="picker-overlay" @tap="closePicker">
      <view class="picker-sheet" @tap.stop="">
        <view class="picker-header">
          <text class="picker-cancel" @tap="closePicker">取消</text>
          <text class="picker-title">{{ pickerType === 'resume' ? '选择简历' : '选择岗位' }}</text>
          <text class="picker-done" @tap="closePicker">完成</text>
        </view>
        <view class="picker-search">
          <text class="iconfont icon-sousuotubiao search-icon" />
          <input
            class="search-input"
            v-model="pickerKeyword"
            placeholder="搜索..."
            @input="onPickerSearch"
          />
        </view>
        <scroll-view class="picker-list" scroll-y>
          <view v-if="filteredPickerItems.length === 0" class="picker-empty">无匹配结果</view>
          <view
            v-for="item in filteredPickerItems"
            :key="item.id"
            class="picker-item"
            :class="{ selected: pickerType === 'resume' ? selectedResumeId === item.id : selectedJobId === item.id }"
            @tap="selectPickerItem(item)"
          >
            <view class="picker-item-info">
              <text class="picker-item-name">
                <template v-if="pickerType === 'resume'">{{ (item as any).title }}</template>
                <template v-else>{{ (item as any).companyName }}<text class="picker-item-name-sub">（{{ (item as any).jobName }}）</text></template>
              </text>
              <text v-if="pickerType === 'job'" class="picker-item-sub">{{ (item as any).salary }}k</text>
            </view>
            <text
              v-if="pickerType === 'resume' ? selectedResumeId === item.id : selectedJobId === item.id"
              class="picker-check"
            >✓</text>
          </view>
        </scroll-view>
      </view>
    </view>
    </view>
  </DesktopLayout>
  <view v-else class="select-page">
    <view class="picker-trigger" @tap="openPicker('resume')">
      <text class="iconfont icon-a-jianli trigger-icon" />
      <text class="trigger-label" :class="{ placeholder: !selectedResume }">{{ selectedResume ? selectedResume.title : '点击选择简历' }}</text>
      <text class="trigger-arrow">▾</text>
    </view>
    <view class="picker-trigger" @tap="openPicker('job')">
      <text class="iconfont icon-a-gangwei trigger-icon" />
      <text class="trigger-label" :class="{ placeholder: !selectedJob }">{{ selectedJob ? `${selectedJob.companyName}（${selectedJob.jobName}） · ${selectedJob.salary}k` : '点击选择心动岗位' }}</text>
      <text class="trigger-arrow">▾</text>
    </view>
    <button class="optimize-btn" @tap="startOptimize">立即优化</button>
    <view class="history-section">
      <view class="history-header">
        <text class="section-title">优化历史</text>
        <view class="history-actions"><text class="batch-toggle" @tap="toggleBatchMode">{{ batchMode ? '取消' : '批量删除' }}</text></view>
      </view>
      <scroll-view class="history-list" scroll-y>
        <view v-if="filteredHistory.length === 0" class="empty-tip">暂无匹配记录</view>
        <view v-for="h in filteredHistory" :key="h.id" class="history-card" :class="{ 'batch-selected': selectedIds.includes(h.id) }" @tap="batchMode ? toggleSelect(h.id) : null">
          <view v-if="batchMode" class="hc-checkbox" @tap.stop="toggleSelect(h.id)"><text>{{ selectedIds.includes(h.id) ? '☑' : '☐' }}</text></view>
          <view class="hc-names">
            <text class="hc-resume">{{ h.resume?.title }}</text>
            <text class="iconfont icon-lianjie hc-x" />
            <text class="hc-job">{{ h.jobPosition?.companyName }}<text class="hc-job-sub">（{{ h.jobPosition?.jobName }}）</text></text>
            <text class="hc-x">=</text>
            <text class="hc-result-btn" @tap="generatingIds.has(h.id) ? onGeneratingClick() : (batchMode ? null : goResult(h.id))">
              <view v-if="generatingIds.has(h.id)" class="spinner-dot" />
              <text v-else class="iconfont icon-a-jianliyouhua hc-result-icon" />
            </text>
          </view>
        </view>
      </scroll-view>
      <view v-if="batchMode" class="batch-bar">
        <text class="batch-select-all" @tap="toggleSelectAll">{{ isAllSelected ? '☑' : '☐' }} 全选</text>
        <text class="batch-delete" :class="{ disabled: selectedIds.length === 0 }" @tap="handleBatchDelete">删除 ({{ selectedIds.length }})</text>
      </view>
    </view>
  </view>
  <view v-if="pickerVisible" class="picker-overlay" @tap="closePicker">
    <view class="picker-sheet" @tap.stop="">
      <view class="picker-header"><text class="picker-cancel" @tap="closePicker">取消</text><text class="picker-title">{{ pickerType === 'resume' ? '选择简历' : '选择岗位' }}</text><text class="picker-done" @tap="closePicker">完成</text></view>
      <view class="picker-search"><text class="iconfont icon-sousuotubiao search-icon" /><input class="search-input" v-model="pickerKeyword" placeholder="搜索..." @input="onPickerSearch" /></view>
      <scroll-view class="picker-list" scroll-y>
        <view v-if="filteredPickerItems.length === 0" class="picker-empty">无匹配结果</view>
        <view v-for="item in filteredPickerItems" :key="item.id" class="picker-item" :class="{ selected: pickerType === 'resume' ? selectedResumeId === item.id : selectedJobId === item.id }" @tap="selectPickerItem(item)">
          <view class="picker-item-info"><text class="picker-item-name"><template v-if="pickerType === 'resume'">{{ (item as any).title }}</template><template v-else>{{ (item as any).companyName }}<text class="picker-item-name-sub">（{{ (item as any).jobName }}）</text></template></text><text v-if="pickerType === 'job'" class="picker-item-sub">{{ (item as any).salary }}k</text></view>
          <text v-if="pickerType === 'resume' ? selectedResumeId === item.id : selectedJobId === item.id" class="picker-check">✓</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import DesktopLayout from '@/components/DesktopLayout.vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getResumeList, type Resume } from '@/apis/resume'
import { getJobList, type JobPosition } from '@/apis/job'
import { getOptimizeHistory, deleteOptimizeBatch, requestOptimize, getOptimizeDetail, type OptimizeHistoryItem } from '@/apis/optimize'
import { useTracking } from '@/composables/useTracking'
import { BRAND_PRIMARY } from '@/utils/theme'

const appStore = useAppStore()

function onSidebarNav(page: string) { if (page === 'ask') uni.switchTab({ url: '/pages/ask/index' }); else if (page === 'home') uni.switchTab({ url: '/pages/home' }) }

const { trackAction } = useTracking({ module: 'optimize' })

// ── 选择 ──
const selectedResumeId = ref('')
const selectedJobId = ref('')
const selectedResume = computed(() => resumes.value.find((r) => r.id === selectedResumeId.value))
const selectedJob = computed(() => (jobs.value as JobPosition[]).find((j) => j.id === selectedJobId.value))

// ── 数据 ──
const resumes = ref<Resume[]>([])
const jobs = ref<JobPosition[]>([])
const history = ref<OptimizeHistoryItem[]>([])

async function fetchData() {
  try {
    const [r, j, h] = await Promise.all([
      getResumeList(),
      getJobList(),
      getOptimizeHistory(),
    ])
    resumes.value = r.list
    jobs.value = j.list
    history.value = h.list
  } catch { /* 拦截器已 toast */ }
}

onLoad((options?: Record<string, string>) => {
  fetchData()
  if (options?.autoResumeId && options?.autoJobId) {
    selectedResumeId.value = options.autoResumeId
    selectedJobId.value = options.autoJobId
    // 等数据加载完再触发优化
    setTimeout(() => {
      if (selectedResume.value && selectedJob.value) {
        startOptimize()
      }
    }, 500)
  }
})
onShow(() => fetchData())

// ── Picker ──
const pickerVisible = ref(false)
const pickerType = ref<'resume' | 'job'>('resume')
const pickerKeyword = ref('')

interface PickerItem { id: string; title?: string; jobName?: string; companyName?: string; salary?: number }

const filteredPickerItems = computed(() => {
  if (pickerType.value === 'resume') {
    return filterResumes(resumes.value, pickerKeyword.value)
  }
  return filterJobs(jobs.value, pickerKeyword.value)
})

function filterResumes(list: Resume[], kw: string): Resume[] {
  if (!kw) return list
  const lower = kw.toLowerCase()
  return list.filter((r) => r.title.toLowerCase().includes(lower))
}

function filterJobs(list: JobPosition[], kw: string): JobPosition[] {
  if (!kw) return list
  const lower = kw.toLowerCase()
  return list.filter((j) => j.jobName.toLowerCase().includes(lower) || j.companyName.toLowerCase().includes(lower))
}

// ── 历史搜索 ──
const historyKeyword = ref('')

const filteredHistory = computed(() => {
  if (!historyKeyword.value) return history.value
  const kw = historyKeyword.value.toLowerCase()
  return history.value.filter(
    (h) =>
      h.resume.title.toLowerCase().includes(kw) ||
      h.jobPosition.jobName.toLowerCase().includes(kw) ||
      h.jobPosition.companyName.toLowerCase().includes(kw),
  )
})

function openPicker(type: 'resume' | 'job') {
  pickerType.value = type
  pickerKeyword.value = ''
  pickerVisible.value = true
}

function closePicker() {
  pickerVisible.value = false
}

function onPickerSearch() { /* computed reacts automatically */ }

function selectPickerItem(item: PickerItem) {
  if (pickerType.value === 'resume') {
    trackAction('select_resume')
    selectedResumeId.value = item.id
  } else {
    trackAction('select_job')
    selectedJobId.value = item.id
  }
  closePicker()
}

// ── 操作 ──
const generatingIds = ref(new Set<string>())

async function startOptimize() {
  if (!selectedResumeId.value) { uni.showToast({ title: '请先选择简历', icon: 'none' }); return }
  if (!selectedJobId.value) { uni.showToast({ title: '请先选择岗位', icon: 'none' }); return }
  trackAction('start_optimize')
  const resume = selectedResume.value!
  const job = selectedJob.value!
  try {
    const { recordId } = await requestOptimize(selectedResumeId.value, selectedJobId.value)
    const id = recordId
    generatingIds.value.add(id)
    generatingIds.value = new Set(generatingIds.value)
    // 插入占位记录到列表顶部
    const placeholder: OptimizeHistoryItem = {
      id,
      resumeId: selectedResumeId.value,
      jobPositionId: selectedJobId.value,
      resume: { title: resume.title },
      jobPosition: { jobName: job.jobName, companyName: job.companyName },
      tokensUsed: null,
      createdAt: new Date().toISOString(),
    }
    history.value.unshift(placeholder)

    // 轮询直到完成
    const poll = async () => {
      try {
        const detail = await getOptimizeDetail(id)
        if (detail.optimizedText) {
          generatingIds.value.delete(id)
          generatingIds.value = new Set(generatingIds.value)
          fetchData()
        } else {
          setTimeout(poll, 2000)
        }
      } catch { generatingIds.value.delete(id); generatingIds.value = new Set(generatingIds.value) }
    }
    poll()
  } catch { /* 拦截器已 toast */ }
}

// ── 批量删除 ──
const batchMode = ref(false)
const selectedIds = ref<string[]>([])

const isAllSelected = computed(() => {
  return filteredHistory.value.length > 0 && selectedIds.value.length === filteredHistory.value.length
})

function toggleBatchMode() {
  batchMode.value = !batchMode.value
  selectedIds.value = []
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
    selectedIds.value = filteredHistory.value.map((h) => h.id)
  }
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) return
  const res = await uni.showModal({
    title: '批量删除',
    content: `确定要删除 ${selectedIds.value.length} 条记录吗？`,
    confirmColor: BRAND_PRIMARY,
  })
  if (!res.confirm) return
  try {
    trackAction('batch_delete_history')
    await deleteOptimizeBatch(selectedIds.value)
    uni.showToast({ title: `已删除 ${selectedIds.value.length} 条`, icon: 'success' })
    batchMode.value = false
    selectedIds.value = []
    fetchData()
  } catch { /* 拦截器已 toast */ }
}

function goResult(id: string) {
  trackAction('view_result')
  uni.navigateTo({ url: `/pages/optimize/result?id=${id}` })
}

function onGeneratingClick() {
  uni.showToast({ title: '简历优化生成中，请稍后查看', icon: 'none' })
}


</script>

<style scoped>
.select-page {
  background: transparent;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 24rpx 24rpx 0;
}
.select-desktop {
  padding: 24rpx 32rpx;
  height: auto;
  display: flex;
  flex-direction: column;
}

/* ── 下拉触发器 ── */
.picker-trigger {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.trigger-icon { font-size: 32rpx; margin-right: 16rpx; flex-shrink: 0; color: var(--text-secondary); }
.trigger-label {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.trigger-label.placeholder { color: var(--text-secondary); }
.trigger-arrow { font-size: 24rpx; color: var(--text-secondary); flex-shrink: 0; margin-left: 8rpx; }

/* ── 按钮 ── */
.optimize-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: #3ddec5;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 48rpx;
  border: none;
  margin: 8rpx 0 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(12,181,178,0.3);
}
.optimize-btn::after { border: none; }

/* 桌面端按钮 */
.select-desktop .optimize-btn {
  width: auto;
  height: 32px;
  line-height: 32px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  box-shadow: none;
  margin: 16px 0 16px auto;
  cursor: pointer;
  transition: background 0.2s;

  &:hover { background: #80ede0; }
}

/* ── 历史 ── */
.history-section {
  margin-top: 8rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.history-search {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 10rpx;
  padding: 8rpx 16rpx;
}
.hs-icon { font-size: 24rpx; margin-right: 6rpx; }
.hs-input { font-size: 24rpx; color: var(--text-primary); width: 160rpx; }
.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-primary);
}
.history-list {
  flex: 1;
  min-height: 0;
}
.empty-tip { padding: 32rpx; text-align: center; font-size: 26rpx; color: var(--text-secondary); }

.history-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 14rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 10rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
}
.hc-names {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10rpx;
  overflow: hidden;
}
.hc-resume {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: var(--text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hc-x { font-size: 22rpx; color: var(--text-secondary); flex-shrink: 0; }
.icon-lianjie.hc-x { font-size: 45rpx; }
.hc-job {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: var(--text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hc-job-sub { font-size: 22rpx; font-weight: 400; color: var(--text-secondary); }
.hc-result-btn {
  flex-shrink: 0;
}
.hc-result-icon {
  font-size: 32rpx;
  color: var(--brand-primary);
}
.spinner-dot {
  width: 24rpx;
  height: 24rpx;
  border: 4rpx solid #E0E0E0;
  border-top-color: #f0ad4e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  vertical-align: middle;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 批量模式 */
.history-actions { display: flex; align-items: center; }
.batch-toggle {
  font-size: 24rpx;
  color: var(--brand-primary);
  font-weight: 500;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  background: var(--brand-light);
}
.hc-checkbox {
  font-size: 36rpx;
  color: var(--brand-primary);
  margin-right: 12rpx;
  flex-shrink: 0;
}
.history-card.batch-selected {
  background: #f8fffe;
  border: 2rpx solid var(--brand-primary);
}
.batch-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #fff;
  border-top: 1rpx solid var(--divider);
  flex-shrink: 0;
}
.batch-select-all { font-size: 26rpx; color: var(--text-primary); }
.batch-delete {
  font-size: 26rpx;
  color: #FF4757;
  font-weight: 600;
}
.batch-delete.disabled { color: var(--text-secondary); }

/* ── Picker 弹层 ── */
.picker-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}
.picker-sheet {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  height: 60vh;
  display: flex;
  flex-direction: column;
}
.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid var(--divider);
  flex-shrink: 0;
}
.picker-cancel { font-size: 28rpx; color: var(--text-secondary); }
.picker-title { font-size: 30rpx; font-weight: 600; color: var(--text-primary); }
.picker-done { font-size: 28rpx; color: var(--brand-primary); font-weight: 600; }

.picker-search {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  border-bottom: 1rpx solid var(--divider);
  flex-shrink: 0;
}
.search-icon { font-size: 28rpx; margin-right: 12rpx; }
.search-input { flex: 1; font-size: 28rpx; color: var(--text-primary); }

.picker-list { flex: 1; }
.picker-empty { text-align: center; padding: 60rpx 0; font-size: 26rpx; color: var(--text-secondary); }

.picker-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #F8F8F8;
}
.picker-item.selected { background: #f8fffe; }
.picker-item-info { flex: 1; }
.picker-item-name { font-size: 28rpx; color: var(--text-primary); font-weight: 500; display: block; }
.picker-item-name-sub { font-size: 24rpx; font-weight: 400; color: var(--text-secondary); }
.picker-item-sub { font-size: 22rpx; color: var(--text-secondary); margin-top: 4rpx; display: block; }
.picker-check { font-size: 28rpx; color: var(--brand-primary); font-weight: 700; flex-shrink: 0; }
</style>
