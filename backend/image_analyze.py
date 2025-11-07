import io
import json
import os
import requests
from PIL import Image
import torch
import threading
from transformers import CLIPProcessor, CLIPModel
import time

# 音乐情绪标签
MUSIC_EMOTION_LABELS = [
    "happy", "sad", "calm", "romantic", "dark", "aggressive"
]

class ImageEmotionAnalyzer:
    def __init__(self, model_id: str | None = None, device: str | None = None):
        """
        在线加载 Hugging Face 的 CLIP 模型（默认：openai/clip-vit-base-patch32）。
        可通过环境变量 CLIP_MODEL_ID 覆盖。
        """
        model_id = model_id or os.getenv("CLIP_MODEL_ID", "openai/clip-vit-base-patch32")
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        print(f"加载 CLIP 模型: {model_id} (device={self.device}) ...")
        self.model = CLIPModel.from_pretrained(model_id)
        self.processor = CLIPProcessor.from_pretrained(model_id)
        self.model.to(self.device)
        self.model.eval()
        print("模型加载完成")

    def analyze(self, image_input):
        t0 = time.time()
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

        # 移动到相同设备
        inputs = {k: v.to(self.device) if hasattr(v, 'to') else v for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self.model(**inputs)
            probs = outputs.logits_per_image.softmax(dim=1)[0].detach().cpu().numpy()

        emotion_scores = {label: round(float(score), 4) for label, score in zip(MUSIC_EMOTION_LABELS, probs)}
        dominant_emotion = max(emotion_scores.items(), key=lambda x: x[1])[0]
        dt = (time.time() - t0) * 1000
        try:
            print(f"情绪打分: {emotion_scores}, 用时 {dt:.1f}ms")
        except Exception:
            pass

        return {
            "emotion_scores": emotion_scores,
            "dominant_emotion": dominant_emotion
        }

# 简单的进程级单例，避免每次请求重复加载大模型
_ANALYZER_SINGLETON: ImageEmotionAnalyzer | None = None
_ANALYZER_LOCK = threading.Lock()

def get_analyzer() -> ImageEmotionAnalyzer:
    global _ANALYZER_SINGLETON
    if _ANALYZER_SINGLETON is None:
        with _ANALYZER_LOCK:
            if _ANALYZER_SINGLETON is None:
                _ANALYZER_SINGLETON = ImageEmotionAnalyzer()
    return _ANALYZER_SINGLETON

# 集成为 API，只保留这个入口函数
def analyze_image_emotion(image_path_or_url):
    analyzer = get_analyzer()
    return analyzer.analyze(image_path_or_url)


def main():
    """简单命令行测试：
    python image_analyze.py --image <path_or_url>
    可选：--model-id openai/clip-vit-large-patch14
    """
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True, help="图片本地路径或 URL 或 data:image/base64")
    parser.add_argument("--model-id", default=os.getenv("CLIP_MODEL_ID", "openai/clip-vit-base-patch32"))
    args = parser.parse_args()

    analyzer = ImageEmotionAnalyzer(model_id=args.model_id)
    res = analyzer.analyze(args.image)
    print(json.dumps(res, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
