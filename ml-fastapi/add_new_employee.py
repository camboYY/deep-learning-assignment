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


FACES_ROOT = os.getenv("FACES_ROOT", "data/faces")   # base folder for saving
SAVE_CROPS = True                                     # also save cropped face images

def _l2n(v: np.ndarray) -> np.ndarray:
    v = np.asarray(v, dtype=np.float32).reshape(-1)
    n = np.linalg.norm(v)
    return v / n if n > 0 else v

def _decode_bgr(data: bytes):
    arr = np.frombuffer(data, np.uint8)
    return cv.imdecode(arr, cv.IMREAD_COLOR)

def _safe_emp_folder(emp_id: str) -> str:
    # sanitize and build folder path
    safe = "".join(c for c in emp_id if c.isalnum() or c in ("-", "_"))
    return os.path.join(FACES_ROOT, f"emp_{safe}")

def _jpeg_quality() -> list:
    return [int(cv.IMWRITE_JPEG_QUALITY), 95]

def enroll_new_faces_from_upload(emp_id: str, items: List[Tuple[str, bytes]]) -> bool:
    """
    items: List[(filename, image_bytes)]
    Stores/upserts L2-normalized centroid at 'employee:{emp_id}'.
    Also saves originals (and optional crops) to data/faces/emp_<id>/.
    """
    if not items:
        print(f"No input images for employee {emp_id}")
        return False

    # ensure destination folder exists
    emp_dir = _safe_emp_folder(emp_id)
    os.makedirs(emp_dir, exist_ok=True)

    embs: List[np.ndarray] = []
    saved = 0

    for fname, data in items:
        # ---- save original upload ----
        ts = time.strftime("%Y%m%dT%H%M%S")
        base = os.path.splitext(os.path.basename(fname or "upload"))[0]
        out_orig = os.path.join(emp_dir, f"{ts}_{base}_orig.jpg")

        # decode to BGR and re-encode as JPEG (so we have a consistent format on disk)
        bgr = _decode_bgr(data)
        if bgr is None:
            print(f"Failed to decode {fname}")
            continue
        cv.imwrite(out_orig, bgr, _jpeg_quality())
        saved += 1

        # downscale for huge images
        h, w = bgr.shape[:2]
        if max(h, w) > 3000:
            s = 3000.0 / max(h, w)
            bgr_small = cv.resize(bgr, (int(w*s), int(h*s)), interpolation=cv.INTER_AREA)
        else:
            bgr_small = bgr

        # detect & embed
        faces = app.get(bgr_small)
        if not faces:
            print(f"No face detected in {fname} (size={w}x{h})")
            continue

        # pick largest/highest-score face
        faces.sort(key=lambda f: float((f.bbox[2]-f.bbox[0])*(f.bbox[3]-f.bbox[1]))*float(getattr(f, "det_score", 1.0)), reverse=True)
        f0 = faces[0]

        # save a tight crop of the detected face
        if SAVE_CROPS and hasattr(f0, "bbox"):
            x1, y1, x2, y2 = map(int, f0.bbox)
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(bgr_small.shape[1], x2), min(bgr_small.shape[0], y2)
            crop = bgr_small[y1:y2, x1:x2].copy()
            if crop.size > 0:
                out_crop = os.path.join(emp_dir, f"{ts}_{base}_crop.jpg")
                cv.imwrite(out_crop, crop, _jpeg_quality())

        emb = _l2n(f0.embedding)  # 512-D ArcFace
        embs.append(emb)

    if not embs:
        print(f"No faces found for employee {emp_id}")
        return False

    # centroid and store
    new_mean_emb = _l2n(np.mean(np.stack(embs, axis=0), axis=0))
    key = f"employee:{emp_id}"

    if r.exists(key):
        existing_emb = _l2n(pickle.loads(r.get(key)))
        combined = _l2n(0.5 * existing_emb + 0.5 * new_mean_emb)
        r.set(key, pickle.dumps(combined.astype(np.float32)))
        action = "updated"
    else:
        r.set(key, pickle.dumps(new_mean_emb.astype(np.float32)))
        action = "created"

    print(f"{action} {key} | saved={saved} files -> {emp_dir} | samples={len(embs)}")
    return True


