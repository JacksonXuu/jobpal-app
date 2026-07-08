<template>
  <view class="chat-panel" :class="{ 'chat-desktop': mode === 'desktop' }">
    <!-- 顶部栏 -->
    <view class="chat-header">
      <text class="header-btn" @click="view = 'list'">历史</text>
      <view style="flex:1" />
      <text class="header-btn" :class="{ disabled: !conversationId && messages.length === 0 }" @click="newSession">新对话</text>
    </view>

    <!-- 对话列表 -->
    <scroll-view v-if="view === 'list'" class="conv-list" scroll-y>
      <view class="conv-list-inner">
        <view v-if="conversations.length === 0" class="conv-empty">暂无历史对话</view>
        <view
          v-for="item in conversations"
          :key="item.id"
          class="conv-card"
          @click="openConversation(item)"
        >
          <text class="conv-title">{{ item.title }}</text>
          <text class="conv-date">{{ item.updatedAt?.slice(0, 10) }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 消息列表 -->
    <view v-else class="msg-list-wrap">
      <scroll-view class="msg-list" scroll-y :scroll-into-view="scrollToId" scroll-with-animation>
        <!-- 推荐问题 -->
        <view v-if="messages.length === 0 && suggestions.length > 0" class="suggestions-bar">
          <text class="suggest-label">💡 猜你想问：</text>
          <view v-for="(q, i) in suggestions" :key="i" class="suggest-tag" @click="sendMessage(q)">
            <text>{{ q }}</text>
          </view>
        </view>
        <view class="msg-inner">
          <ChatBubble
            v-for="msg in messages"
            :key="msg.id"
            :role="msg.role"
            :content="msg.content"
          />
          <ChatBubble
            v-if="isStreaming || streamingText"
            role="assistant"
            :content="streamingText"
            :is-streaming="isStreaming"
          />
          <view id="chat-bottom" style="height: 24rpx" />
        </view>
      </scroll-view>
    </view>

    <!-- 免责声明 -->
    <view class="ai-disclaimer">内容由AI生成，仅供参考，请注意甄别</view>

    <!-- 输入栏 -->
    <view class="input-wrap">
      <view class="input-wrap-inner">
        <view class="input-bar">
      <textarea
        class="msg-input"
        :class="{ 'msg-focus': inputFocused }"
        v-model="inputText"
        placeholder="输入你的问题"
        :disabled="isStreaming"
        auto-height
        maxlength="500"
        @focus="inputFocused = true"
        @blur="inputFocused = false"
      />
      <text class="send-btn" :class="{ disabled: !inputText.trim() || isStreaming }" @click="send()">
        发送
      </text>
    </view>
    </view>
  </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useSSE } from '@/composables/useSSE'
import { getConversations, getConversationDetail, getSuggestions, type Conversation, type ChatMessage } from '@/apis/chat'
import ChatBubble from '@/components/ChatBubble.vue'

const props = withDefaults(defineProps<{ mode?: 'desktop' | 'mobile' }>(), { mode: 'mobile' })

const { streamingText, isStreaming, connect, abort } = useSSE()

const view = ref<'chat' | 'list'>('chat')
const conversations = ref<Conversation[]>([])
const messages = ref<Array<{ id: string; role: 'user' | 'assistant'; content: string }>>([])
const inputText = ref('')
const inputFocused = ref(false)
const scrollToId = ref('chat-bottom')
let conversationId: string | null = null

const suggestions = ref<string[]>([])

onMounted(() => {
  fetchConversations()
  fetchSuggestions()
})

async function fetchConversations() {
  try {
    const res = await getConversations()
    conversations.value = res.list
  } catch { /* ignore */ }
}

async function fetchSuggestions() {
  try {
    suggestions.value = await getSuggestions()
  } catch { suggestions.value = [] }
}

function sendMessage(text: string) {
  inputText.value = text
  nextTick(() => send())
}

function scrollToBottom() {
  nextTick(() => { scrollToId.value = ''; scrollToId.value = 'chat-bottom' })
}

/** 新建会话 */
function newSession() {
  abort()
  conversationId = null
  messages.value = []
  streamingText.value = ''
  view.value = 'chat'
  fetchSuggestions()
}

