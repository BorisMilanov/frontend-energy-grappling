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

# CORS — the only allow-list there is. Fixed in code, not configurable by environment
# variables, so a stray .env edit on the server cannot expose logged-in users' tokens to
# another site. To add a domain, edit this list and redeploy.
# Exact matches: scheme + host (+ port), no trailing slash, no wildcards.
ALLOWED_ORIGINS = [
    "https://energygrappling.com",      # ← Add your domain
    "https://www.energygrappling.com",
]

if not settings.is_production:
    # Local dev only. These never reach production: a page on a developer's own
    # localhost:3000 must not be able to call the live API with their credentials.
    ALLOWED_ORIGINS += [
        "http://localhost:3000",         # vite dev server
        "http://127.0.0.1:3000",
        "http://localhost:8000",         # Swagger UI at /docs
        "http://127.0.0.1:8000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
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
