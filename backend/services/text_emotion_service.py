from transformers import pipeline

_emotion_model = None


def _get_model():
    """Load the text emotion model on first use."""
    global _emotion_model
    if _emotion_model is None:
        _emotion_model = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            top_k=None,
        )
    return _emotion_model


def get_text_emotion(text):
    """
    Predict emotion probabilities from text.
    Returns a dict of {emotion: score}.
    """
    if not text or not text.strip():
        return {"neutral": 1.0}

    result = _get_model()(text)
    return {item["label"]: item["score"] for item in result[0]}


def get_top_emotion(text):
    scores = get_text_emotion(text)
    return max(scores, key=scores.get)
