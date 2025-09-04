from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import torch
from PIL import Image
import numpy as np
import io
import redis
import os


# -----------------------------
# Configuration
# -----------------------------
MODEL_PATH = "models/dlidcnn.pth"          # trained DLID-CNN
LABEL_MAP_PATH = "models/label_map.pth"    # label mapping
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")  # <-- now dynamic
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))
REDIS_KEY = "employee_embeddings"  # Redis hash key

# -----------------------------
# Redis connection
# -----------------------------
r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)

# -----------------------------
# FastAPI app
# -----------------------------
app = FastAPI(title="Face Attendance API with Redis")

# -----------------------------
# Load DLID-CNN model
# -----------------------------
class DLIDCNN(torch.nn.Module):
    def __init__(self, num_classes):
        super().__init__()
        self.features = torch.nn.Sequential(
            torch.nn.Conv2d(3,32,3,1,1),
            torch.nn.BatchNorm2d(32),
            torch.nn.ReLU(),
            torch.nn.MaxPool2d(2),

            torch.nn.Conv2d(32,64,3,1,1),
            torch.nn.BatchNorm2d(64),
            torch.nn.ReLU(),
            torch.nn.MaxPool2d(2),

            torch.nn.Conv2d(64,128,3,1,1),
            torch.nn.BatchNorm2d(128),
            torch.nn.ReLU(),
            torch.nn.AdaptiveAvgPool2d((1,1))
        )
        self.fc = torch.nn.Linear(128, num_classes)

    def forward(self, x):
        x = self.features(x)
        x = torch.flatten(x, 1)
        return self.fc(x)

# Load label map
with open(LABEL_MAP_PATH, "rb") as f:
    label_map = torch.load(f)
    print(label_map)

num_classes = len(label_map)
model = DLIDCNN(num_classes=num_classes)
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.eval()
model.to(DEVICE)

# -----------------------------
# Image preprocessing
# -----------------------------
import torchvision.transforms as transforms

transform = transforms.Compose([
    transforms.Resize((112,112)),
    transforms.ToTensor(),
    transforms.Normalize([0.5],[0.5])
])

def preprocess_image(file: UploadFile):
    img_bytes = file.file.read()
    image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    image = transform(image).unsqueeze(0).to(DEVICE)
    return image

# -----------------------------
# Enrollment endpoint
# -----------------------------
@app.post("/enroll")
async def enroll(employee_id: str, file: UploadFile = File(...)):
    image_tensor = preprocess_image(file)
    with torch.no_grad():
        embedding = model.features(image_tensor)
        embedding = torch.flatten(embedding, 1).cpu().numpy()[0]

    # Convert to bytes
    emb_bytes = embedding.tobytes()
    r.hset(REDIS_KEY, employee_id, emb_bytes)

    return JSONResponse({"status":"success", "employee_id": employee_id})

# -----------------------------
# Verification endpoint
# -----------------------------
@app.post("/verify")
async def verify(file: UploadFile = File(...), threshold: float = 0.7):
    image_tensor = preprocess_image(file)
    with torch.no_grad():
        embedding = model.features(image_tensor)
        embedding = torch.flatten(embedding, 1).cpu().numpy()[0]

    # Load all embeddings from Redis
    all_embeddings = r.hgetall(REDIS_KEY)
    if not all_embeddings:
        raise HTTPException(status_code=404, detail="No enrolled employees")

    best_match = None
    best_score = -1

    for emp_id_bytes, emb_bytes in all_embeddings.items():
        emp_id = emp_id_bytes.decode()
        emb = np.frombuffer(emb_bytes, dtype=np.float32)
        score = np.dot(embedding, emb) / (np.linalg.norm(embedding)*np.linalg.norm(emb))
        if score > best_score:
            best_score = score
            best_match = emp_id

    if best_score >= threshold:
        return {"status":"success", "employee_id": best_match, "score": float(best_score)}
    else:
        return {"status":"fail", "score": float(best_score)}

# run uvicorn app:app --reload --host 0.0.0.0 --port 8000
