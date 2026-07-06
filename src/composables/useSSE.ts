import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

export interface SSEOptions {
  url: string
  body: Record<string, unknown>
  onStart?: (data: { conversationId: string; messageId: string }) => void
  onToken?: (token: string) => void
  onComplete?: (data: { conversationId: string; messageId: string }) => void
  onError?: (message: string) => void
}

/** SSE 流式消费 composable */
export function useSSE() {
  const streamingText = ref('')
  const isStreaming = ref(false)
  const error = ref('')
  let abortController: AbortController | null = null

  async function connect(options: SSEOptions) {
    streamingText.value = ''
    isStreaming.value = true
    error.value = ''
    abortController = new AbortController()

    const BASE_URL = 'http://localhost:3000'
    const token = '' // 由 request.ts 管理，但 SSE 需要手动设置

    try {
      const authToken = useAuthStore().token

      const response = await fetch(BASE_URL + options.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(options.body),
        signal: abortController.signal,
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({ message: '请求失败' }))
        error.value = errBody.message || '请求失败'
        options.onError?.(error.value)
        isStreaming.value = false
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        error.value = '浏览器不支持流式响应'
        isStreaming.value = false
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // 解析 SSE 事件
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''

        for (const part of parts) {
          if (!part.trim()) continue
          const lines = part.split('\n')
          let eventType = ''
          let eventData = ''

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim()
            } else if (line.startsWith('data: ')) {
              eventData = line.slice(6).trim()
            }
          }

          if (!eventData) continue

          try {
            const data = JSON.parse(eventData)
            switch (eventType) {
              case 'start':
                options.onStart?.(data)
                break
              case 'token':
                streamingText.value += data.token
                options.onToken?.(data.token)
                break
              case 'complete':
                options.onComplete?.(data)
                break
              case 'error':
                error.value = data.message || '未知错误'
                options.onError?.(error.value)
                break
            }
          } catch { /* JSON 解析失败，跳过 */ }
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // 用户主动中断
      } else {
        error.value = '网络异常，请重试'
        options.onError?.(error.value)
      }
    } finally {
      isStreaming.value = false
    }
  }

  function abort() {
    abortController?.abort()
    isStreaming.value = false
  }

  return { streamingText, isStreaming, error, connect, abort }
}
