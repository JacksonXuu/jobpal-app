# JobPal App — 用户端（移动端）

## 产品概述

**产品名称：** 求职助手（JobPal）

**产品定位：** 求职者的求职一站式助手，帮助求职者管理简历、记录心仪岗位，并通过 AI 大模型对简历进行针对性优化，提升面试机会。

**本项目定位：** 移动端用户端，提供注册登录、简历管理、心动岗位管理、AI 简历优化等功能。

## 项目结构

JobPal 由三个独立项目组成，各自拥有独立的 Git 仓库，托管在 Gitee：

| 项目 | 定位 | 技术栈 |
|------|------|--------|
| `jobpal-app`（本项目） | 用户端（移动端） | uni-app (Vue 3 + Composition API + TypeScript) |
| `jobpal-manage` | 管理端（PC 端） | React 18 + TypeScript + Vite + Ant Design 5 |
| `jobpal-server` | 后端 API 服务 | NestJS + TypeScript + Prisma + MySQL + Redis |

jobpal-app 和 jobpal-manage 共用 jobpal-server 提供的 API 服务。

## 一期产品功能

- **注册/登录模块：** 用户可注册账号、登录账号
- **简历夹模块：** 上传简历文件及描述，支持下载，支持多简历管理
- **心动岗位模块：** 粘贴来自 Boss 等平台的 JD 文本，支持增删改查及关键词过滤
- **简历优化模块 ⭐：** 单选简历 + 单选岗位，接入 AI 大模型，针对简历内容和心仪岗位要求做简历专项优化

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | uni-app (Vue 3 + Composition API) |
| 语言 | TypeScript |
| UI 组件库 | uni-ui（官方组件库） |
| 状态管理 | Pinia |
| HTTP 请求 | uni.request（封装拦截器） |
| 目标平台 | H5 → 微信小程序 → Android → iOS |

## 开发工作流

**核心原则：按模块拆分，一个模块完成后提交推送再进行下一个模块。**

**Git 分支策略：**
- `main` 分支：稳定代码
- 每个模块从 main 创建 `feature/<模块名>` 分支
- 模块开发完成 → 本地自测 → 提交 → 推送 Gitee → 合并到 main

**模块开发顺序：**
1. uni-app 项目初始化 + 认证模块（登录、注册）
2. 简历夹模块（上传、列表、详情、下载、编辑）
3. 心动岗位模块（新增、列表搜索、详情、编辑）
4. AI 简历优化模块（选择页 + SSE 流式 + 打字机效果）
5. 跨端编译适配（微信小程序 + H5 适配 + UI 完善）

## 目录结构

```
jobpal-app/
├── package.json
├── tsconfig.json
├── manifest.json              # uni-app 配置（小程序 AppID 等）
├── pages.json                 # 页面路由 + tabBar 配置
├── uni.scss                   # 全局样式变量
├── App.vue                    # 根组件
├── main.ts                    # 入口
└── src/
    ├── pages/
    │   ├── index/             # 首页
    │   ├── login/             # 登录
    │   ├── register/          # 注册
    │   ├── resume/
    │   │   ├── list.vue       # 简历列表
    │   │   ├── detail.vue     # 简历详情
    │   │   └── upload.vue     # 上传简历
    │   ├── job/
    │   │   ├── list.vue       # 心动岗位列表
    │   │   ├── detail.vue     # 岗位详情
    │   │   └── form.vue       # 新增/编辑岗位
    │   ├── optimize/
    │   │   ├── select.vue     # 选择简历+岗位
    │   │   └── result.vue     # 优化结果（打字机效果）
    │   └── profile/           # 个人中心
    ├── components/
    │   ├── ResumeCard.vue
    │   ├── JobCard.vue
    │   ├── TypewriterText.vue # SSE 打字机文本组件 ⭐
    │   ├── FileUploader.vue
    │   └── EmptyState.vue
    ├── api/                   # 接口请求层
    │   ├── request.ts         # uni.request 拦截器封装
    │   ├── auth.ts
    │   ├── resume.ts
    │   ├── job.ts
    │   └── optimize.ts        # AI 优化 SSE 接口
    ├── stores/                # Pinia 状态管理
    │   ├── auth.ts
    │   └── app.ts
    └── composables/           # Vue 组合式函数
        ├── useAuth.ts
        ├── useSSE.ts          # SSE 流式连接管理 ⭐
        └── usePagination.ts
```

## 页面路由设计

```json
{
  "pages": [
    { "path": "pages/index/index" },
    { "path": "pages/login/login" },
    { "path": "pages/register/register" },
    { "path": "pages/resume/list" },
    { "path": "pages/resume/detail" },
    { "path": "pages/resume/upload" },
    { "path": "pages/job/list" },
    { "path": "pages/job/detail" },
    { "path": "pages/job/form" },
    { "path": "pages/optimize/select" },
    { "path": "pages/optimize/result" },
    { "path": "pages/profile/index" }
  ],
  "tabBar": {
    "list": [
      { "pagePath": "pages/index/index", "text": "首页" },
      { "pagePath": "pages/resume/list", "text": "简历夹" },
      { "pagePath": "pages/job/list", "text": "心动岗位" },
      { "pagePath": "pages/profile/index", "text": "我的" }
    ]
  }
}
```

