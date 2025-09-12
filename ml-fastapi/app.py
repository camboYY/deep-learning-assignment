from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
import numpy as np
from PIL import Image
from insightface.app import FaceAnalysis
import redis
import pickle
import asyncio
from add_new_employee import enroll_new_faces_from_upload

app = FastAPI(title="Face Recognition Attendance System")
r = redis.Redis(host='localhost', port=6379, db=0)
training_lock = asyncio.Lock()

# Initialize ArcFace model for verification
app_model = FaceAnalysis(name="buffalo_l", providers=['CPUExecutionProvider'])
app_model.prepare(ctx_id=-1, det_size=(640, 640))


@app.post("/enroll")
async def enroll(emp_id: str = Form(...), files: list[UploadFile] = File(...), background_tasks: BackgroundTasks = None):
    async def task():
        enroll_new_faces_from_upload(emp_id, files)
    
    if background_tasks:
        background_tasks.add_task(task)
        return {"status": "scheduled", "message": f"Enrollment started for {emp_id}"}
    else:
        success = enroll_new_faces_from_upload(emp_id, files)
        return {"status": "success" if success else "fail", "message": f"Enrollment completed for {emp_id}"}
    

@app.post("/verify")
async def verify(file: UploadFile = File(...), threshold: float = 0.7):
    """
    Verify face and return employee ID if match is found.
    """
    img = np.array(Image.open(file.file).convert("RGB"))

    faces = app_model.get(img)
    if not faces:
        return {"status": "fail", "score": 0.0, "message": "No face detected"}

    embedding = faces[0].embedding
    embedding = embedding / np.linalg.norm(embedding)

    # Compare with Redis embeddings
    best_score = -1
    best_match = None

    for key in r.scan_iter("employee:*"):  # Only iterate employee embeddings
        emp_emb = pickle.loads(r.get(key))
        score = np.dot(embedding, emp_emb / np.linalg.norm(emp_emb))
        if score > best_score:
            best_score = score
            best_match = key.decode()

    if best_score >= threshold:
        # Here you can also mark attendance in a DB
        return {"status": "success", "employee_id": best_match, "score": float(best_score)}
    else:
        return {"status": "fail", "score": float(best_score), "message": "Face not recognized"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

