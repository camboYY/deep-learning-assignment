import os
import numpy as np
from PIL import Image
from insightface.app import FaceAnalysis
import redis
import pickle

DATA_ROOT = "data/train"

# Connect to Redis
r = redis.Redis(host='localhost', port=6379, db=0)

# Initialize ArcFace model
app = FaceAnalysis(name="buffalo_l", providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0)  # 0 = CPU

def enroll_faces_to_redis():
    """
    Extract embeddings for each employee and store in Redis.
    """
    for emp_id in os.listdir(DATA_ROOT):
        emp_path = os.path.join(DATA_ROOT, emp_id)
        if not os.path.isdir(emp_path):
            continue

        emp_embeddings = []
        for img_name in os.listdir(emp_path):
            if not img_name.lower().endswith((".jpg", ".jpeg", ".png")):
                continue
            img_path = os.path.join(emp_path, img_name)
            img = np.array(Image.open(img_path).convert("RGB"))
            faces = app.get(img)
            if len(faces) == 0:
                continue
            emb = faces[0].embedding  # 512-dim
            emb = emb / np.linalg.norm(emb)
            emp_embeddings.append(emb)

        if emp_embeddings:
            mean_emb = np.mean(emp_embeddings, axis=0)
            
            # Save embedding to Redis
            key = f"employee:{emp_id}"
            # Delete old key if it's the wrong type
            if r.exists(key) and r.type(key) != b'string':
                r.delete(key)
            r.set(key, pickle.dumps(mean_emb))
            print(f"✅ Stored embedding for {emp_id} in Redis under {key}")

if __name__ == "__main__":
    enroll_faces_to_redis()

    # Close Redis connection
    r.close()