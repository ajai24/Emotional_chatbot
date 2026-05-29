import io
import logging
import wave
from fastapi import UploadFile
import speech_recognition as sr

logger = logging.getLogger(__name__)


async def transcribe_audio_google(recognizer, audio):
    """Try Google Speech-to-Text API"""
    try:
        logger.info("Attempting Google Speech-to-Text...")
        text = recognizer.recognize_google(audio)
        logger.info(f"Google transcription: '{text}'")
        return text
    except sr.UnknownValueError:
        logger.warning("Google: Could not understand audio")
        return None
    except sr.RequestError as e:
        logger.warning(f"Google API error: {e}")
        return None


async def transcribe_audio_sphinx(recognizer, audio):
    """Try Sphinx offline recognition as fallback"""
    try:
        logger.info("Attempting Sphinx offline recognition...")
        text = recognizer.recognize_sphinx(audio)
        logger.info(f"Sphinx transcription: '{text}'")
        return text
    except AttributeError:
        logger.warning("Sphinx not available (pocketsphinx not installed)")
        return None
    except sr.UnknownValueError:
        logger.warning("Sphinx: Could not understand audio")
        return None
    except Exception as e:
        logger.warning(f"Sphinx error: {e}")
        return None


async def transcribe_audio(file: UploadFile) -> str:
    """
    Transcribe audio file to text using Google Speech Recognition with Sphinx fallback.
    
    Args:
        file: Audio file upload
    
    Returns:
        Transcribed text
    """
    try:
        # Read file content
        audio_content = await file.read()
        logger.info(f"Audio file size: {len(audio_content)} bytes, type: {file.content_type}")
        
        if len(audio_content) == 0:
            logger.warning("Audio file is empty")
            return ""
        
        # Check if it's actually a WAV file by looking at header
        if audio_content[:4] == b'RIFF' and audio_content[8:12] == b'WAVE':
            logger.info("Valid WAV file detected")
            try:
                # Validate WAV structure
                with wave.open(io.BytesIO(audio_content), 'rb') as wav_file:
                    params = wav_file.getparams()
                    duration = params.nframes / params.framerate
                    logger.info(f"WAV: channels={params.nchannels}, "
                              f"sample_rate={params.framerate}, "
                              f"frames={params.nframes}, "
                              f"duration={duration:.2f}s")
                    
                    if duration < 0.5:
                        logger.warning(f"Audio is very short ({duration:.2f}s), speech recognition may fail")
                    
            except Exception as e:
                logger.warning(f"Could not validate WAV structure: {e}")
        else:
            logger.warning(f"File header: {audio_content[:12].hex()}")
        
        # Create recognizer
        recognizer = sr.Recognizer()
        
        # Adjust for noisy environments - be more lenient
        recognizer.energy_threshold = 2000
        recognizer.dynamic_energy_threshold = True
        
        try:
            # Try to read as audio file
            audio_file = sr.AudioFile(io.BytesIO(audio_content))
            
            with audio_file as source:
                try:
                    audio = recognizer.record(source)
                except Exception as e:
                    logger.error(f"Failed to record from source: {e}")
                    return ""
            
            logger.info(f"Audio recorded: {len(audio.frame_data)} bytes")

            # Check if audio has content
            if len(audio.frame_data) < 100:
                logger.warning(f"Audio data too small: {len(audio.frame_data)} bytes")
                return ""
            
        except Exception as e:
            logger.error(f"Could not read audio file: {e}")
            return ""
        
        # Try Google first
        text = await transcribe_audio_google(recognizer, audio)
        if text:
            return text
        
        # Fall back to Sphinx if Google fails
        text = await transcribe_audio_sphinx(recognizer, audio)
        if text:
            return text
        
        logger.warning("Both Google and Sphinx failed to transcribe")
        return ""
    
    except Exception as e:
        logger.error(f"Error transcribing audio: {e}", exc_info=True)
        raise
