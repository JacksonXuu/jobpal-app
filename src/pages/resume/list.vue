<template>
  <!-- 桌面端壳 -->
  <DesktopLayout v-if="appStore.isDesktop" active="resume" @navigate="onSidebarNav">
    <view class="list-page list-desktop">
      <view class="dt-action-bar">
        <view class="dt-actions">
          <button class="dt-btn" @click="goForm()" size="mini"><text class="iconfont icon-tianjia" /> 新建简历</button>
          <button class="dt-btn dt-btn-refresh" @click="fetchList" size="mini"><text class="iconfont icon-shuaxin" /> 刷新</button>
          <button class="dt-btn dt-btn-danger" @click="onDeleteClick" size="mini" v-if="list.length > 0">删除</button>
        </view>
        <view class="dt-search">
          <text class="iconfont icon-sousuotubiao search-icon" />
          <input class="search-input" v-model="keyword" placeholder="搜索简历标题" @input="onSearchInput" />
          <text v-if="keyword" class="search-clear" @tap="clearSearch">✕</text>
        </view>
      </view>

      <view v-if="loading" class="state-box"><text class="state-text">加载中...</text></view>
      <view v-else-if="list.length === 0" class="state-box">
        <text class="iconfont icon-a-jianli state-icon" />
        <text class="state-text">暂无简历</text>
        <text class="state-desc">点击上方「新建简历」创建第一份</text>
      </view>
      <view v-else class="dt-table-wrap">
        <uni-table ref="tableRef" :data="list" type="selection" rowKey="id" @selection-change="onSelectionChange">
          <uni-thead>
            <uni-tr>
              <uni-th>标题</uni-th>
              <uni-th width="220">描述</uni-th>
              <uni-th width="160" align="center">更新日期</uni-th>
              <uni-th width="120" align="center">操作</uni-th>
            </uni-tr>
          </uni-thead>
          <uni-tbody>
            <uni-tr v-for="item in list" :key="item.id" :keyValue="item.id">
              <uni-td @tap="goDetail(item.id)">
                <text class="iconfont icon-a-jianli dt-icon" />
                <text class="dt-title">{{ item.title }}</text>
              </uni-td>
              <uni-td @tap="goDetail(item.id)">
                <text class="dt-desc">{{ item.description || '—' }}</text>
              </uni-td>
              <uni-td align="center" @tap="goDetail(item.id)">
                <text class="dt-date">{{ formatDateTime(item.updatedAt) }}</text>
              </uni-td>
              <uni-td align="center">
                <text class="dt-action" @tap.stop="handleEdit(item.id)">编辑</text>
                <text class="dt-action dt-action-del" @tap.stop="handleDelete(item.id)">删除</text>
              </uni-td>
            </uni-tr>
          </uni-tbody>
        </uni-table>
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
import UniTable from '@dcloudio/uni-ui/lib/uni-table/uni-table.vue'
import UniThead from '@dcloudio/uni-ui/lib/uni-thead/uni-thead.vue'
import UniTbody from '@dcloudio/uni-ui/lib/uni-tbody/uni-tbody.vue'
import UniTr from '@dcloudio/uni-ui/lib/uni-tr/uni-tr.vue'
import UniTh from '@dcloudio/uni-ui/lib/uni-th/uni-th.vue'
import UniTd from '@dcloudio/uni-ui/lib/uni-td/uni-td.vue'

const appStore = useAppStore()
import { getResumeList, deleteResume, type Resume } from '@/apis/resume'
import { useTracking } from '@/composables/useTracking'
import { BRAND_PRIMARY } from '@/utils/theme'

const { trackAction } = useTracking({ module: 'resume' })

const list = ref<Resume[]>([])
const loading = ref(false)
const keyword = ref('')
const tableRef = ref()
let searchTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput() { if (searchTimer) clearTimeout(searchTimer); searchTimer = setTimeout(() => { trackAction('search'); fetchList() }, 300) }
function clearSearch() { trackAction('clear_search'); keyword.value = ''; fetchList() }

async function fetchList() {
  loading.value = true
  try { const res = await getResumeList({ keyword: keyword.value }); list.value = res.list }
  catch { /* */ }
  finally { loading.value = false }
}

let initialLoaded = false
onLoad(() => { fetchList().then(() => { initialLoaded = true }) })
onShow(() => { if (initialLoaded) fetchList() })

const swipedId = ref(''); let touchStartX = 0, touchStartY = 0; const SWIPE_THRESHOLD = 60
function onTouchStart(e: TouchEvent, _id: string, _index: number) { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY }
function onTouchMove(e: TouchEvent, id: string, _index: number) { const dx = e.touches[0].clientX - touchStartX; const dy = e.touches[0].clientY - touchStartY; if (Math.abs(dx) > Math.abs(dy) && dx < -SWIPE_THRESHOLD) swipedId.value = id; else if (dx > SWIPE_THRESHOLD) swipedId.value = '' }
function onTouchEnd(_e: TouchEvent, _id: string) {}

const selectedIds = ref<string[]>([])
function onSelectionChange(e: { detail: { value: Resume[]; index: number[] } }) { selectedIds.value = (e.detail.value || []).map((r: Resume) => r.id) }

