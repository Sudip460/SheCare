import json
import os
import tempfile
import traceback
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv
import requests

try:
    from google import genai
except ImportError:  # pragma: no cover
    genai = None


ROOT_ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ROOT_ENV_PATH)
load_dotenv()


SUPPORTED_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
}


def _gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or genai is None:
        return None
    return genai.Client(api_key=api_key)


def _download_file(file_url):
    response = requests.get(file_url, timeout=30)
    response.raise_for_status()
    return response.content


def _load_uploaded_file(item):
    local_path = item.get("localPath")
    if local_path:
        path = Path(local_path)
        if path.exists():
            return path.read_bytes()

    file_url = item.get("fileUrl")
    if file_url:
        parsed = urlparse(file_url)
        if parsed.scheme in {"", "file"} and parsed.path:
            path = Path(parsed.path)
            if path.exists():
                return path.read_bytes()
        return _download_file(file_url)

    return None


def _extract_json(text):
    if not text:
        return {}
    text = text.strip()
    if text.startswith("```"):
        parts = text.split("```")
        for part in parts:
            cleaned = part.strip()
            if cleaned.startswith("{") and cleaned.endswith("}"):
                text = cleaned
                break
            if "\n" in cleaned:
                body = cleaned.split("\n", 1)[1].strip()
                if body.startswith("{") and body.endswith("}"):
                    text = body
                    break
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return {}
    try:
        return json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return {}


def _normalize_features(features):
    allowed = {
        "cycle_length",
        "cycle_irregularity",
        "missed_periods",
        "period_duration",
        "delay_max",
        "acne",
        "acne_severity",
        "hair_loss",
        "hair_loss_severity",
        "hirsutism",
        "hirsutism_severity",
        "weight_gain",
        "weight_gain_recent",
        "dark_patches",
        "BMI",
        "stress_level",
        "sleep_hours",
        "exercise_days",
        "activity_level",
        "work_type",
        "meal_regularity",
        "meal_skipping",
        "TSH",
        "LH_FSH_ratio",
        "glucose",
        "insulin",
        "hemoglobin",
        "cholesterol",
    }
    cleaned = {}
    for key, value in (features or {}).items():
        if key not in allowed or value in (None, "", "unknown", "Unavailable"):
            continue
        cleaned[key] = value
    return cleaned


def extract_report_context(uploaded_files):
    client = _gemini_client()
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    if not client or not uploaded_files:
        return {"features": {}, "summary": "", "dashboard": {}}

    extracted_parts = []

    for item in uploaded_files[:3]:
        mime_type = item.get("mimeType") or "application/pdf"
        if mime_type not in SUPPORTED_MIME_TYPES:
            continue

        content = _load_uploaded_file(item)
        if not content:
            continue
        suffix = ".pdf" if mime_type == "application/pdf" else ".bin"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name

        try:
            uploaded = client.files.upload(file=temp_path)
            prompt = """
Analyze this women's health / lab report for PCOS-related context.
Return only valid JSON with this shape:
{
  "features": {
    "TSH": number|null,
    "LH_FSH_ratio": number|null,
    "glucose": number|null,
    "insulin": number|null,
    "hemoglobin": number|null,
    "cholesterol": number|null,
    "BMI": number|null
  },
  "summary": "short plain-English summary",
  "dashboard": {
    "cycleLengthLabel": "string or null",
    "overallHealthLabel": "string or null",
    "overallHealthNote": "string or null"
  }
}
If a value is not present in the report, use null.
Do not wrap the JSON in markdown.
"""
            response = client.models.generate_content(
                model=model_name,
                contents=[prompt, uploaded],
            )
            extracted_parts.append(_extract_json(getattr(response, "text", "")))
        except Exception as exc:  # pragma: no cover
            print(f"Report extraction failed for {item.get('fileName') or 'uploaded file'}: {exc}")
            traceback.print_exc()
        finally:
            try:
                os.remove(temp_path)
            except OSError:
                pass

    merged_features = {}
    summaries = []
    dashboard = {}
    for part in extracted_parts:
        merged_features.update(_normalize_features(part.get("features")))
        if part.get("summary"):
            summaries.append(part["summary"])
        dashboard.update({k: v for k, v in (part.get("dashboard") or {}).items() if v})

    return {
        "features": merged_features,
        "summary": " ".join(summaries).strip(),
        "dashboard": dashboard,
    }
