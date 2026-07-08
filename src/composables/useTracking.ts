/**
 * 页面级追踪 Composable
 *
 * 每个页面在 <script setup> 顶部调用一次，自动完成：
 * - page_enter 事件（进入时）
 * - page_leave 事件（离开时，含停留时长）
 * - 提供 trackAction / trackClick 手动埋点方法
 *
 * 使用方式：
 *   const { trackAction, trackClick } = useTracking({ module: 'job' })
 *   trackAction('create')           // 记录业务操作
 *   trackClick('stats_card_resume') // 记录点击事件
 */
import { onHide } from '@dcloudio/uni-app'
import { track, flush, isEnabled } from '@/utils/tracking'
import type { TrackingModule, TrackingEventType } from '@/types/tracking'

interface UseTrackingOptions {
  /** 所属模块 */
  module: TrackingModule
  /** 页面路由，不传则自动获取当前页面路径 */
  page?: string
}

export function useTracking(options: UseTrackingOptions) {
  const enterTime = Date.now()
  const module = options.module
  const page = options.page || getCurrentRoute()

  // 页面进入：自动记录 page_enter
  if (isEnabled()) {
    track({ eventType: 'page_enter', module, page })
  }

  // 页面离开：记录 page_leave + 停留时长，并强制 flush
  onHide(() => {
    if (isEnabled()) {
      const duration = Date.now() - enterTime
      track({ eventType: 'page_leave', module, page, duration })
      flush()
    }
  })

  /**
   * 记录业务操作事件。
   * @param action 行为标识，如 'create'、'search'、'delete'
   */
  function trackAction(action: string) {
    track({ eventType: 'action', module, page, action })
  }

  /**
   * 记录点击事件。
   * @param action 点击目标标识，如 'stats_card_resume'、'fab_create'
   */
  function trackClick(action: string) {
    track({ eventType: 'click', module, page, action })
  }

  return { trackAction, trackClick }
}

/** 获取当前页面路由路径 */
function getCurrentRoute(): string {
  try {
    const pages = getCurrentPages()
    if (pages.length > 0) {
      return pages[pages.length - 1].route || 'unknown'
    }
  } catch {
    // uni-app 未就绪时静默失败
  }
  return 'unknown'
}
