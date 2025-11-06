import mysql.connector
import json
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def recommend_songs_by_emotion(emotion_json, db_config, top_k):
    """
    根据输入的情绪分布 JSON 和数据库配置，推荐 top_k 首最匹配的歌曲

    参数：
        emotion_json: dict，包含6个情绪值 + dominant_emotion
        db_config: dict，数据库连接配置
        top_k: int，返回前 top_k 首匹配的歌曲

    返回：
        list[dict]，每个 dict 仅包含 name 和 artist
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

    query = """
            SELECT name, artist, emotion_json
            FROM songs
            WHERE dominant_emotion = %s
              AND emotion_json IS NOT NULL \
            """
    cursor.execute(query, (dominant_emotion,))
    results = cursor.fetchall()

    if not results:
        cursor.close()
        conn.close()
        return []

    # 计算相似度并排序
    scored_songs = []
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
                "name": row["name"],
                "artist": row["artist"],
                "similarity": sim
            })
        except Exception:
            continue  # 忽略格式错误的数据行

    # 排序取前 top_k 首，去掉 similarity 字段
    scored_songs.sort(key=lambda x: x["similarity"], reverse=True)
    top_songs = [{"name": s["name"], "artist": s["artist"]} for s in scored_songs[:top_k]]

    cursor.close()
    conn.close()

    return top_songs