/** 打开历史对话 */
async function openConversation(item: Conversation) {
  conversationId = item.id
  view.value = 'chat'
  try {
    const detail = await getConversationDetail(item.id)
    messages.value = detail.messages
  } catch { /* ignore */ }
  scrollToBottom()
}

async function send(text?: string) {
  const msg = (text || inputText.value).trim()
  if (!msg || isStreaming.value) return

  inputText.value = ''
  streamingText.value = ''

  messages.value.push({
    id: `u-${Date.now()}`,
    role: 'user',
    content: msg,
  })
  scrollToBottom()

  await connect({
    url: '/v1/chat',
    body: { conversationId, message: msg },
    onStart(data) {
      if (!conversationId) conversationId = data.conversationId
    },
    onComplete(data) {
      messages.value.push({
        id: data.messageId,
        role: 'assistant',
        content: streamingText.value,
      })
      streamingText.value = ''
    },
    onError(msg) {
      uni.showToast({ title: msg, icon: 'none' })
    },
  })
}

defineExpose({ newSession, openConversation })
</script>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5fdfc;
}

/* 顶栏 */
.chat-header {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  flex-shrink: 0;
}
.header-btn { font-size: 28rpx; color: var(--brand-primary); font-weight: 500; flex-shrink: 0; cursor: pointer; }
.header-btn.disabled { color: var(--text-secondary); }

/* 对话列表 */
.conv-list { flex: 1; overflow-y: auto; }
.conv-list-inner { padding: 16rpx 24rpx; }
.chat-desktop .conv-list-inner { max-width: 720px; margin: 0 auto; }
.conv-empty { text-align: center; padding: 80rpx 0; font-size: 26rpx; color: var(--text-secondary); }
.conv-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 12rpx;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
}
.conv-card:hover { background: #f8fafc; }
.conv-title { font-size: 28rpx; color: var(--text-primary); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.conv-date { font-size: 22rpx; color: var(--text-secondary); margin-left: 16rpx; flex-shrink: 0; }

.msg-list-wrap {
  flex: 1;
  overflow: hidden;
}
.msg-list {
  height: 100%;
  overflow-y: auto;
}
.msg-inner {
  padding: 16rpx 0;
}
.chat-desktop .msg-inner {
  max-width: 720px;
  margin: 0 auto;
}

/* 推荐问题 */
.suggestions-bar {
  padding: 24rpx 24rpx 16rpx;
}
.chat-desktop .suggestions-bar {
  max-width: 720px;
  margin: 0 auto;
}
.suggest-label { font-size: 24rpx; color: var(--text-secondary); margin-bottom: 16rpx; display: block; }
.suggest-tag {
  display: inline-block;
  background: var(--brand-light);
  color: var(--brand-primary);
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  margin: 0 12rpx 12rpx 0;
  cursor: pointer;
}
.chat-desktop .suggest-label { font-size: 16px; margin-bottom: 20px; }
.chat-desktop .suggest-tag { font-size: 16px; padding: 10px 20px; margin: 0 12px 12px 0; }

.input-wrap {
  flex-shrink: 0;
  background: #fff;
}
.chat-desktop .input-wrap {
  background: transparent;
  border-top: none;
}
.chat-desktop .input-wrap-inner {
  max-width: 720px;
  margin: 0 auto;
}

.ai-disclaimer {
  text-align: center;
  font-size: 24rpx;
  color: var(--text-secondary);
  padding: 8rpx 0;
  flex-shrink: 0;
}

.input-bar {
  display: flex;
  align-items: flex-end;
  padding: 12rpx 16rpx 20rpx;
  gap: 12rpx;
}
.chat-desktop .input-bar {
  padding-bottom: 32rpx;
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
  transition: border-color 0.2s;
}
.chat-desktop .msg-input {
  min-height: 126rpx;
}
.msg-focus {
  border-color: var(--brand-primary) !important;
}

.send-btn {
  font-size: 28rpx;
  color: var(--brand-primary);
  font-weight: 600;
  padding: 14rpx 8rpx;
  flex-shrink: 0;
}

.send-btn.disabled { color: var(--text-secondary); }
</style>
