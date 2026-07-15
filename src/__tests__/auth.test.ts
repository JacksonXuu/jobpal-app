import { describe, it, expect, beforeEach, vi } from "vitest";

// vi.hoisted 确保 mock 函数在模块加载前初始化
const { mockEncryptPassword } = vi.hoisted(() => ({
  mockEncryptPassword: vi.fn(
    async (password: string) => `sha256:${password}`
  ),
}));

// mock request 模块
vi.mock("@/utils/request", () => ({
  request: vi.fn(),
}));

// mock crypto 模块 — 密码会被哈希后再传输
vi.mock("@/utils/crypto", () => ({
  encryptPassword: mockEncryptPassword,
}));

import { request } from "@/utils/request";
import {
  login,
  register,
  logoutApi,
  validateUsername,
  validatePassword,
} from "../apis/auth";

beforeEach(() => {
  vi.clearAllMocks();
});

// === 纯校验函数测试 ===
describe("validateUsername", () => {
  it("正常用户名通过", () => {
    expect(validateUsername("alice")).toBeNull();
  });

  it("过短 (<3)", () => {
    expect(validateUsername("a")).toContain("用户名需");
  });

  it("过长 (>20)", () => {
    expect(validateUsername("a".repeat(21))).toContain("用户名需");
  });

  it("含特殊字符", () => {
    expect(validateUsername("alice@bob")).toContain("只能包含");
  });

  it("中文通过", () => {
    expect(validateUsername("张三丰")).toBeNull();
  });

  it("含下划线通过", () => {
    expect(validateUsername("hello_world")).toBeNull();
  });

  it("admin 小写拒绝", () => {
    expect(validateUsername("admin")).toContain("已被保留");
  });

  it("Admin 混合拒绝", () => {
    expect(validateUsername("Admin")).toContain("已被保留");
  });
});

describe("validatePassword", () => {
  it("正常密码通过", () => {
    expect(validatePassword("123456")).toBeNull();
  });

  it("过短 (<6)", () => {
    expect(validatePassword("12345")).toContain("密码需");
  });

  it("过长 (>20)", () => {
    expect(validatePassword("1".repeat(21))).toContain("密码需");
  });
});

// === API 测试（mock request） ===
describe("login", () => {
  it("登录成功返回 token 和 userInfo（密码已 SHA-256 哈希）", async () => {
    (request as any).mockResolvedValueOnce({
      code: 0,
      data: {
        access_token: "jwt_token_xxx",
        user: { id: "u1", username: "alice" },
      },
    });

    const res = await login({ username: "alice", password: "123456" });
    expect(res.token).toBe("jwt_token_xxx");
    expect(res.userInfo.username).toBe("alice");

    // 验证密码被哈希后再传输
    expect(mockEncryptPassword).toHaveBeenCalledWith("123456");
    expect((request as any)).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/v1/auth/login",
        method: "POST",
        data: expect.objectContaining({
          username: "alice",
          password: "sha256:123456",
        }),
      })
    );
  });

  it("401 密码错误", async () => {
    (request as any).mockRejectedValueOnce(new Error("用户名或密码错误"));
    await expect(
      login({ username: "alice", password: "wrong" })
    ).rejects.toThrow("用户名或密码错误");
  });
});

describe("register", () => {
  it("注册成功后自动登录返回 token（密码已 SHA-256 哈希）", async () => {
    // 注册请求
    (request as any).mockResolvedValueOnce({
      code: 0,
      data: { id: "u1", username: "alice", status: "active" },
    });
    // 自动登录请求
    (request as any).mockResolvedValueOnce({
      code: 0,
      data: {
        access_token: "jwt_token_xxx",
        user: { id: "u1", username: "alice" },
      },
    });

    const res = await register({ username: "alice", password: "123456" });
    expect(res.token).toBe("jwt_token_xxx");
    expect(res.userInfo.username).toBe("alice");

    // 验证注册时密码被哈希
    expect(mockEncryptPassword).toHaveBeenCalledWith("123456");
    // 第一次调用：注册请求，密码已被哈希
    expect((request as any)).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        url: "/v1/auth/register",
        data: expect.objectContaining({
          password: "sha256:123456",
        }),
      })
    );
  });

  it("注册用户名已存在", async () => {
    (request as any).mockRejectedValueOnce(new Error("用户名已存在"));
    await expect(
      register({ username: "admin", password: "123456" })
    ).rejects.toThrow("用户名已存在");
  });
});

// === logoutApi 测试 ===
describe("logoutApi", () => {
  it("退出登录成功", async () => {
    (request as any).mockResolvedValueOnce({ code: 0, data: null });
    await expect(logoutApi()).resolves.toBeUndefined();
  });

  it("服务端返回错误应抛出异常", async () => {
    (request as any).mockRejectedValueOnce(new Error("token 无效"));
    await expect(logoutApi()).rejects.toThrow("token 无效");
  });
});
