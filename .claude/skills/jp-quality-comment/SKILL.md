---
name: jp-quality-comment
description: 检查新增/修改代码的注释完整性，确保每个函数和核心逻辑都有准确注释
---

# 注释检查 `/jp-quality-comment`

检查当前工作区新增/修改代码的注释是否达标。

## 触发条件

- 用户输入 `/jp-quality-comment`
- 用户说"检查注释"、"注释够不够"、"有没有缺注释"

## 注释标准

### 必须有注释

1. **每个导出的函数/方法** — 一句话说明做什么，关键参数含义
2. **核心算法/业务逻辑** — 为什么这样写（不是"做什么"，代码本身能看出来）
3. **非显而易见的判断/分支** — 比如 `if (status === 3)` 要说明 status=3 代表什么
4. **临时方案/待办项** — `TODO` 或 `FIXME` 标注原因和计划

### 不需要注释

1. **自解释代码** — `const userName = user.name` 不需要写"获取用户名"
2. **重复签名** — 不写"login 函数用于登录"这种废话
3. **Vue 模板事件绑定** — `@tap="handleClick"` 不需要注释

### 注释风格

```typescript
// ✅ 好注释：说明为什么
// 使用 RSA 解密后比对明文，OAEP 每次加密结果不同不能直接比密文
const decrypted = await decryptPassword(user.encryptedPassword)

// ❌ 坏注释：重复代码
// 解密密码
const decrypted = await decryptPassword(user.encryptedPassword)

// ✅ 好注释：JS Doc 描述接口契约
/**
 * 用户注册
 * @param username 3-20 位字母数字下划线中文，禁止 admin
 * @param password 6-20 位，明文传入（内部 RSA 加密存储）
 * @returns token 和用户信息
 */
export async function register(params: RegisterParams): Promise<AuthResult>

// ❌ 坏注释：啰嗦废话
/**
 * 这是一个注册函数
 * 它接收用户名和密码
 * 然后返回一个结果
 */
```

## 执行流程

1. `git diff HEAD --name-only` + `git status --short` 找出新增/修改的 `.ts` `.vue` 文件
2. 逐一审查每个文件的注释
3. 按严重性输出报告

## 输出报告格式

```
## 注释检查报告

### ❌ 缺注释
| 文件 | 行 | 问题 |
|------|-----|------|
| auth.ts | 80 | login 函数缺少 JS Doc |
| crypto.ts | 33 | 密钥生成逻辑未注释 |

### ⚠️ 注释质量不足
| 文件 | 行 | 问题 | 建议 |
|------|-----|------|------|
| login.vue | 103 | validate 注释太简略 | 补充各分支含义 |

### ✅ 已达标
- stores/auth.ts
- utils/request.ts

**总计：5 文件，2 缺注释，1 质量不足，2 达标**
```

## 注意事项

- 跳过 `node_modules/`、`dist/`、`.json` 配置文件
- 跳过仅改动样式/CSS 的文件
- 新增文件和存量文件改动的检查标准一致
