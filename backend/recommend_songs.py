import argparse
import json
import numpy as np
from threadpoolctl import threadpool_limits
import mysql.connector
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, Any, List

from config import get_config

def recommend_songs_by_emotion(emotion_json: dict, db_config: Dict[str, Any], top_k: int) -> list:
    """
    根据输入的情绪分布 JSON 和数据库配置，推荐 top_k 首最匹配的歌曲

    参数：
        emotion_json: dict，包含6个情绪值 + dominant_emotion
        db_config: dict，数据库连接配置
        top_k: int，返回前 top_k 首匹配的歌曲

    返回：
        list[dict]，每个 dict 包含 id、name、artist
    """

    input_vector = np.array([
        emotion_json["emotion_scores"]["happy"],
        emotion_json["emotion_scores"]["sad"],
        emotion_json["emotion_scores"]["calm"],
        emotion_json["emotion_scores"]["romantic"],
        emotion_json["emotion_scores"]["dark"],
        emotion_json["emotion_scores"]["aggressive"]
    ]).reshape(1, -1)

    dominant_emotion = emotion_json["dominant_emotion"]

    # 连接数据库
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    # 表名与 schema.sql 对齐：tracks
    query = (
        "SELECT id, name, artist, emotion_json "
        "FROM tracks "
        "WHERE dominant_emotion = %s "
        "AND emotion_json IS NOT NULL"
    )
    cursor.execute(query, (dominant_emotion,))
    results = cursor.fetchall()

    if not results:
        cursor.close()
        conn.close()
        return []

    # 计算相似度并排序（限制底层 BLAS 线程，避免 macOS 崩溃）
    scored_songs = []
    with threadpool_limits(limits=1):
        for row in results:
            try:
                song_vector_dict = json.loads(row["emotion_json"])
                song_vector = np.array([
                    song_vector_dict.get("happy", 0),
                    song_vector_dict.get("sad", 0),
                    song_vector_dict.get("calm", 0),
                    song_vector_dict.get("romantic", 0),
                    song_vector_dict.get("dark", 0),
                    song_vector_dict.get("aggressive", 0)
                ]).reshape(1, -1)

                sim = cosine_similarity(input_vector, song_vector)[0][0]
                scored_songs.append({
                    "id": row["id"],
                    "name": row["name"],
                    "artist": row["artist"],
                    "similarity": sim
                })
            except Exception:
                continue  # 忽略格式错误的数据行

    # 排序取前 top_k 首，去掉 similarity 字段
    scored_songs.sort(key=lambda x: x["similarity"], reverse=True)
    top_songs = [{"id": s["id"], "name": s["name"], "artist": s["artist"]} for s in scored_songs[:top_k]]

    cursor.close()
    conn.close()

    return top_songs


def main():
    """命令行测试入口：
    方式一：基于图片自动分析情绪后推荐
      python recommend_songs.py --image <path_or_url> --top-k 10

    方式二：直接给定情绪 JSON（字符串或文件路径）
      python recommend_songs.py --emotion-json '{"emotion_scores": {...}, "dominant_emotion": "happy"}'
      python recommend_songs.py --emotion-json-file emotion.json
    """
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", help="图片路径/URL；如提供，则先通过 CLIP 计算情绪")
    parser.add_argument("--emotion-json", help="直接提供情绪 JSON 字符串")
    parser.add_argument("--emotion-json-file", help="从文件读取情绪 JSON")
    parser.add_argument("--top-k", type=int, default=10)
    args = parser.parse_args()

    emotion: Dict[str, Any] | None = None

    if args.image:
        # 延迟导入，避免部署无需分析时也加载 transformers
        from image_analyze import analyze_image_emotion
        emotion = analyze_image_emotion(args.image)
    elif args.emotion_json:
        emotion = json.loads(args.emotion_json)
    elif args.emotion_json_file:
        with open(args.emotion_json_file, "r", encoding="utf-8") as f:
            emotion = json.load(f)
    else:
        raise SystemExit("必须提供 --image 或 --emotion-json(或 --emotion-json-file)")

    cfg = get_config()
    recs: List[Dict[str, Any]] = recommend_songs_by_emotion(emotion, cfg.db_config, args.top_k)
    print(json.dumps({"input": emotion, "recommendations": recs}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()