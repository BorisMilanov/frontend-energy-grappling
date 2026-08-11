# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# from app.config import settings
# from app.database import Base, engine
# from app.routers import auth, chat

# # Small project, no migrations yet: create the tables on boot.
# Base.metadata.create_all(bind=engine)

# app = FastAPI(title="Energy Grappling API", version="0.1.0")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["https://energygrappling.com"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(auth.router)
# app.include_router(chat.router)


# @app.get("/api/health")
# def health() -> dict[str, str]:
#     return {"status": "ok"}
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="Energy Grappling API",
    description="API for Energy Grappling Platform",
    version="1.0.0"
)

# ============================================================================
# CORS Configuration - IMPORTANT!
# ============================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://energygrappling.com",      # Production frontend
        "http://localhost:3000",             # Local React/Vue dev
        "http://localhost:8000",             # Local testing
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,                  # Allow cookies/auth headers
    allow_methods=["*"],                     # Allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],                     # Allow all headers
    max_age=3600,                            # Cache preflight for 1 hour
)

# ============================================================================
# Health Check Endpoint
# ============================================================================
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Energy Grappling API",
        "version": "1.0.0"
    }

# ============================================================================
# Authentication Endpoints
# ============================================================================
@app.post("/api/auth/register")
async def register(username: str, password: str, email: str):
    """Register a new user"""
    # Add your registration logic here
    return {
        "status": "success",
        "message": "User registered successfully",
        "user": {
            "username": username,
            "email": email
        }
    }

@app.post("/api/auth/login")
async def login(username: str, password: str):
    """Login user"""
    # Add your authentication logic here
    return {
        "status": "success",
        "token": "your_jwt_token_here",
        "user": {
            "username": username,
            "id": "user_id"
        }
    }

# ============================================================================
# API Endpoints
# ============================================================================
@app.get("/api/data")
async def get_data():
    """Get all data"""
    return {
        "data": [
            {"id": 1, "name": "Item 1"},
            {"id": 2, "name": "Item 2"}
        ]
    }

@app.post("/api/data")
async def create_data(item: dict):
    """Create new data item"""
    return {
        "status": "created",
        "item": item
    }

@app.get("/api/data/{item_id}")
async def get_item(item_id: int):
    """Get specific item by ID"""
    return {
        "id": item_id,
        "name": f"Item {item_id}",
        "data": "some data"
    }

# ============================================================================
# Error Handling
# ============================================================================
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)}
    )

# ============================================================================
# Root Endpoint
# ============================================================================
@app.get("/")
async def root():
    return {
        "message": "Welcome to Energy Grappling API",
        "docs": "/docs",
        "health": "/health"
    }

# ============================================================================
# Run the server (for local testing)
# ============================================================================
if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False  # Set to True for development
    )