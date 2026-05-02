import os
import traceback
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request
from services.analysis import analyze_answers
from services.assistant import assistant_diagnostics, assistant_reply
from services.chatbot import advance_chat
from services.firebase_admin_client import save_report_metadata
from services.pdf_report import generate_pdf_report
from werkzeug.utils import secure_filename

health_bp = Blueprint("health", __name__)
ALLOWED_UPLOAD_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
}


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
    try:
        return jsonify(analyze_answers(data["answers"]))
    except Exception as exc:
        traceback.print_exc()
        return jsonify({"error": f"Analysis failed: {exc}"}), 500


@health_bp.post("/assistant")
def assistant():
    data, error = require_json("uid", "message")
    if error:
        return error
    reply = assistant_reply(data["message"], data.get("session") or {}, data.get("history") or [])
    return jsonify({"reply": reply})


@health_bp.post("/upload-report")
def upload_report():
    uid = (request.form.get("uid") or "").strip()
    upload = request.files.get("file")
    if not uid or upload is None:
        return jsonify({"error": "Missing uid or file"}), 400

    mime_type = upload.mimetype or "application/octet-stream"
    if mime_type not in ALLOWED_UPLOAD_MIME_TYPES:
        return jsonify({"error": "Only PDF, PNG, JPG, and WEBP files are supported"}), 400

    safe_uid = secure_filename(uid)
    safe_name = secure_filename(upload.filename or "report")
    filename = f"{Path(safe_name).stem}-{os.urandom(6).hex()}{Path(safe_name).suffix}"
    relative_dir = Path(safe_uid)
    relative_path = relative_dir / filename
    upload_root = Path(current_app.config["UPLOAD_FOLDER"])
    target_dir = upload_root / relative_dir
    target_dir.mkdir(parents=True, exist_ok=True)
    target_path = target_dir / filename
    upload.save(target_path)

    return jsonify(
        {
            "fileName": upload.filename,
            "mimeType": mime_type,
            "fileUrl": f"{request.host_url.rstrip('/')}/uploads/{relative_path.as_posix()}",
            "localPath": str(target_path.resolve()),
        }
    )


@health_bp.get("/assistant-debug")
def assistant_debug():
    return jsonify(assistant_diagnostics())


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
