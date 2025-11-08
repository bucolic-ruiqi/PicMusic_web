# 实验报告：PicMusic 音乐旅行日记系统

## 一、实验目的
- 构建一个融合图片情绪理解与音乐推荐的 Web 应用（前端 Next.js + 后端 FastAPI）。
- 以 API 形式暴露核心推荐能力，实现可被任意客户端（Web/脚本）调用的统一接口。
- 使用关系型数据库（MySQL）存储用户、歌曲、日记数据，完成增删改查全流程。
- 通过旅行日记的可视化时间线与全局播放器提升多模态互动体验。

## 二、项目详述与功能演示
### 1. 项目详述
PicMusic（音乐旅行日记 / Image-to-Music Diary）旨在把“旅途照片”转化为“可被再次回放的多模态记忆”。核心路径：用户在“新建日记”页上传 1~N 张旅途照片 → 前端读取首张图片 DataURL → 发送到后端 `/recommend` → 后端通过 CLIP 模型得到 6 维情绪分布（happy, sad, calm, romantic, dark, aggressive）→ 以主导情绪过滤曲库并按余弦相似度排序返回 Top-K 歌曲候选 → 用户试听并挑选加入该日记 → 日记（文本 + 图片 JSON + 歌曲 ID JSON + 心情标签）持久化到 MySQL → 首页时间线（按年份纵向、月份横向）展示聚合的旅途回忆。

价值与目标：
- 降低“写旅行日记 + 选配乐”的创作摩擦，把纯文本记叙提升为“可听的记忆”。
- 用轻量情绪向量（6 维）为后续个性化、向量检索（ANN）、跨模态召回预留扩展接口。
- 形成一个可增长的数据层：图片 → 情绪 → 歌曲 → 用户交互反馈（收藏、停留、跳过）→ 迭代重排序。

主要交互流：
1. 新建：`/new` 上传图片 + 录入地点/文字 → Loading → 推荐列表页（可刷新 Top-K）。
2. 编辑：选择歌曲并保存 → 生成一条 `diaries` 记录（含照片 URL、track_ids_json、mood、content）。
3. 浏览：`/` 首页时间线组件 `Timeline` 读取聚合数据，按年→月分组，仅渲染有内容的月份，改善密度。
4. 检索：地点关键字通过 `/api/diaries/search?q=` 前端路由即时列出匹配日记。
5. 收藏：`/api/diaries/[id]/favorite` 切换收藏状态，为未来个性化打标签。

关键目录与组件：
- 后端：`backend/main.py`（FastAPI + 预热 + /recommend）、`image_analyze.py`（CLIP 推理）、`recommend_songs.py`（相似度检索）。
- 前端页面：`frontend/app/`（`page.tsx` 首页时间线、`new/` 创建流程、`diary/[id]` 详情）。
- 前端组件：`Timeline.tsx`（年份纵列 + 月份横轴）、`DiaryCard.tsx`（4:3 卡片 + 文本滚动）、`GlobalAudioBar.tsx`（全站唯一音频实例 + 事件总线）、`Header.tsx`（最小导航）。
- 数据访问：`frontend/lib/diaryRepo.ts` 封装 CRUD；`frontend/app/api/diaries/*` 为 BFF（Backend For Frontend）层。

系统特性摘要：
- 响应式时间线布局精确计算高度，避免空白；按有内容月份稠密展示。
- 单例 `<audio>` + CustomEvent("globalplay") 保证播放控制一致性，防止并行播放冲突。
- 情绪向量存储在 `tracks.emotion_json`（JSON），主导情绪冗余列 `dominant_emotion` 用于快速过滤（缩小相似度计算集合）。
- 线程安全：使用 `_RECOMMEND_LOCK` 串行化 CLIP 推理阶段，规避并发模型切换（可改良为队列 / 多 worker）。

### 2. 功能演示
#### 一键获取歌曲推荐（核心功能）
1. 用户上传图片 → 前端将首图 base64 DataURL POST：`POST /recommend { image_url, top_k }`；
2. 后端：CLIP 计算 6 维概率向量 `p` 与主导情绪 `d`；
3. 数据库：按 `dominant_emotion = d` 过滤，再按余弦相似度排序；
4. 前端：渲染试听列表，用户可加入到日记草稿。

示例（curl）：
```bash
curl -X POST http://127.0.0.1:8000/recommend \
	-H 'Content-Type: application/json' \
	-d '{"image_url":"data:image/png;base64,iVBOR...","top_k":5}'
```

#### 旅途回忆可视化与编辑
首页时间线：按年份纵列、年内横向按“出现过的月份”稀疏渲染；卡片固定 4:3，标题 + 可滚动正文 + 底部缩略图；点击进入详情或编辑，支持增删图片、修改文字与歌曲清单。

#### 旅途回忆检索
地点关键字检索：`GET /api/diaries/search?q=杭州&limit=8` 返回匹配日记数组，可用于联想与跳转。

#### 个性化偏好定制
当前：收藏（favorite）标记、基础情绪匹配；
规划：引入用户行为权重、歌词与图片情绪融合、ANN 近似检索、在线重排序（LTR/Bandit）。

