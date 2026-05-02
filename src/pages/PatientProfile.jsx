import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, doc, getDoc, getDocs, limit, orderBy, query } from "firebase/firestore";
import { CalendarDays, Download, FileText, HeartPulse, Mail, Stethoscope } from "lucide-react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import DashboardCard from "../components/DashboardCard.jsx";
import PatientDashboardShell from "../components/PatientDashboardShell.jsx";
import SheCareAssistant from "../components/SheCareAssistant.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { db } from "../services/firebase";

function formatDate(value) {
  if (!value) return "Date unavailable";
  if (value.toDate) return value.toDate().toLocaleDateString();
  return "Date unavailable";
}

function riskTone(riskLevel) {
  if (riskLevel === "High") return "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200";
  if (riskLevel === "Medium") return "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200";
  return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200";
}

export default function PatientProfile() {
  const { user, userProfile } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (userProfile?.doctorId) {
        const doctorSnapshot = await getDoc(doc(db, "doctors", userProfile.doctorId));
        setDoctor(doctorSnapshot.exists() ? { id: doctorSnapshot.id, ...doctorSnapshot.data() } : null);
      }

      const sessionsQuery = query(collection(db, "users", user.uid, "sessions"), orderBy("createdAt", "desc"), limit(12));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      setSessions(sessionsSnapshot.docs.map((row) => ({ id: row.id, ...row.data() })));
      setLoading(false);
    }
    loadProfile();
  }, [user.uid, userProfile?.doctorId]);

  const latestSession = sessions[0];
  const reportCount = useMemo(() => sessions.filter((session) => session.reportUrl).length, [sessions]);

  return (
    <PatientDashboardShell assistant={<SheCareAssistant sessions={sessions} />}>
      <div className="mb-6">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Patient profile</p>
        <h2 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">{userProfile?.displayName || user?.email}</h2>
        <p className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Mail size={16} />
          {userProfile?.email || user?.email}
        </p>
      </div>

      {loading ? (
        <Card>
          <div className="loader" />
        </Card>
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-3">
            <DashboardCard icon={<Stethoscope className="text-blue-700" />} title="Assigned Doctor">
              <p className="font-bold text-ink dark:text-slate-100">
                {userProfile?.doctorStatus === "pending"
                  ? `${userProfile?.doctorName || doctor?.name} requested`
                  : userProfile?.doctorStatus === "rejected"
                    ? "Request not accepted"
                    : doctor?.name || userProfile?.doctorName || "Not assigned"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted dark:text-slate-400">
                {userProfile?.doctorStatus === "pending"
                  ? "Your selected doctor needs to accept the consultancy request."
                  : userProfile?.doctorStatus === "rejected"
                    ? "You can continue using self-guided assessments."
                    : doctor?.specialty || "Doctor profile details will appear here."}
              </p>
            </DashboardCard>
            <DashboardCard icon={<HeartPulse className="text-emerald-700" />} title="Latest Risk" accent="bg-health-green">
              <span className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${riskTone(latestSession?.riskLevel)}`}>
                {latestSession?.riskLevel || "No assessment"} risk
              </span>
            </DashboardCard>
            <DashboardCard icon={<FileText className="text-rose-700" />} title="Reports" accent="bg-rose-50">
              <p className="text-3xl font-bold text-ink dark:text-slate-100">{reportCount}</p>
              <p className="mt-2 text-sm text-muted dark:text-slate-400">Generated downloadable reports.</p>
            </DashboardCard>
          </div>

          <Card className="mt-5">
            <h2 className="text-xl font-bold text-ink dark:text-slate-100">Assessment history</h2>
            <div className="mt-4 grid gap-3">
              {sessions.length === 0 && (
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/10">
                  <p className="text-sm text-muted dark:text-slate-400">No assessments yet.</p>
                  <Link className="mt-3 inline-flex text-sm font-bold text-blue-700 dark:text-health-sky" to="/pcos-risk">
                    Start assessment
                  </Link>
                </div>
              )}
              {sessions.map((session) => (
                <div key={session.id} className="rounded-3xl border border-slate-200 bg-white/75 p-5 dark:border-white/10 dark:bg-white/10">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="flex items-center gap-2 text-sm text-muted dark:text-slate-400">
                        <CalendarDays size={16} />
                        {formatDate(session.createdAt)}
                      </p>
                      <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${riskTone(session.riskLevel)}`}>
                        {session.riskLevel || "Assessment"} risk
                      </span>
                      <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                        Cycle prediction: {session.cyclePrediction || "Unavailable"}
                      </p>
                    </div>
                    {session.reportUrl && (
                      <a href={session.reportUrl} target="_blank" rel="noreferrer">
                        <Button variant="secondary">
                          <Download size={17} />
                          Report
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </PatientDashboardShell>
  );
}
