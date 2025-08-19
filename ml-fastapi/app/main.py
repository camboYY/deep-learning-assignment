from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import select, insert
import numpy as np
import hashlib
from app.routers import ws as ws_router

from database import database, engine, metadata, redis
from models import Staff, StaffCreate
from utils import detect_face_embedding

app = FastAPI(title="Attendance ML API")

metadata.create_all(engine)

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# ------------------------------
# ML Attendance endpoint
# ------------------------------
@app.post("/ml/attendance")
async def mark_attendance(
    file: UploadFile = File(...),
    name: str = Form(None),
    email: str = Form(None)
):
    image_bytes = await file.read()
    embedding = detect_face_embedding(image_bytes)

    if embedding is None:
        raise HTTPException(status_code=400, detail="No face detected")

    # ----------------------
    # Redis caching
    # ----------------------
    img_hash = hashlib.md5(image_bytes).hexdigest()
    cached_staff = await redis.get(img_hash)
    if cached_staff:
        return {"success": True, "staff_id": int(cached_staff), "cached": True}

    # ----------------------
    # Compute nearest neighbor
    # ----------------------
    query = select(Staff)
    staff_list = await database.fetch_all(query)

    best_match = None
    best_score = float("inf")

    for staff in staff_list:
        staff_emb = np.frombuffer(staff["embedding"], dtype=np.float32)
        dist = np.linalg.norm(embedding - staff_emb)
        if dist < best_score:
            best_score = dist
            best_match = staff

    threshold = 1.0
    if best_match and best_score < threshold:
        await redis.set(img_hash, best_match["id"], ex=86400)
        return {
            "success": True,
            "staff_id": best_match["id"],
            "name": best_match["name"],
            "distance": float(best_score),
            "cached": False
        }

    # ----------------------
    # Unknown face: optionally register
    # ----------------------
    if name and email:
        embedding_bytes = embedding.astype(np.float32).tobytes()
        staff_create = StaffCreate(name=name, email=email, embedding=embedding_bytes)
        query = insert(Staff).values(
            name=staff_create.name,
            email=staff_create.email,
            embedding=staff_create.embedding
        )
        staff_id = await database.execute(query)
        await redis.set(img_hash, staff_id, ex=86400)
        return {
            "success": True,
            "staff_id": staff_id,
            "name": staff_create.name,
            "distance": 0.0,
            "cached": False,
            "message": "New staff registered"
        }

    return JSONResponse(
        {"success": False, "message": "Unknown face. Provide name and email to register."},
        status_code=404
    )

# ------------------------------
# Healthcheck endpoint
# ------------------------------
@app.get("/healthcheck")
async def healthcheck():
    return {"success": True}

app.include_router(ws_router.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)