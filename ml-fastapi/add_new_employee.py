import numpy as np
from PIL import Image
from insightface.app import FaceAnalysis
import redis
import pickle
from io import BytesIO

# Redis connection
r = redis.Redis(host='localhost', port=6379, db=0)

# Initialize ArcFace model
app = FaceAnalysis(name="buffalo_l", providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0)


async def enroll_new_faces_from_upload(emp_id: str, files: list):
    """
    Enroll new faces for a single employee from uploaded images
    and store/update embeddings in Redis.
    
    Args:
        emp_id: Employee ID
        files: List of UploadFile objects
    Returns:
        True if enrollment successful, False otherwise
    """
    emp_embeddings = []

    for file in files:
        try:
            content = await file.read()
            img = np.array(Image.open(BytesIO(content)).convert("RGB"))
        except Exception as e:
            print(f"⚠️ Failed to read image {file.filename}: {e}")
            continue

        faces = app.get(img)
        if len(faces) == 0:
            print(f"⚠️ No face detected in {file.filename}")
            continue

        emb = faces[0].embedding
        emb = emb / np.linalg.norm(emb)
        emp_embeddings.append(emb)

    if not emp_embeddings:
        print(f"⚠️ No faces found for employee {emp_id}")
        return False

    new_mean_emb = np.mean(emp_embeddings, axis=0)
    emp_id_key = f"employee:{emp_id}"

    # If employee exists, average new embedding with existing
    if r.exists(emp_id_key):
        existing_emb = pickle.loads(r.get(emp_id_key))
        combined_emb = (existing_emb + new_mean_emb) / 2
        combined_emb /= np.linalg.norm(combined_emb)
        r.set(emp_id_key, pickle.dumps(combined_emb))
    else:
        r.set(emp_id_key, pickle.dumps(new_mean_emb))

    print(f"✅ Enrolled/Updated embeddings for {emp_id_key}")
    return True
