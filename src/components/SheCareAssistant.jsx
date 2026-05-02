import { useMemo, useState } from "react";
import { Bot, Send } from "lucide-react";
import Button from "./Button.jsx";

function summarizeSessions(sessions) {
  const latest = sessions?.[0];
  return {
    latestRisk: latest?.riskLevel || "not available yet",
    latestCycle: latest?.cyclePrediction || "not available yet",
    symptoms: latest?.answers?.symptoms || "not recorded",
    stress: latest?.answers?.stress_level || "not recorded",
    sleep: latest?.answers?.sleep_hours || "not recorded",
    recommendations: latest?.recommendations || [],
  };
}

function assistantReply(message, context) {
  const text = message.toLowerCase();
  const base = `Based on your latest survey, your risk is ${context.latestRisk}, cycle prediction is ${context.latestCycle}, symptoms are ${context.symptoms}, stress is ${context.stress}, and sleep is ${context.sleep}.`;

  if (text.includes("eat") || text.includes("diet") || text.includes("food")) {
    return `${base} Prefer protein with every meal, high-fiber carbohydrates, vegetables, nuts or seeds, and regular hydration. Limit highly processed sugary foods.`;
  }
  if (text.includes("exercise") || text.includes("workout") || text.includes("weight")) {
    return `${base} Aim for moderate walking or cycling most days and add strength training twice weekly. Start gently if pain or fatigue is present.`;
  }
  if (text.includes("stress") || text.includes("sleep") || text.includes("mental")) {
    return `${base} Keep a consistent sleep window, reduce screens before bed, and track stress triggers with cycle symptoms. Seek support if stress feels persistent.`;
  }
  if (text.includes("pcos") || text.includes("risk") || text.includes("hormone")) {
    return `${base} PCOS risk in this app is an indicator, not a diagnosis. If symptoms persist or risk is medium/high, consult a clinician for hormone testing and ultrasound guidance.`;
  }
  if (context.recommendations.length) {
    return `${base} Your saved recommendations include: ${context.recommendations.slice(0, 2).join(" ")}`;
  }
  return `${base} Ask me about diet, exercise, sleep, stress, PCOS risk, or what to discuss with a doctor.`;
}

export default function SheCareAssistant({ sessions = [], className = "" }) {
  const context = useMemo(() => summarizeSessions(sessions), [sessions]);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi. I am SheCare AI. Ask me about your reports, PCOS risk, food, exercise, stress, sleep, or next steps.",
    },
  ]);
  const [input, setInput] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((items) => [
      ...items,
      { role: "user", text },
      { role: "bot", text: assistantReply(text, context) },
    ]);
  }

  return (
    <div className={`flex h-full min-h-[24rem] flex-col ${className}`}>
      <div className="flex items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-3xl bg-white text-health-purple shadow-sm dark:bg-white/10">
          <Bot size={29} />
        </span>
        <div>
          <p className="text-lg font-extrabold text-slate-950 dark:text-white">SheCare AI Assistant</p>
          <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Online
          </p>
        </div>
      </div>

      <div className="mt-6 flex-1 space-y-4 overflow-y-auto pr-1 text-sm leading-6">
        {messages.map((item, index) => (
          <div
            key={`${item.role}-${index}`}
            className={`break-words rounded-3xl p-4 shadow-sm ${
              item.role === "user"
                ? "ml-8 bg-health-purple text-white"
                : "bg-white text-slate-900 dark:bg-white/10 dark:text-slate-100"
            }`}
          >
            {item.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-2 rounded-3xl bg-white p-2 shadow-sm dark:bg-white/10 sm:flex-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about your health..."
          className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-slate-400 dark:text-slate-100"
        />
        <Button type="submit" className="h-11 w-full rounded-2xl px-4 sm:w-11 sm:p-0">
          <Send size={17} />
        </Button>
      </form>
    </div>
  );
}
