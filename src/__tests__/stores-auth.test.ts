import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "../stores/auth";

// 每个测试创建独立 Pinia 实例
beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe("auth store", () => {
  it("初始状态未登录", () => {
    const store = useAuthStore();
    expect(store.isLogin).toBe(false);
    expect(store.token).toBe("");
    expect(store.userInfo).toBeNull();
  });

  it("setLogin 设置 token 和 userInfo，isLogin 为 true", () => {
    const store = useAuthStore();
    store.setLogin("test_token_123", { id: "u1", username: "alice" });
    expect(store.token).toBe("test_token_123");
    expect(store.isLogin).toBe(true);
    expect(store.userInfo?.username).toBe("alice");
    expect(uni.setStorageSync).toHaveBeenCalledWith("token", "test_token_123");
    expect(uni.setStorageSync).toHaveBeenCalledWith(
      "userInfo",
      JSON.stringify({ id: "u1", username: "alice" })
    );
  });

  it("logout 清除 token 和 userInfo", () => {
    const store = useAuthStore();
    store.setLogin("token", { id: "u1", username: "alice" });
    store.logout();

    expect(store.token).toBe("");
    expect(store.isLogin).toBe(false);
    expect(store.userInfo).toBeNull();
    expect(uni.removeStorageSync).toHaveBeenCalledWith("token");
    expect(uni.removeStorageSync).toHaveBeenCalledWith("userInfo");
  });

  it("init 从 storage 恢复登录态", () => {
    (uni.getStorageSync as any)
      .mockReturnValueOnce("saved_token") // token
      .mockReturnValueOnce(JSON.stringify({ id: "u2", username: "bob" })); // userInfo

    const store = useAuthStore();
    store.init();

    expect(store.token).toBe("saved_token");
    expect(store.isLogin).toBe(true);
    expect(store.userInfo?.username).toBe("bob");
  });

  it("init 无缓存时保持未登录", () => {
    (uni.getStorageSync as any).mockReturnValue("");

    const store = useAuthStore();
    store.init();

    expect(store.token).toBe("");
    expect(store.isLogin).toBe(false);
    expect(store.userInfo).toBeNull();
  });

  it("setLogin → logout → init 完整生命周期", () => {
    const store = useAuthStore();

    store.setLogin("full_token", { id: "u3", username: "charlie" });
    expect(store.isLogin).toBe(true);

    store.logout();
    expect(store.isLogin).toBe(false);

    store.init();
    expect(store.isLogin).toBe(false);
  });

  it("连续 logout 两次不报错（幂等性）", () => {
    const store = useAuthStore();
    store.setLogin("t", { id: "u1", username: "a" });
    store.logout();
    store.logout(); // 不应报错
    expect(store.isLogin).toBe(false);
  });

  it("连续 setLogin 以最后一次为准", () => {
    const store = useAuthStore();
    store.setLogin("t1", { id: "u1", username: "first" });
    store.setLogin("t2", { id: "u2", username: "second" });
    expect(store.token).toBe("t2");
    expect(store.userInfo?.username).toBe("second");
  });
});
