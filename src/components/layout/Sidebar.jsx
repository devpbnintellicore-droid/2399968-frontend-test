import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ChefHat,
  ShieldCheck,
  Brain,
  FileText,
  LogOut,
  Users,
  X,
  Type,
} from "lucide-react";

// ── Dark sidebar tokens (always dark, theme-independent) ──
const S = {
  bg: "#161B27",
  border: "#252D40",
  text: "#E8EDF5",
  muted: "#6B7A99",
  hover: "#1E2438",
  activeBg: "rgba(41,71,147,0.18)",
  activeText: "#6B8FD4",
  activeBorder: "#294793",
  sectionLabel: "#4A5568",
};

const navGroups = [
  {
    label: "Main",
    items: [
      {
        to: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ["Manager", "Chef", "Reviewer", "CRA"],
      },
      {
        to: "/all-recipes",
        label: "All Recipes",
        icon: ChefHat,
        roles: ["Chef", "Manager", "CRA"],
      },
      {
        to: "/recipes",
        label: "Create Experiment",
        icon: ChefHat,
        roles: ["Chef"],
      },
      {
        to: "/reviews",
        label: "Submissions",
        icon: ShieldCheck,
        roles: ["Manager", "Reviewer"],
      },
      {
        to: "/quality",
        label: "Review Recipe",
        icon: ShieldCheck,
        roles: ["Reviewer"],
      },
    ],
  },
  {
    label: "Manager",
    items: [
      {
        to: "/quality-builder",
        label: "Question Builder",
        icon: Type,
        roles: ["Manager"],
      },
      {
        to: "/role-management",
        label: "Role Management",
        icon: Users,
        roles: ["Manager"],
      },
    ],
  },
  {
    label: "Intelligence",
    items: [
      {
        to: "/ai",
        label: "AI Forecast",
        icon: Brain,
        roles: ["Manager", "CRA"],
      },
      // {
      //   to: "/cra",
      //   label: "Audit Log",
      //   icon: FileText,
      //   roles: ["CRA", "Manager"],
      // },
    ],
  },
];

export default function Sidebar({
  collapsed,
  setCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onLogout,
}) {
  const location = useLocation();
  const role = localStorage.getItem("ck_role");
  const userEmail =
    localStorage.getItem("ck_auth_email") || "admin@kitchen.com";
  const username = userEmail.split("@")[0];
  const initials = username.slice(0, 1).toUpperCase();

  const filteredGroups = navGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => item.roles?.includes(role)),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-[120] h-screen flex flex-col overflow-x-hidden transition-all duration-200
          ${collapsed ? "md:w-[60px]" : "md:w-[220px]"}
          ${isMobileOpen ? "w-[220px] translate-x-0" : "w-[220px] md:translate-x-0 -translate-x-full"}`}
        style={{ background: S.bg, borderRight: `1px solid ${S.border}` }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-3 min-h-[80px] shrink-0"
          style={{ borderBottom: `1px solid ${S.border}` }}
        >
          <div className="w-8 h-8 min-w-[32px] rounded-lg bg-[var(--accent)] flex items-center justify-center shrink-0">
            <ChefHat size={16} color="#fff" />
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <div
                className="text-[12px] font-bold truncate leading-tight"
                style={{ color: S.text }}
              >
                Urban-Tadka
              </div>
              <div className="text-[10px]" style={{ color: S.muted }}>
                By PBN Intellicore
              </div>
            </div>
          )}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden ml-auto shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{
              color: S.muted,
              background: "transparent",
              border: `1px solid ${S.border}`,
            }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 scrollbar-hide">
          {filteredGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <div
                  className="text-[10px] font-bold uppercase tracking-[0.12em] px-3 pt-4 pb-1.5"
                  style={{ color: S.sectionLabel }}
                >
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const isActive =
                  location.pathname === item.to ||
                  (item.to !== "/" &&
                    location.pathname.startsWith(item.to + "/"));
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileOpen(false)}
                    className="block no-underline mb-0.5"
                    title={collapsed ? item.label : undefined}
                  >
                    <div
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all relative text-[13px] font-medium ${collapsed ? "justify-center" : ""}`}
                      style={{
                        background: isActive ? S.activeBg : "transparent",
                        color: isActive ? S.activeText : S.muted,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = S.hover;
                          e.currentTarget.style.color = S.text;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = S.muted;
                        }
                      }}
                    >
                      {isActive && (
                        <span
                          className="absolute left-0 top-[20%] h-[60%] w-[3px] rounded-r-sm"
                          style={{ background: S.activeBorder }}
                        />
                      )}
                      <Icon size={15} className="shrink-0" />
                      {!collapsed && (
                        <span className="flex-1 whitespace-nowrap">
                          {item.label}
                        </span>
                      )}
                    </div>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div
          className="p-3 shrink-0"
          style={{ borderTop: `1px solid ${S.border}` }}
        >
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                {initials}
              </div>
              <div className="flex-1 overflow-hidden">
                <div
                  className="text-[11px] font-semibold truncate"
                  style={{ color: S.text }}
                >
                  {username}
                </div>
                <div
                  className="text-[10px] uppercase tracking-wide"
                  style={{ color: S.muted }}
                >
                  {role}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-[11px] font-bold text-white">
                {initials}
              </div>
            </div>
          )}
          {/* {!collapsed && (
            <button
              onClick={onLogout}
              className="mt-2 w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] transition-all"
              style={{ color: S.muted, background: "transparent" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#F04438"; e.currentTarget.style.background = "rgba(240,68,56,0.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = S.muted; e.currentTarget.style.background = "transparent"; }}
            >
              <LogOut size={13} />
              Sign out
            </button>
          )} */}
        </div>
      </aside>
    </>
  );
}
