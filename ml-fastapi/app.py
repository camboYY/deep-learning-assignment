from __future__ import annotations
import os
from typing import List, Tuple

import numpy as np
import cv2 as cv
from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, HTTPException
from insightface.app import FaceAnalysis
import redis
import pickle
import asyncio

from add_new_employee import enroll_new_faces_from_upload

app = FastAPI(title="Face Recognition Attendance System")


# r = redis.Redis(host='localhost', port=6379, db=0)

# Redis (use env var in Docker: REDIS_URL=redis://redis:6379/0)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
r = redis.from_url(REDIS_URL)


training_lock = asyncio.Lock()

# ArcFace (InsightFace) on CPU
app_model = FaceAnalysis(name="buffalo_l", providers=['CPUExecutionProvider'])
app_model.prepare(ctx_id=-1, det_size=(640, 640))

# --- settings for duplicate-face prevention ---
# DUPLICATE_THRESHOLD = float(os.getenv("DUPLICATE_THRESHOLD", "0.7"))  # stricter than verify threshold

# turns raw image bytes (JPEG/PNG that got from file.read()) into an OpenCV image in BGR order.
def _decode_bgr(data: bytes):
    arr = np.frombuffer(data, np.uint8)
    return cv.imdecode(arr, cv.IMREAD_COLOR)  # BGR


def _l2n(v: np.ndarray) -> np.ndarray:
    v = np.asarray(v, dtype=np.float32).reshape(-1)
    n = np.linalg.norm(v)
    return v / n if n > 0 else v

def _first_embedding_from_items(items: List[Tuple[str, bytes]]) -> np.ndarray | None:
    """Try each uploaded image until we can extract one face embedding."""
    for fname, data in items:
        bgr = _decode_bgr(data)
        if bgr is None:
            continue
        h, w = bgr.shape[:2]
        if max(h, w) > 3000:
            s = 3000.0 / max(h, w)
            bgr = cv.resize(bgr, (int(w*s), int(h*s)), interpolation=cv.INTER_AREA)
        faces = app_model.get(bgr)
        if not faces:
            continue
        faces.sort(key=lambda f: float((f.bbox[2]-f.bbox[0])*(f.bbox[3]-f.bbox[1]))*float(getattr(f, "det_score", 1.0)), reverse=True)
        return _l2n(faces[0].embedding)
    return None

def _closest_match(emb: np.ndarray) -> tuple[str | None, float]:
    """Return (redis_key, cosine) of the best match in Redis, or (None, -1)."""
    best_k, best_s = None, -1.0
    for key in r.scan_iter("employee:*"):
        ref = pickle.loads(r.get(key))
        ref = _l2n(np.asarray(ref))
        s = float(np.dot(emb, ref))
        if s > best_s:
            best_s, best_k = s, key.decode()
    return best_k, best_s

@app.post("/enroll")
async def enroll(
    background_tasks: BackgroundTasks,             # required
    emp_id: str = Form(...),
    files: List[UploadFile] = File(...),
    deny_if_exists: bool = Form(True),             # block if employee ID already has an embedding
    prevent_duplicate_face: bool = Form(True),     # block if this face matches someone else
    threshold: float = Form(0.7)
):
    # Read all bytes now
    items: List[Tuple[str, bytes]] = []
    for f in files:
        data = await f.read()
        if data:
            items.append((f.filename, data))
    if not items:
        raise HTTPException(400, "No valid image bytes received")

    # Block if this employee ID already has an embedding (unless caller allows updates)
    key = f"employee:{emp_id}"
    if deny_if_exists and r.exists(key):
        raise HTTPException(status_code=409, detail=f"Employee {emp_id} already enrolled")

    # prevent registering the same person under a different ID
    if prevent_duplicate_face:
        probe = _first_embedding_from_items(items)
        if probe is None:
            raise HTTPException(400, "No face detected in any uploaded image")
        best_key, best_score = _closest_match(probe)
        # If there is a strong match AND it's not this emp_id, block
        if best_key is not None and best_key != key and best_score >= threshold:
            # Strip "employee:" prefix for clarity
            existing_emp = best_key.split("employee:", 1)[-1]
            return {
                "status": "duplicate",
                "message": "A very similar face is already enrolled.",
                "existing_employee_id": existing_emp,
                "score": round(best_score, 4),
                "duplicate_threshold": threshold,
            }

    # background
    background_tasks.add_task(enroll_new_faces_from_upload, emp_id, items)
    return {"status": "scheduled", "message": f"Enrollment started for {emp_id}", "count": len(items)}


@app.post("/verify")
async def verify(file: UploadFile = File(...), threshold: float = 0.7):
    data = await file.read()
    if not data:
        raise HTTPException(400, "Invalid image")

    img_bgr = _decode_bgr(data)
    if img_bgr is None:
        raise HTTPException(400, "Failed to decode image")

    faces = app_model.get(img_bgr)                     # expects BGR
    if not faces:
        return {"status": "fail", "score": 0.0, "message": "No face detected"}

    embedding = _l2n(faces[0].embedding)               # 512-D ArcFace, L2-normalized

    # Compare with Redis embeddings
    best_score = -1.0
    best_match = None
    for key in r.scan_iter("employee:*"):
        emp_emb = pickle.loads(r.get(key))
        emp_emb = _l2n(np.asarray(emp_emb))
        score = float(np.dot(embedding, emp_emb))      # cosine (both normalized)
        if score > best_score:
            best_score = score
            best_match = key.decode()

    if best_match and best_score >= float(threshold):
        return {"status": "success", "employee_id": best_match, "score": round(best_score, 4)}
    else:
        return {"status": "fail", "score": round(best_score, 4), "message": "Face not recognized"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
