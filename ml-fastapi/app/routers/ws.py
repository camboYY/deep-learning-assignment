# app/routers/ws.py
import base64, asyncio, time, json
from typing import Dict, Set, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
import numpy as np

from app.utils import detect_face_embedding   # expects image bytes -> np.ndarray
from app.database import database, redis
from app.models import Staff
from sqlalchemy import select

router = APIRouter()

# Simple connection manager (rooms by device_id)
class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, Set[WebSocket]] = {}

    async def connect(self, device_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active.setdefault(device_id, set()).add(websocket)

    def disconnect(self, device_id: str, websocket: WebSocket):
        if device_id in self.active and websocket in self.active[device_id]:
            self.active[device_id].remove(websocket)
            if not self.active[device_id]:
                del self.active[device_id]

    async def broadcast(self, device_id: str, message: dict):
        for ws in list(self.active.get(device_id, [])):
            try:
                await ws.send_json(message)
            except Exception:
                # Drop broken sockets
                self.disconnect(device_id, ws)

manager = ConnectionManager()

# Tuneable settings
FRAME_INTERVAL_MS = 400          # throttle processing per socket
CACHE_TTL_SECONDS = 86400
DISTANCE_THRESHOLD = 1.0

def _strip_data_url(b64: str) -> str:
    # handles "data:image/jpeg;base64,..." or raw base64
    if "," in b64 and b64.startswith("data:"):
        return b64.split(",", 1)[1]
    return b64

@router.websocket("/ws/attendance")
async def attendance_ws(websocket: WebSocket):
    """
    Client sends JSON text messages:
      { "type": "frame", "deviceId": "kiosk-1", "image": "<base64 jpeg/png>" }

    Server replies JSON:
      { "type": "result", "deviceId": "...", "success": bool, ... }
    or heartbeat/ack messages.
    """
    # First message must include deviceId so we can "room" the socket
    await websocket.accept()
    try:
        hello = await websocket.receive_text()
        try:
            hello_obj = json.loads(hello)
            device_id = hello_obj.get("deviceId") or "default"
        except Exception:
            device_id = "default"
        await manager.connect(device_id, websocket)
        await websocket.send_json({"type": "ack", "deviceId": device_id})
    except Exception:
        return

    last_processed_at = 0.0

    try:
        while True:
            msg = await websocket.receive_text()
            try:
                data = json.loads(msg)
            except Exception:
                await websocket.send_json({"type": "error", "message": "Invalid JSON"})
                continue

            if data.get("type") != "frame":
                await websocket.send_json({"type": "pong"} if data.get("type") == "ping" else {"type":"noop"})
                continue

            device_id = data.get("deviceId") or "default"
            b64 = _strip_data_url(data.get("image", ""))

            # Throttle processing per connection
            now = time.monotonic() * 1000
            if now - last_processed_at < FRAME_INTERVAL_MS:
                # Skip heavy work but keep socket healthy
                await websocket.send_json({"type": "throttle", "deviceId": device_id})
                continue
            last_processed_at = now

            try:
                image_bytes = base64.b64decode(b64)
            except Exception:
                await websocket.send_json({"type":"error", "message":"Bad base64"})
                continue

            # ----- cache on raw frame to short-circuit repeats -----
            import hashlib
            img_hash = hashlib.md5(image_bytes).hexdigest()
            cached_staff = await redis.get(f"att:img:{img_hash}")
            if cached_staff:
                await manager.broadcast(device_id, {
                    "type": "result", "deviceId": device_id,
                    "success": True, "staff_id": int(cached_staff),
                    "cached": True
                })
                continue

            # ----- infer embedding -----
            embedding = detect_face_embedding(image_bytes)
            if embedding is None:
                await manager.broadcast(device_id, {
                    "type": "result", "deviceId": device_id,
                    "success": False, "message": "No face detected"
                })
                continue

            # ----- nearest-neighbor against DB -----
            rows = await database.fetch_all(select(Staff))
            best = None
            best_dist = float("inf")
            for row in rows:
                staff_emb = np.frombuffer(row["embedding"], dtype=np.float32)
                dist = float(np.linalg.norm(embedding - staff_emb))
                if dist < best_dist:
                    best_dist = dist
                    best = row

            if best and best_dist < DISTANCE_THRESHOLD:
                await redis.set(f"att:img:{img_hash}", best["id"], ex=CACHE_TTL_SECONDS)
                await manager.broadcast(device_id, {
                    "type": "result", "deviceId": device_id,
                    "success": True, "staff_id": best["id"],
                    "name": best["name"], "distance": best_dist,
                    "cached": False
                })
            else:
                await manager.broadcast(device_id, {
                    "type": "result", "deviceId": device_id,
                    "success": False, "message": "Unknown face",
                    "distance": best_dist if best_dist != float("inf") else None
                })

    except WebSocketDisconnect:
        manager.disconnect(device_id, websocket)
    except Exception:
        manager.disconnect(device_id, websocket)
