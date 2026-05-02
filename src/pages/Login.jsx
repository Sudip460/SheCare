import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import DoctorSelector from "../components/DoctorSelector.jsx";
import InputField from "../components/InputField.jsx";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Login() {
  const { user, userProfile, login, register, getUserProfile, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get("role") === "doctor" ? "doctor" : "patient";
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [wantsConsultancy, setWantsConsultancy] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to={userProfile?.role === "doctor" ? "/doctor" : "/chat"} replace />;

  const isDoctorLogin = requestedRole === "doctor";
  const isRegisteringPatient = !isDoctorLogin && mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    if (isRegisteringPatient && wantsConsultancy && !selectedDoctor) {
      toast.error("Select a doctor or continue without doctor consultancy.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        const credential = await login(email, password);
        const profile = await getUserProfile(credential.user.uid);
        if (isDoctorLogin && profile?.role !== "doctor") {
          await logout();
          throw new Error("This login is only for manually approved doctors.");
        }
        navigate(profile?.role === "doctor" ? "/doctor" : "/chat");
      } else {
        await register(email, password, {
          displayName,
          wantsDoctorConsultancy: wantsConsultancy,
          doctorStatus: wantsConsultancy ? "pending" : "none",
          doctorId: wantsConsultancy ? selectedDoctor.id : null,
          doctorName: wantsConsultancy ? selectedDoctor.name : null,
        });
        navigate("/chat");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <Navbar />
      <section className="mx-auto grid max-w-6xl place-items-center px-5 py-8 sm:py-12">
        <Card className={`w-full ${isRegisteringPatient ? "max-w-4xl" : "max-w-md"}`}>
          <h1 className="text-3xl font-bold text-ink dark:text-slate-100">
            {isDoctorLogin ? "Doctor login" : mode === "login" ? "Patient login" : "Create patient account"}
          </h1>
          <p className="mt-3 text-muted dark:text-slate-300">
            {isDoctorLogin
              ? "Doctor accounts are created by the SheCare team. Use the approved email and password."
              : "Patients are assigned to a doctor before starting health assessments."}
          </p>
          <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
            {isRegisteringPatient && (
              <InputField
                label="Full name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required
              />
            )}
            <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="rounded-full p-1 text-slate-500 transition hover:text-health-purple focus:outline-none focus-visible:ring-2 focus-visible:ring-health-sky dark:text-slate-400 dark:hover:text-violet-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              required
            />
            {isRegisteringPatient && (
              <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/10">
                <p className="font-bold text-ink dark:text-slate-100">Do you want doctor consultancy?</p>
                <p className="mt-1 text-sm leading-6 text-muted dark:text-slate-400">
                  You can request a doctor now, or continue with the self-guided assessment.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setWantsConsultancy(true)}
                    className={`rounded-2xl border p-4 text-left font-semibold transition ${
                      wantsConsultancy
                        ? "border-health-sky bg-health-blue text-ink dark:bg-blue-500/15 dark:text-slate-100"
                        : "border-slate-200 bg-white/80 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-300"
                    }`}
                  >
                    Yes, request a doctor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWantsConsultancy(false);
                      setSelectedDoctor(null);
                    }}
                    className={`rounded-2xl border p-4 text-left font-semibold transition ${
                      !wantsConsultancy
                        ? "border-health-sky bg-health-blue text-ink dark:bg-blue-500/15 dark:text-slate-100"
                        : "border-slate-200 bg-white/80 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-300"
                    }`}
                  >
                    No, continue without doctor
                  </button>
                </div>
              </div>
            )}
            {isRegisteringPatient && wantsConsultancy && (
              <DoctorSelector selectedDoctor={selectedDoctor} onSelect={setSelectedDoctor} />
            )}
            <Button type="submit" disabled={submitting} className="mt-2 w-full">
              {submitting ? "Please wait..." : mode === "login" ? "Login" : "Register and continue"}
            </Button>
          </form>
          {!isDoctorLogin && (
            <button
              type="button"
              className="mt-5 text-sm font-semibold text-slate-600 underline-offset-4 hover:underline dark:text-slate-300"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "New patient? Register" : "Already have an account? Login"}
            </button>
          )}
        </Card>
      </section>
    </main>
  );
}
