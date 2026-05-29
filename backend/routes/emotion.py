from fastapi import APIRouter, HTTPException
from backend.models.schemas import FaceEmotionResponse, FusionRequest, FusionResponse
from backend.services.text_emotion_service import get_text_emotion, get_top_emotion
from backend.utils.emotion_fusion import fuse_emotions
import logging

router = APIRouter(prefix="/api", tags=["emotion"])
logger = logging.getLogger(__name__)

# Global variable to store latest face emotion
latest_face_emotion = None
latest_face_scores = None


def update_face_emotion(emotion: str, scores: dict = None):
    """Update the latest detected facial emotion"""
    global latest_face_emotion, latest_face_scores
    latest_face_emotion = emotion
    latest_face_scores = scores or {}


@router.get("/emotion/face", response_model=FaceEmotionResponse)
async def get_face_emotion():
    """
    Get latest detected facial emotion.
    Called from frontend to get current camera emotion.
    """
    try:
        if latest_face_emotion is None:
            return FaceEmotionResponse(
                emotion="neutral",
                emotion_scores={"neutral": 1.0},
                success=False
            )
        
        return FaceEmotionResponse(
            emotion=latest_face_emotion,
            emotion_scores=latest_face_scores,
            success=True
        )
    
    except Exception as e:
        logger.error(f"Error getting face emotion: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fusion", response_model=FusionResponse)
async def fuse_emotions_endpoint(request: FusionRequest):
    """
    Fuse emotions from multiple modalities (text, face, audio).
    
    This endpoint combines emotion detection from different sources
    using weighted averaging.
    """
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Get text emotion
        text_scores = get_text_emotion(request.text)
        text_emotion = get_top_emotion(request.text)
        
        # Fuse with face emotion if available
        fused_emotion, fused_scores = fuse_emotions(
            text_emotion=text_emotion,
            text_scores=text_scores,
            face_emotion=request.face_emotion,
            face_scores=None,  # Could be enhanced
            audio_emotion=request.audio_emotion
        )
        
        logger.info(f"Emotions fused. Text: {text_emotion}, Face: {request.face_emotion}, "
                   f"Audio: {request.audio_emotion} -> Fused: {fused_emotion}")
        
        return FusionResponse(
            fused_emotion=fused_emotion,
            text_emotion=text_emotion,
            face_emotion=request.face_emotion,
            fusion_scores=fused_scores
        )
    
    except Exception as e:
        logger.error(f"Error fusing emotions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
