# JobPal App — 求职助手（用户端）

求职者的求职一站式助手，帮助求职者管理简历、记录心仪岗位，并通过 AI 大模型对简历进行针对性优化，提升面试机会。

## 一期功能

- **注册/登录** — 手机号注册登录
- **简历夹** — 上传、下载、多简历管理
- **心动岗位** — 粘贴 JD 文本，增删改查及关键词过滤
- **AI 简历优化** ⭐ — 单选简历 + 岗位，AI 针对性优化，SSE 流式 + 打字机效果

## 技术栈

| 层 | 技术 |
|------|------|
| 框架 | uni-app (Vue 3 + Composition API) |
| 语言 | TypeScript |
| UI 组件库 | uni-ui |
| 状态管理 | Pinia |
| 构建工具 | Vite 5 |
| 目标平台 | H5 → 微信小程序 → Android → iOS |

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动 H5 开发服务器（浏览器预览）
pnpm dev:h5

# 启动微信小程序开发
pnpm dev:mp-weixin
```

浏览器打开 `http://localhost:8080` 即可预览。

## 构建

```bash
# 构建 H5
pnpm build:h5

# 构建微信小程序
pnpm build:mp-weixin
```

## 项目结构

```
jobpal-app/
├── src/
│   ├── pages/          # 页面组件
│   │   ├── index/      # 首页
│   │   ├── login/      # 登录
│   │   ├── register/   # 注册
│   │   ├── resume/     # 简历夹
│   │   ├── job/        # 心动岗位
│   │   ├── optimize/   # AI 简历优化
│   │   └── profile/    # 个人中心
│   ├── components/     # 公共组件
│   ├── api/            # 接口请求层
│   ├── stores/         # Pinia 状态管理
│   └── composables/    # 组合式函数
├── pages.json          # 页面路由 + TabBar
├── manifest.json       # uni-app 配置
└── uni.scss            # 全局样式变量
```

## 相关项目

JobPal 由三个项目组成：

| 项目 | 定位 | 技术栈 |
|------|------|--------|
| **jobpal-app**（本项目） | 用户端（移动端） | uni-app + Vue 3 + TypeScript |
| [jobpal-manage](https://gitee.com/JacksonXuu/jobpal-manage) | 管理端（PC 端） | React 18 + Ant Design 5 |
| jobpal-server | 后端 API 服务 | NestJS + Prisma + MySQL |

## 开发规范

- Vue 3 Composition API（`<script setup lang="ts">`）
- 接口调用统一走 `api/` 层
- 跨页面状态用 Pinia，页面内状态用 `ref`/`reactive`
- 每个页面处理 loading、empty、error 三种状态
- 平台差异代码用条件编译包裹
