import logging

try:
    from transformers import pipeline
except ImportError:
    pipeline = None

logger = logging.getLogger(__name__)

_emotion_model = None

FALLBACK_SCORES = {
    "anger": 0.0,
    "disgust": 0.0,
    "fear": 0.0,
    "joy": 0.0,
    "neutral": 1.0,
    "sadness": 0.0,
    "surprise": 0.0,
}

KEYWORD_EMOTIONS = {
    "anger": ["angry", "mad", "furious", "annoyed", "frustrated", "hate"],
    "fear": ["afraid", "scared", "fear", "worried", "anxious", "panic"],
    "joy": ["happy", "joy", "great", "good", "excited", "love", "awesome"],
    "sadness": ["sad", "down", "depressed", "cry", "lonely", "upset"],
    "surprise": ["wow", "surprised", "unexpected", "shocked"],
    "disgust": ["disgust", "gross", "awful"],
}


def _get_model():
    """Load the text emotion model on first use."""
    global _emotion_model
    if pipeline is None:
        return None

    if _emotion_model is None:
        _emotion_model = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            top_k=None,
        )
    return _emotion_model


def _fallback_text_emotion(text):
    text_lower = text.lower()
    scores = FALLBACK_SCORES.copy()

    for emotion, keywords in KEYWORD_EMOTIONS.items():
        if any(keyword in text_lower for keyword in keywords):
            scores["neutral"] = 0.2
            scores[emotion] = 0.8
            return scores

    return scores


def get_text_emotion(text):
    """
    Predict emotion probabilities from text.
    Returns a dict of {emotion: score}.
    """
    if not text or not text.strip():
        return {"neutral": 1.0}

    try:
        model = _get_model()
        if model is None:
            return _fallback_text_emotion(text)

        result = model(text)
        return {item["label"]: item["score"] for item in result[0]}
    except Exception as error:
        logger.warning("Text emotion model unavailable, using fallback: %s", error)
        return _fallback_text_emotion(text)


def get_top_emotion(text):
    scores = get_text_emotion(text)
    return max(scores, key=scores.get)
