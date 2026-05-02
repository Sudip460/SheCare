import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Chat from "./pages/Chat.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import Profile from "./pages/Profile.jsx";
import LabReports from "./pages/LabReports.jsx";
import HistoryInsights from "./pages/HistoryInsights.jsx";
import Settings from "./pages/Settings.jsx";

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 dark:bg-slate-950">
      <div className="loader" />
    </div>
  );
}

function roleHome(userProfile) {
  return userProfile?.role === "doctor" ? "/doctor" : "/dashboard";
}

function HomeRoute() {
  const { user, userProfile, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to={roleHome(userProfile)} replace />;
  return <Landing />;
}

function ProtectedRoute({ children, role }) {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && userProfile?.role !== role) {
    return <Navigate to={roleHome(userProfile)} replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute role="patient">
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pcos-risk"
        element={
          <ProtectedRoute role="patient">
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="patient">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lab-reports"
        element={
          <ProtectedRoute role="patient">
            <LabReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute role="patient">
            <HistoryInsights />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute role="patient">
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor"
        element={
          <ProtectedRoute role="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
