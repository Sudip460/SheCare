import os
import traceback
from pathlib import Path

from dotenv import load_dotenv

ROOT_ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ROOT_ENV_PATH)
load_dotenv()

try:
    from google import genai
except ImportError:  # pragma: no cover - graceful fallback if SDK missing
    genai = None


def _format_probability(session):
    probability = session.get("probability")
    if isinstance(probability, (int, float)):
        return f"{probability:.1f}%"
    return None


def _latest_context(session):
    features = session.get("featuresUsed") or {}
    answers = session.get("answers") or {}
    return {
        "risk": session.get("riskLevel", "Unavailable"),
        "probability": _format_probability(session),
        "cycle": session.get("cyclePrediction", "Unavailable"),
        "recommendations": session.get("recommendations") or [],
        "mentalTips": session.get("mentalTips") or [],
        "bmi": features.get("BMI") or answers.get("BMI"),
        "stress": features.get("stress_level") or answers.get("stress_level"),
        "sleep": features.get("sleep_hours") or answers.get("sleep_hours"),
        "exercise_days": features.get("exercise_days") or answers.get("exercise_days"),
        "glucose": features.get("glucose") or answers.get("glucose"),
        "cycle_irregularity": features.get("cycle_irregularity") or answers.get("cycle_irregularity"),
        "missed_periods": features.get("missed_periods") or answers.get("missed_periods"),
    }


def _conversation_text(history):
    rows = []
    for item in history or []:
        role = "User" if item.get("role") == "user" else "Assistant"
        text = str(item.get("text") or "").strip()
        if text:
            rows.append(f"{role}: {text}")
    return "\n".join(rows[-12:])


def _fallback_reply(message, session):
    text = str(message or "").strip().lower()
    context = _latest_context(session or {})

    if not session:
        return (
            "I can help explain PCOS risk, cycle patterns, food habits, exercise, and next steps. "
            "Complete one health assessment first so I can give personalized answers from your result."
        )

    intro = f"Your latest result shows {context['risk']} PCOS risk"
    if context["probability"]:
        intro += f" at about {context['probability']}"
    intro += f", and your predicted next cycle date is {context['cycle']}."

    if any(word in text for word in ["risk", "pcos", "chance", "probability"]):
        extra = []
        if context["cycle_irregularity"] not in (None, ""):
            extra.append(f"cycle variation is around {context['cycle_irregularity']} days")
        if context["missed_periods"] not in (None, ""):
            extra.append(f"missed periods reported: {context['missed_periods']}")
        suffix = f" Key drivers from your assessment include {', '.join(extra)}." if extra else ""
        return f"{intro}{suffix} This is a screening signal, not a diagnosis, so a gynecologist should confirm it with clinical evaluation."

    if any(word in text for word in ["diet", "food", "eat", "meal", "weight"]):
        detail = []
        if context["bmi"] not in (None, ""):
            detail.append(f"your recorded BMI is {context['bmi']}")
        if context["glucose"] not in (None, ""):
            detail.append(f"glucose is {context['glucose']}")
        note = f" Also, {', '.join(detail)}." if detail else ""
        return (
            f"{intro} Focus on regular meals with protein, fiber-rich carbs, vegetables, seeds, and good hydration. "
            "Try to avoid frequent meal skipping and large sugar-heavy meals." + note
        )

    if any(word in text for word in ["exercise", "workout", "activity", "walk", "gym"]):
        detail = ""
        if context["exercise_days"] not in (None, ""):
            detail = f" You currently reported exercise on about {context['exercise_days']} day(s) per week."
        return (
            f"{intro} A practical goal is 150 minutes of moderate movement weekly plus two strength sessions."
            f"{detail} Even brisk walking and short strength routines can help improve insulin response and cycle health."
        )

    if any(word in text for word in ["stress", "sleep", "mental", "anxiety", "mood"]):
        detail = []
        if context["stress"] not in (None, ""):
            detail.append(f"stress level is {context['stress']}/10")
        if context["sleep"] not in (None, ""):
            detail.append(f"sleep is about {context['sleep']} hours")
        note = f" In your latest session, {', '.join(detail)}." if detail else ""
        tips = " ".join(context["mentalTips"][:2]) if context["mentalTips"] else "Try a stable sleep schedule and a short daily stress check-in."
        return f"{intro}{note} {tips}"

    saved = " ".join(context["recommendations"][:2]) if context["recommendations"] else "Ask me about risk, diet, exercise, sleep, stress, reports, or next steps."
    return f"{intro} {saved}"


def _build_prompt(message, session, history):
    context = _latest_context(session or {})
    conversation = _conversation_text(history)

    if session:
        session_summary = f"""
Latest PCOS assessment context:
- Risk level: {context["risk"]}
- Probability: {context["probability"] or "Unavailable"}
- Predicted next cycle date: {context["cycle"]}
- Cycle irregularity: {context["cycle_irregularity"] or "Unavailable"}
- Missed periods: {context["missed_periods"] or "Unavailable"}
- BMI: {context["bmi"] or "Unavailable"}
- Stress: {context["stress"] or "Unavailable"}
- Sleep hours: {context["sleep"] or "Unavailable"}
- Exercise days: {context["exercise_days"] or "Unavailable"}
- Glucose: {context["glucose"] or "Unavailable"}
- Recommendations: {" | ".join(context["recommendations"][:4]) or "Unavailable"}
- Mental wellness tips: {" | ".join(context["mentalTips"][:3]) or "Unavailable"}
"""
    else:
        session_summary = """
No completed PCOS assessment is available yet.
If the user asks about their own risk or cycle prediction, explain that they should complete the health assessment first.
"""

    return f"""
You are SheCare AI, a warm, conversational women's health assistant inside a PCOS assessment app.
Speak naturally and make the user feel like they are chatting 1-to-1 with a caring assistant.
Use short, human answers unless the user asks for more detail.
Be supportive, clear, and practical.
Do not say you are an AI model unless directly asked.

Important medical rules:
- You are not diagnosing PCOS.
- The ML result is only a screening indicator.
- Never invent lab values or symptoms that are not in context.
- If the user asks about emergency symptoms, tell them to seek urgent medical care.
- If no assessment exists, answer generally and encourage completing one assessment.

Ground your answer in this assessment context when relevant:
{session_summary}

Recent conversation:
{conversation or "No previous conversation."}

User message:
{message}

Answer as SheCare AI:
""".strip()


def assistant_diagnostics():
    api_key = os.getenv("GEMINI_API_KEY")
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    return {
        "gemini_sdk_loaded": genai is not None,
        "gemini_api_key_present": bool(api_key),
        "gemini_model": model_name,
        "gemini_api_key_prefix": api_key[:8] if api_key else None,
    }


def assistant_reply(message, session, history=None):
    api_key = os.getenv("GEMINI_API_KEY")
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    if not api_key or genai is None:
        return _fallback_reply(message, session)

    prompt = _build_prompt(message, session, history)

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
        )
        text = getattr(response, "text", None)
        if text and text.strip():
            return text.strip()
        print("Gemini assistant returned an empty response; using fallback.")
    except Exception as error:
        print(f"Gemini assistant error: {error}")
        traceback.print_exc()

    return _fallback_reply(message, session)
