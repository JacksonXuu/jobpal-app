import { describe, it, expect, beforeEach, vi } from "vitest"

// mock request 模块
vi.mock("@/utils/request", () => ({
  request: vi.fn(),
}))

import { request } from "@/utils/request"
import {
  validateJobForm,
  createJob,
  getJobList,
  getJobDetail,
  updateJob,
  deleteJob,
  JOB_STATUS_OPTIONS,
  SOURCE_PLATFORM_OPTIONS,
  SORT_BY_OPTIONS,
  SALARY_MIN,
  SALARY_MAX,
} from "../apis/job"

beforeEach(() => {
  vi.clearAllMocks()
})

// === 常量测试 ===
describe("JOB_STATUS_OPTIONS", () => {
  it("包含待投递", () => {
    expect(JOB_STATUS_OPTIONS).toContain("待投递")
  })
  it("包含已归档", () => {
    expect(JOB_STATUS_OPTIONS).toContain("已归档")
  })
  it("共 8 个状态", () => {
    expect(JOB_STATUS_OPTIONS).toHaveLength(8)
  })
})

describe("SOURCE_PLATFORM_OPTIONS", () => {
  it("包含 3 个平台", () => {
    expect(SOURCE_PLATFORM_OPTIONS).toHaveLength(3)
  })
})

describe("SORT_BY_OPTIONS", () => {
  it("包含 updatedAt", () => {
    expect(SORT_BY_OPTIONS).toContain("updatedAt")
  })
})

describe("SALARY 常量", () => {
  it("最低 1k，最高 100k", () => {
    expect(SALARY_MIN).toBe(1)
    expect(SALARY_MAX).toBe(100)
  })
})

// === 纯校验函数测试 ===
describe("validateJobForm", () => {
  it("正常表单通过", () => {
    expect(
      validateJobForm({ jobName: "前端开发", companyName: "字节跳动", salary: 30 })
    ).toBeNull()
  })

  it("jobName 为空字符串报错", () => {
    expect(
      validateJobForm({ jobName: "", companyName: "字节跳动", salary: 30 })
    ).toBe("请输入岗位名称")
  })

  it("jobName 纯空格报错", () => {
    expect(
      validateJobForm({ jobName: "   ", companyName: "字节跳动", salary: 30 })
    ).toBe("请输入岗位名称")
  })

  it("companyName 为空报错", () => {
    expect(
      validateJobForm({ jobName: "前端开发", companyName: "", salary: 30 })
    ).toBe("请输入公司名称")
  })

  it("companyName 纯空格报错", () => {
    expect(
      validateJobForm({ jobName: "前端开发", companyName: "  ", salary: 30 })
    ).toBe("请输入公司名称")
  })

  it("salary 为 0 报错（低于最小值）", () => {
    expect(
      validateJobForm({ jobName: "前端开发", companyName: "字节跳动", salary: 0 })
    ).toContain("薪资需在")
  })

  it("salary 为 101 报错（超过最大值）", () => {
    expect(
      validateJobForm({ jobName: "前端开发", companyName: "字节跳动", salary: 101 })
    ).toContain("薪资需在")
  })

  it("salary 为字符串数字正常通过", () => {
    expect(
      validateJobForm({ jobName: "前端开发", companyName: "字节跳动", salary: "30" })
    ).toBeNull()
  })

  it("salary 为非数字字符串报错", () => {
    expect(
      validateJobForm({ jobName: "前端开发", companyName: "字节跳动", salary: "abc" })
    ).toContain("薪资需在")
  })

  it("salary 边界值 1 通过", () => {
    expect(
      validateJobForm({ jobName: "前端开发", companyName: "字节跳动", salary: 1 })
    ).toBeNull()
  })

  it("salary 边界值 100 通过", () => {
    expect(
      validateJobForm({ jobName: "前端开发", companyName: "字节跳动", salary: 100 })
    ).toBeNull()
  })
})

// === API 测试（mock request） ===
const mockJob = {
  id: "j1",
  userId: "u1",
  jobName: "前端开发",
  companyName: "字节跳动",
  salary: 30,
  rating: 4,
  sourcePlatform: "招聘平台",
  status: "待投递",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-02",
}

