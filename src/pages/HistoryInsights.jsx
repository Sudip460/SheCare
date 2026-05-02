import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { CalendarDays, Download, History } from "lucide-react";
import PatientDashboardShell from "../components/PatientDashboardShell.jsx";
import SheCareAssistant from "../components/SheCareAssistant.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { db } from "../services/firebase";

function formatDate(value) {
  if (!value) return "Date unavailable";
  if (value.toDate) return value.toDate().toLocaleString();
  return "Date unavailable";
}

export default function HistoryInsights() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      const sessionsQuery = query(collection(db, "users", user.uid, "sessions"), orderBy("createdAt", "desc"), limit(30));
      const snapshot = await getDocs(sessionsQuery);
      setSessions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    loadSessions();
  }, [user.uid]);

  return (
    <PatientDashboardShell assistant={<SheCareAssistant sessions={sessions} />}>
      <section className="shecare-card min-w-0 rounded-3xl p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-health-lavender text-health-purple">
            <History />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">Assessment History</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Every completed AI survey and its analysis.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {loading && <div className="loader" />}
          {!loading && sessions.length === 0 && (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-white/10 dark:text-slate-400">
              No assessments completed yet.
            </p>
          )}
          {sessions.map((session) => (
            <article key={session.id} className="min-w-0 rounded-3xl border border-slate-200 bg-white/75 p-5 dark:border-white/10 dark:bg-white/10">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <CalendarDays size={16} />
                    {formatDate(session.createdAt)}
                  </p>
                  <h3 className="mt-3 text-xl font-extrabold text-slate-950 dark:text-white">{session.riskLevel || "Assessment"} risk</h3>
                  <p className="mt-2 break-words text-sm text-slate-600 dark:text-slate-300">Cycle prediction: {session.cyclePrediction || "Unavailable"}</p>
                </div>
                {session.reportUrl && (
                  <a className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-health-purple px-4 py-3 text-sm font-bold text-white sm:w-auto" href={session.reportUrl} target="_blank" rel="noreferrer">
                    <Download size={17} />
                    Report
                  </a>
                )}
              </div>
              {session.recommendations?.length > 0 && (
                <ul className="mt-4 grid gap-2 text-sm text-slate-700 dark:text-slate-300">
                  {session.recommendations.map((item) => (
                    <li key={item} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/30">{item}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>
    </PatientDashboardShell>
  );
}
