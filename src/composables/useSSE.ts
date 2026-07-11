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

  /** 处理单个 SSE 事件 */
  function processSSEEvent(eventType: string, eventData: string, options: SSEOptions) {
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

  /** 从 SSE 文本块中提取并处理事件 */
  function parseSSEChunk(chunk: string, bufferRef: { value: string }, options: SSEOptions) {
    bufferRef.value += chunk
    const parts = bufferRef.value.split('\n\n')
    bufferRef.value = parts.pop() || ''

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

      if (eventData) {
        processSSEEvent(eventType, eventData, options)
      }
    }
  }

  // #ifdef H5
  let abortController: AbortController | null = null

  async function connect(options: SSEOptions) {
    streamingText.value = ''
    isStreaming.value = true
    error.value = ''
    abortController = new AbortController()

    const BASE_URL = import.meta.env.VITE_API_BASE_URL

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
      const bufferRef = { value: '' }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        parseSSEChunk(chunk, bufferRef, options)
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
  // #endif

  // #ifdef MP-WEIXIN
  let requestTask: UniApp.RequestTask | null = null

  /** ArrayBuffer → 字符串（兼容不支持 TextDecoder 的环境） */
  function arrayBufferToString(buffer: ArrayBuffer): string {
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('utf-8').decode(buffer)
    }
    const bytes = new Uint8Array(buffer)
    // 分批处理避免大 chunk 导致栈溢出
    const CHUNK_SIZE = 8192
    let result = ''
    for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
      const end = Math.min(i + CHUNK_SIZE, bytes.length)
      result += String.fromCharCode.apply(null, Array.from(bytes.slice(i, end)))
    }
    return result
  }

  function connect(options: SSEOptions) {
    streamingText.value = ''
    isStreaming.value = true
    error.value = ''

    const BASE_URL = import.meta.env.VITE_API_BASE_URL
    const authToken = useAuthStore().token

    const bufferRef = { value: '' }

    requestTask = uni.request({
      url: BASE_URL + options.url,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      data: options.body,
      enableChunked: true,
      success: () => {
        // 流结束，处理缓冲区残留
        if (bufferRef.value.trim()) {
          const lastPart = bufferRef.value.trim()
          const lines = lastPart.split('\n')
          let eventType = ''
          let eventData = ''
          for (const line of lines) {
            if (line.startsWith('event: ')) eventType = line.slice(7).trim()
            else if (line.startsWith('data: ')) eventData = line.slice(6).trim()
          }
          if (eventData) processSSEEvent(eventType, eventData, options)
        }
        isStreaming.value = false
      },
      fail: (err) => {
        // errMsg 包含 'abort' 说明是主动中断，不报错
        if (err.errMsg && !err.errMsg.includes('abort')) {
          error.value = err.errMsg || '网络异常，请重试'
          options.onError?.(error.value)
        }
        isStreaming.value = false
      },
    })

    // 监听分块数据
    if (requestTask) {
      requestTask.onChunkReceived((res: { data: ArrayBuffer }) => {
        const chunk = arrayBufferToString(res.data)
        parseSSEChunk(chunk, bufferRef, options)
      })
    }
  }

  function abort() {
    requestTask?.abort()
    isStreaming.value = false
  }
  // #endif

  return { streamingText, isStreaming, error, connect, abort }
}
