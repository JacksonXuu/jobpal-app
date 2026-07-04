---
name: jp-test-incremental
description: 对 git diff 中修改的纯逻辑文件生成单元测试并执行，输出覆盖报告
---

# 增量测试 `/jp-test-incremental`

对当前工作区中已修改的纯逻辑模块自动生成/更新单元测试并执行。

## 触发条件

- 用户输入 `/jp-test-incremental`
- 用户说"增量测试"、"跑一下测试"、"给修改的文件写测试"

## 执行流程

### Step 1: 找出修改的纯逻辑文件

```bash
git diff HEAD --name-only
```

筛选出路径匹配 `src/(utils|apis|stores|composables)/` 的 `.ts` 文件。

如果没有匹配到纯逻辑文件，直接告知用户并结束。

### Step 2: 为每个修改文件生成/更新测试

- 测试文件位于 `src/__tests__/<模块名>.test.ts`
- 使用 vitest 语法（`describe`/`it`/`expect`）
- 测试文件顶部自动 import `src/__tests__/setup.ts`（uni 全局 mock 已在 vitest.config 中配置）
- 覆盖策略：
  - 纯函数：覆盖所有分支（正常、边界、异常）
  - 带 uni 依赖的函数：mock uni API，验证调用参数和返回值
  - Store：覆盖 init/setLogin/logout 完整状态变迁

### Step 3: 执行测试

```bash
pnpm test -- src/__tests__/<文件1>.test.ts src/__tests__/<文件2>.test.ts
```

### Step 4: 输出报告

按以下格式输出结果：

```
## 增量测试报告

| 文件 | 测试数 | 通过 | 失败 | 状态 |
|------|--------|------|------|------|
| auth.test.ts | 12 | 12 | 0 | ✅ |
| crypto.test.ts | 6 | 5 | 1 | ❌ |

**通过率：17/18 (94%)**

### 失败详情（如有）
- crypto.test.ts > encryptPassword > 空字符串加密 — expected "xxx" but got "yyy"

### 未覆盖模块
- (无)
```

## 测试编写规范

```typescript
// 示例：src/__tests__/auth.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { login, register } from "../apis/auth";

describe("auth", () => {
  beforeEach(() => {
    // 清空 mock storage
    (uni.getStorageSync as any).mockImplementation((key: string) => "");
  });

  describe("register", () => {
    it("正常注册返回 token 和用户信息", async () => { ... });
    it("用户名过短应报错", async () => { ... });
    it("admin 用户名应被拒绝", async () => { ... });
  });
});
```

## 注意事项

- 跳过 `.vue` 组件文件（需要 DOM 环境，方案未就绪）
- 跳过 `request.ts`（当前为死代码骨架）
- 如果已有测试文件存在，增量更新而非覆盖