function onDeleteClick() {
  if (selectedIds.value.length === 0) { tableRef.value?.selectionAll(); return }
  handleBatchDelete()
}

async function handleBatchDelete() {
  const res = await uni.showModal({ title: '批量删除', content: `确定要删除 ${selectedIds.value.length} 份简历吗？`, confirmColor: BRAND_PRIMARY })
  if (!res.confirm) return
  try {
    trackAction('batch_delete')
    for (const id of selectedIds.value) { await deleteResume(id) }
    uni.showToast({ title: `已删除 ${selectedIds.value.length} 份`, icon: 'success' })
    selectedIds.value = []
    fetchList()
  } catch { /* */ }
}

function goDetail(id: string) { trackAction('view_detail'); uni.navigateTo({ url: `/pages/resume/detail?id=${id}` }) }
function onSidebarNav(page: string) { if (page === 'ask') uni.switchTab({ url: '/pages/ask/index' }); else if (page === 'home') uni.switchTab({ url: '/pages/home' }) }
function goForm(id?: string) { uni.navigateTo({ url: id ? `/pages/resume/form?id=${id}` : '/pages/resume/form' }) }
function handleEdit(id: string) { swipedId.value = ''; goForm(id) }

async function handleDelete(id: string) {
  swipedId.value = ''
  const res = await uni.showModal({ title: '确认删除', content: '确定要删除该简历吗？', confirmColor: BRAND_PRIMARY })
  if (!res.confirm) return
  try { trackAction('delete'); await deleteResume(id); uni.showToast({ title: '已删除', icon: 'success' }); fetchList() }
  catch { /* */ }
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.list-page {
  background: transparent;
  min-height: 100vh;
  padding: 24rpx 24rpx 160rpx;
}

.list-desktop {
  padding: 32rpx;
  min-height: auto;

  .fab { display: none !important; }
  .swipe-actions { display: none; }
}

/* 桌面端操作栏 */
.dt-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.dt-actions {
  display: flex;
  gap: 10px;
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

  &:hover { color: #80ede0; border-color: #80ede0; }
  &::after { border: none; }
}

.dt-btn-refresh {
  color: var(--brand-primary);
  border: 1px solid var(--brand-primary);

  &:hover { color: #80ede0; border-color: #80ede0; }
}

.dt-btn-danger {
  color: #FF4757;
  border-color: #FF4757;

  &:hover { color: #ff6b7a; border-color: #ff6b7a; }
}

.dt-search {
  display: flex;
  align-items: center;
  width: 680rpx;
  background: #fff;
  border-radius: 8rpx;
  padding: 0 16rpx;
  height: 40px;
  box-sizing: border-box;

  .search-input {
    flex: 1;
    height: 40px;
    font-size: 14px;
  }

  .search-icon {
    font-size: 28rpx;
    margin-right: 8rpx;
  }

  .search-clear {
    font-size: 24rpx;
    color: var(--text-secondary);
    padding: 4rpx;
    cursor: pointer;
  }
}

/* 表格 */
.dt-table-wrap {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;

  :deep(.uni-table-loading),
  :deep(.uni-table-mask) { display: none !important; }

  :deep(.uni-table) { font-size: 14px; }

  :deep(.uni-table-th) {
    background: #f8fafc;
    color: #64748b;
    font-weight: 600;
    font-size: 14px;
    padding: 10px 12px;
    border-bottom: 1px solid #e8e8e8;
  }

  :deep(.uni-table-td) {
    padding: 10px 12px;
    border-bottom: 1px solid #f0f0f0;
  }

  :deep(.uni-table-tr:hover td) { background: #f8fffe; }
}

.dt-icon {
  font-size: 18px;
  margin-right: 8px;
  vertical-align: middle;
}

.dt-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
  display: inline-block;
  vertical-align: middle;
}

.dt-desc {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.dt-date {
  font-size: 13px;
  color: var(--text-secondary);
}

.dt-action {
  font-size: 13px;
  color: var(--brand-primary);
  cursor: pointer;
  margin: 0 6px;
}

.dt-action-del { color: #FF4757; }

/* ── 移动端 ── */
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

.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

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

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0;
}

.state-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.state-text {
  font-size: 30rpx;
  color: var(--text-primary);
  font-weight: 500;
}

.state-desc {
  font-size: 26rpx;
  color: var(--text-secondary);
  margin-top: 12rpx;
}

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

  button {
    font-size: 26rpx;
    font-weight: 500;
    background: transparent;
    border: none;
    padding: 0;
    height: 64rpx;
    line-height: 64rpx;

    &::after { border: none; }
  }
}

.edit-btn button { color: var(--brand-primary); }

.delete-btn {
  position: relative;

  button { color: #FF4757; }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 2rpx;
    height: 28rpx;
    background: var(--divider);
  }
}

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
  box-shadow: 0 8rpx 24px rgba(8, 201, 176, 0.4);
  z-index: 100;
}

.fab-icon {
  font-size: 28rpx;
  color: #fff;
  font-weight: 400;
}
</style>
