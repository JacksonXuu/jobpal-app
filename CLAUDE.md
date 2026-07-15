# JobPal App — 用户端（移动端）

## 产品概述

**产品名称：** 求职助手（JobPal）

**产品定位：** 求职者的求职一站式助手，帮助求职者管理简历、记录心仪岗位，并通过 AI 大模型对简历进行针对性优化，提升面试机会。

**本项目定位：** 移动端用户端，提供注册登录、简历管理、心动岗位管理、AI 简历优化、AI 求职问答等功能。

## 项目结构

JobPal 由三个独立项目组成，各自拥有独立的 Git 仓库，托管在 Gitee：

| 项目 | 定位 | 技术栈 |
|------|------|--------|
| `jobpal-app`（本项目） | 用户端（移动端） | uni-app (Vue 3 + Composition API + TypeScript) |
| `jobpal-manage` | 管理端（PC 端） | React 18 + TypeScript + Vite + Ant Design 5 |
| `jobpal-server` | 后端 API 服务 | NestJS + TypeScript + Prisma + MySQL + Redis |

jobpal-app 和 jobpal-manage 共用 jobpal-server 提供的 API 服务。

## 一期产品功能（已全部完成）

- **注册/登录模块：** 用户可注册账号、登录账号，支持用户名+密码方式
- **首页仪表盘：** 展示我的简历、心动岗位、面试记录数量统计，快捷入口
- **简历夹模块：** 上传简历文件及描述，支持下载、编辑、删除，支持多简历管理
- **心动岗位模块：** 粘贴来自 Boss 等平台的 JD 文本，支持增删改查及关键词搜索过滤
- **简历优化模块：** 单选简历 + 单选岗位，接入 AI 大模型，针对简历内容和心仪岗位要求做简历专项优化，SSE 流式输出 + 打字机效果
- **AI 求职问答（问一问）：** AI 对话助手，基于用户简历、岗位、面试记录提供精准答疑，支持多轮对话、历史记录管理
- **面试记录模块：** 面试记录查看
- **个人中心：** 用户信息展示、设置、关于开发者、退出登录
- **桌面端适配：** H5 桌面浏览器下自动切换为侧边栏布局
- **QQ/微信 WebView 适配：** 处理内置浏览器双导航栏兼容问题

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | uni-app 3 (Vue 3 + Composition API + TypeScript) |
| 语言 | TypeScript |
| 构建工具 | Vite 5 |
| 状态管理 | Pinia |
| HTTP 请求 | uni.request（封装拦截器 + 环境变量注入） |
| 测试框架 | Vitest |
| CSS 预处理 | SCSS |
| 目标平台 | H5（已适配）→ 微信小程序 → Android → iOS |

## 环境变量

```bash
# .env.development（开发环境）
VITE_API_BASE_URL=http://localhost:3000

# .env.production（生产环境）
VITE_API_BASE_URL=https://jobpal.jacksonxu.cn/api
```

## 目录结构

