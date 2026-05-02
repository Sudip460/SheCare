import os
from pathlib import Path

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from routes.health import health_bp


load_dotenv(Path(__file__).resolve().parents[1] / ".env")


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})
    app.config["REPORT_FOLDER"] = "generated_reports"
    app.config["UPLOAD_FOLDER"] = "uploaded_reports"

    os.makedirs(app.config["REPORT_FOLDER"], exist_ok=True)
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    app.register_blueprint(health_bp)

    @app.get("/health")
    def health_check():
        return jsonify({"status": "ok"})

    @app.get("/reports/<path:filename>")
    def download_report(filename):
        return send_from_directory(app.config["REPORT_FOLDER"], filename, as_attachment=False)

    @app.get("/uploads/<path:filename>")
    def download_upload(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename, as_attachment=False)

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
