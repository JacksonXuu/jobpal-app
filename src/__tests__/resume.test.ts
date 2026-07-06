import { describe, it, expect, beforeEach, vi } from "vitest"

// mock request 模块
vi.mock("@/utils/request", () => ({
  request: vi.fn(),
}))

import { request } from "@/utils/request"
import {
  validateResumeForm,
  createResume,
  getResumeList,
  getResumeDetail,
  updateResume,
  deleteResume,
} from "../apis/resume"

beforeEach(() => {
  vi.clearAllMocks()
})

// === 纯校验函数测试 ===
describe("validateResumeForm", () => {
  it("正常表单通过", () => {
    expect(
      validateResumeForm({ title: "我的简历", content: "# 个人简介\n..." })
    ).toBeNull()
  })

  it("title 为空字符串报错", () => {
    expect(
      validateResumeForm({ title: "", content: "内容" })
    ).toBe("请输入简历标题")
  })

  it("title 纯空格报错", () => {
    expect(
      validateResumeForm({ title: "   ", content: "内容" })
    ).toBe("请输入简历标题")
  })

  it("content 为空字符串报错", () => {
    expect(
      validateResumeForm({ title: "标题", content: "" })
    ).toBe("请输入简历正文")
  })

  it("content 纯空格报错", () => {
    expect(
      validateResumeForm({ title: "标题", content: "  " })
    ).toBe("请输入简历正文")
  })
})

// === API 测试（mock request） ===
const mockResume = {
  id: "r1",
  userId: "u1",
  title: "我的简历",
  content: "# 个人简介\n这是内容",
  description: "一份测试简历",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-06-01T12:00:00Z",
}

describe("createResume", () => {
  it("创建简历成功返回简历信息", async () => {
    (request as any).mockResolvedValueOnce({ code: 0, data: mockResume })
    const res = await createResume({
      title: "我的简历",
      content: "# 个人简介\n这是内容",
      description: "一份测试简历",
    })
    expect(res.id).toBe("r1")
    expect(res.title).toBe("我的简历")
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/v1/resumes",
        method: "POST",
      })
    )
  })

  it("创建失败抛出异常", async () => {
    (request as any).mockRejectedValueOnce(new Error("标题已存在"))
    await expect(
      createResume({ title: "重复标题", content: "内容" })
    ).rejects.toThrow("标题已存在")
  })
})

describe("getResumeList", () => {
  it("无参数返回完整列表", async () => {
    (request as any).mockResolvedValueOnce({
      code: 0,
      data: { list: [mockResume], total: 1 },
    })
    const res = await getResumeList()
    expect(res.list).toHaveLength(1)
    expect(res.total).toBe(1)
  })

  it("带 keyword 拼接 query string", async () => {
    (request as any).mockResolvedValueOnce({
      code: 0,
      data: { list: [], total: 0 },
    })
    await getResumeList({ keyword: "测试" })
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining("keyword="),
      })
    )
  })

  it("keyword 为空时不拼接 query string", async () => {
    (request as any).mockResolvedValueOnce({
      code: 0,
      data: { list: [mockResume], total: 1 },
    })
    await getResumeList({ keyword: "" })
    const callUrl = (request as any).mock.calls[0][0].url
    expect(callUrl).toBe("/v1/resumes")
  })

  it("服务端错误抛出异常", async () => {
    (request as any).mockRejectedValueOnce(new Error("服务异常"))
    await expect(getResumeList()).rejects.toThrow("服务异常")
  })
})

describe("getResumeDetail", () => {
  it("返回简历详情", async () => {
    (request as any).mockResolvedValueOnce({ code: 0, data: mockResume })
    const res = await getResumeDetail("r1")
    expect(res.id).toBe("r1")
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/v1/resumes/r1" })
    )
  })

  it("不存在的简历抛出异常", async () => {
    (request as any).mockRejectedValueOnce(new Error("简历不存在"))
    await expect(getResumeDetail("not-exist")).rejects.toThrow("简历不存在")
  })
})

describe("updateResume", () => {
  it("部分更新成功返回最新信息", async () => {
    const updated = { ...mockResume, title: "更新后的标题", content: "新内容" }
    ;(request as any).mockResolvedValueOnce({ code: 0, data: updated })
    const res = await updateResume("r1", { title: "更新后的标题", content: "新内容" })
    expect(res.title).toBe("更新后的标题")
    expect(res.content).toBe("新内容")
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/v1/resumes/r1",
        method: "PUT",
      })
    )
  })

  it("更新失败抛出异常", async () => {
    (request as any).mockRejectedValueOnce(new Error("无权修改"))
    await expect(
      updateResume("r1", { title: "修改" })
    ).rejects.toThrow("无权修改")
  })
})

describe("deleteResume", () => {
  it("删除成功", async () => {
    (request as any).mockResolvedValueOnce({ code: 0, data: null })
    await expect(deleteResume("r1")).resolves.toBeUndefined()
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/v1/resumes/r1",
        method: "DELETE",
      })
    )
  })

  it("删除失败抛出异常", async () => {
    (request as any).mockRejectedValueOnce(new Error("简历不存在"))
    await expect(deleteResume("not-exist")).rejects.toThrow("简历不存在")
  })
})
