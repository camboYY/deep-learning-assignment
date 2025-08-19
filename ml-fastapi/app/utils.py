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

def bytes_to_bgr(img_bytes: bytes) -> np.ndarray:
    """
    Convert a bytes object containing a JPEG image to an OpenCV BGR image.

    Parameters
    ----------
    img_bytes : bytes
        Bytes object containing a JPEG image.

    Returns
    -------
    img : np.ndarray
        OpenCV BGR image.
    """
    arr = np.frombuffer(img_bytes, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)

def bgr_to_bytes(img: np.ndarray) -> bytes:
    """
    Convert an OpenCV BGR image to a bytes object containing a JPEG image.

    Parameters
    ----------
    img : np.ndarray
        OpenCV BGR image.

    Returns
    -------
    img_bytes : bytes
        Bytes object containing a JPEG image.
    """
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()