# 求职助手 JobPal · 用户端

> 求职者的 AI 一站式助手 — 简历管理 · 心动岗位 · AI 简历优化 · 智能问答

[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![uni-app](https://img.shields.io/badge/uni--app-3.x-2B9939)](https://uniapp.dcloud.net.cn/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)

## 项目简介

JobPal 是一款面向求职者的 AI 求职助手应用。用户端（本项目）支持 **简历管理**、**心动岗位记录**、**AI 简历优化** 和 **AI 求职问答**。

作为 JobPal 生态的移动端，本项目与 [管理端](https://gitee.com/JacksonXuu/jobpal-manage) 共用 [后端 API 服务](https://gitee.com/JacksonXuu/jobpal-server)。

## 一期功能

| 模块 | 说明 |
|------|------|
| 🔐 认证 | 用户名 + 密码注册登录，Token 持久化 |
| 🏠 首页 | 简历/岗位/面试数据统计，快捷功能入口 |
| 📄 简历夹 | 上传文件、列表、详情、编辑、删除、下载 |
| 💼 心动岗位 | 录入 JD 文本，搜索过滤，增删改查 |
| ✨ AI 简历优化 | 简历 + 岗位配对，SSE 流式输出，打字机渲染 |
| 🤖 AI 求职问答 | 多轮智能对话，历史管理，推荐问题 |
| 📋 面试记录 | 面试记录查看 |
| 👤 个人中心 | 用户信息、设置、关于、退出登录 |
| 🖥 桌面端适配 | H5 桌面浏览器自适应侧边栏布局 |

## 技术栈

- **框架**: uni-app 3 (Vue 3 + Composition API + TypeScript)
- **构建**: Vite 5
- **状态管理**: Pinia
- **HTTP**: uni.request（拦截器 + 环境变量注入）
- **样式**: SCSS + uni.scss 全局变量
- **测试**: Vitest
- **目标平台**: H5 ✅ → 微信小程序 → Android → iOS

## 快速开始

```bash
# 安装依赖
npm install

# 启动 H5 开发服务器
npm run dev:h5

# 浏览器打开 http://localhost:8080

# 启动微信小程序开发
npm run dev:mp-weixin
```

## 构建

```bash
npm run build:h5            # H5
npm run build:mp-weixin     # 微信小程序
npm run build:app-plus      # Android/iOS
```

构建产物：`dist/build/h5/`

## 测试

```bash
npm test              # 运行全部单元测试
npm run test:watch    # 监听模式
npm run type-check    # TypeScript 类型检查
```

## 环境变量

| 文件 | 用途 | 内容 |
|------|------|------|
| `.env.development` | 本地开发 | `VITE_API_BASE_URL=http://localhost:3000` |
| `.env.production` | 生产环境 | `VITE_API_BASE_URL=https://jobpal.jacksonxu.cn/api` |

## 项目结构

```
jobpal-app/
├── src/
│   ├── pages/              # 页面组件（15 个页面）
│   │   ├── login/          #   登录/注册
│   │   ├── home.vue        #   首页仪表盘
│   │   ├── ask/            #   AI 求职问答（问一问）
│   │   ├── resume/         #   简历管理（3 页）
│   │   ├── job/            #   心动岗位（3 页）
│   │   ├── interview/      #   面试记录
│   │   ├── optimize/       #   AI 简历优化（2 页）
│   │   ├── profile/        #   个人中心
│   │   ├── settings/       #   设置
│   │   ├── about/          #   关于开发者
│   │   └── placeholder/    #   功能占位
│   ├── components/         # 可复用组件
│   │   ├── ChatBubble.vue      # AI 对话气泡
│   │   ├── DesktopLayout.vue   # 桌面端侧边栏壳
│   │   ├── chat/ChatPanel.vue  # AI 聊天面板（移动+桌面复用）
│   │   └── home/HomeContent.vue # 移动端首页内容
│   ├── apis/               # API 接口层
│   │   ├── auth.ts         #   认证
│   │   ├── resume.ts       #   简历 CRUD
│   │   ├── job.ts          #   岗位 CRUD
│   │   ├── optimize.ts     #   简历优化
│   │   └── chat.ts         #   AI 对话
│   ├── composables/        # 组合式函数
│   │   └── useSSE.ts       #   SSE 流式连接管理
│   ├── stores/             # Pinia 状态
│   │   ├── auth.ts         #   认证（token / userInfo）
│   │   └── app.ts          #   全局（设备检测 / 桌面适配）
│   ├── utils/              # 工具函数
│   │   ├── request.ts      #   HTTP 请求拦截器
│   │   └── crypto.ts       #   密码加密
│   └── __tests__/          # 单元测试（Vitest）
├── pages.json              # 页面路由 + TabBar
├── manifest.json           # uni-app 配置
├── deploy-h5.sh            # H5 一键部署脚本
├── .env.development        # 开发环境变量
├── .env.production         # 生产环境变量
└── CLAUDE.md               # 详细开发文档（API、架构、规范）
```

## 部署

```bash
# 一键部署到生产服务器
bash deploy-h5.sh
```

目标：`root@47.107.30.30:/var/www/jobpal/app`
访问：`https://jobpal.jacksonxu.cn/app/`

## 相关项目

| 项目 | 定位 | 技术栈 |
|------|------|--------|
| **jobpal-app**（本项目） | 用户端（移动端） | uni-app + Vue 3 + TypeScript |
| [jobpal-manage](https://gitee.com/JacksonXuu/jobpal-manage) | 管理端（PC 端） | React 18 + Ant Design 5 |
| jobpal-server | 后端 API 服务 | NestJS + Prisma + MySQL |

## 开发规范

- Vue 3 Composition API（`<script setup lang="ts">`）
- 页面组件放 `pages/`，公共组件放 `components/`
- 接口调用统一走 `apis/` 层，不直接调用 `uni.request`
- 跨页面状态用 Pinia，页面内状态用 `ref`/`reactive`
- 每个页面处理 loading / empty / error 三种状态
- 平台差异代码用条件编译包裹（`#ifdef H5` / `#ifdef MP-WEIXIN`）

## License

Private — 个人项目 © 2026 徐渝松
