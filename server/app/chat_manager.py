import asyncio
from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    """In-memory registry of the sockets currently in the group chat.

    Single-process only: with more than one worker each process would broadcast to
    just its own clients. Move to Redis pub/sub before scaling out.
    """

    def __init__(self) -> None:
        self._connections: dict[WebSocket, tuple[int, str]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, user_id: int, full_name: str) -> None:
        async with self._lock:
            self._connections[websocket] = (user_id, full_name)

    async def disconnect(self, websocket: WebSocket) -> None:
        async with self._lock:
            self._connections.pop(websocket, None)

    async def online_users(self) -> list[dict[str, Any]]:
        async with self._lock:
            # One entry per user even if they have several tabs open.
            unique = {user_id: name for user_id, name in self._connections.values()}
        return [{"id": user_id, "full_name": name} for user_id, name in unique.items()]

    async def broadcast(self, payload: dict[str, Any]) -> None:
        async with self._lock:
            targets = list(self._connections)

        dead: list[WebSocket] = []
        for websocket in targets:
            try:
                await websocket.send_json(payload)
            except (RuntimeError, ConnectionError):
                # Socket closed between the snapshot above and this send.
                dead.append(websocket)

        for websocket in dead:
            await self.disconnect(websocket)


manager = ConnectionManager()
