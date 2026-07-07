<template>
  <view class="ask-page">
    <!-- ====== 列表视图 ====== -->
    <template v-if="view === 'list'">
      <view class="list-header">
        <text class="list-title">💬 历史对话</text>
        <text class="back-btn" @tap="view = 'chat'">← 返回</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && conversations.length === 0" class="empty-box">
        <text class="empty-icon">🤖</text>
        <text class="empty-title">你的 AI 求职助手</text>
        <text class="empty-desc">基于你的简历、心动岗位、面试记录为你提供精准答疑</text>
        <view class="suggestion-list">
          <text class="suggestion-label">试试问这些：</text>
          <view
            v-for="(q, i) in suggestions"
            :key="i"
            class="suggestion-item"
            @tap="startWithSuggestion(q)"
          >
            <text>{{ q }}</text>
          </view>
        </view>
      </view>

      <!-- 对话列表 -->
      <view v-else class="conv-list">
        <view
          v-for="item in conversations"
          :key="item.id"
          class="swipe-wrapper"
        >
          <view class="swipe-action" @tap.stop="handleDelete(item.id)">
            <text>删除</text>
          </view>
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

      <!-- 加载中 -->
      <view v-if="loading" class="state-box">
        <text class="state-text">加载中...</text>
      </view>

      <!-- FAB -->
      <view class="fab" @tap="startNewChat">
        <text class="fab-icon">+</text>
      </view>
    </template>

    <!-- ====== 聊天视图 ====== -->
    <template v-else>
      <!-- 顶部栏 -->
      <view class="chat-header">
        <text class="history-btn" @tap="view = 'list'">历史</text>
        <view style="flex:1" />
        <text class="history-btn" :class="{ disabled: !conversationId && messages.length === 0 }" @tap="startNewChat">新对话</text>
      </view>

      <!-- 消息列表 -->
      <scroll-view class="msg-list" scroll-y :scroll-into-view="scrollToId" scroll-with-animation>
        <!-- 快捷提问 -->
        <view v-if="messages.length === 0 && suggestions.length > 0" class="suggestions-bar">
          <text class="suggestion-label">💡 猜你想问：</text>
          <view
            v-for="(q, i) in suggestions"
            :key="i"
            class="suggestion-tag"
            @tap="sendMessage(q)"
          >
            <text>{{ q }}</text>
          </view>
        </view>

        <ChatBubble
          v-for="msg in messages"
          :key="msg.id"
          :role="msg.role"
          :content="msg.content"
        />

        <!-- 流式回复中的 AI 气泡 -->
        <ChatBubble
          v-if="isStreaming || streamingText"
          role="assistant"
          :content="streamingText"
          :is-streaming="isStreaming"
        />

        <view id="msg-bottom" style="height: 24rpx" />
      </scroll-view>

      <!-- 底部输入栏 -->
      <view class="input-bar">
        <textarea
          class="msg-input"
          v-model="inputText"
          placeholder="输入你的问题..."
          :disabled="isStreaming"
          auto-height
          maxlength="500"
        />
        <text class="send-btn" :class="{ disabled: !inputText.trim() || isStreaming }" @tap="sendMessage()">
          发送
        </text>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getConversations, getConversationDetail, deleteConversation, getSuggestions, type Conversation, type ChatMessage } from '@/apis/chat'
import { useSSE } from '@/composables/useSSE'
import ChatBubble from '@/components/ChatBubble.vue'

// ── 视图切换 ──
const view = ref<'list' | 'chat'>('chat')

// ── 对话列表 ──
const conversations = ref<Conversation[]>([])
const loading = ref(false)

async function fetchConversations() {
  loading.value = true
  try {
    const res = await getConversations()
    conversations.value = res.list
  } catch { /* 拦截器已 toast */ }
  finally { loading.value = false }
}

onLoad(() => {
  fetchConversations()
  fetchSuggestions()
})

// ── 左滑删除 ──
const swipedId = ref('')
let swipeStartX = 0

function onSwipeStart(e: TouchEvent, id: string) {
  swipeStartX = e.touches[0].clientX
  swipedId.value = ''
}

function onSwipeMove(e: TouchEvent, id: string) {
  const dx = e.touches[0].clientX - swipeStartX
  if (dx < -60) swipedId.value = id
  else if (dx > 60) swipedId.value = ''
}

async function handleDelete(id: string) {
  swipedId.value = ''
  const res = await uni.showModal({ title: '确认删除', content: '确定要删除该对话吗？', confirmColor: '#08c9b0' })
  if (!res.confirm) return
  try {
    await deleteConversation(id)
    fetchConversations()
  } catch { /* 拦截器已 toast */ }
}

// ── 智能推荐 ──
const suggestions = ref<string[]>([])

async function fetchSuggestions() {
  try {
    suggestions.value = await getSuggestions()
  } catch { suggestions.value = [] }
}

// ── SSE ──
const { streamingText, isStreaming, connect, abort } = useSSE()

// ── 聊天状态 ──
const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const scrollToId = ref('msg-bottom')
const chatTitle = ref('新对话')
let conversationId: string | null = null

async function startNewChat() {
  if (!conversationId && messages.value.length === 0) return // 已在空对话中
  conversationId = null
  messages.value = []
  streamingText.value = ''
  chatTitle.value = '新对话'
  view.value = 'chat'
  fetchSuggestions()
}

