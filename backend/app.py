import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import routes
from backend.routes.chat import router as chat_router
from backend.routes.audio import router as audio_router
from backend.routes.emotion import router as emotion_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Multimodal Emotion-Aware Chatbot API",
    description="REST API for emotion detection and chatbot responses",
    version="1.0.0"
)

# Configure CORS (local dev plus deployed frontend URLs)
default_origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]
def _clean_env_value(value: str) -> str:
    return value.strip().strip("`'\"").rstrip("/")


configured_origins = [
    _clean_env_value(origin)
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if _clean_env_value(origin)
]
frontend_url = _clean_env_value(os.getenv("FRONTEND_URL", ""))
origins = default_origins + configured_origins + ([frontend_url] if frontend_url else [])
cors_allow_origin_regex = _clean_env_value(os.getenv("CORS_ALLOW_ORIGIN_REGEX", ""))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=cors_allow_origin_regex or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router)
app.include_router(audio_router)
app.include_router(emotion_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Multimodal Emotion-Aware Chatbot API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "API is running"
    }


@app.get("/debug/cors")
async def debug_cors():
    """Show active CORS settings without exposing secrets."""
    return {
        "origins": origins,
        "allow_origin_regex": cors_allow_origin_regex,
        "frontend_url": frontend_url,
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("API_PORT", 8000))
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        reload=True
    )
