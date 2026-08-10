from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, status
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from ..chat_manager import manager
from ..database import SessionLocal, get_db
from ..deps import get_current_user, user_from_token
from ..models import Message, User
from ..schemas import MessageCreate, MessageOut

router = APIRouter(prefix="/api/chat", tags=["chat"])

HISTORY_LIMIT = 100


@router.get("/messages", response_model=list[MessageOut])
def history(
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=HISTORY_LIMIT)] = 50,
) -> list[Message]:
    """The most recent messages, returned oldest-first so the client can append as-is."""
    rows = db.scalars(select(Message).order_by(Message.id.desc()).limit(limit)).all()
    return list(reversed(rows))


def _store_message(user_id: int, content: str) -> dict[str, Any]:
    with SessionLocal() as db:
        message = Message(user_id=user_id, content=content)
        db.add(message)
        db.commit()
        db.refresh(message)
        return MessageOut.model_validate(message).model_dump(mode="json")


async def _broadcast_presence() -> None:
    users = await manager.online_users()
    await manager.broadcast({"type": "presence", "data": {"users": users, "count": len(users)}})


@router.websocket("/ws")
async def chat_socket(websocket: WebSocket, token: Annotated[str | None, Query()] = None) -> None:
    # Browsers cannot set headers on a WebSocket handshake, so the JWT arrives as a query param.
    with SessionLocal() as db:
        user = user_from_token(token, db) if token else None
        if user is None:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        user_id, full_name = user.id, user.full_name

    await websocket.accept()
    await manager.connect(websocket, user_id, full_name)
    await _broadcast_presence()

    try:
        while True:
            raw = await websocket.receive_json()
            try:
                payload = MessageCreate.model_validate(raw)
            except ValidationError:
                await websocket.send_json(
                    {"type": "error", "data": {"detail": "Невалидно съобщение."}}
                )
                continue

            content = payload.content.strip()
            if not content:
                continue

            stored = await run_in_threadpool(_store_message, user_id, content)
            await manager.broadcast({"type": "message", "data": stored})
    except WebSocketDisconnect:
        pass
    finally:
        await manager.disconnect(websocket)
        await _broadcast_presence()
