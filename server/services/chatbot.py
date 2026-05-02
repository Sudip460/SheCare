FLOW = [
    {
        "key": "cycle_length",
        "question": "What is your usual cycle length in days?",
        "reply": "How many days does your cycle usually vary by? For example, type 0 for very regular or 10 if it often shifts by 10 days.",
    },
    {
        "key": "cycle_irregularity",
        "question": "How many days does your cycle vary by?",
        "reply": "How many periods have you missed in the last 12 months?",
    },
    {
        "key": "missed_periods",
        "question": "How many periods have you missed recently?",
        "reply": "How many days does your period usually last?",
    },
    {
        "key": "period_duration",
        "question": "How many days does your period usually last?",
        "reply": "What is the maximum delay you typically notice in your cycle, in days?",
    },
    {
        "key": "delay_max",
        "question": "What is the maximum delay in your cycle?",
        "reply": "When did your last period start? Use DD-MM-YYYY. Any delimiter is okay, like 02-05-2026 or 02/05/2026.",
    },
    {
        "key": "last_period",
        "question": "When did your last period start?",
        "reply": "Do you currently have acne? Answer yes or no.",
    },
    {
        "key": "acne",
        "question": "Do you currently have acne?",
        "reply": "Rate acne severity from 0 to 10. Type 0 if none.",
    },
    {
        "key": "acne_severity",
        "question": "How severe is your acne from 0 to 10?",
        "reply": "Are you noticing hair loss? Answer yes or no.",
    },
    {
        "key": "hair_loss",
        "question": "Are you noticing hair loss?",
        "reply": "Rate hair loss severity from 0 to 10. Type 0 if none.",
    },
    {
        "key": "hair_loss_severity",
        "question": "How severe is the hair loss from 0 to 10?",
        "reply": "Are you noticing extra facial or body hair growth? Answer yes or no.",
    },
    {
        "key": "hirsutism",
        "question": "Are you noticing extra facial or body hair growth?",
        "reply": "Rate that hair growth severity from 0 to 10. Type 0 if none.",
    },
    {
        "key": "hirsutism_severity",
        "question": "How severe is the extra hair growth from 0 to 10?",
        "reply": "Have you experienced weight gain? Answer yes or no.",
    },
    {
        "key": "weight_gain",
        "question": "Have you experienced weight gain?",
        "reply": "Has the weight gain happened recently? Answer yes or no.",
    },
    {
        "key": "weight_gain_recent",
        "question": "Has the weight gain happened recently?",
        "reply": "Do you have dark skin patches around the neck, underarms, or other folds? Answer yes or no.",
    },
    {
        "key": "dark_patches",
        "question": "Do you have dark skin patches?",
        "reply": "What is your BMI? If you are unsure, type your best estimate.",
    },
    {
        "key": "BMI",
        "question": "What is your BMI?",
        "reply": "How would you rate your stress level from 1 to 10?",
    },
    {
        "key": "stress_level",
        "question": "How would you rate your stress level?",
        "reply": "How many hours do you usually sleep each night?",
    },
    {
        "key": "sleep_hours",
        "question": "How many hours do you usually sleep?",
        "reply": "How many days per week do you exercise?",
    },
    {
        "key": "exercise_days",
        "question": "How many days per week do you exercise?",
        "reply": "How active are you overall from 1 to 10?",
    },
    {
        "key": "activity_level",
        "question": "How active are you overall from 1 to 10?",
        "reply": "What best describes your work type: desk, mixed, or active?",
    },
    {
        "key": "work_type",
        "question": "What best describes your work type?",
        "reply": "How regular are your meals from 1 to 10?",
    },
    {
        "key": "meal_regularity",
        "question": "How regular are your meals from 1 to 10?",
        "reply": "Do you often skip meals? Answer yes or no.",
    },
    {
        "key": "meal_skipping",
        "question": "Do you often skip meals?",
        "reply": "Optional: if you know any lab values like TSH, glucose, insulin, hemoglobin, cholesterol, or LH/FSH ratio, upload reports now or type skip to continue.",
    },
    {
        "key": "upload_ack",
        "question": "Upload reports or lab values if available.",
        "reply": "Your survey is complete. Select Analyze results to generate your ML-based PCOS risk report.",
    },
]


def advance_chat(message, state):
    step = state.get("step", FLOW[0]["key"])
    answers = state.get("answers", {})
    current_index = next((i for i, item in enumerate(FLOW) if item["key"] == step), 0)
    current = FLOW[current_index]

    answers[current["key"]] = message.strip()

    if current_index >= len(FLOW) - 1:
        updated_state = {"step": "complete", "answers": answers}
        return {
            "reply": current["reply"],
            "next_question": None,
            "updated_state": updated_state,
        }

    next_item = FLOW[current_index + 1]
    updated_state = {"step": next_item["key"], "answers": answers}
    return {
        "reply": current["reply"],
        "next_question": next_item["question"],
        "updated_state": updated_state,
    }
