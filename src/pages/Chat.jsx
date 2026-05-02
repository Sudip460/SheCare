import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { Send, Sparkles } from "lucide-react";
import Button from "../components/Button.jsx";
import ChatBubble from "../components/ChatBubble.jsx";
import FileUploader from "../components/FileUploader.jsx";
import PatientDashboardShell from "../components/PatientDashboardShell.jsx";
import SheCareAssistant from "../components/SheCareAssistant.jsx";
import TypingIndicator from "../components/TypingIndicator.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { api } from "../services/api.js";
import { db } from "../services/firebase.js";

const initialMessage = {
  role: "bot",
  text: "Hi, I am SheCare. I will ask a few questions about your cycle, symptoms, lifestyle, and wellbeing. What is your age?",
};

const progressByStep = {
  age: 12,
  lifestyle: 25,
  last_period: 38,
  cycle_regularity: 52,
  symptoms: 66,
  stress_level: 80,
  sleep_hours: 92,
  upload_ack: 96,
  complete: 100,
};

export default function Chat() {
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState([initialMessage]);
  const [message, setMessage] = useState("");
  const [state, setState] = useState({ step: "age", answers: {} });
  const [typing, setTyping] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  const isComplete = useMemo(() => state.step === "complete", [state.step]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function handleSend(event) {
    event.preventDefault();
    const text = message.trim();
    if (!text || typing || isComplete) return;

    setMessages((items) => [...items, { role: "user", text }]);
    setMessage("");
    setTyping(true);
    try {
      const result = await api.chat({ uid: user.uid, message: text, state });
      setState(result.updated_state);
      window.setTimeout(() => {
        setMessages((items) => [...items, { role: "bot", text: result.reply }]);
        setTyping(false);
      }, 450);
    } catch (error) {
      setTyping(false);
      toast.error(error.message);
    }
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    try {
      const answers = { ...state.answers, uploadedFiles };
      const analysis = await api.analyze({ uid: user.uid, answers });
      const hasAcceptedDoctor = userProfile?.doctorStatus === "accepted";
      const sessionRef = await addDoc(collection(db, "users", user.uid, "sessions"), {
        answers,
        ...analysis,
        doctorId: hasAcceptedDoctor ? userProfile?.doctorId || null : null,
        doctorName: hasAcceptedDoctor ? userProfile?.doctorName || null : null,
        createdAt: serverTimestamp(),
      });
      const report = await api.generateReport({
        uid: user.uid,
        sessionId: sessionRef.id,
        analysisData: { answers, ...analysis },
      });
      await updateDoc(sessionRef, {
        reportUrl: report.reportUrl,
        reportPath: report.reportPath || null,
      });
      navigate("/dashboard", { state: { sessionId: sessionRef.id, analysis: { ...analysis, reportUrl: report.reportUrl } } });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <PatientDashboardShell assistant={<SheCareAssistant sessions={[]} />}>
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,21.25rem)]">
        <div className="glass-card flex min-h-[70vh] min-w-0 flex-col rounded-3xl">
          <div className="border-b border-white/80 p-5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-health-blue">
                <Sparkles size={20} className="text-blue-700" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-ink dark:text-slate-100">Health assessment</h1>
                <p className="text-sm text-muted dark:text-slate-400">Your answers stay scoped to your account.</p>
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white dark:bg-slate-950/40">
              <div
                className="h-full rounded-full bg-health-mint transition-all duration-500"
                style={{ width: `${progressByStep[state.step] || 8}%` }}
              />
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
            {messages.map((item, index) => (
              <ChatBubble key={`${item.role}-${index}`} role={item.role}>
                {item.text}
              </ChatBubble>
            ))}
            {typing && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          <form className="flex flex-col gap-3 border-t border-white/80 p-4 dark:border-white/10 sm:flex-row" onSubmit={handleSend}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isComplete ? "Survey complete" : "Type your answer..."}
              disabled={typing || isComplete}
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-ink outline-none transition placeholder:text-slate-400 focus:border-health-sky focus:ring-4 focus:ring-health-blue disabled:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500/20 dark:disabled:bg-white/5"
            />
            <Button type="submit" disabled={typing || isComplete || !message.trim()} className="w-full px-4 sm:w-auto">
              <Send size={18} />
            </Button>
          </form>
        </div>

        <aside className="space-y-4 xl:min-w-0">
          <FileUploader uid={user.uid} onUploaded={(file) => setUploadedFiles((files) => [...files, file])} />
          <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-glass dark:border-white/10 dark:bg-white/10">
            <p className="text-sm font-semibold text-muted dark:text-slate-400">Assessment progress</p>
            <p className="mt-2 text-2xl font-bold text-ink dark:text-slate-100">{isComplete ? "Ready" : "In progress"}</p>
            <p className="mt-2 text-sm leading-6 text-muted dark:text-slate-400">
              {isComplete ? "Generate your analysis when ready." : "Answer each prompt to unlock analysis."}
            </p>
            <Button className="mt-5 w-full" onClick={handleAnalyze} disabled={!isComplete || analyzing}>
              {analyzing ? "Analyzing..." : "Analyze results"}
            </Button>
          </div>
          {analyzing && (
            <div className="rounded-3xl bg-ink p-5 text-white shadow-soft">
              <div className="loader mb-4 border-white/20 border-t-white" />
              <p className="font-semibold">Analyzing your survey</p>
              <p className="mt-1 text-sm text-slate-300">Calculating risk indicators and preparing your report.</p>
            </div>
          )}
        </aside>
      </section>
    </PatientDashboardShell>
  );
}
