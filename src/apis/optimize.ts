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

/** 发起优化（POST，返回记录 ID 用于轮询） */
export async function requestOptimize(resumeId: string, jobPositionId: string): Promise<{ recordId: string }> {
  const res = await request<{ recordId: string }>({
    url: '/v1/optimize',
    method: 'POST',
    data: { resumeId, jobPositionId } as unknown as Record<string, unknown>,
  })
  return res.data
}

/** 优化详情（含 status: generating | completed） */
export async function getOptimizeDetail(id: string): Promise<OptimizeDetail> {
  const res = await request<OptimizeDetail>({
    url: `/v1/optimize/${id}`,
  })
  return res.data
}

/** 批量删除优化历史 */
export async function deleteOptimizeBatch(ids: string[]): Promise<void> {
  await request({
    url: '/v1/optimize/batch',
    method: 'DELETE',
    data: { ids } as unknown as Record<string, unknown>,
  })
}
