from services.assessment_mapper import cycle_prediction_from_last_period, map_answers_to_features, to_float
from services.pcos_ml import is_model_available, predict_pcos
from services.report_extractor import extract_report_context


def analyze_answers(answers):
    features = map_answers_to_features(answers)
    report_context = extract_report_context(answers.get("uploadedFiles") or [])
    features.update({key: value for key, value in report_context.get("features", {}).items() if value is not None})
    stress_level = to_float(answers.get("stress_level"), default=5) or 5
    sleep_hours = to_float(answers.get("sleep_hours"), default=7) or 7
    probability = None

    if is_model_available():
        prediction = predict_pcos(features)
        risk_level = prediction["riskLevel"]
        score = prediction["score"]
        probability = prediction["probability"]
    else:
        score = 0
        if (features.get("cycle_irregularity") or 0) >= 7:
            score += 3
        if features.get("missed_periods", 0) >= 1:
            score += 2
        if features.get("acne"):
            score += 1
        if features.get("hair_loss"):
            score += 1
        if features.get("hirsutism"):
            score += 2
        if features.get("weight_gain"):
            score += 1
        if stress_level >= 7:
            score += 1
        if sleep_hours < 6:
            score += 1

        if score >= 6:
            risk_level = "High"
        elif score >= 3:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        probability = round(min(100, score * 10), 1)

    recommendations = [
        "Track cycle dates and symptoms consistently for the next three cycles.",
        "Prioritize balanced meals with protein, fiber-rich carbohydrates, and healthy fats.",
        "Aim for 150 minutes of moderate activity weekly, including two strength sessions.",
    ]

    if risk_level in ["Medium", "High"]:
        recommendations.append("Book a clinician review for hormone testing, ultrasound guidance, and diagnosis.")
    if (features.get("cycle_irregularity") or 0) >= 10 or features.get("missed_periods", 0) >= 2:
        recommendations.append("Large cycle delays or repeated missed periods should be reviewed by a gynecologist.")
    if (features.get("BMI") or 0) >= 27:
        recommendations.append("A gradual weight-management plan with clinician support can help improve symptoms and insulin response.")
    if (features.get("glucose") or 0) >= 100:
        recommendations.append("Your glucose pattern may need medical follow-up for insulin resistance screening.")

    mental_tips = [
        "Use a short daily stress check-in and note triggers alongside cycle symptoms.",
        "Keep a consistent sleep window and reduce screens for 30 minutes before bed.",
    ]
    if stress_level >= 7:
        mental_tips.append("Consider speaking with a mental health professional if stress feels persistent or unmanageable.")

    cycle_length = features.get("cycle_length")
    cycle_length_label = (
        report_context.get("dashboard", {}).get("cycleLengthLabel")
        or (f"{int(round(float(cycle_length)))} Days" if cycle_length not in (None, "") else "Not recorded")
    )
    overall_health_label = report_context.get("dashboard", {}).get("overallHealthLabel")
    if not overall_health_label:
        overall_health_label = "Needs Care" if risk_level == "High" else "Needs Attention" if risk_level == "Medium" else "Stable"
    overall_health_note = report_context.get("dashboard", {}).get("overallHealthNote")
    if not overall_health_note:
        overall_health_note = (
            "Please review symptoms and labs with a clinician soon."
            if risk_level == "High"
            else "Continue tracking symptoms and improving routines."
            if risk_level == "Medium"
            else "Keep maintaining healthy habits."
        )

    return {
        "riskLevel": risk_level,
        "score": score,
        "probability": probability,
        "modelUsed": is_model_available(),
        "cyclePrediction": cycle_prediction_from_last_period(answers.get("last_period")),
        "recommendations": recommendations,
        "mentalTips": mental_tips,
        "disclaimer": "This report is educational and is not a diagnosis. Consult a qualified clinician for medical decisions.",
        "featuresUsed": features,
        "reportSummary": report_context.get("summary", ""),
        "dashboardCards": {
            "nextPeriod": cycle_prediction_from_last_period(answers.get("last_period")),
            "cycleLength": cycle_length_label,
            "pcosRisk": risk_level,
            "overallHealth": overall_health_label,
            "overallHealthNote": overall_health_note,
        },
    }
