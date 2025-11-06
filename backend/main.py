from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from image_analyze import analyze_image_emotion
from recommend_songs import recommend_songs_by_emotion
from config import get_config

# 获取配置
config = get_config()

app = FastAPI(title="Image-to-Music Recommendation API")

# 配置CORS
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
    name: str
    artist: str

# 📌 唯一公开接口：推荐歌曲
@app.post("/recommend", response_model=List[SongInfo])
def recommend_songs(req: RecommendRequest):
    try:
        # 1. 图像情绪分析
        emotion_result = analyze_image_emotion(req.image_url)

        # 2. 推荐歌曲
        recommended = recommend_songs_by_emotion(emotion_result, db_config, top_k=req.top_k)
        return recommended

    except Exception as e:
        return [{"name": "Error", "artist": str(e)}]


# uvicorn main:app --host 0.0.0.0 --port 8000