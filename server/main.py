from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth, chat

# Small project, no migrations yet: create the tables on boot.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Energy Grappling API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://energygrappling.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
