import { Activity, CalendarDays, FileText, LockKeyhole, ShieldCheck, Stethoscope, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Navbar from "../components/Navbar.jsx";

export default function Landing() {
  return (
    <main className="page-shell">
      <Navbar />
      <section className="mx-auto grid min-h-[calc(100vh-96px)] max-w-6xl items-center gap-10 px-5 pb-12 pt-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="min-w-0">
          <p className="mb-5 inline-flex rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
            Private, guided women&apos;s health assessment
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-ink dark:text-slate-100 sm:text-5xl md:text-7xl">
            SheCare AI
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted dark:text-slate-300">
            A calm assistant for cycle tracking, PCOS risk indicators, mental wellness signals, and
            medical report organization.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {["Auth protected", "Private uploads", "Downloadable PDF"].map((item) => (
              <span key={item} className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 dark:border-white/10 dark:bg-white/10">
                {item}
              </span>
            ))}
          </div>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/login?role=patient">
              <Button className="px-6">Start Health Assessment</Button>
            </Link>
            <Link to="/login?role=doctor">
              <Button variant="secondary" className="px-6">
                Doctor login
              </Button>
            </Link>
          </div>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
            <Link
              to="/login?role=patient"
              className="rounded-3xl border border-white/80 bg-white/75 p-5 shadow-glass transition hover:-translate-y-1 dark:border-white/10 dark:bg-white/10"
            >
              <UserRound className="mb-4 text-health-sky" />
              <p className="font-bold text-ink dark:text-slate-100">I am a patient</p>
              <p className="mt-2 text-sm leading-6 text-muted dark:text-slate-400">Choose a doctor, create an account, and start your assessment.</p>
            </Link>
            <Link
              to="/login?role=doctor"
              className="rounded-3xl border border-white/80 bg-white/75 p-5 shadow-glass transition hover:-translate-y-1 dark:border-white/10 dark:bg-white/10"
            >
              <Stethoscope className="mb-4 text-health-mint" />
              <p className="font-bold text-ink dark:text-slate-100">I am a doctor</p>
              <p className="mt-2 text-sm leading-6 text-muted dark:text-slate-400">Login to review assigned patients, reports, and analysis history.</p>
            </Link>
          </div>
        </div>

        <div className="min-w-0 grid gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted dark:text-slate-400">Today&apos;s readiness</p>
                <p className="mt-1 text-3xl font-bold text-ink dark:text-slate-100">Balanced</p>
              </div>
              <span className="grid h-14 w-14 place-items-center rounded-3xl bg-health-green">
                <Activity className="text-emerald-700" />
              </span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {["Cycle", "Symptoms", "Stress"].map((item, index) => (
                <div key={item} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/10">
                  <p className="text-xs font-semibold text-muted dark:text-slate-400">{item}</p>
                  <div className="mt-3 h-2 rounded-full bg-white dark:bg-slate-950/40">
                    <div
                      className="h-full rounded-full bg-health-mint"
                      style={{ width: `${[72, 46, 58][index]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [CalendarDays, "Cycle prediction"],
              [ShieldCheck, "UID scoped data"],
              [FileText, "PDF reports"],
              [LockKeyhole, "Protected routes"],
            ].map(([Icon, label]) => (
              <div key={label} className="rounded-3xl border border-white/80 bg-white/75 p-5 shadow-glass transition hover:-translate-y-1 dark:border-white/10 dark:bg-white/10 sm:[&:nth-child(4)]:col-span-3">
                <Icon className="mb-4 text-health-sky" />
                <p className="font-semibold text-ink dark:text-slate-100">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
