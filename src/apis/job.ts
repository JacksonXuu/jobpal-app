import { request } from '@/utils/request'

// ── 枚举常量 ──
/** 岗位状态 */
export const JOB_STATUS_OPTIONS = [
  '待投递', '已投递', '待面试', '面试中', '面试结果待反馈', '面试通过', '面试失败', '已归档',
] as const

/** 来源平台 */
export const SOURCE_PLATFORM_OPTIONS = ['招聘平台', '朋友推荐', '官网'] as const

/** 排序字段 */
export const SORT_BY_OPTIONS = ['updatedAt', 'salary', 'rating'] as const

/** 薪资范围 */
export const SALARY_MIN = 1
export const SALARY_MAX = 100

// ── 类型 ──
/** 岗位完整模型 */
export interface JobPosition {
  id: string
  userId: string
  jobName: string
  companyName: string
  salary: number
  requirements?: string
  responsibilities?: string
  attractiveness?: string
  rating: number
  sourcePlatform: string
  status: string
  remark?: string
  createdAt: string
  updatedAt: string
}

/** 创建岗位参数 */
export interface CreateJobParams {
  jobName: string
  companyName: string
  salary: number
  requirements?: string
  responsibilities?: string
  attractiveness?: string
  rating?: number
  sourcePlatform?: string
  status?: string
}

/** 编辑岗位参数（全部可选） */
export type UpdateJobParams = Partial<CreateJobParams>

/** 列表查询参数 */
export interface QueryJobParams {
  keyword?: string
  status?: string
  sourcePlatform?: string
  sortBy?: string
  sortOrder?: string
}

/** 列表响应 */
export interface JobListResult {
  list: JobPosition[]
  total: number
}

// ── 校验 ──
/**
 * 岗位表单校验
 * @returns null 表示通过，string 为错误提示
 */
export function validateJobForm(form: {
  jobName: string
  companyName: string
  salary: number | string
}): string | null {
  if (!form.jobName || !form.jobName.trim()) {
    return '请输入岗位名称'
  }
  if (!form.companyName || !form.companyName.trim()) {
    return '请输入公司名称'
  }
  const salary = Number(form.salary)
  if (isNaN(salary) || salary < SALARY_MIN || salary > SALARY_MAX) {
    return `薪资需在 ${SALARY_MIN}-${SALARY_MAX}k 之间`
  }
  return null
}

// ── API ──
/**
 * 创建岗位
 * POST /v1/jobs
 */
export async function createJob(params: CreateJobParams): Promise<JobPosition> {
  const res = await request<JobPosition>({
    url: '/v1/jobs',
    method: 'POST',
    data: params as unknown as Record<string, unknown>,
  })
  return res.data
}

/**
 * 岗位列表（不分页）
 * GET /v1/jobs?keyword=&status=&sourcePlatform=&sortBy=&sortOrder=
 */
export async function getJobList(query: QueryJobParams = {}): Promise<JobListResult> {
  // 过滤空值参数
  const cleanQuery: Record<string, string> = {}
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      cleanQuery[key] = String(value)
    }
  })
  const qs = Object.entries(cleanQuery)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
  const res = await request<JobListResult>({
    url: `/v1/jobs${qs ? '?' + qs : ''}`,
  })
  return res.data
}

/**
 * 岗位详情
 * GET /v1/jobs/:id
 */
export async function getJobDetail(id: string): Promise<JobPosition> {
  const res = await request<JobPosition>({
    url: `/v1/jobs/${id}`,
  })
  return res.data
}

/**
 * 编辑岗位（部分更新）
 * PUT /v1/jobs/:id
 */
export async function updateJob(id: string, params: UpdateJobParams): Promise<JobPosition> {
  const res = await request<JobPosition>({
    url: `/v1/jobs/${id}`,
    method: 'PUT',
    data: params as unknown as Record<string, unknown>,
  })
  return res.data
}

/**
 * 删除岗位
 * DELETE /v1/jobs/:id
 */
export async function deleteJob(id: string): Promise<void> {
  await request({
    url: `/v1/jobs/${id}`,
    method: 'DELETE',
  })
}

// ── 面试记录 ──

/** 面试状态（仅5种） */
export const INTERVIEW_STATUS_OPTIONS = [
  '待面试', '面试中', '面试结果待反馈', '面试通过', '面试失败',
] as const

/** 面试列表查询参数 */
export interface QueryInterviewParams {
  keyword?: string
  status?: string
  sortBy?: string
  sortOrder?: string
}

/**
 * 面试列表（基于 /v1/jobs，客户端筛选面试状态）
 */
export async function getInterviewList(query: QueryInterviewParams = {}): Promise<JobListResult> {
  const res = await request<JobListResult>({ url: '/v1/jobs' })
  let { list } = res.data

  // 过滤：仅保留 5 种面试状态
  list = list.filter((item) =>
    (INTERVIEW_STATUS_OPTIONS as readonly string[]).includes(item.status),
  )

  // 客户端搜索
  if (query.keyword) {
    const kw = query.keyword.toLowerCase()
    list = list.filter(
      (item) =>
        item.jobName.toLowerCase().includes(kw) ||
        item.companyName.toLowerCase().includes(kw),
    )
  }

  // 客户端状态筛选
  if (query.status) {
    list = list.filter((item) => item.status === query.status)
  }

  // 客户端排序
  const sortBy = query.sortBy || 'updatedAt'
  const sortOrder = query.sortOrder || 'desc'
  list.sort((a, b) => {
    const aVal = sortBy === 'salary' ? a.salary : sortBy === 'rating' ? a.rating : a.updatedAt
    const bVal = sortBy === 'salary' ? b.salary : sortBy === 'rating' ? b.rating : b.updatedAt
    if (aVal < bVal) return sortOrder === 'desc' ? 1 : -1
    if (aVal > bVal) return sortOrder === 'desc' ? -1 : 1
    return 0
  })

  return { list, total: list.length }
}

/**
 * 快速修改状态
 * PATCH /v1/jobs/:id/status
 */
export async function patchJobStatus(id: string, status: string): Promise<JobPosition> {
  const res = await request<JobPosition>({
    url: `/v1/jobs/${id}/status`,
    method: 'PATCH',
    data: { status } as unknown as Record<string, unknown>,
  })
  return res.data
}

/**
 * 更新备注
 * PUT /v1/jobs/:id { remark }
 */
export async function updateRemark(id: string, remark: string): Promise<JobPosition> {
  const res = await request<JobPosition>({
    url: `/v1/jobs/${id}`,
    method: 'PUT',
    data: { remark } as unknown as Record<string, unknown>,
  })
  return res.data
}

/**
 * 批量删除岗位
 * DELETE /v1/jobs/batch
 */
export async function deleteJobsBatch(ids: string[]): Promise<void> {
  await request<void>({
    url: '/v1/jobs/batch',
    method: 'DELETE',
    data: { ids } as unknown as Record<string, unknown>,
  })
}
