import { describe, it, expect, beforeEach, vi } from "vitest";

// 每次测试前重置 mock storage
beforeEach(() => {
  vi.clearAllMocks();
  const storage: Record<string, string> = {};
  (uni.getStorageSync as any).mockImplementation((key: string) => storage[key] ?? "");
  (uni.setStorageSync as any).mockImplementation((key: string, value: string) => {
    storage[key] = value;
  });
  (uni.removeStorageSync as any).mockImplementation((key: string) => {
    delete storage[key];
  });
});

import { login, register } from "../apis/auth";

// === register 测试 ===
describe("register", () => {
  it("正常注册返回 token 和 userInfo", async () => {
    const res = await register({ username: "alice", password: "123456" });
    expect(res.token).toMatch(/^mock_token_/);
    expect(res.userInfo.username).toBe("alice");
    expect(res.userInfo.id).toBeTruthy();
  });

  it("用户名过短（<3 位）应报错", async () => {
    await expect(register({ username: "ab", password: "123456" })).rejects.toThrow(
      "用户名需 3-20 位"
    );
  });

  it("用户名过长（>20 位）应报错", async () => {
    await expect(
      register({ username: "a".repeat(21), password: "123456" })
    ).rejects.toThrow("用户名需 3-20 位");
  });

  it("用户名含特殊字符应报错", async () => {
    await expect(register({ username: "alice@bob", password: "123456" })).rejects.toThrow(
      "用户名只能包含字母、数字、下划线或中文"
    );
  });

  it("中文用户名可正常注册", async () => {
    const res = await register({ username: "张三丰", password: "123456" });
    expect(res.userInfo.username).toBe("张三丰");
  });

  it("admin 小写应被拒绝", async () => {
    await expect(register({ username: "admin", password: "123456" })).rejects.toThrow(
      "该用户名已被保留"
    );
  });

  it("Admin 大小写混合应被拒绝", async () => {
    await expect(register({ username: "Admin", password: "123456" })).rejects.toThrow(
      "该用户名已被保留"
    );
  });

  it("密码过短（<6 位）应报错", async () => {
    await expect(register({ username: "alice", password: "12345" })).rejects.toThrow(
      "密码需 6-20 位"
    );
  });

  it("密码过长（>20 位）应报错", async () => {
    await expect(
      register({ username: "alice", password: "1".repeat(21) })
    ).rejects.toThrow("密码需 6-20 位");
  });

  it("用户名边界3位可正常注册", async () => {
    const res = await register({ username: "abc", password: "123456" });
    expect(res.userInfo.username).toBe("abc");
  });

  it("用户名含下划线可正常注册", async () => {
    const res = await register({ username: "hello_world", password: "123456" });
    expect(res.userInfo.username).toBe("hello_world");
  });

  it("密码边界6位可正常注册", async () => {
    const res = await register({ username: "user6", password: "123456" });
    expect(res.token).toBeTruthy();
  });

  it("密码边界20位可正常注册", async () => {
    const res = await register({ username: "user20", password: "1".repeat(20) });
    expect(res.token).toBeTruthy();
  });

  it("纯数字密码可正常注册", async () => {
    const res = await register({ username: "bob", password: "12345678" });
    expect(res.userInfo.username).toBe("bob");
  });

  it("重复用户名应报错", async () => {
    await register({ username: "alice", password: "123456" });
    await expect(register({ username: "alice", password: "654321" })).rejects.toThrow(
      "用户名已存在"
    );
  });

  it("空用户名为 undefined 时应报错", async () => {
    await expect(
      register({ username: "" as any, password: "123456" })
    ).rejects.toThrow("用户名需 3-20 位");
  });
});

// === login 测试 ===
describe("login", () => {
  const user = { username: "testuser", password: "mypassword" };

  beforeEach(async () => {
    await register(user);
  });

  it("正确密码登录成功", async () => {
    const res = await login(user);
    expect(res.token).toMatch(/^mock_token_/);
    expect(res.userInfo.username).toBe("testuser");
  });

  it("错误密码登录失败", async () => {
    await expect(
      login({ username: "testuser", password: "wrongpass" })
    ).rejects.toThrow("密码错误");
  });

  it("不存在的用户登录失败", async () => {
    await expect(
      login({ username: "nobody", password: "123456" })
    ).rejects.toThrow("用户不存在");
  });
});
