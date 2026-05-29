from typing import Optional, Dict


def fuse_emotions(
    text_emotion: str,
    text_scores: Dict[str, float],
    face_emotion: Optional[str] = None,
    face_scores: Optional[Dict[str, float]] = None,
    audio_emotion: Optional[str] = None,
) -> tuple[str, Dict[str, float]]:
    """
    Fuse emotions from multiple modalities using weighted averaging.
    
    Args:
        text_emotion: Primary emotion from text
        text_scores: Emotion scores from text
        face_emotion: Primary emotion from face (optional)
        face_scores: Emotion scores from face (optional)
        audio_emotion: Primary emotion from audio (optional)
    
    Returns:
        Tuple of (fused_emotion, fused_scores)
    """
    # Start with text scores (weight=0.5)
    fused_scores = {emotion: score * 0.5 for emotion, score in text_scores.items()}
    
    # Add face emotion scores if available (weight=0.3)
    if face_emotion:
        if face_scores:
            # If we have detailed face scores, use them
            for emotion, score in face_scores.items():
                if emotion in fused_scores:
                    fused_scores[emotion] += score * 0.3
                else:
                    fused_scores[emotion] = score * 0.3
        else:
            # If we only have face_emotion (no scores), boost that emotion
            if face_emotion in fused_scores:
                fused_scores[face_emotion] += 0.3
            else:
                fused_scores[face_emotion] = 0.3
    
    # Add audio emotion scores if available (weight=0.2)
    if audio_emotion:
        # If we have audio emotion but not detailed scores, boost the audio emotion
        audio_weight = 0.2
        for emotion in fused_scores:
            if emotion == audio_emotion:
                fused_scores[emotion] += audio_weight
    
    # Normalize scores to sum to 1
    total = sum(fused_scores.values())
    if total > 0:
        fused_scores = {emotion: score / total for emotion, score in fused_scores.items()}
    
    # Get the emotion with highest score
    fused_emotion = max(fused_scores, key=fused_scores.get)
    
    return fused_emotion, fused_scores


def get_emotion_emoji(emotion: str) -> str:
    """Map emotion to emoji"""
    emoji_map = {
        "joy": "😊",
        "sadness": "😢",
        "anger": "😠",
        "fear": "😨",
        "surprise": "😲",
        "disgust": "🤮",
        "neutral": "😐",
        "confusion": "😕"
    }
    return emoji_map.get(emotion.lower(), "😐")