## 三、主要技术详述与核心代码实现
### 1. 前端 React + Next.js 技术
选择理由：
1) Next.js App Router：在同一代码库内实现 UI 与 Route Handlers（BFF），降低前后端沟通成本；
2) 同构渲染：首屏 SSR + 客户端水合增强交互体验；
3) 全局播放器：浏览器事件总线 + 单例 `<audio>`，避免多音轨并发；
4) Tailwind v4：原子化样式 + 设计 Token（品牌紫 `brand-*`）快速试错；
5) TypeScript：统一数据模型（Diary/Track/User），减少接口演化回归。

实现要点：
- 时间线容器高度精确：`height = topOffset + (maxLane-1)*laneGap + cardH + bottomPad`；
- 稀疏月份映射：仅对出现月份分配横向段，`left = paddingX + order * monthWidth`；
- 卡片正文滚动替代截断，保证信息可读。

### 2. 智能体技术与推荐算法设计
情绪标签集合 𝑬 = {happy, sad, calm, romantic, dark, aggressive}（6 维）。
CLIP 计算图片与文本标签相似度，经 softmax 得到概率：
$$ p_i = \frac{\exp(s_i)}{\sum_{j=1}^{6} \exp(s_j)},\; i=1..6 $$
得到 \( \mathbf{p} \in \mathbb{R}^6 \)，主导情绪 \( d = \arg\max_i p_i \)。

歌词离线标注（`backend/utils/lyrics_analyze.py`）将原始强度 \( r_i \) 归一化：
$$ w_i = \frac{r_i}{\sum_{j=1}^{6} r_j} $$
存入 `tracks.emotion_json`，并记录 `dominant_emotion`。

在线检索：先按 `d` 过滤候选集合 S，再对每首歌向量 \( \mathbf{w} \) 计算余弦：
$$ \text{cos}(\mathbf{p},\mathbf{w}) = \frac{\mathbf{p}\cdot\mathbf{w}}{\|\mathbf{p}\|\,\|\mathbf{w}\|} $$
按相似度降序取前 K，复杂度 \( O(|S|) \)。未来可用 ANN 将查询近似到 \( O(\log |S|) \)。

工程权衡：6 维向量轻量、易存储；主导情绪过滤换取延迟；可后续加入次高情绪阈值补偿或向量索引提升 recall。

### 3. 后端 FastAPI 技术
结构亮点：
1) 启动预热：`@app.on_event('startup')` 调 `get_analyzer()` 预加载 CLIP；
2) 串行推荐：`_RECOMMEND_LOCK` 保护推理段，避免多线程模型抖动；
3) CORS/配置：`config.py` 按 ENVIRONMENT 输出不同允许来源与端口；
4) 容错：异常返回空数组，前端安全降级；
5) 线程数约束：环境变量与 `threadpool_limits` 规避 macOS BLAS 并发崩溃。

核心流程（伪代码）：
```python
@app.post('/recommend')
def recommend(req):
		with _RECOMMEND_LOCK:
				emo = analyze_image_emotion(req.image_url)
				return recommend_songs_by_emotion(emo, db_config, top_k=req.top_k)
```
运行：
```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 4. 数据库存储技术
核心表：
- users：`id, username, email, created_at`
- tracks：`id, name, artist, emotion_json(JSON), dominant_emotion`
- diaries：`id, user_id, diary_datetime, trip_start, trip_end, location, mood, content, photo_urls_json, track_ids_json, is_favorite`

前端 CRUD（Next.js Route Handlers）：
```http
GET    /api/diaries
POST   /api/diaries
GET    /api/diaries/{id}
PUT    /api/diaries/{id}
DELETE /api/diaries/{id}
PUT    /api/diaries/{id}/favorite
GET    /api/diaries/search?q=关键词
```
创建示例（POST /api/diaries）：
```json
{
	"date": "2025-10-03T12:00:00Z",
	"location": "杭州西湖",
	"mood": "快乐",
	"text": "西湖边的桂花香和微风。",
	"photos": ["https://.../1.jpg"],
	"trackIds": [12, 87],
	"isFavorite": false
}
```
说明：服务端负责时间格式化与 JSON 字段序列化；更新仅传变更字段；删除返回 `{ ok: true }`。

## 四、总结与展望
本实验实现了端到端的“图片情绪 → 音乐推荐 → 旅行日记”MVP：Next.js 前后端同构、FastAPI 推理、MySQL 持久化；CLIP 六维情绪 + 余弦相似度匹配；时间线与全局播放器带来顺畅的浏览与试听体验。

不足：标签维度较少、主导情绪过滤牺牲 recall、无真实音频 URL、推理吞吐受限。

展望：补充可播曲目元数据；引入用户行为信号；将歌词/图片双模态融合并采用 ANN + rerank；多 worker 与任务队列；Docker 化与 CDN 缓存模型；账号体系与跨端同步。

> 由此，实验不仅完成题目要求的“后端 API + 数据库 + Web 客户端”，还搭建了多模态推荐可扩展骨架，为进一步科研或产品化奠定基础。