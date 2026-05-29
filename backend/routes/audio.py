from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.models.schemas import AudioResponse
from backend.utils.audio_handler import transcribe_audio
import logging

router = APIRouter(prefix="/api", tags=["audio"])
logger = logging.getLogger(__name__)


@router.post("/audio", response_model=AudioResponse)
async def transcribe(file: UploadFile = File(...)):
    """
    Transcribe audio file to text.
    
    Supported formats: WAV, MP3, FLAC, OGG, WEBM
    """
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        logger.info(f"Received audio file: {file.filename}, content-type: {file.content_type}")
        
        # Validate file type - be more flexible
        allowed_types = {
            "audio/wav", "audio/mpeg", "audio/flac", "audio/ogg", 
            "audio/webm", "audio/x-wav", "audio/vnd.wav"
        }
        
        # If content type is not in allowed list, log warning but try anyway
        if file.content_type not in allowed_types:
            logger.warning(f"Unusual content type: {file.content_type}, but attempting transcription anyway")
        
        # Transcribe audio
        transcribed_text = await transcribe_audio(file)
        
        logger.info(f"Transcription result: '{transcribed_text}'")
        
        if not transcribed_text or transcribed_text.strip() == "":
            logger.warning("No text was transcribed from audio")
            return AudioResponse(
                transcribed_text="",
                success=False
            )
        
        return AudioResponse(
            transcribed_text=transcribed_text,
            success=True
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error transcribing audio: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