```
jobpal-app/
├── package.json                # 依赖与脚本
├── tsconfig.json               # TypeScript 配置
├── vite.config.ts              # Vite 构建配置
├── vitest.config.ts            # 测试配置
├── manifest.json               # uni-app 配置（AppID、权限等）
├── pages.json                  # 页面路由 + tabBar + 全局样式配置
├── uni.scss                    # uni-app 全局 SCSS 变量
├── App.vue                     # 根组件（全局样式 + 初始化逻辑）
├── main.ts                     # 入口文件
├── deploy-h5.sh                # H5 一键部署脚本
├── .env.development            # 开发环境变量
├── .env.production             # 生产环境变量
└── src/
    ├── pages/
    │   ├── login/login.vue         # 登录/注册（合二为一，Tab 切换）
    │   ├── home.vue                # 首页仪表盘（桌面端/移动端自适应）
    │   ├── ask/index.vue           # 问一问（AI 求职问答）
    │   ├── resume/
    │   │   ├── list.vue            # 简历列表
    │   │   ├── detail.vue          # 简历详情
    │   │   └── form.vue            # 上传/编辑简历
    │   ├── job/
    │   │   ├── list.vue            # 心动岗位列表
    │   │   ├── detail.vue          # 岗位详情
    │   │   └── form.vue            # 新增/编辑岗位
    │   ├── interview/
    │   │   └── list.vue            # 面试记录列表
    │   ├── optimize/
    │   │   ├── select.vue          # 选择简历+岗位
    │   │   └── result.vue          # 优化结果（打字机效果）
    │   ├── profile/
    │   │   └── index.vue           # 个人中心
    │   ├── settings/
    │   │   └── index.vue           # 设置
    │   ├── about/
    │   │   └── index.vue           # 关于开发者
    │   └── placeholder/
    │       └── index.vue           # 功能占位页
    ├── components/
    │   ├── ChatBubble.vue          # AI 对话气泡组件
    │   ├── DesktopLayout.vue       # 桌面端侧边栏布局壳
    │   ├── home/
    │   │   └── HomeContent.vue     # 移动端首页内容
    │   └── chat/
    │       └── ChatPanel.vue       # AI 聊天面板（复用：移动端 + 桌面端）
    ├── apis/                       # API 接口层
    │   ├── auth.ts                 # 认证接口（登录、注册、登出）
    │   ├── resume.ts               # 简历 CRUD 接口
    │   ├── job.ts                  # 岗位 CRUD 接口
    │   ├── optimize.ts             # 简历优化接口（SSE）
    │   └── chat.ts                 # AI 对话接口（会话管理 + SSE 聊天）
    ├── composables/
    │   └── useSSE.ts               # SSE 流式连接管理（H5 EventSource + 小程序手动解析）
    ├── stores/
    │   ├── auth.ts                 # 认证状态（token、userInfo、isLogin）
    │   └── app.ts                  # 全局状态（设备类型检测、桌面端判断）
    ├── utils/
    │   ├── request.ts              # uni.request 拦截器封装（自动 token、错误统一处理）
    │   └── crypto.ts               # 密码加密工具（bcrypt 占位，后续 RS��）
    └── __tests__/                  # 单元测试
        ├── setup.ts                # 测试环境配置
        ├── auth.test.ts
        ├── crypto.test.ts
        ├── job.test.ts
        ├── resume.test.ts
        └── stores-auth.test.ts
```

## 页面路由设计（实际）

```json
{
  "pages": [
    { "path": "pages/login/login" },       // 登录/注册
    { "path": "pages/home" },              // 首页
    { "path": "pages/resume/list" },       // 我的简历
    { "path": "pages/resume/detail" },     // 简历详情
    { "path": "pages/resume/form" },       // 上传/编辑简历
    { "path": "pages/job/list" },          // 心动岗位
    { "path": "pages/job/detail" },        // 岗位详情
    { "path": "pages/job/form" },          // 新增/编辑岗位
    { "path": "pages/interview/list" },    // 面试记录
    { "path": "pages/optimize/select" },   // 选择简历+岗位
    { "path": "pages/optimize/result" },   // 优化结果
    { "path": "pages/ask/index" },         // 问一问
    { "path": "pages/profile/index" },     // 我的
    { "path": "pages/settings/index" },    // 设置
    { "path": "pages/about/index" },       // 关于开发者
    { "path": "pages/placeholder/index" }  // 功能占位
  ],
  "tabBar": {
    "list": [
      { "pagePath": "pages/home", "text": "首页" },
      { "pagePath": "pages/ask/index", "text": "问一问" },
      { "pagePath": "pages/profile/index", "text": "我的" }
    ]
  },
  "globalStyle": {
    "navigationBarTitleText": "求职助手",
    "navigationBarBackgroundColor": "#f5fdfc",
    "backgroundColor": "#e8f6fc"
  }
}
```

## API 接口

> Base URL 由 `VITE_API_BASE_URL` 环境变量注入，开发环境为 `http://localhost:3000`，生产环境为 `https://jobpal.jacksonxu.cn/api`

**统一响应格式：** `{ "code": 0, "message": "success", "data": {} }`

