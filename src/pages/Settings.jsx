import { Moon, Settings as SettingsIcon, Sun } from "lucide-react";
import PatientDashboardShell from "../components/PatientDashboardShell.jsx";
import SheCareAssistant from "../components/SheCareAssistant.jsx";
import Button from "../components/Button.jsx";
import { useTheme } from "../hooks/useTheme.jsx";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <PatientDashboardShell assistant={<SheCareAssistant sessions={[]} />}>
      <section className="shecare-card rounded-3xl p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-health-lavender text-health-purple">
            <SettingsIcon />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">Settings</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Control your SheCare experience.</p>
          </div>
        </div>

        <div className="mt-7 rounded-3xl border border-slate-200 bg-white/75 p-5 dark:border-white/10 dark:bg-white/10">
          <h3 className="font-extrabold text-slate-950 dark:text-white">Theme</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Choose the display mode that feels comfortable.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant={theme === "light" ? "primary" : "secondary"} onClick={() => setTheme("light")}>
              <Sun size={17} />
              Light
            </Button>
            <Button variant={theme === "dark" ? "primary" : "secondary"} onClick={() => setTheme("dark")}>
              <Moon size={17} />
              Dark
            </Button>
          </div>
        </div>
      </section>
    </PatientDashboardShell>
  );
}