## API 接口

> 以下接口由 jobpal-server 提供，Base URL: `https://api.jobpal.com/v1`

**统一响应格式：** `{ "code": 0, "message": "success", "data": {} }`

### 本端使用的接口

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | /v1/auth/register | 用户注册 | 否 |
| POST | /v1/auth/login | 用户登录 | 否 |
| POST | /v1/auth/logout | 退出登录 | 是 |
| GET | /v1/auth/me | 当前用户信息 | 是 |
| POST | /v1/resumes | 上传简历（multipart） | 是 |
| GET | /v1/resumes | 简历列表（分页+搜索） | 是 |
| GET | /v1/resumes/:id | 简历详情 | 是 |
| PUT | /v1/resumes/:id | 编辑简历信息 | 是 |
| DELETE | /v1/resumes/:id | 删除简历 | 是 |
| GET | /v1/resumes/:id/download | 下载简历文件 | 是 |
| POST | /v1/jobs | 新增岗位 | 是 |
| GET | /v1/jobs | 岗位列表（分页+搜索+过滤） | 是 |
| GET | /v1/jobs/:id | 岗位详情 | 是 |
| PUT | /v1/jobs/:id | 编辑岗位 | 是 |
| DELETE | /v1/jobs/:id | 删除岗位 | 是 |
| POST | /v1/optimize | **SSE 流式优化** | 是 |
| GET | /v1/optimize/history | 历史优化记录 | 是 |
| GET | /v1/optimize/:id | 某次优化详情 | 是 |

**SSE 事件类型：** `start` → `token`（逐块文本）→ `progress`（可选）→ `complete` → `error`

## 数据库设计

> 以下为 jobpal-server 的数据库设计，前端了解即可。

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| `users` | 用户表 | id, phone, passwordHash, nickname, status, createdAt |
| `resumes` | 简历表 | id, userId, title, fileName, fileUrl(OSS), fileType, fileSize, description |
| `job_positions` | 心动岗位表 | id, userId, companyName, positionName, jdContent, salaryRange, location, tags |
| `resume_optimizations` | AI优化记录 | id, userId, resumeId, jobPositionId, originalText, optimizedText, tokensUsed |

## 核心实现要点

### 请求拦截器 (`api/request.ts`)
- 基于 `uni.request` 封装，自动从 Pinia store 读取 token 附加到 Header
- 响应拦截：`code !== 0` 时统一 toast 错误信息，`401` 时清除 token 并跳转登录页
- 支持 `enableChunked: true`（小程序端 SSE 流式消费）

### 认证状态 (`stores/auth.ts`)
- `{ token, refreshToken, userInfo, isLogin }`
- token 使用 `uni.setStorageSync` 持久化，启动时自动恢复

### SSE 流式消费 (`composables/useSSE.ts`) ⭐
- H5 模式：使用 `EventSource` API
- 小程序模式：`uni.request` + `enableChunked: true` 手动解析 SSE
- 暴露：`{ text, isStreaming, error, start(), abort() }`

### 打字机效果 (`components/TypewriterText.vue`) ⭐
- Props: `text`（SSE 累积文本），逐字渲染，自动滚动到底部

### 平台条件编译
```vue
<!-- #ifdef H5 --> H5 特有代码 <!-- #endif -->
<!-- #ifdef MP-WEIXIN --> 小程序特有代码 <!-- #endif -->
```

## AI 集成架构

- **AI 平台：** 阿里云百炼 DashScope API
- **推荐模型：** `qwen-turbo`（开发）、`qwen-plus`（生产）
- **前端流程：** 选择简历+岗位 → POST /v1/optimize → 接收 SSE 事件流 → 打字机效果渲染 → 完成展示 → 复制结果

### Prompt 核心原则（后端实现）
1. 诚实不编造 / 2. 关键词匹配 / 3. STAR 法则 / 4. 简洁有力 / 5. 针对性提炼

## 部署架构

```
Nginx (ECS, :80/:443)
  ├── jobpal.com        → 管理端静态文件
  ├── api.jobpal.com    → proxy_pass → NestJS
  └── app.jobpal.com    → 本项目 H5 构建产物
```

## 开发规范

- 使用 Vue 3 Composition API（`<script setup lang="ts">`）
- 页面级组件放 `pages/`，可复用组件放 `components/`
- 接口调用统一走 `api/` 层，页面不直接调用 `uni.request`
- 跨页面状态用 Pinia，页面内状态用 `ref`/`reactive`
- 每个页面处理三种状态：loading、empty、error
- 平台差异代码用条件编译包裹
- **代码质量底线**：所有优化和功能开发必须符合企业级规范——不能只解决当前问题而增加维护或扩展的复杂度。杜绝代码重复、避免依赖框架内部未公开 API、保持组件职责单一、布局方案统一
