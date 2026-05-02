import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import {
  Activity,
  CalendarDays,
  Download,
  FileText,
  HeartPulse,
  Mail,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import DashboardCard from "../components/DashboardCard.jsx";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { db } from "../services/firebase";
import PatientProfile from "./PatientProfile.jsx";

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

export default function Profile() {
  const { user, userProfile } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDoctor = userProfile?.role === "doctor";
  const doctorId = userProfile?.doctorId || userProfile?.doctorProfileId || user?.uid;

  useEffect(() => {
    async function loadProfileData() {
      setLoading(true);

      if (userProfile?.role === "patient") {
        if (userProfile?.doctorId) {
          const doctorSnapshot = await getDoc(doc(db, "doctors", userProfile.doctorId));
          setDoctor(doctorSnapshot.exists() ? { id: doctorSnapshot.id, ...doctorSnapshot.data() } : null);
        }

        const sessionsQuery = query(collection(db, "users", user.uid, "sessions"), orderBy("createdAt", "desc"), limit(12));
        const sessionsSnapshot = await getDocs(sessionsQuery);
        setSessions(sessionsSnapshot.docs.map((row) => ({ id: row.id, ...row.data() })));
      }

      if (userProfile?.role === "doctor" && doctorId) {
        const doctorSnapshot = await getDoc(doc(db, "doctors", doctorId));
        setDoctor(doctorSnapshot.exists() ? { id: doctorSnapshot.id, ...doctorSnapshot.data() } : null);

        const patientsQuery = query(
          collection(db, "users"),
          where("profile.role", "==", "patient"),
          where("profile.doctorId", "==", doctorId),
          where("profile.doctorStatus", "==", "accepted")
        );
        const patientsSnapshot = await getDocs(patientsQuery);
        const patientRows = patientsSnapshot.docs.map((row) => ({ id: row.id, ...row.data().profile }));
        setPatients(patientRows);

        const activity = [];
        await Promise.all(
          patientRows.slice(0, 12).map(async (patient) => {
            const sessionQuery = query(collection(db, "users", patient.id, "sessions"), orderBy("createdAt", "desc"), limit(3));
            const sessionSnapshot = await getDocs(sessionQuery);
            sessionSnapshot.docs.forEach((sessionDoc) => {
              activity.push({
                id: `${patient.id}-${sessionDoc.id}`,
                patient,
                ...sessionDoc.data(),
              });
            });
          })
        );
        activity.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setRecentActivity(activity.slice(0, 10));
      }

      setLoading(false);
    }

    if (user && userProfile) loadProfileData();
  }, [doctorId, user, userProfile]);

  const latestSession = sessions[0];
  const reportCount = useMemo(() => sessions.filter((session) => session.reportUrl).length, [sessions]);

  if (!isDoctor) {
    return <PatientProfile />;
  }

  return (
    <main className="page-shell">
      <Navbar />
      <section className="mx-auto max-w-6xl px-5 pb-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-muted dark:text-slate-400">
              {isDoctor ? "Doctor profile" : "Patient profile"}
            </p>
            <h1 className="mt-2 break-words text-4xl font-bold text-ink dark:text-slate-100">
              {userProfile?.displayName || user?.email}
            </h1>
            <p className="mt-2 flex items-center gap-2 break-all text-sm text-muted dark:text-slate-400">
              <Mail size={16} />
              {userProfile?.email || user?.email}
            </p>
          </div>
          <Link to={isDoctor ? "/doctor" : "/dashboard"}>
            <Button variant="secondary">{isDoctor ? "Open doctor desk" : "Open dashboard"}</Button>
          </Link>
        </div>

        {loading ? (
          <Card>
            <div className="loader" />
          </Card>
        ) : isDoctor ? (
          <>
            <div className="grid gap-5 lg:grid-cols-3">
              <DashboardCard icon={<Stethoscope className="text-blue-700" />} title="Doctor Details">
                <p className="font-bold text-ink dark:text-slate-100">{doctor?.name || userProfile?.displayName}</p>
                <p className="mt-2 text-sm leading-6 text-muted dark:text-slate-400">
                  {doctor?.specialty || "Specialty not added yet"}
                </p>
              </DashboardCard>
              <DashboardCard icon={<UsersRound className="text-emerald-700" />} title="Assigned Patients" accent="bg-health-green">
                <p className="text-3xl font-bold text-ink dark:text-slate-100">{patients.length}</p>
                <p className="mt-2 text-sm text-muted dark:text-slate-400">Patients linked to your doctor ID.</p>
              </DashboardCard>
              <DashboardCard icon={<Activity className="text-rose-700" />} title="Recent Submissions" accent="bg-rose-50">
                <p className="text-3xl font-bold text-ink dark:text-slate-100">{recentActivity.length}</p>
                <p className="mt-2 text-sm text-muted dark:text-slate-400">Latest patient assessments.</p>
              </DashboardCard>
            </div>

            <Card className="mt-5 min-w-0">
              <h2 className="text-xl font-bold text-ink dark:text-slate-100">Recent patient activity</h2>
              <div className="mt-4 grid gap-3">
                {recentActivity.length === 0 && (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-muted dark:bg-white/10 dark:text-slate-400">
                    No patient submissions yet.
                  </p>
                )}
                {recentActivity.map((session) => (
                  <div key={session.id} className="min-w-0 rounded-3xl border border-slate-200 bg-white/75 p-5 dark:border-white/10 dark:bg-white/10">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="break-words font-bold text-ink dark:text-slate-100">{session.patient.displayName || "Patient"}</p>
                        <p className="mt-1 text-sm text-muted dark:text-slate-400">{formatDate(session.createdAt)}</p>
                        <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${riskTone(session.riskLevel)}`}>
                          {session.riskLevel || "Assessment"} risk
                        </span>
                      </div>
                      {session.reportUrl && (
                        <a href={session.reportUrl} target="_blank" rel="noreferrer">
                          <Button variant="secondary" className="w-full sm:w-auto">
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

            <Card className="mt-5 min-w-0">
              <h2 className="text-xl font-bold text-ink dark:text-slate-100">Assessment history</h2>
              <div className="mt-4 grid gap-3">
                {sessions.length === 0 && (
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/10">
                    <p className="text-sm text-muted dark:text-slate-400">No assessments yet.</p>
                    <Link className="mt-3 inline-flex text-sm font-bold text-blue-700 dark:text-health-sky" to="/chat">
                      Start assessment
                    </Link>
                  </div>
                )}
                {sessions.map((session) => (
                  <div key={session.id} className="min-w-0 rounded-3xl border border-slate-200 bg-white/75 p-5 dark:border-white/10 dark:bg-white/10">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-sm text-muted dark:text-slate-400">
                          <CalendarDays size={16} />
                          {formatDate(session.createdAt)}
                        </p>
                        <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${riskTone(session.riskLevel)}`}>
                          {session.riskLevel || "Assessment"} risk
                        </span>
                        <p className="mt-3 break-words text-sm leading-6 text-slate-700 dark:text-slate-300">
                          Cycle prediction: {session.cyclePrediction || "Unavailable"}
                        </p>
                      </div>
                      {session.reportUrl && (
                        <a href={session.reportUrl} target="_blank" rel="noreferrer">
                          <Button variant="secondary" className="w-full sm:w-auto">
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
      </section>
    </main>
  );
}
