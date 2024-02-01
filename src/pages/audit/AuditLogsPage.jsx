import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  ChefHat,
  ShieldCheck,
  ClipboardCheck,
  Crown,
  Activity,
  Calendar,
  Clock,
  FlaskConical,
  Users,
  Star,
  HelpCircle,
  Package,
  FileText,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import { getAuditLogs } from "../../api/auditApi";

// ─── Config maps ──────────────────────────────────────────────────────────────

const ENTITY_CONFIG = {
  Experiment: {
    icon: <FlaskConical size={12} />,
    classes: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dot: "bg-blue-400",
  },
  Review: {
    icon: <Star size={12} />,
    classes: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    dot: "bg-purple-400",
  },
  Staff: {
    icon: <Users size={12} />,
    classes: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    dot: "bg-orange-400",
  },
  Question: {
    icon: <HelpCircle size={12} />,
    classes: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    dot: "bg-teal-400",
  },
  Ingredient: {
    icon: <Package size={12} />,
    classes: "bg-green-500/10 text-green-400 border-green-500/20",
    dot: "bg-green-400",
  },
};

const ACTION_CONFIG = {
  SUBMITTED: {
    label: "Submitted",
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  COMPLETED: {
    label: "Completed",
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  ANSWERED: {
    label: "Answered",
    classes: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  CREATED: {
    label: "Created",
    classes: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  UPDATED: {
    label: "Updated",
    classes: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
  DELETED: {
    label: "Deleted",
    classes: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
  ADDED: {
    label: "Added",
    classes: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
};

const ROLE_ICON = {
  Chef: <ChefHat size={13} />,
  Reviewer: <ShieldCheck size={13} />,
  CRA: <ClipboardCheck size={13} />,
  Manager: <Crown size={13} />,
  System: <Activity size={13} />,
};

const ROLE_COLORS = {
  Chef: "text-orange-400",
  Reviewer: "text-indigo-400",
  CRA: "text-emerald-400",
  Manager: "text-rose-400",
  System: "text-slate-400",
};

const ALL_ROLES = ["All", "Manager", "Chef", "Reviewer", "CRA"];
const ALL_ENTITIES = [
  "All",
  "Experiment",
  "Review",
  "Staff",
  "Question",
  "Ingredient",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimestamp(iso) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-CA"),
    time: d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EntityBadge({ entity }) {
  const cfg = ENTITY_CONFIG[entity] || {};
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${cfg.classes}`}
    >
      {cfg.icon}
      {entity}
    </span>
  );
}

function ActionBadge({ action }) {
  const cfg = ACTION_CONFIG[action] || {
    label: action,
    classes: "bg-[var(--border)] text-[var(--muted)] border-[var(--border)]",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  );
}

function FilterPill({ label, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
        active
          ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30 scale-105"
          : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatPill({ icon, label, count, color }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
      <div className={`${color}`}>{icon}</div>
      <div>
        <div className="text-lg font-black text-[var(--text)] leading-none">
          {count}
        </div>
        <div className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest mt-0.5">
          {label}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [entityFilter, setEntityFilter] = useState("All");
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async (role, entity, searchVal) => {
    setLoading(true);
    try {
      const params = {};
      if (role !== "All") params.role = role;
      if (entity !== "All") params.entity = entity;
      if (searchVal?.trim()) params.search = searchVal.trim();

      const res = await getAuditLogs(params);
      const logsData =
        res?.data?.data || (Array.isArray(res?.data) ? res.data : []);
      const metaData = res?.data?.meta || {};

      setLogs(logsData);
      setTotal(metaData.total ?? logsData.length);
    } catch {
      // keep showing whatever is already rendered
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced re-fetch on filter change
  useEffect(() => {
    const t = setTimeout(
      () => fetchLogs(roleFilter, entityFilter, search),
      300,
    );
    return () => clearTimeout(t);
  }, [roleFilter, entityFilter, search, fetchLogs]);

  const filtered = logs;

  // Stats derived from full unfiltered count — show entity breakdown from current result
  const stats = useMemo(
    () => ({
      total: total,
      experiments: logs.filter((l) => l.entity === "Experiment").length,
      reviews: logs.filter((l) => l.entity === "Review").length,
      staff: logs.filter((l) => l.entity === "Staff").length,
      questions: logs.filter((l) => l.entity === "Question").length,
      ingredients: logs.filter((l) => l.entity === "Ingredient").length,
    }),
    [logs, total],
  );

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <PageHeader
        title="Audit Logs"
        subtitle="Complete chronological record of every system operation across all roles."
        actions={[
          <div
            key="live"
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary-glow)] rounded-2xl border border-[var(--primary)]/20 text-[11px] font-black text-[var(--primary)] uppercase tracking-widest"
          >
            <Activity size={13} strokeWidth={3} className="animate-pulse" />
            Live
          </div>,
        ]}
      />

      {/* ── Stats ── */}
      <div className="flex flex-wrap gap-3">
        <StatPill
          icon={<FileText size={16} />}
          label="Total Logs"
          count={stats.total}
          color="text-[var(--muted)]"
        />
        <StatPill
          icon={<FlaskConical size={16} />}
          label="Experiments"
          count={stats.experiments}
          color="text-blue-400"
        />
        <StatPill
          icon={<Star size={16} />}
          label="Reviews"
          count={stats.reviews}
          color="text-purple-400"
        />
        <StatPill
          icon={<Users size={16} />}
          label="Staff"
          count={stats.staff}
          color="text-orange-400"
        />
        <StatPill
          icon={<HelpCircle size={16} />}
          label="Questions"
          count={stats.questions}
          color="text-teal-400"
        />
        <StatPill
          icon={<Package size={16} />}
          label="Ingredients"
          count={stats.ingredients}
          color="text-green-400"
        />
      </div>

      {/* ── Filters ── */}
      <Card className="p-4 space-y-4">
        {/* Search */}
        <div className="relative group">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--primary)] transition-colors"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, entity, action, or description..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-sm font-bold text-[var(--text)] focus:ring-4 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] outline-none transition-all placeholder:opacity-40"
          />
        </div>

        {/* Role + Entity filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Role pills */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest shrink-0">
              Role
            </span>
            <div className="flex flex-wrap gap-1.5 p-1.5 bg-[var(--bg)] rounded-2xl border border-[var(--border)]">
              {ALL_ROLES.map((r) => (
                <FilterPill
                  key={r}
                  label={r}
                  active={roleFilter === r}
                  onClick={() => setRoleFilter(r)}
                  icon={
                    r !== "All" ? (
                      <span className={ROLE_COLORS[r]}>{ROLE_ICON[r]}</span>
                    ) : null
                  }
                />
              ))}
            </div>
          </div>

          <div className="hidden sm:block w-px bg-[var(--border)]" />

          {/* Entity pills */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest shrink-0">
              Entity
            </span>
            <div className="flex flex-wrap gap-1.5 p-1.5 bg-[var(--bg)] rounded-2xl border border-[var(--border)]">
              {ALL_ENTITIES.map((e) => (
                <FilterPill
                  key={e}
                  label={e}
                  active={entityFilter === e}
                  onClick={() => setEntityFilter(e)}
                  icon={
                    e !== "All" ? (
                      <span
                        className={ENTITY_CONFIG[e]?.classes
                          .split(" ")
                          .find((c) => c.startsWith("text-"))}
                      >
                        {ENTITY_CONFIG[e]?.icon}
                      </span>
                    ) : null
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Results count ── */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-black text-[var(--muted)] uppercase tracking-widest flex items-center gap-2">
          {loading && (
            <Activity
              size={11}
              className="animate-spin text-[var(--primary)]"
            />
          )}
          Showing {filtered.length} of {total} logs
        </span>
        {(roleFilter !== "All" || entityFilter !== "All" || search) && (
          <button
            onClick={() => {
              setRoleFilter("All");
              setEntityFilter("All");
              setSearch("");
            }}
            className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <Card
        noPad
        className="overflow-hidden border-[var(--border)] shadow-2xl shadow-black/5 rounded-[32px]"
      >
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]/60">
                {[
                  "Identity",
                  "Context",
                  "Authority",
                  "Operation",
                  "Summary",
                  "Time Dimension",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-7 py-5 text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/40">
              {filtered.map((log) => {
                const { date, time } = formatTimestamp(log.createdAt);
                const entityCfg = ENTITY_CONFIG[log.entity] || {};
                return (
                  <tr
                    key={log.id}
                    className="group hover:bg-[var(--primary-glow)] transition-all duration-300"
                  >
                    {/* Identity */}
                    <td className="px-7 py-5">
                      <span className="font-mono text-[11px] font-black text-[var(--primary)] opacity-70">
                        LOG-{String(log.id).padStart(3, "0")}
                      </span>
                    </td>

                    {/* Context (Entity) */}
                    <td className="px-7 py-5">
                      <div className="space-y-1.5">
                        <EntityBadge entity={log.entity} />
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)]">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${entityCfg.dot}`}
                          />
                          {log.entityLabel}
                        </div>
                      </div>
                    </td>

                    {/* Authority (User) */}
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[13px] font-black text-[var(--primary)] shrink-0 group-hover:bg-[var(--primary)] group-hover:text-white group-hover:scale-110 transition-all duration-300">
                          {log.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-black text-[var(--text)] tracking-tight leading-none">
                            {log.user.name}
                          </div>
                          <div
                            className={`flex items-center gap-1 mt-1.5 text-[10px] font-black uppercase tracking-wider ${ROLE_COLORS[log.user.role]}`}
                          >
                            {ROLE_ICON[log.user.role]}
                            {log.user.role}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Operation (Action) */}
                    <td className="px-7 py-5">
                      <ActionBadge action={log.action} />
                    </td>

                    {/* Summary (Description) */}
                    <td className="px-7 py-5 max-w-xs">
                      <p className="text-sm font-medium text-[var(--text)] leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                        {log.description}
                      </p>
                    </td>

                    {/* Time Dimension (Timestamp) */}
                    <td className="px-7 py-5 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-[11px] font-black text-[var(--text)]">
                          <Calendar
                            size={11}
                            className="text-[var(--primary)] opacity-60"
                          />
                          {date}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--muted)] opacity-60">
                          <Clock size={11} />
                          {time}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Activity
                        size={28}
                        className="text-[var(--primary)] animate-spin opacity-60"
                      />
                      <p className="text-xs font-black text-[var(--muted)] uppercase tracking-widest">
                        Loading audit logs...
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-[20px] bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center">
                        <FileText
                          size={28}
                          className="text-[var(--muted)] opacity-40"
                        />
                      </div>
                      <div className="text-base font-black text-[var(--text)] uppercase tracking-widest">
                        No Logs Found
                      </div>
                      <p className="text-xs font-bold text-[var(--muted)] max-w-[240px] leading-relaxed">
                        No audit events match the current filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
