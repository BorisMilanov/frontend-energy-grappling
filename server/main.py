import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth, chat

# Small project, no migrations yet: create the tables on boot.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Energy Grappling API",
    description="API for the Energy Grappling site: auth and group chat.",
    version="1.0.0",
)

# CORS. In production this list is pinned in app/config.py and cannot be changed by
# environment variables; in development it follows CORS_ORIGINS / the dev defaults.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://energygrappling.com",      # ← Add your domain
        "https://www.energygrappling.com",
        "http://localhost:3000",             # Dev
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=86400,
)

app.include_router(auth.router)
app.include_router(chat.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "Energy Grappling API", "version": app.version}


# Alias, so an uptime check pointed at either path works.
@app.get("/health")
def health_alias() -> dict[str, str]:
    return health()


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Energy Grappling API", "docs": "/docs", "health": "/api/health"}


if __name__ == "__main__":
    # Local convenience only. In production systemd runs uvicorn directly
    # (see deploy/energygrappling-api.service).
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
