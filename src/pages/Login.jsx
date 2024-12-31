import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChefHat,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  BarChart3,
  ShieldCheck,
  User,
  ClipboardCheck,
} from "lucide-react";
import { loginStaff } from "../api/staffApi";

const ROLES = ["Chef", "Reviewer", "Manager", "CRA"];

const FEATURES = [
  {
    icon: Zap,
    title: "AI-Powered Analysis",
    desc: "Predict quality scores and detect batch deviations automatically.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    desc: "Live experiment health, sensory trends, and chef KPIs.",
  },
  {
    icon: ShieldCheck,
    title: "CRA-Ready Compliance",
    desc: "Immutable audit trail, export-ready for regulatory review.",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [roleOpen, setRoleOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorType = params.get("error");
    // Query errors can be left behind by an older frontend bundle. Clear them
    // without showing a misleading inactive-account message.
    if (errorType) {
      setError("");
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    if (!role) {
      setError("Please select a role.");
      return;
    }
    try {
      setError("");
      setLoading(true);
      const data = await loginStaff(email.trim(), password.trim(), role);
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("ck_auth", "1");
      localStorage.setItem("ck_auth_email", email.trim());
      localStorage.setItem("ck_role", role);
      navigate("/", { replace: true });
    } catch (err) {
      const apiMessage = err?.response?.data?.message;
      if (apiMessage === "Staff not found") {
        setError("No staff account was found for this email address.");
      } else if (apiMessage === "Incorrect role selected for this account") {
        setError("The selected role does not match this account.");
      } else if (apiMessage === "Incorrect password") {
        setError("Incorrect password.");
      } else {
        setError(apiMessage || err?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0d1117]">
      {/* ══════════ LEFT HERO PANEL ══════════ */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden flex-col">
        {/* bg image */}
        <img
          src="https://images.unsplash.com/photo-1581349485608-9469926a8e5e?w=1400&q=80"
          alt="Kitchen"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/45 to-black/68" />

        {/* content */}
        <div className="relative z-10 flex flex-col h-full p-10">
          {/* logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center shrink-0">
              <ChefHat size={20} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">
                Urban-Tadka.
              </div>
              <div className="text-white/45 text-[10px] uppercase tracking-widest">
                By PBN Intellicore
              </div>
            </div>
          </div>

          {/* hero text */}
          <div className="mt-auto pb-2">
            <h1 className="text-white font-black leading-[1.1] mb-4 text-[clamp(26px,3vw,44px)]">
              Where kitchen quality
              <br />
              meets{" "}
              <span className="text-[var(--accent-light)]">intelligent</span>
              <br />
              <span className="text-[var(--accent-light)]">operations.</span>
            </h1>
            <p className="text-white/55 text-[13px] leading-relaxed max-w-md mb-9">
              A premium AI analytics suite for Ontario cloud kitchens —
              experiments, sensory audits, quality scores, and compliance,
              unified in one elegant workspace.
            </p>

            {/* features */}
            <div className="flex flex-col gap-5">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-glow)] border border-[var(--accent-light)]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={14} className="text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-[13px]">
                      {title}
                    </div>
                    <div className="text-white/40 text-[11px] leading-relaxed">
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ RIGHT FORM PANEL ══════════ */}
      <div className="flex-1 flex flex-col justify-between p-8 lg:p-12 bg-[#13161e]">
        {/* mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center shrink-0">
            <ChefHat size={17} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-[13px]">
              Urban-Tadka.
            </div>
            <div className="text-white/35 text-[10px] uppercase tracking-widest">
              By PBN Intellicore
            </div>
          </div>
        </div>

        {/* form area */}
        <div className="flex-1 flex flex-col justify-center max-w-[400px] w-full mx-auto">
          {/* heading */}
          <div className="mb-8">
            <h2 className="text-white font-black text-[28px] tracking-tight mb-1.5">
              Welcome back
            </h2>
            <p className="text-[#6b7a99] text-[13px]">
              Sign in to your enterprise workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block text-[#6b7a99] text-[10px] font-bold uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a99] pointer-events-none"
                />
                <input
                  type="email"
                  value={email}
                  required
                  autoComplete="email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@ontario.ca"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#1c2030] border border-[#252d40] text-[#e8edf5] text-[13px] font-medium outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[#6b7a99]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[#6b7a99] text-[10px] font-bold uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a99] pointer-events-none"
                />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  required
                  autoComplete="current-password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-[#1c2030] border border-[#252d40] text-[#e8edf5] text-[13px] font-medium outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[#6b7a99]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a99] hover:text-[#a0aabf] transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div className="relative">
              <label className="block text-[#6b7a99] text-[10px] font-bold uppercase tracking-widest mb-1.5">
                Role <span className="text-[var(--danger)]">*</span>
              </label>
              <div
                onClick={() => setRoleOpen(!roleOpen)}
                className={`relative flex items-center justify-between pl-9 pr-4 py-2.5 rounded-lg bg-[#1c2030] border text-[13px] font-medium cursor-pointer transition-colors ${roleOpen ? "border-[var(--accent)]" : "border-[#252d40] hover:border-[#3a4258]"}`}
              >
                <User
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a99]"
                />
                <span className={role ? "text-[#e8edf5]" : "text-[#6b7a99]"}>
                  {role || "Select role"}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`text-[#6b7a99] transition-transform shrink-0 ${roleOpen ? "rotate-180" : ""}`}
                >
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {roleOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setRoleOpen(false)}
                  />
                  <div className="absolute left-0 right-0 top-full mt-1 bg-[#1c2030] border border-[#252d40] rounded-lg overflow-hidden z-20 shadow-[0_8px_24px_rgba(0,0,0,.4)]">
                    {ROLES.map((r) => (
                      <div
                        key={r}
                        onClick={() => {
                          setRole(r);
                          setRoleOpen(false);
                        }}
                        className={`flex items-center justify-between px-4 py-2.5 text-[13px] font-medium cursor-pointer transition-colors ${role === r ? "bg-[var(--accent)] text-white" : "text-[#e8edf5] hover:bg-[#252d40]"}`}
                      >
                        {r}
                        {role === r && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
              <div
                onClick={() => setRemember(!remember)}
                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all border-2 ${remember ? "bg-[var(--accent)] border-[var(--accent)]" : "bg-transparent border-[#252d40]"}`}
              >
                {remember && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path
                      d="M1 3.5L3.5 6L8 1"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-[#a0aabf] text-[12px] font-medium">
                Remember me
              </span>
            </label>

            {/* Error */}
            {error && (
              <div className="px-3 py-2.5 rounded-lg bg-[var(--danger-glow)] border border-[var(--danger)]/25 text-[var(--danger)] text-[12px] font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-dark)] text-white font-bold text-[13px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  {" "}
                  Sign in to workspace <ArrowRight size={15} />{" "}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[#3a4258] text-[11px]">
            © {new Date().getFullYear()} Urban-Tadka. · Powered by PBN
            Intellicore
          </p>
        </div>
      </div>
    </div>
  );
}
