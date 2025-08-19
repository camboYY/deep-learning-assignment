import cv2
import numpy as np
import insightface

# Load ArcFace model
model = insightface.app.FaceAnalysis(name="buffalo_l")
model.prepare(ctx_id=-1)  # CPU (-1), GPU >=0

def detect_face_embedding(image_bytes: bytes) -> np.ndarray:
    # Convert bytes to OpenCV image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Detect face and get embedding
    faces = model.get(img)
    if len(faces) == 0:
        return None
    return faces[0].embedding  # 512-d vector
