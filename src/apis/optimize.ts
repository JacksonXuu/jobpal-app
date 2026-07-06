import { request } from '@/utils/request'

// ── 类型 ──
export interface OptimizeHistoryItem {
  id: string
  resumeId: string
  jobPositionId: string
  resume: { title: string }
  jobPosition: { jobName: string; companyName: string }
  tokensUsed: number | null
  createdAt: string
}

export interface OptimizeDetail {
  id: string
  userId: string
  resumeId: string
  jobPositionId: string
  originalText: string
  optimizedText: string | null
  tokensUsed: number | null
  createdAt: string
  resume: { title: string }
  jobPosition: { jobName: string; companyName: string }
}

// ── API ──
/** 优化历史 */
export async function getOptimizeHistory(keyword = ''): Promise<{ list: OptimizeHistoryItem[]; total: number }> {
  const qs = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
  const res = await request<{ list: OptimizeHistoryItem[]; total: number }>({
    url: `/v1/optimize/history${qs}`,
  })
  return res.data
}

/** 优化详情 */
export async function getOptimizeDetail(id: string): Promise<OptimizeDetail> {
  const res = await request<OptimizeDetail>({
    url: `/v1/optimize/${id}`,
  })
  return res.data
}
