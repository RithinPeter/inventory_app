from fastapi import FastAPI, HTTPException
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import time
import json
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = Path("requests_db.json")

# ---------- MODELS ----------
class RequestIn(BaseModel):
    item_type: str
    description: str
    os: Optional[str] = None
    boot_mode: Optional[str] = None

class RequestOut(RequestIn):
    id: int
    status: str
    created_at: float
    updated_at: float
    notify: Optional[str] = "none"

class RequestUpdate(BaseModel):
    status: Optional[str] = None


# ---------- DB HELPERS ----------
def load_db() -> List[dict]:
    if not DB_PATH.exists():
        return []
    try:
        return json.load(open(DB_PATH, "r"))
    except:
        return []

def save_db(data: List[dict]):
    json.dump(data, open(DB_PATH, "w"), indent=2)


# ---------- API ENDPOINTS ----------
@app.get("/api/requests")
def list_requests():
    return load_db()


@app.post("/api/requests", response_model=RequestOut)
def create_request(req: RequestIn):
    data = load_db()
    new_id = max([i["id"] for i in data], default=0) + 1
    now = time.time()

    rec = {
        "id": new_id,
        "item_type": req.item_type,
        "description": req.description,
        "os": req.os,
        "boot_mode": req.boot_mode,
        "status": "New",
        "created_at": now,
        "updated_at": now,
        "notify": "none"
    }

    data.append(rec)
    save_db(data)
    return rec


@app.patch("/api/requests/{req_id}")
def update_request(req_id: int, patch: RequestUpdate):
    data = load_db()
    for r in data:
        if r["id"] == req_id:
            if patch.status:
                r["status"] = patch.status
                r["updated_at"] = time.time()

                # Mark notify flag if delivered
                if patch.status == "Delivered":
                    r["notify"] = "delivered"

            save_db(data)
            return r

    raise HTTPException(404, "Request not found")


# ---------- NOTIFICATION ----------
@app.get("/api/notify/{ticket_id}")
def notify_status(ticket_id: int):
    data = load_db()
    for r in data:
        if r["id"] == ticket_id:
            return {"status": r.get("notify", "none")}
    return {"status": "none"}

#chat-code

clients = []

@app.websocket("/ws/chat")
async def chat_ws(ws: WebSocket):
    await ws.accept()
    clients.append(ws)

    try:
        while True:
            data = await ws.receive_text()

            # Broadcast to all clients
            for c in clients:
                await c.send_text(data)

    except WebSocketDisconnect:
        clients.remove(ws)