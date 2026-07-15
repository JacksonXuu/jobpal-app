<template>
  <!-- 桌面端壳 -->
  <DesktopLayout v-if="appStore.isDesktop" active="interview" @navigate="onSidebarNav">
    <view class="list-page list-desktop">
      <view class="dt-top-bar">
        <view class="dt-filter-bar">
          <view class="filter-item" @click="openPicker"><text>{{ statusLabel }}</text><text class="filter-arrow">▾</text></view>
        </view>
        <view class="dt-search-bar">
          <text class="iconfont icon-sousuotubiao search-icon" />
          <input class="search-input" v-model="keyword" placeholder="搜索岗位或公司" @input="onSearchInput" />
          <text v-if="keyword" class="search-clear" @tap="clearSearch">✕</text>
        </view>
      </view>
      <view v-if="loading" class="state-box"><text class="state-text">加载中...</text></view>
      <view v-else-if="list.length === 0" class="state-box">
        <text class="iconfont icon-lianxi2hebing_jilu state-icon" />
        <text class="state-text">暂无面试记录</text>
        <text class="state-desc">将心动岗位状态改为面试流程即可在此查看</text>
      </view>
      <view v-else class="grouped-list">
        <view v-for="group in groupedList" :key="group.status" class="status-group">
          <view class="group-header">
            <text class="group-title">{{ group.status }}</text>
            <text class="group-count">{{ group.items.length }}</text>
          </view>
          <view v-for="item in group.items" :key="item.id" class="interview-card" @tap="goDetail(item.id)">
            <text class="card-jobname">{{ item.companyName }}<text class="card-jobname-sub">（{{ item.jobName }}）</text></text>
            <view class="card-rating" @tap.stop=""><UniRate :value="item.rating" :max="5" readonly :size="14" /></view>
            <text class="card-salary"><text class="salary-num">{{ item.salary }}</text><text class="salary-unit">k</text></text>
            <button class="card-action-remark" size="mini" @tap.stop="openRemark(item)">备注</button>
            <text v-if="item.remark" class="card-remark">{{ item.remark }}</text>
          </view>
        </view>
      </view>
    </view>
  </DesktopLayout>

  <!-- 手机端 -->
  <view v-else class="list-page">
    <view class="search-bar">
      <text class="iconfont icon-sousuotubiao search-icon" />
      <input class="search-input" v-model="keyword" placeholder="搜索岗位或公司" @input="onSearchInput" />
      <text v-if="keyword" class="search-clear" @tap="clearSearch">✕</text>
    </view>
    <view class="filter-bar">
      <view class="filter-item" @tap="openPicker"><text>{{ statusLabel }}</text><text class="filter-arrow">▾</text></view>
    </view>
    <view v-if="loading" class="state-box"><text class="state-text">加载中...</text></view>
    <view v-else-if="list.length === 0" class="state-box">
      <text class="iconfont icon-lianxi2hebing_jilu state-icon" />
      <text class="state-text">暂无面试记录</text>
      <text class="state-desc">将心动岗位状态改为面试流程即可在此查看</text>
    </view>
    <view v-else class="grouped-list">
      <view v-for="group in groupedList" :key="group.status" class="status-group">
        <view class="group-header"><text class="group-title">{{ group.status }}</text><text class="group-count">{{ group.items.length }}</text></view>
        <view v-for="(item, index) in group.items" :key="item.id" class="swipe-wrapper">
          <view class="swipe-actions"><view class="swipe-btn remark-swipe-btn" @tap.stop="openRemark(item)">备注</view></view>
          <view class="interview-card" :class="{ 'swiped': swipedId === item.id }" :style="{ transform: swipedId === item.id ? 'translateX(-80rpx)' : 'translateX(0)' }" @touchstart="onTouchStart($event, item.id, index)" @touchmove="onTouchMove($event, item.id, index)" @touchend="onTouchEnd($event, item.id)" @tap="goDetail(item.id)">
            <view class="card-top"><text class="card-jobname">{{ item.companyName }}<text class="card-jobname-sub">（{{ item.jobName }}）</text></text><view class="card-rating" @tap.stop=""><UniRate :value="item.rating" :max="5" readonly :size="16" /></view></view>
            <view class="card-bottom"><text class="card-salary"><text class="salary-num">{{ item.salary }}</text><text class="salary-unit">k</text></text></view>
            <text v-if="item.remark" class="card-remark"><text class="iconfont icon-lianxi2hebing_jilu remark-icon" />{{ item.remark }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>

  <!-- 共享弹窗 -->
  <view v-if="remarkVisible" class="picker-overlay" @tap="closeRemark">
    <view class="remark-sheet" @tap.stop="">
      <view class="remark-header"><text class="remark-cancel" @tap="closeRemark">取消</text><text class="remark-title">编辑备注</text><text class="remark-confirm" @tap="saveRemark">保存</text></view>
      <textarea class="remark-textarea" v-model="remarkText" placeholder="输入面试备注..." maxlength="500" />
    </view>
  </view>
  <view v-if="pickerVisible" class="picker-overlay" @tap="closePicker">
    <view class="picker-sheet" @tap.stop="">
      <view class="picker-header"><text class="picker-cancel" @tap="closePicker">取消</text><text class="picker-title">面试状态</text><text class="picker-confirm" @tap="confirmPicker">确定</text></view>
      <view class="picker-body"><view v-for="opt in statusOptions" :key="opt.value" class="picker-option" :class="{ selected: pickerTemp === opt.value }" @tap="pickerTemp = opt.value"><text>{{ opt.label }}</text><text v-if="pickerTemp === opt.value" class="check">✓</text></view></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useAppStore } from '@/stores/app'
