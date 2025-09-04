# align.py
"""
Server-side face detection + alignment using facenet-pytorch's MTCNN.
Returns aligned PIL.Image sized 112x112 (RGB).
"""
from facenet_pytorch import MTCNN
from PIL import Image
import numpy as np
import io

# Single global MTCNN instance (thread-safe for inference)
mtcnn = MTCNN(image_size=112, margin=14, keep_all=False)  # margin pads the crop

def align_from_bytes(image_bytes: bytes):
    """
    Accept raw image bytes; return PIL.Image (aligned face) or None if no face found.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    # mtcnn returns a PIL Image or a torch.Tensor depending on configuration
    face = mtcnn(img)  # returns torch.Tensor or PIL.Image depending on return_aligned/other flags
    if face is None:
        return None
    # If face is torch.Tensor (C,H,W), convert to PIL
    if hasattr(face, "permute"):
        face = face.permute(1,2,0).int().numpy()
        return Image.fromarray(face.astype(np.uint8))
    # else it's already PIL
    return face
