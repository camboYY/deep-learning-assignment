# inference.py
"""
Embedder wrapper: loads backbone checkpoint and provides embed(PIL.Image) -> np.ndarray(512)
"""
import torch
import numpy as np
from backbone import IRResNet18
from torchvision import transforms
import torch.nn.functional as F
from PIL import Image

device = "cuda" if torch.cuda.is_available() else "cpu"

# preprocessing transforms used at inference
T = transforms.Compose([
    transforms.Resize((112,112)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5,0.5,0.5], std=[0.5,0.5,0.5])
])

class Embedder:
    def __init__(self, ckpt_path: str = "backbone_final.pt"):
        self.net = IRResNet18(emb_dim=512)
        ckpt = torch.load(ckpt_path, map_location=device)
        # support dict saved as {'model': state_dict} or directly state_dict
        sd = ckpt.get('model', ckpt) if isinstance(ckpt, dict) else ckpt
        self.net.load_state_dict(sd)
        self.net.to(device).eval()

    @torch.no_grad()
    def embed_pil(self, pil_image: Image.Image) -> np.ndarray:
        x = T(pil_image).unsqueeze(0).to(device)
        e = self.net(x)  # already normalized in backbone
        e = F.normalize(e, p=2, dim=1)
        return e.cpu().numpy().reshape(-1)

# cosine helper
def cosine(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b) / ((np.linalg.norm(a) * np.linalg.norm(b)) + 1e-9))

if __name__ == "__main__":
    # quick manual smoke (requires a valid checkpoint)
    E = Embedder("backbone_final.pt")
    from PIL import Image
    img = Image.new("RGB", (112,112), color=(128,128,128))
    v = E.embed_pil(img)
    print(v.shape, np.linalg.norm(v))