### 认证模块

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | /v1/auth/register | 用户注册 | 否 |
| POST | /v1/auth/login | 用户登录 | 否 |
| POST | /v1/auth/logout | 退出登录 | 是 |
| GET | /v1/auth/me | 当前用户信息 | 是 |

### 简历模块

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | /v1/resumes | 上传简历 | 是 |
| GET | /v1/resumes | 简历列表（分页+搜索） | 是 |
| GET | /v1/resumes/:id | 简历详情 | 是 |
| PUT | /v1/resumes/:id | 编辑简历信息 | 是 |
| DELETE | /v1/resumes/:id | 删除简历 | 是 |
| GET | /v1/resumes/:id/download | 下载简历文件 | 是 |

### 心动岗位模块

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | /v1/jobs | 新增岗位 | 是 |
| GET | /v1/jobs | 岗位列表（分页+搜索+过滤） | 是 |
| GET | /v1/jobs/:id | 岗位详情 | 是 |
| PUT | /v1/jobs/:id | 编辑岗位 | 是 |
| DELETE | /v1/jobs/:id | 删除岗位 | 是 |

### AI 简历优化模块

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | /v1/optimize | 发起优化（返回 recordId） | 是 |
| GET | /v1/optimize/history | 优化历史列表 | 是 |
| GET | /v1/optimize/:id | 优化详情（含 streaming 状态） | 是 |
| DELETE | /v1/optimize/batch | 批量删除优化记录 | 是 |

### AI 求职问答模块

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | /v1/chat | SSE 流式对话 | 是 |
| GET | /v1/chat/conversations | 会话历史列表 | 是 |
| GET | /v1/chat/conversations/:id | 会话详情（含消息列表） | 是 |
| DELETE | /v1/chat/conversations/:id | 删除会话 | 是 |
| GET | /v1/chat/suggestions | 推荐问题列表 | 是 |

### 首页 & 面试记录

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | /v1/home/stats | 首页统计数据 | 是 |
| GET | /v1/interviews | 面试记录列表 | 是 |

**SSE 事件类型：** `start` → `token`（逐块文本）→ `progress`（可选）→ `complete` → `error`

## 数据库设计（server 端，前端了解即可）

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| `users` | 用户表 | id, username, passwordHash, status, createdAt |
| `resumes` | 简历表 | id, userId, title, fileName, fileUrl, fileType, fileSize, description |
| `job_positions` | 心动岗位表 | id, userId, companyName, positionName, jdContent, salaryRange, location, tags |
| `resume_optimizations` | AI优化记录 | id, userId, resumeId, jobPositionId, originalText, optimizedText, tokensUsed, status |
| `chat_conversations` | AI对话会话 | id, userId, title, createdAt, updatedAt |
| `chat_messages` | AI对话消息 | id, conversationId, role, content, createdAt |
| `interviews` | 面试记录 | id, userId, companyName, positionName, interviewDate, result, notes |

## 核心实现要点

### 请求拦截器 (`utils/request.ts`)
- 基于 `uni.request` 封装，自动从 Pinia store 读取 token 附加到 `Authorization` Header
- 响应拦截：`code !== 0` 时统一 toast 错误信息，`401` 时清除登录态并跳转登录页
- 支持 `enableChunked: true`（小程序端 SSE 流式消费）

### 认证状态 (`stores/auth.ts`)
- 状态：`{ token, userInfo, isLogin }`
- token 与 userInfo 使用 `uni.setStorageSync` 持久化，应用启动时通过 `init()` 自动恢复
- 登录成功后调用 `setLogin()` 同步更新 store 和本地存储
- `isLogin` 为 computed 属性，由 token 是否存在决定

### 全局状态 (`stores/app.ts`)
- `isDesktop`：通过 UA 检测判断是否为桌面端浏览器（非 Mobile/Android/iPhone/iPad）
- 仅在 H5 模式下生效，用于桌面端/移动端自适应切换
- 桌面端自动注入 `desktop-mode` CSS 类，隐藏 uni-app 导航栏并启用侧边栏布局

