import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import {
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  UploadCloud,
  Zap,
} from "lucide-react";
import Button from "../components/Button.jsx";
import PatientDashboardShell from "../components/PatientDashboardShell.jsx";
import SheCareAssistant from "../components/SheCareAssistant.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { db } from "../services/firebase.js";

function nextPeriodLabel(value) {
  if (!value || value.includes("Use a")) return "Add Date";
  return value;
}

function compactDateLabel(value) {
  if (!value || value === "Add Date") return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed;
}

function metricValueLines(label, value, compact) {
  if (label === "Next Period") {
    const parsedValue =
      value instanceof Date
        ? value
        : typeof value === "string"
          ? new Date(value)
          : null;

    if (parsedValue instanceof Date && !Number.isNaN(parsedValue.getTime())) {
      const month = parsedValue.toLocaleDateString("en-US", { month: "long" });
      const date = parsedValue.toLocaleDateString("en-US", {
        day: "2-digit",
        year: "numeric",
      });
      return [month, date];
    }

    if (typeof value === "string" && value.includes(",")) {
      const [firstPart, ...rest] = value.split(",");
      if (firstPart && rest.length > 0) {
        return [firstPart.trim(), rest.join(",").trim()];
      }
    }

    return [String(value)];
  }

  if (!compact) return [String(value)];

  if (label === "Overall Health" && typeof value === "string") {
    if (value === "Needs Care") return ["Needs", "Care"];
    if (value === "Good Health") return ["Good", "Health"];
    return value.split(" ");
  }

  return [String(value)];
}

function riskPercent(analysis) {
  if (typeof analysis.score === "number") return Math.min(100, Math.round((analysis.score / 10) * 100));
  if (analysis.riskLevel === "High") return 80;
  if (analysis.riskLevel === "Medium") return 50;
  if (analysis.riskLevel === "Low") return 20;
  return 0;
}

