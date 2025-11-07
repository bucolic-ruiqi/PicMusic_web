<div align="center">

  <h1>PicMusic</h1>
  <p>音乐旅行日记 · 以一张旅途照片，生成你的专属配乐</p>

  <a href="#"><img alt="Version" src="https://img.shields.io/badge/version-v0.1.0-blue"></a>
  <img alt="Frontend" src="https://img.shields.io/badge/Frontend-Next.js_16_%2B_Tailwind_4-06b6d4">
  <img alt="Backend" src="https://img.shields.io/badge/Backend-FastAPI-009485">
  <img alt="Database" src="https://img.shields.io/badge/Database-MySQL_8-4479A1">
  <img alt="Language" src="https://img.shields.io/badge/Language-TypeScript_%2B_Python-3178C6">
  <a href="#license"><img alt="License" src="https://img.shields.io/badge/License-TBD-orange"></a>

</div>

<div align="center">

<strong>⭐ If this project helps you, please give it a Star! ⭐</strong>

</div>

## PicMusic · 音乐旅行日记（Image-to-Music Diary）

以一张旅途照片，开启一段专属配乐。PicMusic 将“图像情绪理解 + 歌曲情绪检索”融入旅行日记：你上传照片，后端用 CLIP 推断情绪分布，匹配曲库里最合适的歌；前端提供沉浸式的时间线、编辑器与全局迷你播放器，帮助你沉淀一段段“有声的回忆”。

- 前端：Next.js App Router + Tailwind v4（暗黑模式、全局悬浮播放条）
- 后端：FastAPI（/recommend）+ Hugging Face CLIP（图像→情绪）
- 数据库：MySQL 8（users/tracks/diaries 三表，含 CSV 一键导入脚本）


## 目录
- 核心功能与亮点
- 架构与数据流
- 快速开始（本地运行）
- 数据库初始化与导入
- 开发者指南（目录结构、关键代码）
- API 说明与示例
- 设计与实现要点（论文式概览）
- 常见问题（FAQ）
- 路线图（Roadmap）
- 致谢


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
   │  dispatchEvent('globalplay')     │  CLIP(图像→情绪分布)
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
  python -m venv .venv && source .venv/bin/activate  # Windows 使用 .venv\Scripts\activate
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


## 数据库初始化与导入
1) 创建库与表结构
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS mywebapp DEFAULT CHARSET utf8mb4;"
mysql -u root -p mywebapp < backend/sql/schema.sql
```
2) 可选：导入示例数据（CSV）
- 若客户端允许 `LOCAL INFILE`：
  - 将 `backend/sql/import_from_data.sql` 中的 CSV 路径改成你的本地绝对路径（当前示例包含作者环境路径占位）。
  - 以 `--local-infile=1` 连接并执行脚本：
    ```bash
    mysql --local-infile=1 -u root -p < backend/sql/import_from_data.sql
    ```
- 若服务端限定 `secure_file_priv` 目录：
  - 参考 `backend/sql/import_from_data_server_infile.sql`：先用 `SELECT @@secure_file_priv;` 查目录，将 CSV 复制进去，调整 `@dir` 路径后执行该脚本。

表结构概览：
- `users`：基础用户信息
- `tracks`：歌曲元数据 + `emotion_json`（六维情绪向量）+ `dominant_emotion`
- `diaries`：日记主体，含图片 URL 的 JSON、歌曲 ID 列表 JSON、收藏标记等


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

关键交互：
- 全局播放器事件总线
  ```ts
  // 分发（任意播放按钮处）
  window.dispatchEvent(new CustomEvent("globalplay", {
    detail: { track, url, command: "play" as const },
  }));
  ```
  `frontend/components/GlobalAudioBar.tsx:6` 监听 `globalplay`，创建/复用 `<audio>`，并以 `play/pause/timeupdate/ended` 事件同步 UI 状态与进度。按钮在播放与暂停时均使用品牌紫色（统一视觉）。


## API 说明与示例
- POST `/recommend`
  - 入参：`{ image_url: string, top_k?: number }`
    - `image_url` 支持 `http(s)` 链接、`data:image/...;base64,` 的 Data URL、本地路径（服务端可达）
  - 返回：`[{ name: string, artist: string }]`
  - 示例：
    ```bash
    curl -X POST http://127.0.0.1:8000/recommend \
      -H 'Content-Type: application/json' \
      -d '{"image_url":"data:image/png;base64,....","top_k":10}'
    ```

前端内部数据接口（Next.js）
- GET `/api/diaries`、`/api/diaries/[id]`、PUT `/api/diaries/[id]`、DELETE `/api/diaries/[id]`
- GET `/api/diaries/search?q=...&limit=...`（地点关键字检索）


## 设计与实现要点（论文式概览）
- 表征与检索：
  - 图像侧：CLIP 在情绪标签集合上计算 `softmax` 概率，得到六维向量 `p∈R^6` 与主导情绪 `argmax(p)`。
  - 歌曲侧：曲库预存 `emotion_json`（六维），同时存 `dominant_emotion` 以先验过滤。
  - 召回与排序：先按 `dominant_emotion` 过滤，再以余弦相似度排序 Top‑K，复杂度近似 `O(n)`（n 为过滤后规模）。
- 体验工程：
  - 播放统一：事件总线 + 单例 `<audio>`，避免并发播放、保证全站一致 UI。
  - 语义样式：Tailwind v4 自定义 `--color-brand`，暗黑/浅色全局变量与类选择器配合，避免闪烁与“跳变”。
  - 可达性：自定义进度条使用 `role=slider`/`aria-valuenow/aria-valuemax`，两端时间采用等宽数字（tabular-nums）。


## 常见问题（FAQ）
- 首次调用 `/recommend` 很慢？
  - transformers 会按需下载/缓存 CLIP 模型与权重；建议稳定网络或预热一次。
- 未配置数据库也能跑前端吗？
  - 目前首页时间线依赖 MySQL；请按“数据库初始化与导入”准备最小数据，或自行改造 `getDiaries` 的数据来源。
- 推荐的歌曲为什么无法播放？
  - 推荐只返回歌名/艺人；试听音频使用演示 URL（SoundHelix）做占位，可按你平台的真实音源替换 `TrackPlayerList`/推荐页中的 `SAMPLE_URLS` 与映射逻辑。


## 路线图（Roadmap）
- 歌曲数据：为 tracks 表补充真实可播 URL、封面、预览片段时长等。
- 推荐增强：加入多模态（歌词/地点/天气）特征与个性化重排序；引入 ANN 向量检索。
- 账户体系：接入登录、云端用户偏好与跨端同步。
- 运维发布：Docker 化 + 反向代理 + CDN 静态资源与模型缓存。


## 致谢
- Hugging Face Transformers · CLIP 系列模型
- Next.js / Tailwind CSS / FastAPI 社区

---

如需进一步的部署脚本、Dockerfile 或演示数据扩充，我可以按你的运行环境补充相应配置与说明。
