from __future__ import annotations
import os, pickle
from typing import List, Tuple

import numpy as np
import cv2 as cv
import redis
from insightface.app import FaceAnalysis

import time

# Redis (works in Docker with REDIS_URL=redis://redis:6379/0)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
r = redis.from_url(REDIS_URL)

# InsightFace pipeline (CPU)
app = FaceAnalysis(name="buffalo_l", providers=['CPUExecutionProvider'])
app.prepare(ctx_id=-1, det_size=(640, 640))

def _l2n(v: np.ndarray) -> np.ndarray:
    v = np.asarray(v, dtype=np.float32).reshape(-1)
    n = np.linalg.norm(v)
    return v / n if n > 0 else v

def _decode_bgr(data: bytes):
    arr = np.frombuffer(data, np.uint8)
    return cv.imdecode(arr, cv.IMREAD_COLOR)

def enroll_new_faces_from_upload(emp_id: str, items: List[Tuple[str, bytes]]) -> bool:
    """
    items: List[(filename, image_bytes)]
    Stores/upserts L2-normalized centroid at 'employee:{emp_id}'.
    Prints timing info: total seconds and per-image milliseconds.
    """
    if not items:
        print(f"⚠️ No input images for employee {emp_id}")
        return False

    t_start = time.perf_counter()
    per_image_times = []   # [(filename, ms, note)]

    embs: List[np.ndarray] = []
    for fname, data in items:
        t0 = time.perf_counter()

        bgr = _decode_bgr(data)
        if bgr is None:
            per_image_times.append((fname, (time.perf_counter()-t0)*1000, "decode_fail"))
            print(f"⚠️ Failed to decode {fname}")
            continue

        h, w = bgr.shape[:2]
        if max(h, w) > 3000:  # keep detector sane on huge photos
            scale = 3000.0 / max(h, w)
            bgr = cv.resize(bgr, (int(w*scale), int(h*scale)), interpolation=cv.INTER_AREA)

        faces = app.get(bgr)   # InsightFace expects BGR
        if not faces:
            per_image_times.append((fname, (time.perf_counter()-t0)*1000, f"no_face({w}x{h})"))
            print(f"⚠️ No face detected in {fname} (size={w}x{h})")
            continue

        # pick largest/highest-score face
        faces.sort(key=lambda f: float((f.bbox[2]-f.bbox[0])*(f.bbox[3]-f.bbox[1])) * float(getattr(f, "det_score", 1.0)), reverse=True)
        emb = _l2n(faces[0].embedding)  # 512-D ArcFace
        embs.append(emb)

        per_image_times.append((fname, (time.perf_counter()-t0)*1000, "ok"))

    if not embs:
        total = time.perf_counter() - t_start
        print(f"⚠️ No faces found for employee {emp_id} | total={total:.3f}s")
        # also print per-image breakdown
        for fn, ms, note in per_image_times:
            print(f"   • {fn}: {ms:.1f} ms [{note}]")
        return False

    # centroid (normalize!)
    new_mean_emb = _l2n(np.mean(np.stack(embs, axis=0), axis=0))
    key = f"employee:{emp_id}"

    if r.exists(key):
        existing_emb = _l2n(pickle.loads(r.get(key)))
        combined_emb = _l2n(0.5 * existing_emb + 0.5 * new_mean_emb)
        r.set(key, pickle.dumps(combined_emb.astype(np.float32)))
        action = "updated"
    else:
        r.set(key, pickle.dumps(new_mean_emb.astype(np.float32)))
        action = "created"

    total = time.perf_counter() - t_start

    # concise summary
    print(f"✅ {action} {key} | samples={len(embs)} | images={len(items)} | total={total:.3f}s")
    for fn, ms, note in per_image_times:
        print(f"   • {fn}: {ms:.1f} ms [{note}]")

    return True
