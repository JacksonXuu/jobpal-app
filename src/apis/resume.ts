import { request } from '@/utils/request'

// ── 类型 ──
/** 简历完整模型 */
export interface Resume {
  id: string
  userId: string
  title: string
  content: string
  description?: string
  createdAt: string
  updatedAt: string
}

/** 创建简历参数 */
export interface CreateResumeParams {
  title: string
  content: string
  description?: string
}

/** 编辑简历参数（全部可选） */
export type UpdateResumeParams = Partial<CreateResumeParams>

/** 列表查询参数 */
export interface QueryResumeParams {
  keyword?: string
}

/** 列表响应 */
export interface ResumeListResult {
  list: Resume[]
  total: number
}

// ── 校验 ──
/**
 * 简历表单校验
 * @returns null 表示通过，string 为错误提示
 */
export function validateResumeForm(form: { title: string; content: string }): string | null {
  if (!form.title || !form.title.trim()) {
    return '请输入简历标题'
  }
  if (!form.content || !form.content.trim()) {
    return '请输入简历正文'
  }
  return null
}

// ── API ──
/**
 * 创建简历
 * POST /v1/resumes
 */
export async function createResume(params: CreateResumeParams): Promise<Resume> {
  const res = await request<Resume>({
    url: '/v1/resumes',
    method: 'POST',
    data: params as unknown as Record<string, unknown>,
  })
  return res.data
}

/**
 * 简历列表（不分页，仅搜索）
 * GET /v1/resumes?keyword=
 */
export async function getResumeList(query: QueryResumeParams = {}): Promise<ResumeListResult> {
  const qs = query.keyword ? `?keyword=${encodeURIComponent(query.keyword)}` : ''
  const res = await request<ResumeListResult>({
    url: `/v1/resumes${qs}`,
  })
  return res.data
}

/**
 * 简历详情
 * GET /v1/resumes/:id
 */
export async function getResumeDetail(id: string): Promise<Resume> {
  const res = await request<Resume>({
    url: `/v1/resumes/${id}`,
  })
  return res.data
}

/**
 * 编辑简历（部分更新）
 * PUT /v1/resumes/:id
 */
export async function updateResume(id: string, params: UpdateResumeParams): Promise<Resume> {
  const res = await request<Resume>({
    url: `/v1/resumes/${id}`,
    method: 'PUT',
    data: params as unknown as Record<string, unknown>,
  })
  return res.data
}

/**
 * 删除简历
 * DELETE /v1/resumes/:id
 */
export async function deleteResume(id: string): Promise<void> {
  await request({
    url: `/v1/resumes/${id}`,
    method: 'DELETE',
  })
}
