<div align="center">

  <h1>
    <img src="frontend/public/logo.png" alt="PicMusic Logo" height="48" style="vertical-align: middle; margin-right: 8px;" />
    PicMusic - Web Ver.
  </h1>
  <p>音乐旅行日记 · 多模态旅行记忆管理 · 基于图像情绪的个性化音乐推荐</p>

  <a href="#"><img alt="Version" src="https://img.shields.io/badge/version-v0.1.0-blue"></a>
  <img alt="Frontend" src="https://img.shields.io/badge/Frontend-Next.js_16_%2B_Tailwind_4-06b6d4">
  <img alt="Backend" src="https://img.shields.io/badge/Backend-FastAPI-009485">
  <img alt="Database" src="https://img.shields.io/badge/Database-MySQL_8-4479A1">
  <img alt="Language" src="https://img.shields.io/badge/Language-TypeScript_%2B_Python-3178C6">
  <a href="#license"><img alt="License" src="https://img.shields.io/badge/License-TBD-orange"></a>

</div>


以一张旅途照片，获得你的个性化音乐推荐。PicMusic 将“图像情绪理解 + 歌曲情绪检索”融入旅行日记：你上传照片，后端用 CLIP 推断情绪分布，匹配曲库里最合适的歌；前端提供沉浸式的时间线、编辑器与全局迷你播放器，帮助你沉淀一段段“有声的回忆”。

- 前端：Next.js App Router + React
- 后端：FastAPI + CLIP
- 数据库：MySQL 8（users/tracks/diaries 三表）



## 核心功能与亮点
- 以图找乐：上传旅途照片，后端推断 6 维情绪分布（happy/sad/calm/romantic/dark/aggressive），按余弦相似度推荐 Top-K 歌曲。
- 旅行日记：时间线浏览、地点与心情标签、图文内容编辑、收藏、搜索（地点关键字）。
- 一键配乐：创建/编辑日记时，可从推荐列表试听并加入日记歌曲清单。
- 全局播放器：右下角悬浮迷你播放条，支持点击进度条快进，统一接管全站播放事件。
- 主题与动效：类原生的暗黑模式切换；柔和的过渡与滚动进度指示。


## 架构与数据流
```
[Next.js 前端]  ── fetch ──▶  [/recommend · FastAPI 后端]
   │                                 │
   │  dispatchEvent('globalplay')    │  CLIP(图像→情绪分布)
   ▼                                 │  MySQL(tracks: emotion_json)
[GlobalAudioBar]  ◀─ 同步播放状态 ─────┘  余弦相似度匹配 top‑k
```
- 推荐链路：new → loading → new/recommend 读取 localStorage 中的 dataURL（首张照片），POST 到后端 `/recommend`，返回歌名/艺人列表，前端映射为可试听条目。
- 播放总线：任意“播放”按钮仅派发 `globalplay` 事件，由全局组件 `GlobalAudioBar` 统一创建/控制 `<audio>`，保证体验一致。


## 快速开始（本地运行）
> 前置要求：Node 18+（推荐 20+）、Python 3.10+、MySQL 8。首次运行需下载 CLIP 模型（由 transformers 自动完成）。

1) 初始化数据库（见“数据库初始化与导入”）

2) 启动后端（FastAPI）
- 创建虚拟环境并安装依赖：
  ```bash
  cd backend
  python -m venv .venv && source .venv/bin/activate  # 
  pip install -r requirements.txt
  ```
- 设置环境变量（示例）：
  ```bash
  export ENVIRONMENT=development
  export DB_HOST=127.0.0.1
  export DB_PORT=3306
  export DB_USER=root
  export DB_PASSWORD=root
  export DB_NAME=mywebapp
  # 可选：export CLIP_MODEL_ID=openai/clip-vit-base-patch32
  ```
- 启动服务：
  ```bash
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
  ```
  默认允许来自前端的 CORS 请求，端口可在 `backend/config.py:22` 通过环境变量调整。

3) 启动前端（Next.js）
- 安装依赖并复制环境：
  ```bash
  cd frontend
  npm i
  cp .env.example .env.local
  # 按需编辑 .env.local，确保连接到你的 MySQL；并新增：
  echo "NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000" >> .env.local
  ```
- 开发模式启动：
  ```bash
  npm run dev
  ```
- 打开浏览器访问：http://localhost:3000


## 开发者指南（目录结构、关键代码）
- 前端（Next.js App Router）
  - 页面：`frontend/app/`（首页时间线、新建/推荐流程、日记详情等）
  - 组件：`frontend/components/`（`GlobalAudioBar.tsx`、`Header.tsx`、`DiaryForm.tsx`、`Timeline.tsx` 等）
  - 数据访问：`frontend/lib/`（`db.ts` 使用 mysql2/promise；`diaryRepo.ts` 封装增删改查；`config.ts` 统一 URL/开关）
  - API 路由：`frontend/app/api/diaries/*`（Next.js 轻量数据面板：检索地点、日记 CRUD）
- 后端（FastAPI）
  - `backend/main.py`: 提供唯一公开接口 `/recommend`
  - `backend/image_analyze.py`: 基于 CLIP 的图像情绪分析
  - `backend/recommend_songs.py`: 基于情绪向量余弦相似度的歌曲检索
  - `backend/sql/*.sql`: 数据库 schema 与 CSV 导入脚本
  - `backend/config.py`: 环境配置（CORS、DB 连接、端口等）




---

<div align="center">

<strong>⭐ If this project helps you, please give it a Star! ⭐</strong>

</div>