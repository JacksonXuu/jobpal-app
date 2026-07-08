<template>
  <view class="ask-page">
    <!-- ====== 列表视图（手机端独有） ====== -->
    <template v-if="view === 'list'">
      <view class="list-header">
        <text class="list-title">💬 历史对话</text>
        <text class="back-btn" @tap="view = 'chat'">← 返回</text>
      </view>

      <view v-if="!loading && conversations.length === 0" class="empty-box">
        <text class="empty-icon">🤖</text>
        <text class="empty-title">你的 AI 求职助手</text>
        <text class="empty-desc">基于你的简历、心动岗位、面试记录为你提供精准答疑</text>
        <view class="suggestion-list">
          <text class="suggestion-label">试试问这些：</text>
          <view v-for="(q, i) in suggestions" :key="i" class="suggestion-item" @tap="startWithSuggestion(q)">
            <text>{{ q }}</text>
          </view>
        </view>
      </view>

      <view v-else class="conv-list">
        <view v-for="item in conversations" :key="item.id" class="swipe-wrapper">
          <view class="swipe-action" @tap.stop="handleDelete(item.id)"><text>删除</text></view>
          <view
            class="conv-card"
            :style="{ transform: swipedId === item.id ? 'translateX(-80rpx)' : 'translateX(0)' }"
            @touchstart="onSwipeStart($event, item.id)"
            @touchmove="onSwipeMove($event, item.id)"
            @touchup="swipedId = ''"
            @tap="openConversation(item)"
          >
            <text class="conv-title">{{ item.title }}</text>
            <text class="conv-date">{{ formatDate(item.updatedAt) }}</text>
          </view>
        </view>
      </view>

      <view v-if="loading" class="state-box"><text class="state-text">加载中...</text></view>
      <view class="fab" @tap="startNewChat"><text class="fab-icon">+</text></view>
    </template>

    <!-- ====== 聊天视图（复用 ChatPanel） ====== -->
    <template v-else>
      <DesktopLayout v-if="appStore.isDesktop" active="ask" @navigate="onSidebarNav">
        <ChatPanel ref="chatPanelRef" mode="desktop" />
      </DesktopLayout>
      <ChatPanel v-else ref="chatPanelRef" />
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getConversations, deleteConversation, getSuggestions, type Conversation } from '@/apis/chat'
import { useAppStore } from '@/stores/app'
import DesktopLayout from '@/components/DesktopLayout.vue'
import ChatPanel from '@/components/chat/ChatPanel.vue'
import { useTracking } from '@/composables/useTracking'

const appStore = useAppStore()
const { trackAction, trackClick } = useTracking({ module: 'ask' })
const view = ref<'list' | 'chat'>('chat')
const conversations = ref<Conversation[]>([])
const loading = ref(false)
const suggestions = ref<string[]>([])
const swipedId = ref('')
let swipeStartX = 0

const chatPanelRef = ref<InstanceType<typeof ChatPanel>>()

onLoad(() => {
  fetchConversations()
  fetchSuggestions()
})

onShow(() => {
  // #ifdef H5
  if (appStore.isDesktop) uni.hideTabBar()
  // #endif
})

async function fetchConversations() {
  loading.value = true
  try { conversations.value = (await getConversations()).list } catch { /* ignore */ }
  finally { loading.value = false }
}

async function fetchSuggestions() {
  try { suggestions.value = await getSuggestions() } catch { suggestions.value = [] }
}

function onSwipeStart(e: TouchEvent, id: string) { swipeStartX = e.touches[0].clientX; swipedId.value = '' }
function onSwipeMove(e: TouchEvent, id: string) {
  const dx = e.touches[0].clientX - swipeStartX
  if (dx < -60) swipedId.value = id
  else if (dx > 60) swipedId.value = ''
}

async function handleDelete(id: string) {
  swipedId.value = ''
  const res = await uni.showModal({ title: '确认删除', content: '确定要删除该对话吗？', confirmColor: '#3ddec5' })
  if (!res.confirm) return
  try {
    trackAction('delete_conversation')
    await deleteConversation(id); fetchConversations()
  } catch { /* ignore */ }
}

function startNewChat() {
  trackAction('new_session')
  chatPanelRef.value?.newSession()
  view.value = 'chat'
}

function startWithSuggestion(_q: string) {
  trackClick('click_suggestion')
  chatPanelRef.value?.newSession()
  view.value = 'chat'
}

function openConversation(item: Conversation) {
  trackAction('open_conversation')
  chatPanelRef.value?.openConversation(item)
  view.value = 'chat'
}

function onSidebarNav(page: string) {
  if (page === 'ask') return
  if (page === 'home') { uni.switchTab({ url: '/pages/home' }); return }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.ask-page { background: transparent; position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: flex; flex-direction: column; overflow: hidden; }

.list-header { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 32rpx; }
.list-title { font-size: 34rpx; font-weight: 700; color: var(--text-primary); }
.back-btn { font-size: 28rpx; color: var(--brand-primary); }

.empty-box { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 80rpx 40rpx 0; }
.empty-icon { font-size: 96rpx; margin-bottom: 24rpx; }
.empty-title { font-size: 32rpx; font-weight: 600; color: var(--text-primary); margin-bottom: 12rpx; }
.empty-desc { font-size: 26rpx; color: var(--text-secondary); text-align: center; margin-bottom: 40rpx; line-height: 1.6; }

.suggestion-list { width: 100%; }
.suggestion-label { font-size: 24rpx; color: var(--text-secondary); margin-bottom: 16rpx; display: block; padding-left: 4rpx; }
.suggestion-item {
  background: #fff; border-radius: 16rpx; padding: 24rpx 28rpx;
  margin-bottom: 12rpx; font-size: 28rpx; color: var(--brand-primary);
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

.conv-list { flex: 1; overflow-y: auto; padding: 0 24rpx 160rpx; }
.swipe-wrapper { position: relative; margin-bottom: 12rpx; overflow: hidden; border-radius: 16rpx; }
.swipe-action {
  position: absolute; right: 0; top: 0; bottom: 0; width: 80rpx;
  background: #FF4757; display: flex; align-items: center; justify-content: center;
  font-size: 24rpx; color: #fff;
}
.conv-card {
  background: #fff; border-radius: 16rpx; padding: 24rpx 28rpx;
  transition: transform 0.2s ease; position: relative; z-index: 1;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.conv-title { display: block; font-size: 28rpx; font-weight: 500; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 8rpx; }
.conv-date { font-size: 22rpx; color: var(--text-secondary); }

.state-box { display: flex; justify-content: center; padding: 40rpx 0; }
.state-text { font-size: 26rpx; color: var(--text-secondary); }

.fab { position: fixed; right: 40rpx; bottom: 120rpx; width: 72rpx; height: 72rpx; background: var(--brand-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8rpx 24rpx rgba(8,201,176,0.4); z-index: 100; }
.fab-icon { font-size: 36rpx; color: #fff; font-weight: 300; line-height: 0; margin-top: -2rpx; }
</style>
