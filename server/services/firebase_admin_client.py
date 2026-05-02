import os
from dotenv import load_dotenv

load_dotenv()

_db = None


def _get_db():
    global _db
    if _db is not None:
        return _db

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        if not firebase_admin._apps:
            credential_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
            if credential_path and os.path.exists(credential_path):
                cred = credentials.Certificate(credential_path)
                firebase_admin.initialize_app(cred)
            else:
                firebase_admin.initialize_app()
        _db = firestore.client()
        return _db
    except Exception:
        return None


def save_report_metadata(uid, session_id, report):
    db = _get_db()
    if not db or not uid or not session_id:
        return

    db.collection("users").document(uid).collection("sessions").document(session_id).set(
        {
            "reportUrl": report.get("reportUrl"),
            "reportPath": report.get("reportPath"),
        },
        merge=True,
    )
