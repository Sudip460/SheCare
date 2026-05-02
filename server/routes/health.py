from flask import Blueprint, jsonify, request
from services.analysis import analyze_answers
from services.chatbot import advance_chat
from services.firebase_admin_client import save_report_metadata
from services.pdf_report import generate_pdf_report

health_bp = Blueprint("health", __name__)


def require_json(*fields):
    data = request.get_json(silent=True) or {}
    missing = [field for field in fields if field not in data]
    if missing:
      return None, (jsonify({"error": f"Missing required field(s): {', '.join(missing)}"}), 400)
    return data, None


@health_bp.post("/chat")
def chat():
    data, error = require_json("uid", "message", "state")
    if error:
        return error
    result = advance_chat(data["message"], data.get("state") or {})
    return jsonify(result)


@health_bp.post("/analyze")
def analyze():
    data, error = require_json("uid", "answers")
    if error:
        return error
    return jsonify(analyze_answers(data["answers"]))


@health_bp.post("/generate-report")
def generate_report():
    data, error = require_json("uid", "analysisData")
    if error:
        return error

    uid = data["uid"]
    session_id = data.get("sessionId", "session")
    report = generate_pdf_report(uid, session_id, data["analysisData"])
    save_report_metadata(uid, session_id, report)
    return jsonify(report)
