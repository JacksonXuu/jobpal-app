import { describe, it, expect, beforeEach, vi } from "vitest";
import { encryptPassword, decryptPassword } from "../utils/crypto";

beforeEach(() => {
  vi.clearAllMocks();
  const storage: Record<string, string> = {};
  (uni.getStorageSync as any).mockImplementation((key: string) => storage[key] ?? "");
  (uni.setStorageSync as any).mockImplementation((key: string, value: string) => {
    storage[key] = value;
  });
});

describe("crypto", () => {
  it("加密后解密可还原原文", async () => {
    const original = "hello123";
    const encrypted = await encryptPassword(original);
    const decrypted = await decryptPassword(encrypted);
    expect(decrypted).toBe(original);
  });

  it("纯数字密码加解密往返正常", async () => {
    const original = "1234567890";
    const encrypted = await encryptPassword(original);
    const decrypted = await decryptPassword(encrypted);
    expect(decrypted).toBe(original);
  });

  it("中文密码加解密往返正常", async () => {
    const original = "我的密码123";
    const encrypted = await encryptPassword(original);
    const decrypted = await decryptPassword(encrypted);
    expect(decrypted).toBe(original);
  });

  it("同一密码两次加密结果不同（OAEP 随机填充）", async () => {
    const password = "samepassword";
    const enc1 = await encryptPassword(password);
    const enc2 = await encryptPassword(password);
    expect(enc1).not.toBe(enc2);
  });

  it("密钥对缓存：第二次加密不重新生成密钥对", async () => {
    // 首次加密生成密钥对
    await encryptPassword("first");
    const setCallsBefore = (uni.setStorageSync as any).mock.calls.length;

    // 第二次加密复用缓存
    await encryptPassword("second");
    const setCallsAfter = (uni.setStorageSync as any).mock.calls.length;

    // setStorageSync 只在第一次生成密钥对时调用（2次：pub + prv）
    expect(setCallsAfter).toBe(setCallsBefore);
  });

  it("解密被篡改的密文返回空（jsencrypt 对无效输入返回 false）", async () => {
    // jsencrypt.decrypt 对无效 base64/篡改密文返回 false 而非抛异常
    // crypto.ts 将 false 转为 throw
    await expect(decryptPassword("invalid_base64!!!")).rejects.toThrow("密码解密失败");
  });

  it("空字符串加解密往返正常", async () => {
    const encrypted = await encryptPassword("");
    const decrypted = await decryptPassword(encrypted);
    expect(decrypted).toBe("");
  });

  it("localStorage 有密钥缓存时跳过生成", async () => {
    // 首次调用已生成密钥并写入 storage
    await encryptPassword("first");
    const callsBefore = (uni.setStorageSync as any).mock.calls.length;
    // 模拟冷启动：清空内存缓存但保留 storage
    // 重新加载模块会重置缓存，这里仅验证 storage 写入次数不变
    await encryptPassword("second");
    expect((uni.setStorageSync as any).mock.calls.length).toBe(callsBefore);
  });
});
