from openai import OpenAI
import pandas as pd
import json
import time
from tqdm import tqdm

client = OpenAI(
    api_key="sk-gQ5TIZeMYw6S7mh8eK5S3MBH6iCho1kGPiYNE2DCSII58Qzm",
    base_url="https://api.chatanywhere.tech/v1"
)

CSV_PATH = '../database/id_name_lyrics.csv'

# 直接用6类情绪标签
emotion_labels = ["happy", "sad", "calm", "romantic", "dark", "aggressive"]

def generate_prompt(lyrics):
    return f"""
你是一个中文歌词情绪分析助手，目标是对一段歌词进行多标签情绪强度评分。

请从以下英文情绪标签中分析每种情绪在歌词中所表达的程度，并使用 JSON 格式返回（每个值介于 0~1 之间，无需加总为1）：

["happy", "sad", "calm", "romantic", "dark", "aggressive"]

歌词如下：
\"\"\"{lyrics}\"\"\"

请直接输出格式如下的 JSON（不要解释）：
{{
  "happy": 0.2,
  "sad": 0.5,
  ...
}}
"""

def get_emotion_distribution(lyrics, retries=3):
    prompt = generate_prompt(lyrics)
    for attempt in range(retries):
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.4
            )
            content = response.choices[0].message.content.strip()
            raw_emotion = json.loads(content)

            total = sum(raw_emotion.get(label, 0.0) for label in emotion_labels)
            if total > 0:
                normalized = {label: round(raw_emotion.get(label, 0.0) / total, 3) for label in emotion_labels}
            else:
                normalized = {label: 0.0 for label in emotion_labels}

            dominant = max(normalized, key=normalized.get) if total > 0 else "unknown"
            return normalized, dominant
        except Exception as e:
            print(f"[重试中] GPT调用失败：{e}")
            time.sleep(2)

    return {label: 0.0 for label in emotion_labels}, "unknown"

df = pd.read_csv(CSV_PATH)

for idx, row in tqdm(df.iterrows(), total=len(df)):
    lyrics = str(row.get('lyrics', '')).strip()
    if not lyrics:
        emotion_dist = {label: 0.0 for label in emotion_labels}
        dominant = "unknown"
    else:
        emotion_dist, dominant = get_emotion_distribution(lyrics)

    df.at[idx, 'emotion_json'] = json.dumps(emotion_dist, ensure_ascii=False)
    df.at[idx, 'dominant_emotion'] = dominant

df.to_csv(CSV_PATH, index=False, encoding='utf-8-sig')

print(f"\n 任务完成！6类情绪已写入 emotion_json，主导情绪写入 dominant_emotion，文件覆盖保存：{CSV_PATH}")