/**
 * 用户行为追踪类型定义
 *
 * 核心原则：只记录行为，不记录数据。
 * 所有需要区分的操作直接编码在 action 名称中，不通过 metadata 传递用户数据。
 */

/** 事件类型 */
export type TrackingEventType =
  | 'page_enter'   // 页面进入（自动）
  | 'page_leave'   // 页面离开（自动，含 duration）
  | 'click'        // 通用点击
  | 'action'       // 业务操作
  | 'tab_switch'   // Tab 切换

/** 模块标识 */
export type TrackingModule =
  | 'home'
  | 'ask'
  | 'resume'
  | 'job'
  | 'optimize'
  | 'interview'
  | 'profile'
  | 'settings'
  | 'about'
  | 'auth'

/** 单条追踪事件 */
export interface TrackEvent {
  eventType: TrackingEventType
  module: TrackingModule
  page: string           // 页面路由，如 'pages/resume/list'
  timestamp: number      // Date.now()
  duration?: number      // 停留时长（ms），仅 page_leave 时存在
  action?: string        // 行为标识，如 'create'、'search'、'delete'、'filter_status'
}

/** 批量上报载荷（userId 由服务端从 JWT 提取，客户端不传） */
export interface AnalyticsBatchPayload {
  events: TrackEvent[]
  sessionId: string
  platform: string       // 'h5' | 'mp-weixin' | 'other'
}

/** 批量上报响应 */
export interface AnalyticsBatchResult {
  received: number
}

/** 统计查询响应 */
export interface AnalyticsStatsResponse {
  pageViews: Record<string, number>
  avgDurations: Record<string, number>       // 毫秒
  topActions: Array<{ module: string; action: string; count: number }>
  dailyActiveUsers: Array<{ date: string; count: number }>
  moduleFrequency: Record<string, number>
}
