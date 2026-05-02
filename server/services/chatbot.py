FLOW = [
    {
        "key": "age",
        "question": "What is your age?",
        "reply": "Thanks. How would you describe your lifestyle: sedentary, moderately active, or active?",
    },
    {
        "key": "lifestyle",
        "question": "How would you describe your lifestyle?",
        "reply": "When did your last period start? Use DD-MM-YYYY. Any delimiter is okay, like 02-05-2026 or 02/05/2026.",
    },
    {
        "key": "last_period",
        "question": "When did your last period start?",
        "reply": "Are your cycles usually regular? Answer yes, no, or sometimes.",
    },
    {
        "key": "cycle_regularity",
        "question": "Are your cycles usually regular?",
        "reply": "Which symptoms are you noticing: acne, pelvic pain, weight gain, hair growth, fatigue, or none?",
    },
    {
        "key": "symptoms",
        "question": "Which symptoms are you noticing?",
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
        "reply": "Optional: upload any recent reports in the panel, then type done when you are ready for analysis.",
    },
    {
        "key": "upload_ack",
        "question": "Upload reports if available.",
        "reply": "Your survey is complete. Select Analyze results to generate your dashboard and report.",
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
