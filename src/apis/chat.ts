import { request } from '@/utils/request'
import { useAuthStore } from '@/stores/auth'

const BASE_URL = 'http://localhost:3000'

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

/** 智能推荐提问（使用 fetch 静默失败，避免 request 拦截器 toast） */
export async function getSuggestions(): Promise<string[]> {
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
}
