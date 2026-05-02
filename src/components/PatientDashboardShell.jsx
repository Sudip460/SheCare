import { useState } from "react";
import {
  Bot,
  ClipboardCheck,
  FileText,
  HeartPulse,
  History,
  Home,
  LogOut,
  Minimize2,
  Settings,
  UserCircle,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import Button from "./Button.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/pcos-risk", label: "PCOS Risk Check", icon: ClipboardCheck },
  { to: "/lab-reports", label: "Lab Reports", icon: FileText },
  { to: "/history", label: "History & Insights", icon: History },
  { to: "/profile", label: "Profile", icon: UserCircle },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function PatientDashboardShell({ children, assistant }) {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isAssistantOpen, setIsAssistantOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1280 : true
  );

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbf9ff] text-slate-950 dark:bg-slate-950 dark:text-slate-100">
        <aside className="fixed inset-y-0 left-0 z-30 hidden h-screen w-72 flex-col border-r border-slate-200/70 bg-white/92 px-4 py-7 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 lg:flex">
        <Link to="/dashboard" className="flex items-center gap-3 px-2">
          <span className="grid h-12 w-12 place-items-center rounded-3xl bg-gradient-to-br from-fuchsia-400 to-violet-600 text-white shadow-lg">
            <HeartPulse size={24} />
          </span>
          <span>
            <span className="block text-2xl font-extrabold text-health-purple">SheCare AI</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Women&apos;s Health Companion</span>
          </span>
        </Link>

        <nav className="mt-10 grid flex-1 gap-2 overflow-y-auto pr-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
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

        <div className="mt-5 border-t border-slate-200/80 pt-5 dark:border-white/10">
          <Button variant="secondary" onClick={handleLogout} className="w-full justify-center">
            <LogOut size={17} />
            Logout
          </Button>
        </div>
        </aside>

        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white/85 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 sm:px-5 lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-2 text-xl font-extrabold text-health-purple">
          <HeartPulse size={24} />
          SheCare AI
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/profile" className="grid h-10 w-10 place-items-center rounded-full bg-health-lavender text-health-purple">
            <UserCircle size={24} />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
        </header>

        <div className={`min-w-0 lg:pl-72 ${assistant && isAssistantOpen ? "xl:pr-[25rem]" : ""}`}>
          <section className="mx-auto min-w-0 max-w-6xl px-4 pb-28 pt-6 sm:px-5 lg:px-8 lg:pb-10 lg:pt-8">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold tracking-normal text-slate-950 dark:text-white md:text-4xl">
                Hello, <span className="text-health-purple">{userProfile?.displayName || "there"}</span>
              </h1>
              <p className="mt-2 break-words text-slate-600 dark:text-slate-300">Let&apos;s take care of your health today!</p>
            </div>
            <div className="hidden items-center gap-5 lg:flex">
              <Link to="/profile" className="grid h-12 w-12 place-items-center rounded-full bg-health-lavender text-health-purple">
                <UserCircle size={28} />
              </Link>
            </div>
          </div>
          {typeof children === "function" ? children({ isAssistantOpen }) : children}
          </section>
        </div>

        {assistant && isAssistantOpen && (
          <aside className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm sm:right-5 sm:w-[23rem] xl:bottom-6 xl:right-6 xl:w-[24rem]">
            <div className="glass-card relative h-[32rem] max-h-[calc(100vh-7.5rem)] overflow-hidden rounded-[2rem] p-5 xl:h-[calc(100vh-3rem)] xl:max-h-[44rem]">
            <button
              type="button"
              onClick={() => setIsAssistantOpen(false)}
              className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-slate-100/90 text-slate-600 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
              aria-label="Minimize chatbot"
              title="Minimize chatbot"
            >
              <Minimize2 size={18} />
            </button>
            <div className="h-full pt-8">{assistant}</div>
            </div>
          </aside>
        )}

        {assistant && !isAssistantOpen && (
          <button
            type="button"
            onClick={() => setIsAssistantOpen(true)}
            className="fixed bottom-24 right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-health-purple text-white shadow-[0_18px_40px_rgba(109,40,217,0.35)] transition hover:-translate-y-1 hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-health-sky sm:bottom-24 sm:right-5 xl:bottom-6 xl:right-6"
            aria-label="Open chatbot"
            title="Open chatbot"
          >
            <Bot size={24} />
          </button>
        )}

        <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 lg:hidden">
        {[
          ["/dashboard", Home, "Home"],
          ["/history", History, "History"],
          ["/pcos-risk", Bot, "Risk Check"],
          ["/lab-reports", FileText, "Reports"],
          ["/profile", UserCircle, "Profile"],
        ].map(([to, Icon, label]) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold ${
                isActive ? "text-health-purple" : "text-slate-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`grid h-9 w-9 place-items-center rounded-2xl ${
                    isActive ? "bg-health-purple text-white" : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Icon size={20} />
                </span>
                <span className="text-center leading-tight">{label}</span>
              </>
            )}
          </NavLink>
        ))}
        </nav>
      </main>
  );
}
