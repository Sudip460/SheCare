import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import toast from "react-hot-toast";
import { Bell, CalendarDays, Check, Download, FileText, Search, UsersRound, X } from "lucide-react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { db } from "../services/firebase";

function formatDate(value) {
  if (!value) return "Date unavailable";
  if (value.toDate) return value.toDate().toLocaleDateString();
  return "Date unavailable";
}

export default function DoctorDashboard() {
  const { user, userProfile } = useAuth();
  const [patients, setPatients] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const doctorId = userProfile?.doctorId || userProfile?.doctorProfileId || user?.uid;

  useEffect(() => {
    async function loadPatientsAndRequests() {
      if (!doctorId) {
        setLoadingPatients(false);
        setLoadingRequests(false);
        return;
      }
      setLoadingPatients(true);
      setLoadingRequests(true);
      const patientsQuery = query(
        collection(db, "users"),
        where("profile.role", "==", "patient"),
        where("profile.doctorId", "==", doctorId),
        where("profile.doctorStatus", "==", "accepted")
      );
      const requestsQuery = query(
        collection(db, "users"),
        where("profile.role", "==", "patient"),
        where("profile.doctorId", "==", doctorId),
        where("profile.doctorStatus", "==", "pending")
      );
      const snapshot = await getDocs(patientsQuery);
      const rows = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data().profile }));
      const requestSnapshot = await getDocs(requestsQuery);
      const requestRows = requestSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data().profile }));
      setPatients(rows);
      setPendingRequests(requestRows);
      setSelectedPatient((current) => current || rows[0] || null);
      setLoadingPatients(false);
      setLoadingRequests(false);
    }
    loadPatientsAndRequests();
  }, [doctorId]);

  async function handleRequestDecision(patient, decision) {
    const status = decision === "accept" ? "accepted" : "rejected";
    try {
      await updateDoc(doc(db, "users", patient.id), {
        "profile.doctorStatus": status,
        "profile.doctorDecisionAt": serverTimestamp(),
      });
      setPendingRequests((items) => items.filter((item) => item.id !== patient.id));
      if (status === "accepted") {
        setPatients((items) => [...items, { ...patient, doctorStatus: "accepted" }]);
        setSelectedPatient((current) => current || { ...patient, doctorStatus: "accepted" });
        toast.success("Patient request accepted");
      } else {
        toast.success("Patient request rejected");
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    async function loadSessions() {
      if (!selectedPatient) {
        setSessions([]);
        return;
      }
      setLoadingSessions(true);
      const sessionsQuery = query(
        collection(db, "users", selectedPatient.id, "sessions"),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      const snapshot = await getDocs(sessionsQuery);
      setSessions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoadingSessions(false);
    }
    loadSessions();
  }, [selectedPatient]);

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patients;
    return patients.filter((patient) =>
      [patient.displayName, patient.email].some((value) => String(value || "").toLowerCase().includes(term))
    );
  }, [patients, search]);

  return (
    <main className="page-shell">
      <Navbar />
      <section className="mx-auto max-w-6xl px-5 pb-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-muted dark:text-slate-400">Doctor workspace</p>
            <h1 className="mt-2 text-4xl font-bold text-ink dark:text-slate-100">Patient review desk</h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/80 bg-white/80 px-5 py-4 shadow-glass dark:border-white/10 dark:bg-white/10">
              <p className="text-sm text-muted dark:text-slate-400">Assigned patients</p>
              <p className="text-2xl font-bold text-ink dark:text-slate-100">{patients.length}</p>
            </div>
            <a
              href="#patient-requests"
              className="rounded-3xl border border-white/80 bg-white/80 px-5 py-4 shadow-glass transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10"
            >
              <p className="flex items-center gap-2 text-sm text-muted dark:text-slate-400">
                <Bell size={16} />
                New requests
              </p>
              <p className="text-2xl font-bold text-ink dark:text-slate-100">{pendingRequests.length}</p>
            </a>
          </div>
        </div>

        <Card id="patient-requests" className="mb-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-ink dark:text-slate-100">Patient requests</h2>
              <p className="mt-1 text-sm text-muted dark:text-slate-400">
                Patients appear in your dashboard only after you accept them.
              </p>
            </div>
            <span className="rounded-full bg-health-blue px-3 py-1 text-sm font-bold text-blue-800 dark:bg-blue-500/15 dark:text-blue-200">
              {pendingRequests.length} pending
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            {loadingRequests && <div className="loader" />}
            {!loadingRequests && pendingRequests.length === 0 && (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-muted dark:bg-white/10 dark:text-slate-400">
                No new patient requests.
              </p>
            )}
            {pendingRequests.map((patient) => (
              <div key={patient.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white/75 p-4 dark:border-white/10 dark:bg-white/10">
                <div>
                  <p className="font-bold text-ink dark:text-slate-100">{patient.displayName || "Patient"}</p>
                  <p className="text-sm text-muted dark:text-slate-400">{patient.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => handleRequestDecision(patient, "reject")}>
                    <X size={17} />
                    Reject
                  </Button>
                  <Button onClick={() => handleRequestDecision(patient, "accept")}>
                    <Check size={17} />
                    Accept
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-health-blue">
                <UsersRound className="text-blue-700" />
              </span>
              <div>
                <h2 className="font-bold text-ink dark:text-slate-100">Patients</h2>
                <p className="text-sm text-muted dark:text-slate-400">Search assigned profiles</p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 dark:border-white/10 dark:bg-white/10">
              <Search size={18} className="text-muted dark:text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search patient"
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="mt-5 grid gap-3">
              {loadingPatients && <div className="loader" />}
              {!loadingPatients && filteredPatients.length === 0 && (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-muted dark:bg-white/10 dark:text-slate-400">
                  No assigned patients found.
                </p>
              )}
              {filteredPatients.map((patient) => {
                const active = selectedPatient?.id === patient.id;
                return (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => setSelectedPatient(patient)}
                    className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                      active
                        ? "border-health-sky bg-health-blue dark:border-health-sky dark:bg-blue-500/15"
                        : "border-slate-200 bg-white/75 dark:border-white/10 dark:bg-white/10"
                    }`}
                  >
                    <p className="font-bold text-ink dark:text-slate-100">{patient.displayName || "Patient"}</p>
                    <p className="mt-1 truncate text-sm text-muted dark:text-slate-400">{patient.email}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          <div className="space-y-5">
            <Card>
              {selectedPatient ? (
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-muted dark:text-slate-400">Selected patient</p>
                    <h2 className="mt-1 text-2xl font-bold text-ink dark:text-slate-100">
                      {selectedPatient.displayName || "Patient"}
                    </h2>
                    <p className="mt-2 text-sm text-muted dark:text-slate-400">{selectedPatient.email}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/10">
                    <p className="text-sm text-muted dark:text-slate-400">Submissions</p>
                    <p className="text-xl font-bold text-ink dark:text-slate-100">{sessions.length}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted dark:text-slate-400">Select a patient to review submissions.</p>
              )}
            </Card>

            <Card>
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-health-green">
                  <FileText className="text-emerald-700" />
                </span>
                <div>
                  <h2 className="font-bold text-ink dark:text-slate-100">Analysis history</h2>
                  <p className="text-sm text-muted dark:text-slate-400">Reports and risk summaries from patient submissions</p>
                </div>
              </div>

              <div className="grid gap-3">
                {loadingSessions && <div className="loader" />}
                {!loadingSessions && selectedPatient && sessions.length === 0 && (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-muted dark:bg-white/10 dark:text-slate-400">
                    This patient has not completed an assessment yet.
                  </p>
                )}
                {sessions.map((session) => (
                  <article key={session.id} className="rounded-3xl border border-slate-200 bg-white/75 p-5 dark:border-white/10 dark:bg-white/10">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                          {session.riskLevel || "Assessment"} risk
                        </span>
                        <p className="mt-3 flex items-center gap-2 text-sm text-muted dark:text-slate-400">
                          <CalendarDays size={16} />
                          {formatDate(session.createdAt)}
                        </p>
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

                    {session.recommendations?.length > 0 && (
                      <ul className="mt-4 grid gap-2 text-sm text-slate-700 dark:text-slate-300">
                        {session.recommendations.slice(0, 3).map((item) => (
                          <li key={item} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/30">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
