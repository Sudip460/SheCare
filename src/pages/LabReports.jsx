import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { Download, FileText } from "lucide-react";
import PatientDashboardShell from "../components/PatientDashboardShell.jsx";
import SheCareAssistant from "../components/SheCareAssistant.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { db } from "../services/firebase";

function formatDate(value) {
  if (!value) return "Date unavailable";
  if (value.toDate) return value.toDate().toLocaleString();
  return "Date unavailable";
}

export default function LabReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const reportsQuery = query(collection(db, "users", user.uid, "reports"), orderBy("createdAt", "desc"), limit(30));
      const sessionsQuery = query(collection(db, "users", user.uid, "sessions"), orderBy("createdAt", "desc"), limit(8));
      const [reportsSnapshot, sessionsSnapshot] = await Promise.all([getDocs(reportsQuery), getDocs(sessionsQuery)]);
      setReports(reportsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setSessions(sessionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    loadData();
  }, [user.uid]);

  return (
    <PatientDashboardShell assistant={<SheCareAssistant sessions={sessions} />}>
      <section className="shecare-card min-w-0 rounded-3xl p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-health-lavender text-health-purple">
            <FileText />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">Lab Reports</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Reports uploaded during AI surveys.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {loading && <div className="loader" />}
          {!loading && reports.length === 0 && (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-white/10 dark:text-slate-400">
              No lab reports uploaded yet.
            </p>
          )}
          {reports.map((report) => (
            <article key={report.id} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/75 p-5 dark:border-white/10 dark:bg-white/10">
              <div className="min-w-0">
                <p className="break-words font-bold text-slate-950 dark:text-white">{report.fileName || "Medical report"}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Submitted: {formatDate(report.createdAt)}</p>
              </div>
              <a className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-health-purple px-4 py-3 text-sm font-bold text-white sm:w-auto" href={report.fileUrl} target="_blank" rel="noreferrer">
                <Download size={17} />
                Open
              </a>
            </article>
          ))}
        </div>
      </section>
    </PatientDashboardShell>
  );
}
