---
name: jp-security-review
description: 对当前工作区代码进行安全审查，发现敏感信息泄露、注入漏洞、配置风险等安全隐患
---

# 安全审查 `/jp-security-review`

对当前工作区新增/修改代码进行全面安全审查。

## 触发条件

- 用户输入 `/jp-security-review`
- 用户说"安全检查"、"安全审查"、"有没有安全漏洞"

## 审查维度

### 1. 敏感信息泄露

- 密码、私钥、Token、Secret 是否硬编码在代码中
- 日志/console 是否打印了敏感字段（密码、手机号、身份证）
- localStorage/sessionStorage 是否存储了明文敏感数据
- 前端是否暴露了不该出现的后端配置（数据库连接串、API 密钥）

### 2. 注入漏洞

- SQL/NoSQL 拼接是否使用参数化查询
- URL 拼接是否有 SSRF 风险
- innerHTML/v-html 是否存在 XSS 风险
- eval/Function/new Function 等动态执行是否存在代码注入

### 3. 配置安全

- 配置文件（.json/.yaml/.env）中是否有明文密码/密钥
- `.gitignore` 是否忽略了 `.env`、`.local` 等敏感配置
- API Base URL 是否硬编码为生产地址

### 4. 其他常见隐患

- HTTPS 是否强制（无 HTTP 降级）
- Token 存储是否使用 httpOnly Cookie（而非 localStorage）
- 加密算法是否使用了已废弃的方案（MD5/SHA1/3DES）
- RSA 密钥强度是否达标（≥2048 位）
- 是否缺少 CSRF/XSRF 防护
- 文件上传是否限制了类型和大小
- 权限校验是否在前后端一致（前端校验不能替代后端校验）

## 执行流程

1. `git diff HEAD --name-only` + `git status --short` 找出新增/修改的文件
2. 筛选出需要审查的文件（`.ts` `.vue` `.js` `.json` `.yaml` `.env` `.gitignore`）
3. 逐文件按四个维度审查
4. 输出分级报告

## 输出报告格式

```
## 安全审查报告

### 🔴 高危（必须修复）
| 文件 | 行 | 问题 | 建议 |
|------|-----|------|------|
| config.ts | 5 | API Key 硬编码 | 改用环境变量 |
| auth.ts | 15 | 密码 console.log 打印 | 删除或脱敏 |

### 🟡 中危（建议修复）
| 文件 | 行 | 问题 | 建议 |
|------|-----|------|------|

### 🟢 低危（可接受）
| 文件 | 行 | 问题 | 建议 |
|------|-----|------|------|

### ✅ 已达标
- crypto.ts (RSA 2048位达标)
- .gitignore (已忽略 .local)

**总结：审查 N 个文件，高危 X 项，中危 Y 项，低危 Z 项**
```

## 注意事项

- 仅审查当前 diff 涉及的文件，不做全量扫描
- 如发现 `crypto.subtle` 使用 1024 位密钥，标注为中危（Firefox 不兼容）
- 如发现 `require()` 在 ESM 项目中使用，标注为低危（运行时代码执行风险）
- mock/测试代码中的假密码不视为泄露