describe("createJob", () => {
  it("创建岗位成功返回岗位信息", async () => {
    (request as any).mockResolvedValueOnce({ code: 0, data: mockJob })
    const res = await createJob({
      jobName: "前端开发",
      companyName: "字节跳动",
      salary: 30,
    })
    expect(res.id).toBe("j1")
    expect(res.jobName).toBe("前端开发")
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/v1/jobs",
        method: "POST",
      })
    )
  })

  it("创建失败抛出异常", async () => {
    (request as any).mockRejectedValueOnce(new Error("岗位名称已存在"))
    await expect(
      createJob({ jobName: "重复岗位", companyName: "测试", salary: 10 })
    ).rejects.toThrow("岗位名称已存在")
  })
})

describe("getJobList", () => {
  it("无参数返回列表", async () => {
    (request as any).mockResolvedValueOnce({
      code: 0,
      data: { list: [mockJob], total: 1 },
    })
    const res = await getJobList()
    expect(res.list).toHaveLength(1)
    expect(res.total).toBe(1)
  })

  it("带 keyword 参数过滤空值", async () => {
    (request as any).mockResolvedValueOnce({
      code: 0,
      data: { list: [], total: 0 },
    })
    await getJobList({ keyword: "前端", status: "", sourcePlatform: undefined })
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("keyword="),
      })
    )
  })

  it("带完整筛选参数", async () => {
    (request as any).mockResolvedValueOnce({
      code: 0,
      data: { list: [mockJob], total: 1 },
    })
    await getJobList({
      keyword: "开发",
      status: "待投递",
      sourcePlatform: "招聘平台",
      sortBy: "salary",
      sortOrder: "desc",
    })
    const callUrl = (request as any).mock.calls[0][0].url
    expect(callUrl).toContain("keyword=")
    expect(callUrl).toContain("status=")
    expect(callUrl).toContain("sourcePlatform=")
    expect(callUrl).toContain("sortBy=salary")
    expect(callUrl).toContain("sortOrder=desc")
  })

  it("服务端错误抛出异常", async () => {
    (request as any).mockRejectedValueOnce(new Error("服务异常"))
    await expect(getJobList()).rejects.toThrow("服务异常")
  })
})

describe("getJobDetail", () => {
  it("返回岗位详情", async () => {
    (request as any).mockResolvedValueOnce({ code: 0, data: mockJob })
    const res = await getJobDetail("j1")
    expect(res.id).toBe("j1")
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/v1/jobs/j1" })
    )
  })

  it("不存在的岗位抛出异常", async () => {
    (request as any).mockRejectedValueOnce(new Error("岗位不存在"))
    await expect(getJobDetail("not-exist")).rejects.toThrow("岗位不存在")
  })
})

describe("updateJob", () => {
  it("更新岗位成功返回最新信息", async () => {
    const updated = { ...mockJob, jobName: "全栈开发", salary: 50 }
    ;(request as any).mockResolvedValueOnce({ code: 0, data: updated })
    const res = await updateJob("j1", { jobName: "全栈开发", salary: 50 })
    expect(res.jobName).toBe("全栈开发")
    expect(res.salary).toBe(50)
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/v1/jobs/j1",
        method: "PUT",
      })
    )
  })

  it("更新失败抛出异常", async () => {
    (request as any).mockRejectedValueOnce(new Error("无权修改"))
    await expect(
      updateJob("j1", { jobName: "修改" })
    ).rejects.toThrow("无权修改")
  })
})

describe("deleteJob", () => {
  it("删除成功", async () => {
    (request as any).mockResolvedValueOnce({ code: 0, data: null })
    await expect(deleteJob("j1")).resolves.toBeUndefined()
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/v1/jobs/j1",
        method: "DELETE",
      })
    )
  })

  it("删除失败抛出异常", async () => {
    (request as any).mockRejectedValueOnce(new Error("岗位不存在"))
    await expect(deleteJob("not-exist")).rejects.toThrow("岗位不存在")
  })
})
