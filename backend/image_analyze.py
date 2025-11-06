import io
import json
import requests
from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel

# 音乐情绪标签
MUSIC_EMOTION_LABELS = [
    "happy", "sad", "calm", "romantic", "dark", "aggressive"
]

class ImageEmotionAnalyzer:
    def __init__(self):
        print("加载 CLIP 模型...")
        self.model = CLIPModel.from_pretrained("model")
        self.processor = CLIPProcessor.from_pretrained("model")
        print("模型加载完成")

    def analyze(self, image_input):
        # 判断输入是 URL、base64 数据还是本地文件路径
        if image_input.startswith("http"):
            response = requests.get(image_input)
            image = Image.open(io.BytesIO(response.content)).convert("RGB")
        elif image_input.startswith("data:image"):
            # 处理 base64 格式的图片
            import base64
            header, data = image_input.split(',', 1)
            image_data = base64.b64decode(data)
            image = Image.open(io.BytesIO(image_data)).convert("RGB")
        else:
            image = Image.open(image_input).convert("RGB")

        # 使用 CLIP 对图像与情绪标签进行匹配
        inputs = self.processor(
            text=MUSIC_EMOTION_LABELS,
            images=image,
            return_tensors="pt",
            padding=True
        )

        with torch.no_grad():
            outputs = self.model(**inputs)
            probs = outputs.logits_per_image.softmax(dim=1)[0].cpu().numpy()

        emotion_scores = {label: round(float(score), 4) for label, score in zip(MUSIC_EMOTION_LABELS, probs)}
        dominant_emotion = max(emotion_scores.items(), key=lambda x: x[1])[0]

        return {
            "emotion_scores": emotion_scores,
            "dominant_emotion": dominant_emotion
        }

# 集成为 API，只保留这个入口函数
def analyze_image_emotion(image_path_or_url):
    analyzer = ImageEmotionAnalyzer()
    return analyzer.analyze(image_path_or_url)
