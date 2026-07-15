import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock Web Crypto API — 用确定的 hash 输出保证测试可重复
const mockDigest = vi.fn();
const mockCrypto = {
  subtle: {
    digest: mockDigest,
  },
};

beforeEach(() => {
  vi.stubGlobal("crypto", mockCrypto);
  mockDigest.mockReset();
});

// 动态 import，确保在 mock 之后加载
const cryptoModule = await import("../utils/crypto");
const { encryptPassword } = cryptoModule;

/**
 * 将字符串转为 SHA-256 hash 的 hex 字符串（用于生成预期值）
 */
async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  // 使用 vitest 环境提供的真实 crypto（如果有的话），否则手动 mock
  // 这里我们用 mock 控制输出
  return "";
}

/**
 * 模拟 digest 返回特定 hash 结果的 helper
 */
function mockHashReturn(hexString: string) {
  // 将 hex 字符串转为 ArrayBuffer
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  mockDigest.mockResolvedValue(bytes.buffer);
}

describe("encryptPassword (SHA-256)", () => {
  const KNOWN_HASH =
    "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f";

  it("正常密码返回 64 位 hex 字符串", async () => {
    mockHashReturn(KNOWN_HASH);
    const result = await encryptPassword("password123");
    expect(result).toBe(KNOWN_HASH);
    expect(result).toHaveLength(64);
  });

  it("仅含 hex 字符 (0-9, a-f)", async () => {
    mockHashReturn(KNOWN_HASH);
    const result = await encryptPassword("password123");
    expect(result).toMatch(/^[0-9a-f]+$/);
  });

  it("相同输入产生相同输出（幂等）", async () => {
    mockHashReturn(KNOWN_HASH);
    const r1 = await encryptPassword("same");
    const r2 = await encryptPassword("same");
    expect(r1).toBe(r2);
  });

  it("不同输入产生不同输出", async () => {
    mockHashReturn(KNOWN_HASH);
    const r1 = await encryptPassword("alpha");
    mockDigest.mockReset();

    const DIFF_HASH =
      "a948904f2f0f479b8f8197694b30184b0d2ed1c1cd2a1ec0fb85d299a192a447";
    mockHashReturn(DIFF_HASH);
    const r2 = await encryptPassword("beta");
    expect(r1).not.toBe(r2);
  });

  it("空字符串也能正常哈希", async () => {
    const EMPTY_HASH =
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    mockHashReturn(EMPTY_HASH);
    const result = await encryptPassword("");
    expect(result).toBe(EMPTY_HASH);
    expect(result).toHaveLength(64);
  });

  it("中文密码正常哈希", async () => {
    mockHashReturn(KNOWN_HASH);
    const result = await encryptPassword("中文密码测试");
    expect(result).toHaveLength(64);
  });

  it("调用 crypto.subtle.digest 时传入算法为 SHA-256", async () => {
    mockHashReturn(KNOWN_HASH);
    await encryptPassword("test");
    expect(mockDigest).toHaveBeenCalledTimes(1);
    expect(mockDigest).toHaveBeenCalledWith(
      "SHA-256",
      expect.any(ArrayBuffer)
    );
  });
});
