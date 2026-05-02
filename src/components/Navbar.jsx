import { HeartPulse, LogOut, Moon, Sun, UserCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { useTheme } from "../hooks/useTheme.jsx";
import Button from "./Button.jsx";

export default function Navbar() {
  const { user, userProfile, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const homePath = user ? (userProfile?.role === "doctor" ? "/doctor" : "/dashboard") : "/";

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6">
      <Link to={homePath} className="inline-flex min-w-0 items-center gap-3 text-lg font-bold text-ink dark:text-slate-100">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white shadow-soft dark:bg-white/10">
          <HeartPulse size={22} className="text-health-rose" />
        </span>
        <span className="truncate">SheCare AI</span>
      </Link>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {user && userProfile?.role === "patient" && (
          <Link className="hidden text-sm font-bold text-slate-600 dark:text-slate-300 md:inline-flex" to="/dashboard">
            Dashboard
          </Link>
        )}
        {user && userProfile?.role === "doctor" && (
          <Link className="hidden text-sm font-bold text-slate-600 dark:text-slate-300 md:inline-flex" to="/doctor">
            Doctor desk
          </Link>
        )}
        <button
          type="button"
          onClick={toggleTheme}
          className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white/80 text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-health-sky dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:border-white/20"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Light mode" : "Dark mode"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {user && (
          <Link
            to="/profile"
            className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white/80 text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-health-sky dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:border-white/20"
            aria-label="Open profile"
            title="Profile"
          >
            <UserCircle size={21} />
          </Link>
        )}
        {user ? (
          <Button variant="secondary" onClick={handleLogout} className="px-4">
            <LogOut size={17} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        ) : (
          <Link to="/login">
            <Button variant="secondary">Login</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
