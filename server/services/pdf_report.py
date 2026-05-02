import os
from datetime import datetime
from flask import current_app, request
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def _rows_from_answers(answers):
    rows = [["Input", "Response"]]
    for key, value in (answers or {}).items():
        if key == "uploadedFiles":
            value = f"{len(value)} uploaded file(s)"
        rows.append([key.replace("_", " ").title(), str(value)])
    return rows


def generate_pdf_report(uid, session_id, analysis_data):
    folder = os.path.join(os.getcwd(), current_app.config["REPORT_FOLDER"])
    os.makedirs(folder, exist_ok=True)
    filename = f"{uid}_{session_id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.pdf"
    path = os.path.join(folder, filename)

    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(path, pagesize=letter, title="SheCare AI Health Report")
    story = []

    story.append(Paragraph("SheCare AI Health Report", styles["Title"]))
    story.append(Paragraph(datetime.utcnow().strftime("Generated on %B %d, %Y UTC"), styles["Normal"]))
    story.append(Spacer(1, 18))

    story.append(Paragraph("Health Summary", styles["Heading2"]))
    story.append(Paragraph(f"Risk level: {analysis_data.get('riskLevel', 'Unavailable')}", styles["BodyText"]))
    story.append(Paragraph(f"Cycle prediction: {analysis_data.get('cyclePrediction', 'Unavailable')}", styles["BodyText"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Survey Inputs", styles["Heading2"]))
    table = Table(_rows_from_answers(analysis_data.get("answers", {})), colWidths=[160, 330])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#dff2ff")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#17202a")),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#d8e2ef")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 14))

    story.append(Paragraph("Recommendations", styles["Heading2"]))
    for item in analysis_data.get("recommendations", []):
        story.append(Paragraph(f"- {item}", styles["BodyText"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Mental Wellness Tips", styles["Heading2"]))
    for item in analysis_data.get("mentalTips", []):
        story.append(Paragraph(f"- {item}", styles["BodyText"]))
    story.append(Spacer(1, 18))

    disclaimer = analysis_data.get(
        "disclaimer",
        "This report is educational and is not a diagnosis. Consult a qualified clinician for medical decisions.",
    )
    story.append(Paragraph("Disclaimer", styles["Heading2"]))
    story.append(Paragraph(disclaimer, styles["BodyText"]))

    doc.build(story)

    base_url = request.host_url.rstrip("/")
    return {
        "reportUrl": f"{base_url}/reports/{filename}",
        "reportPath": path,
        "fileName": filename,
    }
