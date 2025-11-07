import os
# 限制数学库线程数，避免 macOS/Accelerate 多线程崩溃
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("VECLIB_MAXIMUM_THREADS", "1")
os.environ.setdefault("NUMEXPR_NUM_THREADS", "1")

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import threading
from image_analyze import analyze_image_emotion, get_analyzer
from recommend_songs import recommend_songs_by_emotion
from config import get_config
import logging

# 加载配置
config = get_config()

app = FastAPI(title="Image-to-Music Recommendation API")
logger = logging.getLogger("uvicorn.error")
_RECOMMEND_LOCK = threading.Lock()
# 启动预热模型，降低首请求时延
@app.on_event("startup")
def _warmup():
    try:
        logger.info("[startup] warming up CLIP analyzer")
        get_analyzer()
        logger.info("[startup] CLIP analyzer ready")
    except Exception:
        logger.exception("[startup] warmup failed")


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据库配置
db_config = config.db_config

# 请求模型
class RecommendRequest(BaseModel):
    image_url: str
    top_k: int = 3

# 返回模型
class SongInfo(BaseModel):
    id: int
    name: str
    artist: str

# 唯一公开接口：推荐歌曲
@app.post("/recommend", response_model=List[SongInfo])
def recommend_songs(req: RecommendRequest):
    try:
        with _RECOMMEND_LOCK:
            logger.info("[recommend] start image analyze")
            # 图像情绪分析
            emotion_result = analyze_image_emotion(req.image_url)
            logger.info("[recommend] emotion result: %s", emotion_result.get("dominant_emotion"))

            # 推荐歌曲
            recommended = recommend_songs_by_emotion(emotion_result, db_config, top_k=req.top_k)
            logger.info("[recommend] recommended %d items", len(recommended))
            return recommended

    except Exception as e:
        logger.exception("/recommend failed: %s", e)
        # 出错时返回空列表，避免前端写入非法 id
        return []


# 运行：uvicorn main:app --host 0.0.0.0 --port 8000
