import { useMemo, useState } from "react";
import { Bot, Send } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";
import { api } from "../services/api.js";
import Button from "./Button.jsx";

function summarizeSessions(sessions) {
  const latest = sessions?.[0];
  return {
    latest,
    latestRisk: latest?.riskLevel || "not available yet",
    latestCycle: latest?.cyclePrediction || "not available yet",
    probability: latest?.probability,
  };
}

export default function SheCareAssistant({ sessions = [], className = "" }) {
  const { user } = useAuth();
  const context = useMemo(() => summarizeSessions(sessions), [sessions]);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text:
        "Hi. I am SheCare AI. Ask me about your latest PCOS risk result, food, exercise, stress, sleep, or next steps.",
    },
  ]);
  const [input, setInput] = useState("");
  const [replying, setReplying] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || replying) return;
    setInput("");
    const nextMessages = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setReplying(true);
    try {
      const result = await api.assistant({
        uid: user?.uid || "anonymous",
        message: text,
        session: context.latest || null,
        history: nextMessages,
      });
      setMessages((items) => [...items, { role: "bot", text: result.reply }]);
    } catch (error) {
      setMessages((items) => [
        ...items,
        {
          role: "bot",
          text: "I could not reach the assistant service just now. Please try again after the backend is running.",
        },
      ]);
    } finally {
      setReplying(false);
    }
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
          disabled={replying}
          className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-slate-400 dark:text-slate-100"
        />
        <Button type="submit" disabled={replying || !input.trim()} className="h-11 w-full rounded-2xl px-4 sm:w-11 sm:p-0">
          <Send size={17} />
        </Button>
      </form>
    </div>
  );
}
