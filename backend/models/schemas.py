from pydantic import BaseModel
from typing import Optional, List, Dict
from enum import Enum


class ModeType(str, Enum):
    """Chat mode types"""
    TEXT_ONLY = "text_only"
    AUDIO_ONLY = "audio_only"
    FACE_TEXT = "face_text"
    FACE_AUDIO = "face_audio"


class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    user_message: str
    mode: ModeType = ModeType.TEXT_ONLY
    conversation_history: Optional[List[str]] = None
    detected_emotion: Optional[str] = None


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    chatbot_response: str
    detected_emotion: str
    emotion_scores: Dict[str, float]
    mode: str


class AudioRequest(BaseModel):
    """Request model for audio transcription (uses file upload)"""
    pass


class AudioResponse(BaseModel):
    """Response model for audio transcription"""
    transcribed_text: str
    success: bool


class FaceEmotionResponse(BaseModel):
    """Response model for face emotion endpoint"""
    emotion: str
    emotion_scores: Optional[Dict[str, float]] = None
    success: bool


class FusionRequest(BaseModel):
    """Request model for emotion fusion"""
    text: str
    face_emotion: Optional[str] = None
    audio_emotion: Optional[str] = None


class FusionResponse(BaseModel):
    """Response model for emotion fusion"""
    fused_emotion: str
    text_emotion: str
    face_emotion: Optional[str]
    fusion_scores: Dict[str, float]


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    message: str