export default function Dashboard() {
  const { user, userProfile } = useAuth();
  const location = useLocation();
  const [latest, setLatest] = useState(location.state?.analysis || null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const latestRef = useRef(latest);

  useEffect(() => {
    latestRef.current = latest;
  }, [latest]);

  useEffect(() => {
    async function loadSessions() {
      const q = query(collection(db, "users", user.uid, "sessions"), orderBy("createdAt", "desc"), limit(8));
      const snapshot = await getDocs(q);
      const rows = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSessions(rows);
      if (!latestRef.current && rows[0]) setLatest(rows[0]);
      setLoading(false);
    }
    loadSessions();
  }, [user.uid]);

  const analysis = latest || {
    riskLevel: "No assessment yet",
    cyclePrediction: "Complete an assessment",
    recommendations: ["Start a symptom check to generate personalized guidance."],
    mentalTips: ["Track stress and sleep alongside cycle changes."],
  };
  const score = riskPercent(analysis);
  const circumference = 2 * Math.PI * 46;
  const offset = circumference - (score / 100) * circumference;
  const doctorStatus = userProfile?.doctorStatus || "none";
  return (
    <PatientDashboardShell assistant={<SheCareAssistant sessions={sessions} />}>
      {({ isAssistantOpen }) => {
        const summaryGridClass = isAssistantOpen ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-4";
        const detailGridClass = isAssistantOpen ? "2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]" : "xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]";
        const summaryCardClass = isAssistantOpen ? "rounded-[1.75rem] p-5" : "rounded-3xl p-5";
        const summaryValueClass = isAssistantOpen ? "mt-3 text-[1.15rem] leading-snug sm:text-[1.3rem]" : "mt-4 text-[1.35rem] leading-snug sm:text-[1.55rem]";
        const summarySubClass = isAssistantOpen ? "mt-2 text-sm leading-6" : "mt-2 text-sm";
        const summaryIconWrapClass = isAssistantOpen ? "h-14 w-14 rounded-3xl" : "h-14 w-14 rounded-3xl";
        const summaryIconClass = isAssistantOpen ? 26 : 27;
        const periodValue = nextPeriodLabel(analysis.cyclePrediction);
        const compactPeriodValue = isAssistantOpen ? compactDateLabel(periodValue) : periodValue;

        return (
      <>
      <div className={`grid gap-5 ${summaryGridClass}`}>
        {[
          [CalendarDays, "Next Period", compactPeriodValue, sessions[0]?.answers?.last_period || "Track date"],
          [Zap, "Cycle Length", "28 Days", "Regular"],
          [ShieldCheck, "PCOS Risk", analysis.riskLevel, score ? `Risk: ${score}%` : "Risk pending"],
          [HeartPulse, "Overall Health", analysis.riskLevel === "High" ? "Needs Care" : "Good", "Keep it up!"],
        ].map(([Icon, label, value, sub]) => {
          const valueLines = metricValueLines(label, value, isAssistantOpen);
          const labelValueClass =
            label === "Next Period"
              ? isAssistantOpen
                ? "text-[1.05rem] sm:text-[1.18rem]"
                : "text-[1.12rem] sm:text-[1.28rem]"
              : isAssistantOpen && label === "Overall Health"
              ? "text-[1.12rem] sm:text-[1.25rem]"
              : !isAssistantOpen && label === "Overall Health"
              ? "text-[1.18rem] sm:text-[1.34rem]"
                : "";

          return (
          <section key={label} className={`shecare-card min-w-0 ${summaryCardClass}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                <div className={`font-extrabold text-slate-950 dark:text-white ${summaryValueClass} ${labelValueClass}`}>
                  {valueLines.map((line) => (
                    <span key={`${label}-${line}`} className="block whitespace-nowrap">
                      {line}
                    </span>
                  ))}
                </div>
                <p className={`break-words font-semibold text-emerald-600 dark:text-emerald-300 ${summarySubClass}`}>{sub}</p>
              </div>
              <span className={`grid shrink-0 place-items-center bg-health-lavender text-health-purple ${summaryIconWrapClass}`}>
                <Icon size={summaryIconClass} />
              </span>
            </div>
          </section>
        )})}
      </div>

      <section className="purple-gradient mt-5 grid items-center gap-6 overflow-hidden rounded-3xl p-5 shadow-glass sm:p-6 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="hidden h-32 w-32 shrink-0 place-items-center rounded-full bg-white/70 text-health-purple shadow-sm md:grid">
            <Stethoscope size={56} />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-extrabold text-health-purple">Recent AI risk analysis</h2>
            <p className="mt-3 max-w-xl leading-7 text-slate-700 dark:text-slate-300">
              Your latest survey indicates <strong>{analysis.riskLevel}</strong> risk. Review your reports and follow the recommendations generated from your answers.
            </p>
            <Link to="/history">
              <Button className="mt-5 bg-health-purple hover:bg-violet-700">View Assessment History</Button>
            </Link>
          </div>
        </div>
        <div className="relative mx-auto h-40 w-40">
          <svg className="h-full w-full -rotate-90 drop-shadow-sm" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="44" fill="none" stroke="#eadcff" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="44"
              fill="none"
              stroke={analysis.riskLevel === "High" ? "#e11d48" : analysis.riskLevel === "Medium" ? "#f59e0b" : "#10b981"}
              strokeLinecap="round"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={(2 * Math.PI * 44) - (score / 100) * (2 * Math.PI * 44)}
            />
          </svg>
          <div className="absolute inset-5 grid place-items-center rounded-full bg-white text-center shadow-inner dark:bg-slate-950">
            <div>
              <p className="text-4xl font-black leading-none text-slate-950 dark:text-white">{score}%</p>
              <p className="mt-2 text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">Risk Score</p>
              <p className="mt-1 text-xs font-bold text-health-purple dark:text-violet-300">{analysis.riskLevel}</p>
            </div>
          </div>
        </div>
      </section>

      <div className={`mt-5 grid gap-5 ${detailGridClass}`}>
        <section className="shecare-card min-w-0 rounded-3xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Health Overview</h2>
            <span className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300">
              This Month
            </span>
          </div>
          <div className="mt-7 h-56 overflow-hidden rounded-3xl bg-gradient-to-b from-fuchsia-50 to-white p-4 sm:p-5 dark:from-white/10 dark:to-transparent">
            <svg viewBox="0 0 520 180" className="h-full w-full">
              {[0, 45, 90, 135].map((y) => (
                <line key={y} x1="20" x2="500" y1={20 + y} y2={20 + y} stroke="#e5e7eb" />
              ))}
              <polyline
                fill="none"
                stroke="#ec4899"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="5"
                points="25,140 85,88 145,112 205,82 265,84 325,54 385,90 445,64 500,78"
              />
              {[25, 85, 145, 205, 265, 325, 385, 445, 500].map((x, i) => (
                <circle key={x} cx={x} cy={[140, 88, 112, 82, 84, 54, 90, 64, 78][i]} r="6" fill="#ec4899" />
              ))}
            </svg>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300 md:grid-cols-4">
            {["Mood Good", "Energy High", "Sleep 7.5 hrs", "Activity Active"].map((item) => (
              <span key={item} className="rounded-2xl bg-slate-50 px-3 py-2 dark:bg-white/10">{item}</span>
            ))}
          </div>
        </section>

        <section className="shecare-card min-w-0 rounded-3xl p-5 sm:p-6">
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Quick Actions</h2>
          <div className="mt-5 grid gap-3">
            {[
              ["/pcos-risk", ClipboardCheck, "Start PCOS Risk Check", "Analyze your current symptoms"],
              ["/pcos-risk", CalendarDays, "Update Period Data", "Refresh cycle information"],
              ["/pcos-risk", UploadCloud, "Upload Lab Report", "Attach report during survey"],
              ["/history", FileText, "View Assessment History", "Track your progress"],
            ].map(([to, Icon, title, subtitle]) => (
              <Link key={title} to={to} className="flex min-w-0 items-center gap-4 rounded-2xl border-b border-slate-100 p-3 transition hover:bg-health-lavender dark:border-white/10 dark:hover:bg-white/10">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-health-lavender text-health-purple">
                  <Icon size={21} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block break-words font-bold text-slate-950 dark:text-white">{title}</span>
                  <span className="break-words text-sm text-slate-500 dark:text-slate-400">{subtitle}</span>
                </span>
                <ChevronRight size={19} className="shrink-0 text-health-purple" />
              </Link>
            ))}
          </div>
        </section>
      </div>
      <section className="mt-5 rounded-3xl bg-health-lavender p-5 dark:bg-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-health-purple dark:bg-white/10">
              <ShieldCheck />
            </span>
            <div className="min-w-0">
              <p className="font-extrabold text-health-purple dark:text-violet-200">Privacy First</p>
              <p className="break-words text-sm text-slate-600 dark:text-slate-300">
                {doctorStatus === "accepted"
                  ? `Your accepted doctor can review your submissions.`
                  : doctorStatus === "pending"
                    ? "Your doctor request is pending approval."
                    : "Your health data remains private to your account."}
              </p>
            </div>
          </div>
          {analysis.reportUrl && (
            <a href={analysis.reportUrl} target="_blank" rel="noreferrer">
              <Button variant="secondary" className="w-full sm:w-auto">
                <Download size={17} />
                Download Report
              </Button>
            </a>
          )}
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/10 sm:p-6">
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Health Insights</h2>
        <div className="mt-4 grid gap-3">
          {loading && <div className="loader" />}
          {!loading && sessions.length === 0 && (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-white/10 dark:text-slate-400">
              No health history yet. Start an assessment to generate insights.
            </p>
          )}
          {sessions.map((session) => (
            <div key={session.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/30">
              <div className="min-w-0">
                <p className="font-bold text-slate-950 dark:text-white">{session.riskLevel || "Assessment"} risk</p>
                <p className="break-words text-sm text-slate-500 dark:text-slate-400">{session.cyclePrediction || "Cycle prediction unavailable"}</p>
              </div>
              {session.reportUrl && (
                <a className="shrink-0 text-sm font-bold text-health-purple" href={session.reportUrl} target="_blank" rel="noreferrer">
                  Download
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
      </>
        );
      }}
    </PatientDashboardShell>
  );
}
