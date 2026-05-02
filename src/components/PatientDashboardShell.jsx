import {
  Bot,
  ClipboardCheck,
  FileText,
  HeartPulse,
  History,
  Home,
  Settings,
  UserCircle,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/pcos-risk", label: "PCOS Risk Check", icon: ClipboardCheck },
  { to: "/lab-reports", label: "Lab Reports", icon: FileText },
  { to: "/history", label: "History & Insights", icon: History },
  { to: "/profile", label: "Profile", icon: UserCircle },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function PatientDashboardShell({ children, assistant }) {
  const { userProfile } = useAuth();

  return (
    <main className="min-h-screen bg-[#fbf9ff] text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200/70 bg-white/92 px-4 py-7 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 lg:block">
        <Link to="/dashboard" className="flex items-center gap-3 px-2">
          <span className="grid h-12 w-12 place-items-center rounded-3xl bg-gradient-to-br from-fuchsia-400 to-violet-600 text-white shadow-lg">
            <HeartPulse size={24} />
          </span>
          <span>
            <span className="block text-2xl font-extrabold text-health-purple">SheCare AI</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Women&apos;s Health Companion</span>
          </span>
        </Link>

        <nav className="mt-10 grid gap-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive && label === "Dashboard"
                    ? "bg-health-lavender text-health-purple"
                    : "text-slate-600 hover:bg-health-lavender/70 hover:text-health-purple dark:text-slate-300 dark:hover:bg-white/10"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-7 left-4 right-4 rounded-3xl bg-health-lavender p-5 dark:bg-white/10">
          <p className="font-bold text-health-purple dark:text-violet-200">Need immediate help?</p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Talk to our AI assistant anytime.</p>
          <Link
            to="/pcos-risk"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-health-purple px-4 py-3 text-sm font-bold text-white shadow-lg"
          >
            <Bot size={17} />
            Start Check
          </Link>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/70 bg-white/85 px-5 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-2 text-xl font-extrabold text-health-purple">
          <HeartPulse size={24} />
          SheCare AI
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/profile" className="grid h-10 w-10 place-items-center rounded-full bg-health-lavender text-health-purple">
            <UserCircle size={24} />
          </Link>
        </div>
      </header>

      <div className="lg:pl-72 xl:pr-80">
        <section className="mx-auto max-w-6xl px-5 pb-28 pt-8 lg:px-10 lg:pb-10">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-normal text-slate-950 dark:text-white md:text-4xl">
                Hello, <span className="text-health-purple">{userProfile?.displayName || "there"}</span>
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Let&apos;s take care of your health today!</p>
            </div>
            <div className="hidden items-center gap-5 lg:flex">
              <Link to="/profile" className="grid h-12 w-12 place-items-center rounded-full bg-health-lavender text-health-purple">
                <UserCircle size={28} />
              </Link>
            </div>
          </div>
          {children}
        </section>
      </div>

      <aside className="fixed inset-y-0 right-0 z-20 hidden w-80 border-l border-slate-200/70 bg-health-lavender/60 px-5 py-8 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 xl:block">
        {assistant}
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-3 py-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 lg:hidden">
        {[
          ["/dashboard", Home, "Home"],
          ["/history", History, "History"],
          ["/pcos-risk", Bot, "Risk Check"],
          ["/lab-reports", FileText, "Reports"],
          ["/profile", UserCircle, "Profile"],
        ].map(([to, Icon, label]) => (
          <Link key={label} to={to} className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold text-slate-500">
            <span className={`grid h-9 w-9 place-items-center rounded-2xl ${label === "Risk Check" ? "bg-health-purple text-white" : "text-slate-600 dark:text-slate-300"}`}>
              <Icon size={20} />
            </span>
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
