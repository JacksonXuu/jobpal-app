import { request } from '@/utils/request'
import { useAuthStore } from '@/stores/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// ── 类型 ──
export interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface ConversationDetail {
  conversation: Conversation
  messages: ChatMessage[]
}

// ── API ──
/** 对话列表 */
export async function getConversations(): Promise<{ list: Conversation[]; total: number }> {
  const res = await request<{ list: Conversation[]; total: number }>({
    url: '/v1/chat/conversations',
  })
  return res.data
}

/** 对话详情（含消息） */
export async function getConversationDetail(id: string): Promise<ConversationDetail> {
  const res = await request<ConversationDetail>({
    url: `/v1/chat/conversations/${id}`,
  })
  return res.data
}

/** 删除对话 */
export async function deleteConversation(id: string): Promise<void> {
  await request({
    url: `/v1/chat/conversations/${id}`,
    method: 'DELETE',
  })
}

/** 智能推荐提问（静默失败，避免 toast 打扰用户） */
export async function getSuggestions(): Promise<string[]> {
  // #ifdef H5
  try {
    const token = useAuthStore().token
    const response = await fetch(BASE_URL + '/v1/chat/suggestions', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) return []
    const body = await response.json()
    return body?.data?.suggestions || []
  } catch {
    return []
  }
  // #endif
  // #ifdef MP-WEIXIN
  try {
    const token = useAuthStore().token
    const res = await new Promise<{ data: { suggestions: string[] } }>((resolve, reject) => {
      uni.request({
        url: BASE_URL + '/v1/chat/suggestions',
        header: token ? { Authorization: `Bearer ${token}` } : {},
        success: (r) => resolve(r.data as { data: { suggestions: string[] } }),
        fail: reject,
      })
    })
    return res?.data?.suggestions || []
  } catch {
    return []
  }
  // #endif
}
