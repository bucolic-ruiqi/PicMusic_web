import argparse
import json
import numpy as np
from threadpoolctl import threadpool_limits
import mysql.connector
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, Any, List

from config import get_config

def recommend_songs_by_emotion(emotion_json: dict, db_config: Dict[str, Any], top_k: int) -> list:
    """基于情绪向量检索 Top‑K 歌曲（返回 id/name/artist）"""

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

    # 与 schema.sql 对齐：tracks 表
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

    # 计算相似度并排序
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
                continue  

    # 排序取前 top_k 首，去掉 similarity 字段
    scored_songs.sort(key=lambda x: x["similarity"], reverse=True)
    top_songs = [{"id": s["id"], "name": s["name"], "artist": s["artist"]} for s in scored_songs[:top_k]]

    cursor.close()
    conn.close()

    return top_songs


def main():
    """命令行测试：
    - 自动分析：python recommend_songs.py --image <path_or_url> --top-k 10
    - 直接提供情绪：--emotion-json '{...}' 或 --emotion-json-file file.json
    """
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", help="图片路径/URL；如提供，则先通过 CLIP 计算情绪")
    parser.add_argument("--emotion-json", help="直接提供情绪 JSON 字符串")
    parser.add_argument("--emotion-json-file", help="从文件读取情绪 JSON")
    parser.add_argument("--top-k", type=int, default=10)
    args = parser.parse_args()

    emotion: Dict[str, Any] | None = None

    if args.image:
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
