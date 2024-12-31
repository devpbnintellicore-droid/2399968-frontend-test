import { useState, useEffect } from "react";
import api from "./api/axios";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import DeviceRestriction from "./components/DeviceRestriction";

import RoleGuard from "./components/RoleGuard";

import DashboardPage from "./pages/dashboard/DashboardPage";
import RecipePage from "./pages/recipes/RecipePage";
import QualityPage from "./pages/quality/QualityPage";
import QuestionBuilderPage from "./pages/quality/QuestionBuilderPage";
import AIPage from "./pages/ai/AIPage";
import CRAPage from "./pages/cra/CRAPage";
import AllRecipesPage from "./pages/recipes/AllRecipesPage";
import ReviewsPage from "./pages/quality/ReviewsPage";
import RoleManagementPage from "./pages/roles/RoleManagementPage";
import AuditLogsPage from "./pages/audit/AuditLogsPage";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";

function AppShell({ onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isAuthed = localStorage.getItem("ck_auth") === "1";
  const role = localStorage.getItem("ck_role");

  const sidebarWidth = collapsed ? 64 : 220;

  if (!isAuthed || !role) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Background Polling for status checks (Every 5 seconds)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await api.get("/auth/check-status");
      } catch (err) {
        // Interceptor in axios.js will handle 403/401 and redirect to login
        console.warn("Session check failed, possible deactivation.");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const roleHome = "/";

  return (
    <>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onLogout={onLogout}
      />

      <Navbar
        sidebarWidth={sidebarWidth}
        collapsed={collapsed}
        setIsMobileOpen={setIsMobileOpen}
        onLogout={onLogout}
      />

      <main
        className={`transition-[margin-left] duration-200 ease-out min-h-[calc(100vh-52px)] p-3 md:p-4 lg:p-5 mt-[52px] bg-[var(--app-bg)] ${
          collapsed ? "md:ml-[60px]" : "md:ml-[220px]"
        }`}
      >
        <Routes>
          <Route
            path="/"
            element={
              <RoleGuard allowedRoles={["Manager", "Chef", "Reviewer", "CRA"]}>
                <DashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="/recipes"
            element={
              <RoleGuard allowedRoles={["Chef"]}>
                <RecipePage />
              </RoleGuard>
            }
          />
          <Route
            path="/quality"
            element={
              <RoleGuard allowedRoles={["Reviewer"]}>
                <QualityPage />
              </RoleGuard>
            }
          />
          <Route
            path="/reviews"
            element={
              <RoleGuard allowedRoles={["Manager", "Reviewer"]}>
                <ReviewsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/quality-builder"
            element={
              <RoleGuard allowedRoles={["Manager"]}>
                <QuestionBuilderPage />
              </RoleGuard>
            }
          />
          <Route
            path="/ai"
            element={
              <RoleGuard allowedRoles={["Manager", "CRA"]}>
                <AIPage />
              </RoleGuard>
            }
          />
          {/* <Route
            path="/cra"
            element={
              <RoleGuard allowedRoles={["CRA", "Manager"]}>
                <CRAPage />
              </RoleGuard>
            }
          /> */}
          <Route
            path="/all-recipes"
            element={
              <RoleGuard allowedRoles={["Chef", "Manager", "CRA"]}>
                <AllRecipesPage />
              </RoleGuard>
            }
          />
          <Route
            path="/role-management"
            element={
              <RoleGuard allowedRoles={["Manager"]}>
                <RoleManagementPage />
              </RoleGuard>
            }
          />
          {/* <Route
            path="/audit-logs"
            element={
              <RoleGuard allowedRoles={["Manager", "Chef", "Reviewer", "CRA"]}>
                <AuditLogsPage />
              </RoleGuard>
            }
          /> */}
          <Route path="*" element={<Navigate to={roleHome} replace />} />
        </Routes>
      </main>
    </>
  );
}

import { Toaster } from "react-hot-toast";

export default function App() {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("ck_auth");
    localStorage.removeItem("ck_auth_email");
    localStorage.removeItem("ck_role");
  };

  if (!isDesktop) {
    return <DeviceRestriction />;
  }

  return (
    <div className="bg-[var(--app-bg)] min-h-screen font-sans">
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/*" element={<AppShell onLogout={handleLogout} />} />
      </Routes>
    </div>
  );
}
