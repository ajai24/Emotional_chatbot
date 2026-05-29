import logging
import os
import time

from dotenv import load_dotenv

try:
    from google import genai
except ImportError:
    genai = None

load_dotenv()

logger = logging.getLogger(__name__)
API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY) if API_KEY and genai else None

MAX_INPUT_LENGTH = 1000

KNOWLEDGE_BASE = {
    "anger": [
        "Take slow deep breaths",
        "Step away from the situation for a moment",
        "Try to identify the root cause of your anger",
        "Write down what you're feeling",
        "Practice relaxation techniques",
    ],
    "fear": [
        "Prepare ahead to reduce uncertainty",
        "Break the problem into smaller steps",
        "Practice deep breathing",
        "Visualize a positive outcome",
        "Remind yourself of past successes",
    ],
    "sadness": [
        "Talk to someone you trust",
        "Take small positive actions",
        "Go for a walk or get fresh air",
        "Listen to calming music",
        "Be kind to yourself",
    ],
    "joy": [
        "Share your happiness with others",
        "Capture the moment",
        "Express gratitude",
        "Celebrate small wins",
        "Keep doing what makes you happy",
    ],
    "neutral": [
        "Stay mindful of your thoughts",
        "Keep a balanced routine",
        "Take breaks when needed",
    ],
}


def _normalize_emotion(emotion):
    if not emotion:
        return "neutral"

    aliases = {
        "happy": "joy",
        "happiness": "joy",
        "sad": "sadness",
        "angry": "anger",
        "scared": "fear",
        "afraid": "fear",
        "calm": "neutral",
    }
    normalized = emotion.strip().lower()
    return aliases.get(normalized, normalized)


def get_rag_context(emotion):
    emotion = _normalize_emotion(emotion)
    tips = KNOWLEDGE_BASE.get(emotion, [])
    return "\n".join(f"- {tip}" for tip in tips)


def _fallback_response(user_message, emotion):
    emotion = _normalize_emotion(emotion)
    message = user_message.lower()
    tips = KNOWLEDGE_BASE.get(emotion, KNOWLEDGE_BASE["neutral"])

    if any(keyword in message for keyword in ["tip", "advice", "how to", "help me", "suggest"]):
        tips_text = " ".join(f"{index}. {tip}." for index, tip in enumerate(tips[:4], start=1))
        return f"Absolutely. {tips_text} Small, steady habits usually work better than trying to force a mood all day."

    fallback_by_emotion = {
        "sadness": "I am here with you. It sounds like things feel heavy right now. If you want, tell me what happened and we can work through it together.",
        "anger": "I can sense some frustration here. Let's slow it down and focus on what is bothering you most.",
        "fear": "That sounds stressful. Take a slow breath, and tell me what feels most worrying right now.",
        "joy": "That sounds positive. I am glad to hear it. Tell me more about what is going well.",
        "surprise": "That sounds unexpected. If you want, walk me through what happened and how you feel about it.",
        "neutral": "I am here and listening. Tell me a little more so I can respond in a helpful way.",
    }
    return fallback_by_emotion.get(
        emotion,
        "I am here to support you. Tell me a little more about what you are feeling.",
    )


def chatbot_response(user_message, emotion, conversation_history=None):
    if not user_message:
        return "I did not receive a clear message yet. Please try again."

    emotion = _normalize_emotion(emotion)

    if len(user_message) > MAX_INPUT_LENGTH:
        return "That message is too long. Please keep it under 1,000 characters."

    if not client:
        if not API_KEY:
            logger.warning("No Gemini API key found. Using local fallback.")
        elif not genai:
            logger.warning("google-genai is not installed. Using local fallback.")
        return _fallback_response(user_message, emotion)

    rag_context = get_rag_context(emotion)

    system_prompt = (
        "You are an empathetic AI assistant for a multimodal emotion-aware chatbot.\n"
        "Instructions:\n"
        "- Respond with empathy first, then be helpful.\n"
        "- Keep responses natural, warm, and concise.\n"
        "- Use emotion as context but do not explicitly mention labels.\n"
        "- If user asks for tips, give them directly.\n"
        "- Keep response between 2 to 5 sentences.\n"
    )

    history_block = "\n".join(conversation_history or [])

    prompt = (
        f"{system_prompt}\n\n"
        f"Detected emotion: {emotion}\n\n"
        f"Helpful suggestions (if useful):\n"
        f"{rag_context}\n\n"
        f"Conversation history:\n"
        f"{history_block if history_block else 'No previous conversation.'}\n\n"
        f"User message:\n"
        f"{user_message}\n\n"
        f"Response:"
    )

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )

            if response and response.text:
                return response.text.strip()

        except Exception as error:
            error_text = str(error)
            logger.error("Attempt %d failed: %s", attempt + 1, error_text)
            if "429" in error_text or "RESOURCE_EXHAUSTED" in error_text:
                break
            time.sleep(2)

    return _fallback_response(user_message, emotion)
