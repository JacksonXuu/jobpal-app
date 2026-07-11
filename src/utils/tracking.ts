/**
 * 用户行为追踪核心引擎
 *
 * 职责：
 * - 维护事件缓冲队列
 * - 批量上报到后端（sendBeacon 优先，fetch 兜底）
 * - Session 管理（登录生成、登出销毁）
 * - 自动定时刷新 + 失败重试
 *
 * 设计为纯模块（非 Pinia store / composable），确保在 Vue 初始化前后均可工作。
 */
import { useAuthStore } from '@/stores/auth'
import type { TrackEvent, AnalyticsBatchPayload } from '@/types/tracking'

// ── 配置 ──
const BASE_URL = import.meta.env.VITE_API_BASE_URL
const MAX_BUFFER_SIZE = 20
const FLUSH_INTERVAL_MS = 30_000
const MAX_RETRIES = 3
const STORAGE_KEY_SESSION = '__jp_session_id'
/** 开发模式：后端未就绪时，在控制台输出埋点事件 */
const DEV_LOG = true

// ── 状态（模块私有） ──
let buffer: TrackEvent[] = []
let sessionId = ''
let enabled = false
let flushTimer: ReturnType<typeof setTimeout> | null = null
let retryCount = 0

// ── 平台检测 ──
function getPlatform(): string {
  // #ifdef H5
  return 'h5'
  // #endif
  // #ifdef MP-WEIXIN
  return 'mp-weixin'
  // #endif
  return 'other'
}

/** 生成简易 UUID v4（兼容 uni-app 各端） */
function generateUUID(): string {
  // #ifdef H5
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // #endif
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

/** 调度定时刷新 */
function scheduleFlush(): void {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    flush()
  }, FLUSH_INTERVAL_MS)
}

/** 取消定时刷新 */
function cancelFlush(): void {
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
}

// ── 公开 API ──

/** 启用追踪（用户登录后调用） */
export function enable(): void {
  if (enabled) return
  enabled = true
  const cached = uni.getStorageSync(STORAGE_KEY_SESSION)
  sessionId = (typeof cached === 'string' && cached) ? cached : generateUUID()
  uni.setStorageSync(STORAGE_KEY_SESSION, sessionId)
}

/** 停用追踪（用户登出时调用），立即 flush 缓冲 */
export function disable(): void {
  if (!enabled) return
  flush()
  cancelFlush()
  enabled = false
  sessionId = ''
  buffer = []
  retryCount = 0
  uni.removeStorageSync(STORAGE_KEY_SESSION)
}

/** 当前是否已启用 */
export function isEnabled(): boolean {
  return enabled
}

/** 获取当前 session ID */
export function getSessionId(): string {
  return sessionId
}

/** 获取当前缓冲事件数（调试用） */
export function getBufferLength(): number {
  return buffer.length
}

/**
 * 记录一条追踪事件。
 * 仅行为标识，不含任何用户数据。
 */
export function track(event: Omit<TrackEvent, 'timestamp'>): void {
  if (!enabled) return

  buffer.push({ ...event, timestamp: Date.now() })
  scheduleFlush()

  if (buffer.length >= MAX_BUFFER_SIZE) {
    cancelFlush()
    flush()
  }
}

/** 立即上报缓冲中的所有事件 */
export function flush(): void {
  if (buffer.length === 0) return

  const authStore = useAuthStore()
  if (!authStore.isLogin) {
    buffer = []
    return
  }

  const payload: AnalyticsBatchPayload = {
    events: [...buffer],
    sessionId,
    platform: getPlatform(),
  }

  // 清空缓冲（无论发送成败，避免重复上报同一批数据）
  buffer = []

  sendBatch(payload)
}

// ── 网络发送 ──

function sendBatch(payload: AnalyticsBatchPayload): void {
  const url = BASE_URL + '/v1/analytics/events'
  const body = JSON.stringify(payload)
  const authToken = useAuthStore().token

  // 开发模式：控制台输出埋点事件
  if (DEV_LOG) {
    console.log(
      `%c[tracking] %cflush %c${payload.events.length} 条事件`,
      'color:#3ddec5;font-weight:bold',
      'color:inherit',
      'color:#94a3b8',
    )
    payload.events.forEach((e) => {
      console.log(
        `  %c${e.eventType.padEnd(12)} %c${e.module.padEnd(10)} %c${e.action || ''}`,
        e.eventType === 'page_leave' ? 'color:#FF4757' : 'color:#3ddec5',
        'color:#007299',
        'color:#94a3b8',
      )
    })
  }

  // 跨平台发送（H5 用 fetch+keepalive，小程序用 uni.request）
  sendToServer(url, body, authToken)
    .then((ok: boolean) => {
      if (ok) {
        retryCount = 0
      } else {
        requeue(payload)
      }
    })
    .catch(() => {
      requeue(payload)
    })
}

/** 批量上报到服务端（跨平台兼容） */
function sendToServer(
  url: string,
  body: string,
  authToken: string,
): Promise<boolean> {
  // #ifdef H5
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body,
    keepalive: true,
  }).then((res) => res.ok)
  // #endif
  // #ifdef MP-WEIXIN
  return new Promise((resolve) => {
    uni.request({
      url,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      data: JSON.parse(body),
      success: (res) => resolve(res.statusCode === 200),
      fail: () => resolve(false),
    })
  })
  // #endif
}
function requeue(payload: AnalyticsBatchPayload): void {
  retryCount++
  if (retryCount > MAX_RETRIES) {
    console.warn(`[tracking] 上报失败已达 ${MAX_RETRIES} 次，丢弃 ${payload.events.length} 条事件`)
    retryCount = 0
    return
  }
  // 重新放回缓冲队列头部
  buffer = [...payload.events, ...buffer]
  scheduleFlush()
}
