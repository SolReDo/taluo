# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

**塔罗灵犀** — 基于 AI 的塔罗牌心理探索与情绪陪伴应用，使用 Next.js 14 构建。应用引导用户进行塔罗牌占卜，并通过记忆功能提供个性化的 AI 解读。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: TailwindCSS，自定义深色主题（深紫/金色配色）
- **动画**: Framer Motion
- **状态管理**: Zustand
- **AI**: MiniMax API，OpenAI 兼容接口（`@ai-sdk/openai`, `ai` SDK）
- **数据库**: MySQL2, Redis (ioredis), Qdrant (向量搜索)
- **认证**: bcryptjs，支持访客模式

## 常用命令

```bash
npm run dev     # 启动开发服务器
npm run build   # 构建生产版本
npm run start   # 启动生产服务器
npm run lint    # 运行 ESLint
```

## 架构

### 页面 (`app/`)

| 路由 | 说明 |
|-----|------|
| `/` | 首页，含动画背景和问题选择弹窗 |
| `/reading` | 牌阵选择（单牌、三牌、凯尔特十字、马蹄铁） |
| `/reading/single` | 单牌阅读（新状态机 UI） |
| `/reading/spread` | 多牌阵阅读 |
| `/reading/result` | 解读结果显示 |
| `/chat` | AI 聊天界面 |

### API 路由 (`app/api/`)

| 路由 | 说明 |
|-----|------|
| `/api/divination` | 流式 AI 塔罗解读 |
| `/api/chat` | 带记忆的 AI 聊天 |
| `/api/auth/*` | 认证（登录、注册、访客初始化、微信） |
| `/api/tarot/*` | 保存阅读、获取解读 |
| `/api/memory/*` | 短期/长期记忆操作 |

### 状态管理 (`store/`)

- **readingStore.ts** — 塔罗阅读流程（牌阵、卡牌、阶段、解读）
- **uiStore.ts** — UI 状态
- **singleCardStore.ts** — 单牌阅读状态机
- **memoryStore.ts** — 记忆操作

### 塔罗牌系统 (`lib/tarot-data.ts`)

78 张塔罗牌定义为 TypeScript 对象：
- 22 张大阿尔卡纳（id: `major-0` 至 `major-21`）
- 56 张小阿尔卡纳（4 种花色：权杖、圣杯、宝剑、星币）

核心类型：`TarotCard`、`CardPosition`、`SpreadDefinition`

牌阵定义包含位置的中文名称和含义，用于解读。

### AI 集成 (`lib/ai.ts`, `lib/ai-prompts.ts`)

- 使用 MiniMax API（OpenAI 兼容）进行 LLM 调用
- Temperature 0.7，支持流式响应
- 支持上下文注入的 Prompt 构建

### 记忆系统 (`lib/memory/`)

双层记忆架构：
- **短期记忆** (`shortTermMemory.ts`) — 基于 Redis，保存最近 6 轮对话
- **长期记忆** (`longTermMemory.ts`) — 基于 Qdrant 向量搜索，支持语义召回
- **tarotMemoryEngine.ts** — 整合两种记忆生成解读

记忆功能仅对已登录（非访客）用户启用。

### 组件 (`components/`)

- `ui/` — ParticleField, GoldenParticleField, MysticButton, Header
- `tarot/` — CardBack, CardDeck, TarotCard, CardPile, SpreadCards, SingleCardReader, SelectedCardDisplay

## 关键模式

### 阅读流程

1. 用户选择牌阵 → 路由到 `/reading/single` 或 `/reading/spread`
2. 卡牌选择 UI，带翻牌动画（Framer Motion）
3. 用户问题存储在 `sessionStorage` 或 Zustand
4. 调用 `/api/divination`，流式返回响应
5. 渲染 markdown 格式的解读结果

### AI 记忆注入

为已登录用户生成解读时：
1. 获取短期记忆（从 Redis 获取最近 6 轮）
2. 获取长期记忆（从 Qdrant 对用户问题进行语义搜索）
3. 将两者注入 system prompt，生成带上下文的 AI 回应

### 访客用户

访客会话跳过记忆功能（短期和长期记忆返回空数组）。访客 ID 通过 `guestMerger.ts` 工具存储在 `localStorage`。

## 环境变量

`.env` 中必需配置：
```
MINIMAX_API_KEY=
MINIMAX_API_URL=https://api.minimaxi.com/v1/text/chatcompletion_v2
MINIMAX_MODEL=MiniMax-M2.7
```
可选：MySQL、Redis、Qdrant（用于完整功能）。