function startWithSuggestion(question: string) {
  startNewChat()
  nextTick(() => sendMessage(question))
}

async function openConversation(item: Conversation) {
  conversationId = item.id
  chatTitle.value = item.title
  view.value = 'chat'
  try {
    const detail = await getConversationDetail(item.id)
    messages.value = detail.messages
  } catch { /* 拦截器已 toast */ }
  scrollToBottom()
}

function goBack() {
  abort()
  view.value = 'list'
  fetchConversations()
}

async function sendMessage(text?: string) {
  const msg = (text || inputText.value).trim()
  if (!msg || isStreaming.value) return

  inputText.value = ''
  streamingText.value = ''

  // 添加用户消息
  messages.value.push({
    id: `user-${Date.now()}`,
    role: 'user',
    content: msg,
    createdAt: new Date().toISOString(),
  })
  scrollToBottom()

  // SSE 流式请求
  await connect({
    url: '/v1/chat',
    body: { conversationId, message: msg },
    onStart(data) {
      if (!conversationId) {
        conversationId = data.conversationId
        chatTitle.value = msg.slice(0, 30) + (msg.length > 30 ? '...' : '')
      }
    },
    onComplete(data) {
      const finalContent = streamingText.value
      messages.value.push({
        id: data.messageId,
        role: 'assistant',
        content: finalContent,
        createdAt: new Date().toISOString(),
      })
      streamingText.value = ''
      scrollToBottom()
    },
    onError(msg) {
      if (streamingText.value) {
        messages.value.push({
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: streamingText.value + '\n\n[生成中断]',
          createdAt: new Date().toISOString(),
        })
      }
      streamingText.value = ''
    },
  })
}

function scrollToBottom() {
  nextTick(() => {
    scrollToId.value = ''
    nextTick(() => { scrollToId.value = 'msg-bottom' })
  })
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${m}-${day}`
}
</script>

<style scoped>
.ask-page {
  background: transparent;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── 列表视图 ── */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 32rpx;
}
.list-title { font-size: 34rpx; font-weight: 700; color: var(--text-primary); }
.new-btn { font-size: 28rpx; color: var(--brand-primary); font-weight: 600; }

.empty-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx 0;
}
.empty-icon { font-size: 96rpx; margin-bottom: 24rpx; }
.empty-title { font-size: 32rpx; font-weight: 600; color: var(--text-primary); margin-bottom: 12rpx; }
.empty-desc { font-size: 26rpx; color: var(--text-secondary); text-align: center; margin-bottom: 40rpx; line-height: 1.6; }

.suggestion-list { width: 100%; }
.suggestion-label { font-size: 24rpx; color: var(--text-secondary); margin-bottom: 16rpx; display: block; padding-left: 4rpx; }
.suggestion-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  margin-bottom: 12rpx;
  font-size: 28rpx;
  color: var(--brand-primary);
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}

/* 对话列表 */
.conv-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 24rpx 160rpx;
}
.swipe-wrapper {
  position: relative;
  margin-bottom: 12rpx;
  overflow: hidden;
  border-radius: 16rpx;
}
.swipe-action {
  position: absolute;
  right: 0; top: 0; bottom: 0;
  width: 80rpx;
  background: #FF4757;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #fff;
}
.conv-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  transition: transform 0.2s ease;
  position: relative;
  z-index: 1;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.conv-title {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8rpx;
}
.conv-date { font-size: 22rpx; color: var(--text-secondary); }

.state-box { display: flex; justify-content: center; padding: 40rpx 0; }
.state-text { font-size: 26rpx; color: var(--text-secondary); }

/* FAB */
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
.fab-icon { font-size: 36rpx; color: #fff; font-weight: 300; line-height: 0; margin-top: -2rpx; }

/* ── 聊天视图 ── */
.chat-header {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  background: transparent;
  border-bottom: none;
  z-index: 10;
}
.back-btn { font-size: 28rpx; color: var(--brand-primary); flex-shrink: 0; }
.history-btn { font-size: 28rpx; color: var(--brand-primary); font-weight: 500; flex-shrink: 0; }
.history-btn.disabled { color: var(--text-secondary); }
.msg-list {
  flex: 1;
  min-height: 0;
  padding-top: 16rpx;
}

.suggestions-bar {
  padding: 16rpx 24rpx 24rpx;
}
.suggestion-tag {
  display: inline-block;
  background: var(--brand-light);
  color: var(--brand-primary);
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  margin: 6rpx 10rpx 6rpx 0;
}

.input-bar {
  display: flex;
  align-items: flex-end;
  padding: 12rpx 16rpx 20rpx;
  background: #fff;
  border-top: 1rpx solid var(--divider);
  gap: 12rpx;
}
.msg-input {
  flex: 1;
  background: transparent;
  border: 2rpx solid var(--border-light);
  border-radius: 24rpx;
  padding: 14rpx 24rpx;
  font-size: 28rpx;
  line-height: 1.5;
  color: var(--text-primary);
  max-height: 224rpx;
  overflow-y: auto;
}
.send-btn {
  font-size: 28rpx;
  color: var(--brand-primary);
  font-weight: 600;
  padding: 14rpx 8rpx;
  flex-shrink: 0;
}
.send-btn.disabled {
  color: var(--text-secondary);
}
</style>
