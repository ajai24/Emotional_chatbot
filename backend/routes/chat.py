from fastapi import APIRouter, HTTPException
import logging

from backend.models.schemas import ChatRequest, ChatResponse, ModeType
from backend.services.chatbot_service import chatbot_response
from backend.services.text_emotion_service import get_text_emotion, get_top_emotion
from backend.utils.emotion_fusion import fuse_emotions

router = APIRouter(prefix="/api", tags=["chat"])
logger = logging.getLogger(__name__)


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint that processes user message and returns response with emotion.
    
    Supports multiple modes:
    - text_only: Text message only
    - audio_only: Transcribed audio
    - face_text: Text + facial emotion
    - face_audio: Audio + facial emotion
    """
    try:
        if not request.user_message.strip():
            raise HTTPException(status_code=400, detail="User message cannot be empty")
        
        # Detect text emotion
        text_scores = get_text_emotion(request.user_message)
        text_emotion = get_top_emotion(request.user_message)
        
        # Determine final emotion based on mode
        if request.mode in [ModeType.FACE_TEXT, ModeType.FACE_AUDIO] and request.detected_emotion:
            # Use emotion fusion if facial emotion is available
            fused_emotion, fused_scores = fuse_emotions(
                text_emotion=text_emotion,
                text_scores=text_scores,
                face_emotion=request.detected_emotion,
                face_scores=None  # Face scores will be simulated if needed; fusion works without them
            )
            final_emotion = fused_emotion
            final_scores = fused_scores
        else:
            # Use text emotion only
            final_emotion = text_emotion
            final_scores = text_scores
        
        # Generate chatbot response
        response = chatbot_response(
            user_message=request.user_message,
            emotion=final_emotion,
            conversation_history=request.conversation_history
        )
        
        logger.info(f"Chat response generated. Emotion: {final_emotion}, Mode: {request.mode}")
        
        return ChatResponse(
            chatbot_response=response,
            detected_emotion=final_emotion,
            emotion_scores=final_scores,
            mode=request.mode.value
        )
    
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