### SSE 流式消费 (`composables/useSSE.ts`) 
- H5 模式：使用 `fetch` + `AbortController` + 流式读取 Response body
- 小程序模式（待适配）：`uni.request` + `enableChunked: true` 手动解析 SSE
- 暴露：`{ streamingText, isStreaming, error, connect(options), abort() }`
- `connect()` 接收 `SSEOptions`：`{ url, body, onStart, onToken, onComplete, onError }`

### AI 聊天面板 (`components/ChatPanel.vue`) 
- 移动端 + 桌面端复用同一组件，通过 `mode` prop 切换样式
- 聊天视图：消息气泡列表 + 流式输出 + 自动滚动 + 推荐问题
- 历史视图：会话列表 + 左滑删除
- 暴露 `newSession()` 和 `openConversation()` 供外部调用

### 桌面端布局 (`components/DesktopLayout.vue`)
- 仅在桌面端 H5 浏览器下渲染
- 左侧固定侧边栏（Logo + 导航菜单） + 右侧内容区（scroll-view）
- 导航菜单：首页、问一问

### QQ/微信 WebView 适配
- 在 `App.vue` 的 `onLaunch` 中检测 QQ/微信内置浏览器（UserAgent）
- 通过 `MutationObserver` 持续清空 `<title>` 标签，使浏览器自带标题栏不显示文字
- uni-app 导航栏正常渲染，避免双导航冲突的同时保持布局不变

### 平台条件编译
```vue
<!-- #ifdef H5 --> H5 特有代码 <!-- #endif -->
<!-- #ifdef MP-WEIXIN --> 小程序特有代码 <!-- #endif -->
```

## AI 集成架构

- **AI 平台：** 阿里云百炼 DashScope API
- **推荐模型：** `qwen-turbo`（开发）、`qwen-plus`（生产）
- **简历优化流程：** 选择简历+岗位 → POST /v1/optimize → 轮询 GET /v1/optimize/:id → 打字机效果渲染 → 完成展示 → 复制结果
- **AI 问答流程：** 输入问题 → POST /v1/chat（SSE）→ 逐 token 渲染 → 对话历史保存

### Prompt 核心原则（后端实现）
1. 诚实不编造 / 2. 关键词匹配 / 3. STAR 法则 / 4. 简洁有力 / 5. 针对性提炼

## 部署架构

```
Nginx (ECS 47.107.30.30, :80/:443)
  └── jobpal.jacksonxu.cn
        ├── /api/*   → proxy_pass → NestJS :3000
        ├── /app/*   → 本项目 H5 构建产物 (/var/www/jobpal/app)
        └── /manage/* → 管理端
```

### H5 部署

```bash
# 一键部署（构建 + 上传）
bash deploy-h5.sh

# 或手动分步
npm run build:h5                    # 构建产物在 dist/build/h5/
scp -r dist/build/h5/* root@47.107.30.30:/var/www/jobpal/app/
```

## Git 分支策略

- `master` — 稳定发布分支
- `master_dev` — 当前开发主分支（一期功能开发完成）
- 功能分支：`feature/<模块名>`，完成后合并

## 开发规范

- 使用 Vue 3 Composition API（`<script setup lang="ts">`）
- 页面级组件放 `pages/`，可复用组件放 `components/`
- 接口调用统一走 `apis/` 层，页面不直接调用 `uni.request`
- 跨页面状态用 Pinia，页面内状态用 `ref`/`reactive`
- 每个页面处理三种状态：loading、empty、error
- 平台差异代码用条件编译包裹
- **代码质量底线**：所有优化和功能开发必须符合企业级规范——不能只解决当前问题而增加维护或扩展的复杂度。杜绝代码重复、避免依赖框架内部未公开 API、保持组件职责单一、布局方案统一

## 测试

```bash
npm test              # 运行全部单元测试
npm run test:watch    # 监听模式
npm run type-check    # TypeScript 类型检查
```

测试文件位于 `src/__tests__/`，使用 Vitest 框架，覆盖：
- API 层（auth、resume、job）
- Store（auth 状态管理）
- 工具函数（crypto）