import DesktopLayout from '@/components/DesktopLayout.vue'
import UniRate from '@dcloudio/uni-ui/lib/uni-rate/uni-rate.vue'
import { getInterviewList, updateRemark, INTERVIEW_STATUS_OPTIONS, type JobPosition } from '@/apis/job'
import { useTracking } from '@/composables/useTracking'

const appStore = useAppStore()

function onSidebarNav(page: string) { if (page === 'ask') uni.switchTab({ url: '/pages/ask/index' }); else if (page === 'home') uni.switchTab({ url: '/pages/home' }) }

const { trackAction } = useTracking({ module: 'interview' })

const list = ref<JobPosition[]>([])
const loading = ref(false)
const keyword = ref('')
const status = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput() { if (searchTimer) clearTimeout(searchTimer); searchTimer = setTimeout(() => { trackAction('search'); fetchList() }, 300) }
function clearSearch() { keyword.value = ''; fetchList() }
const statusLabel = computed(() => status.value || '全部面试状态')

async function fetchList() { loading.value = true; try { const res = await getInterviewList({ keyword: keyword.value, status: status.value }); list.value = res.list } catch { } finally { loading.value = false } }

const groupedList = computed(() => {
  const order = INTERVIEW_STATUS_OPTIONS as readonly string[]
  const groups: { status: string; items: JobPosition[] }[] = []
  order.forEach(s => { const items = list.value.filter(item => item.status === s); if (items.length > 0) groups.push({ status: s, items }) })
  return groups
})

let initialLoaded = false
onLoad(() => { fetchList().then(() => { initialLoaded = true }) })
onShow(() => { if (initialLoaded) fetchList() })

const pickerVisible = ref(false); const pickerTemp = ref('')
const statusOptions = [{ label: '全部面试状态', value: '' }, ...INTERVIEW_STATUS_OPTIONS.map(s => ({ label: s, value: s }))]
function openPicker() { pickerTemp.value = status.value; pickerVisible.value = true }
function closePicker() { pickerVisible.value = false }
function confirmPicker() { trackAction('filter_status'); status.value = pickerTemp.value; pickerVisible.value = false; fetchList() }

const remarkVisible = ref(false); const remarkText = ref(''); let remarkTarget: JobPosition | null = null
function openRemark(item: JobPosition) { remarkTarget = item; remarkText.value = item.remark || ''; remarkVisible.value = true }
function closeRemark() { remarkVisible.value = false; remarkTarget = null }
async function saveRemark() { if (!remarkTarget) return; try { await updateRemark(remarkTarget.id, remarkText.value.trim()); remarkVisible.value = false; remarkTarget = null; fetchList() } catch { } }

const swipedId = ref(''); let touchStartX = 0, touchStartY = 0; const SWIPE_THRESHOLD = 60
function onTouchStart(e: TouchEvent, _id: string, _index: number) { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY }
function onTouchMove(e: TouchEvent, id: string, _index: number) { const dx = e.touches[0].clientX - touchStartX; const dy = e.touches[0].clientY - touchStartY; if (Math.abs(dx) > Math.abs(dy) && dx < -SWIPE_THRESHOLD) swipedId.value = id; else if (dx > SWIPE_THRESHOLD) swipedId.value = '' }
function onTouchEnd(_e: TouchEvent, _id: string) {}

function goDetail(id: string) { uni.navigateTo({ url: `/pages/job/detail?id=${id}` }) }
</script>

<style lang="scss" scoped>
.list-page {
  background: transparent;
  min-height: 100vh;
  padding: 24rpx 24rpx 120rpx;
}

.list-desktop {
  padding: 24rpx 32rpx;
  min-height: auto;

  .swipe-actions { display: none; }

  .status-group { margin-bottom: 24rpx; }
}

