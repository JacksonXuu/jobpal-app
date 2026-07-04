/**
 * vitest 全局 setup — 模拟 uni-app 全局 API
 */
import { vi } from "vitest";

const storage: Record<string, string> = {};

// @ts-ignore 模拟 uni 全局对象
globalThis.uni = {
  getStorageSync: vi.fn((key: string) => storage[key] ?? ""),
  setStorageSync: vi.fn((key: string, value: string) => {
    storage[key] = value;
  }),
  removeStorageSync: vi.fn((key: string) => {
    delete storage[key];
  }),
  showToast: vi.fn(),
  request: vi.fn(),
  reLaunch: vi.fn(),
  switchTab: vi.fn(),
  navigateTo: vi.fn(),
  redirectTo: vi.fn(),
};
