import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, ChevronDown, Lock, LogOut, Eye, EyeOff, Menu, X, Sun, Moon, Calendar, Clock } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const PAGE_META = {
  "/": { title: "Dashboard" },
  "/all-recipes": { title: "All Recipes" },
  "/recipes": { title: "Create Experiment" },
  "/reviews": { title: "Submissions" },
  "/quality": { title: "Review Recipe" },
  "/ai": { title: "AI Forecast" },
  "/quality-builder": { title: "Add Question" },
  "/role-management": { title: "Role Management" },
  // "/cra": { title: "Audit Log" },
  "/audit-logs": { title: "Audit Logs" },
};

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export default function Navbar({ collapsed, setIsMobileOpen, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const now = useClock();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef(null);

  const userEmail = localStorage.getItem("ck_auth_email") || "admin@kitchen.com";
  const role = localStorage.getItem("ck_role") || "Manager";
  const username = userEmail.split("@")[0];
  const initials = username.slice(0, 1).toUpperCase();
  const meta = PAGE_META[location.pathname] || { title: "Dashboard" };

  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric", timeZone: "America/Toronto" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/Toronto" });

  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <>
      <header className={`fixed top-0 right-0 h-[52px] z-[90] bg-[var(--topbar-bg)] border-b border-[var(--border)] flex items-center px-3 gap-2 transition-[left] duration-200 left-0 ${collapsed ? "md:left-[60px]" : "md:left-[220px]"}`}>
        {/* Mobile toggle */}
        <button onClick={() => setIsMobileOpen(true)} className="btn-icon md:hidden">
          <Menu size={15} />
        </button>

        {/* Page title */}
        <div className="flex-1 min-w-0">
          <span className="text-[15px] font-bold text-[var(--text)]">{meta.title}</span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Date pill */}
          <div className="topbar-pill hidden lg:flex gap-1.5">
            <Calendar size={12} className="text-[var(--accent)]" />
            <span className="text-[11px]">{dateStr}</span>
          </div>

          {/* Time pill */}
          <div className="topbar-pill hidden md:flex">
            <Clock size={12} className="text-[var(--accent)]" />
            <span className="font-mono text-[11px] font-semibold">{timeStr}</span>
          </div>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="btn-icon" title={isDark ? "Light mode" : "Dark mode"}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Role badge */}
          <div className="hidden sm:flex items-center px-2.5 py-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-[11px] font-semibold text-[var(--text-secondary)]">
            {role}
          </div>

          {/* User */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1.5 pl-1 pr-2 py-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                {initials}
              </div>
              <span className="text-[12px] font-semibold text-[var(--text)] hidden sm:block">{username}</span>
              <ChevronDown size={11} className={`text-[var(--muted)] transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-[var(--surface)] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-[var(--border)] py-1.5 z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-[var(--border)]">
                  <div className="text-[12px] font-semibold text-[var(--text)]">{username}</div>
                  <div className="text-[11px] text-[var(--muted)] truncate">{userEmail}</div>
                </div>
                {role !== "CRA" && (
                  <button onClick={() => { setShowDropdown(false); setShowChangePassword(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors">
                    <Lock size={12} className="text-[var(--muted)]" /> Change Password
                  </button>
                )}
                <button onClick={() => { setShowDropdown(false); setShowLogoutConfirm(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[var(--danger)] hover:bg-[var(--danger-glow)] transition-colors">
                  <LogOut size={12} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)}>
          <div className="bg-[var(--surface)] rounded-xl shadow-2xl border border-[var(--border)] p-6 w-full max-w-sm mx-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-11 h-11 rounded-full bg-[var(--danger-glow)] flex items-center justify-center mx-auto mb-3">
                <LogOut size={20} className="text-[var(--danger)]" />
              </div>
              <h3 className="text-[14px] font-bold text-[var(--text)] mb-1">Confirm Sign Out</h3>
              <p className="text-[12px] text-[var(--muted)] mb-5">You'll need to sign in again to access the dashboard.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowLogoutConfirm(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
                <button onClick={() => { setShowLogoutConfirm(false); onLogout(); navigate("/login"); }}
                  className="btn-primary flex-1 justify-center" style={{ background: "var(--danger)" }}>Sign Out</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.newPass.length < 6) { setError("New password must be at least 6 characters."); return; }
    if (form.newPass !== form.confirm) { setError("Passwords do not match."); return; }
    setIsLoading(true);
    try {
      const { changePassword } = await import("../../api/staffApi");
      await changePassword(form.current, form.newPass, form.confirm);
      setSuccess(true);
      setTimeout(() => onClose(), 1800);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update password.");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--surface)] rounded-xl shadow-2xl border border-[var(--border)] p-6 w-full max-w-md mx-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-bold text-[var(--text)]">Change Password</h3>
          <button onClick={onClose} className="btn-icon"><X size={14} /></button>
        </div>
        {success ? (
          <div className="text-center py-6">
            <div className="w-10 h-10 rounded-full bg-[var(--success-glow)] flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[12px] font-semibold text-[var(--success)]">Password updated!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {[{ key: "current", label: "Current Password", show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
              { key: "newPass", label: "New Password", show: showNew, toggle: () => setShowNew(!showNew) }
            ].map(({ key, label, show, toggle }) => (
              <div key={key}>
                <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">{label}</label>
                <div className="relative">
                  <input type={show ? "text" : "password"} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="input-field pr-9" required />
                  <button type="button" onClick={toggle} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                    {show ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            ))}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">Confirm Password</label>
              <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="input-field" required />
            </div>
            {error && <p className="text-[11px] text-[var(--danger)]">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose} disabled={isLoading} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button type="submit" disabled={isLoading} className="btn-primary flex-1 justify-center">{isLoading ? "Updating..." : "Update"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