.dt-top-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.dt-search-bar {
  display: flex;
  align-items: center;
  margin-left: auto;
  width: 300px;
  background: #fff;
  border-radius: 8rpx;
  padding: 0 16rpx;
  height: 40px;
  box-sizing: border-box;

  .search-input { flex: 1; height: 40px; font-size: 14px; }
  .search-icon { font-size: 28rpx; margin-right: 8rpx; }
  .search-clear { font-size: 24rpx; color: var(--text-secondary); padding: 4rpx; cursor: pointer; }
}

.dt-filter-bar {
  display: flex;
  gap: 16rpx;
  flex-shrink: 0;
}

/* 桌面端行内卡片（两行：第一行字段，第二行备注） */
.list-desktop .interview-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 6px 16px;
  margin-bottom: 0;
  border-radius: 0;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
  gap: 8px 12px;
  transition: background 0.15s;

  &:last-child { border-bottom: none; }
  &:hover { background: #f8fffe; }
}

.list-desktop .card-jobname {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-desktop .card-jobname-sub {
  font-size: 14px;
  font-weight: 400;
  color: var(--text-secondary);
}

.list-desktop .card-rating {
  width: 120px;
  flex-shrink: 0;
}

.list-desktop .card-salary {
  width: 70px;
  flex-shrink: 0;
  text-align: right;
  color: var(--brand-primary);
  font-weight: 600;
  font-size: 16px;

  .salary-unit { font-size: 13px; font-weight: 400; }
}

.list-desktop .card-action-remark {
  width: 56px;
  flex-shrink: 0;
  height: 28px;
  line-height: 28px;
  font-size: 13px;
  color: #4A90D9;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;

  &::after { border: none; }
}

.list-desktop .card-remark {
  width: 100%;
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 2px 0 6px;
}

.list-desktop .remark-icon { display: none; }

/* 移动端 */
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

.search-input { flex: 1; font-size: 28rpx; color: var(--text-primary); height: 72rpx; }

.search-clear { font-size: 28rpx; color: var(--text-secondary); padding: 8rpx; }

.filter-bar { display: flex; gap: 16rpx; margin-bottom: 20rpx; }

.filter-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12rpx;
  padding: 12rpx 18rpx;
  font-size: 24rpx;
  color: var(--text-primary);
}

.filter-arrow { font-size: 20rpx; color: var(--text-secondary); margin-left: 6rpx; }

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0;
}

.state-icon { font-size: 80rpx; margin-bottom: 24rpx; }

.state-text { font-size: 30rpx; color: var(--text-primary); font-weight: 500; }

.state-desc { font-size: 26rpx; color: var(--text-secondary); margin-top: 12rpx; }

.status-group { margin-bottom: 32rpx; }

.group-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
  padding-left: 4rpx;
}

.group-title { font-size: 28rpx; font-weight: 600; color: var(--text-primary); }

.group-count {
  font-size: 22rpx;
  color: #fff;
  background: var(--brand-primary);
  padding: 2rpx 14rpx;
  border-radius: 20rpx;
}

.swipe-wrapper { position: relative; margin-bottom: 16rpx; border-radius: 16rpx; }

.swipe-actions {
  position: absolute;
  right: 1rpx;
  top: 0;
  bottom: 0;
  display: flex;
  width: 80rpx;
  border-radius: 0 16rpx 16rpx 0;
  overflow: hidden;
}

.swipe-btn { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 26rpx; font-weight: 500; }

.remark-swipe-btn { color: #4A90D9; }

.interview-card {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
  transition: transform 0.2s ease;
  z-index: 1;
  box-sizing: border-box;
  overflow: hidden;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6rpx;
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

.card-jobname-sub { font-size: 24rpx; font-weight: 400; color: var(--text-secondary); }

.card-rating { flex-shrink: 0; margin-left: 8rpx; }

.card-bottom { display: flex; align-items: center; }

.card-salary { color: var(--brand-primary); font-weight: 600; }

.salary-num { font-size: 32rpx; margin: 0 5rpx; }

.salary-unit { font-size: 22rpx; }

.card-remark {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-top: 12rpx;
  padding-top: 10rpx;
  border-top: 1rpx solid var(--divider);
  line-height: 1.5;
  max-height: calc(24rpx * 1.5 * 10);
  overflow-y: auto;
}

.remark-icon { font-size: 24rpx; margin-right: 6rpx; }

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

  &.selected { color: var(--brand-primary); font-weight: 600; }
}

.check { font-size: 32rpx; }

.remark-sheet {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 0 0 40rpx;
}

.remark-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid var(--divider);
}

.remark-cancel { font-size: 28rpx; color: var(--text-secondary); }

.remark-title { font-size: 30rpx; font-weight: 600; color: var(--text-primary); }

.remark-confirm { font-size: 28rpx; color: var(--brand-primary); font-weight: 600; }

.remark-textarea {
  width: 100%;
  height: 260rpx;
  padding: 24rpx 32rpx;
  font-size: 28rpx;
  color: var(--text-primary);
  line-height: 1.6;
  box-sizing: border-box;
}
</style>
