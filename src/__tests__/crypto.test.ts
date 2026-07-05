import { describe, it, expect } from "vitest";
import { encryptPassword, decryptPassword } from "../utils/crypto";

describe("encryptPassword", () => {
  it("当前版本透传密码（后端 bcrypt 哈希）", async () => {
    const original = "myPassword123";
    const encrypted = await encryptPassword(original);
    expect(encrypted).toBe(original);
  });

  it("纯数字密码透传", async () => {
    const original = "1234567890";
    const encrypted = await encryptPassword(original);
    expect(encrypted).toBe(original);
  });
});

describe("decryptPassword", () => {
  it("客户端解密已废弃，直接抛出异常", async () => {
    await expect(decryptPassword("anything")).rejects.toThrow("客户端解密已废弃");
  });
});
