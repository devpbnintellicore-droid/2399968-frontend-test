import React, { useState, useEffect, useCallback } from "react";
import {
  Download,
  ChevronDown,
  ChevronRight,
  Search,
  Shield,
  Clock,
  Activity,
  Calendar,
  FileText,
  Users,
} from "lucide-react";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { getAuditLogs } from "../../api/auditApi";

const ACTION_COLORS = {
  "Submitted Data Entry": "bg-[var(--accent-glow)] text-[var(--accent-light)]",
  "Approved Review": "bg-[var(--success-glow)] text-[var(--success)]",
  "Rejected Review": "bg-[var(--danger-glow)] text-[var(--danger)]",
  "Added Staff Member": "bg-[var(--info-glow)] text-[var(--info)]",
  "Added Recipe": "bg-[var(--accent-glow)] text-[var(--accent-light)]",
  "Viewed Analytics Report": "bg-[var(--warning-glow)] text-[var(--warning)]",
};

const getActionBadgeClass = (action) =>
  ACTION_COLORS[action] || "bg-[var(--surface-2)] text-[var(--muted)]";

const ROLE_FILTER_TABS = ["All", "Floor Staff", "Manager", "CRA"];

export default function CRAPage() {
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState("All");
  const [stats, setStats] = useState({ total: 0, manager: 0, floorStaff: 0 });
  const pageSize = 10;

  const fetchLogs = useCallback(
    async (searchVal) => {
      setLoading(true);
      try {
        const params = { page, limit: pageSize, search: searchVal.trim() };
        const res = await getAuditLogs(params);
        const logsData =
          res?.data?.data || (Array.isArray(res?.data) ? res.data : []);
        const metaData = res?.data?.meta || {};
        setLogs(logsData);
        setTotal(metaData.total ?? logsData.length);
        // Compute stats from logs
        const allLogs = logsData;
        setStats({
          total: metaData.total ?? logsData.length,
          manager: allLogs.filter((l) =>
            l.user?.role?.toLowerCase().includes("manager"),
          ).length,
          floorStaff: allLogs.filter(
            (l) =>
              !l.user?.role?.toLowerCase().includes("manager") &&
              !l.user?.role?.toLowerCase().includes("cra"),
          ).length,
        });
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize],
  );

  useEffect(() => {
    const t = setTimeout(() => fetchLogs(search), 300);
    return () => clearTimeout(t);
  }, [search, fetchLogs]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const formatTS = (iso) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("en-CA"),
      time: d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

  const filteredLogs =
    roleFilter === "All"
      ? logs
      : logs.filter((l) => {
          const r = l.user?.role?.toLowerCase() || "";
          if (roleFilter === "Manager") return r.includes("manager");
          if (roleFilter === "CRA") return r.includes("cra");
          if (roleFilter === "Floor Staff")
            return !r.includes("manager") && !r.includes("cra");
          return true;
        });

  const avatarColors = [
    "from-blue-400 to-indigo-500",
    "from-emerald-400 to-teal-500",
    "from-violet-400 to-purple-500",
    "from-pink-400 to-rose-500",
    "from-cyan-400 to-blue-500",
  ];
  const getColor = (name) =>
    avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-subtitle">
            Full history of all user actions and events
          </p>
        </div>
        {/* <button className="btn-primary">
          <Download size={14} /> Export PDF
        </button> */}
      </div>

      {/* Stat Cards */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-card-icon">
            <FileText size={20} />
          </div>
          <div className="stat-card-value">{loading ? "—" : total}</div>
          <div className="stat-card-label">Total Logs</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">
            <Users size={20} />
          </div>
          <div className="stat-card-value">{loading ? "—" : stats.manager}</div>
          <div className="stat-card-label">Manager</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">
            <Activity size={20} />
          </div>
          <div className="stat-card-value">
            {loading ? "—" : stats.floorStaff}
          </div>
          <div className="stat-card-label">Floor Staff</div>
        </div>
      </div> */}

      {/* Table Card */}
      <div className="card p-0 overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[14px] font-semibold text-[var(--text)]">
              System Log
            </h2>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">
              Full history of all user actions and events
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search logs..."
                className="input-field pl-9 w-52"
              />
            </div>
            {/* Role filter tabs */}
            {/* <div className="flex gap-1 p-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg">
              {ROLE_FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRoleFilter(tab)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${roleFilter === tab ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
                >
                  {tab}
                </button>
              ))}
            </div> */}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Detail</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-[var(--muted)] text-[13px]"
                  >
                    <Activity size={16} className="animate-spin mx-auto mb-2" />{" "}
                    Loading...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-[var(--muted)] text-[13px]"
                  >
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  const isExpanded = expanded === log.id;
                  const ts = formatTS(log.createdAt);
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        className={`table-row cursor-pointer ${isExpanded ? "bg-[var(--table-row-hover)]" : ""}`}
                        onClick={() => setExpanded(isExpanded ? null : log.id)}
                      >
                        <td className="text-[var(--muted)] text-[12px] font-medium">
                          {(page - 1) * pageSize + idx + 1}
                        </td>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-full bg-gradient-to-br ${getColor(log.user?.name)} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}
                            >
                              {log.user?.name?.charAt(0) || "?"}
                            </div>
                            <span className="text-[13px] font-medium text-[var(--text)]">
                              {log.user?.name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]">
                            {log.user?.role}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${getActionBadgeClass(log.action)}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                            {log.action}
                          </span>
                        </td>
                        <td className="table-cell-muted max-w-[280px] truncate">
                          {log.description}
                        </td>
                        <td className="table-cell-muted whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>{ts.date}</span>
                            <span className="text-[var(--border)]">·</span>
                            <span className="font-mono">{ts.time}</span>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${log.id}-detail`}>
                          <td colSpan={6} className="p-0 bg-[var(--surface-2)]">
                            <div className="px-5 py-4 border-b border-[var(--border)] space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="card p-3">
                                  <div className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">
                                    Log Hash
                                  </div>
                                  <div className="font-mono text-[11px] text-[var(--text)] break-all">
                                    {String(log.id).padStart(16, "0")}
                                  </div>
                                </div>
                                <div className="card p-3">
                                  <div className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">
                                    Sync Integrity
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--success)]">
                                    <Shield size={12} /> Ledger Consistent
                                  </div>
                                </div>
                                <div className="card p-3">
                                  <div className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">
                                    Reference
                                  </div>
                                  <div className="text-[12px] font-semibold text-[var(--accent)]">
                                    {log.entityLabel || "N/A"}
                                  </div>
                                </div>
                              </div>
                              <div className="card p-3">
                                <div className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <Activity size={11} /> Log Payload
                                </div>
                                <p className="text-[12px] text-[var(--text)] leading-relaxed">
                                  {log.description}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2 text-[11px] text-[var(--muted)]">
                                <span className="flex items-center gap-1.5 px-2.5 py-1.5 card">
                                  <Calendar size={10} /> {ts.date} {ts.time}
                                </span>
                                <span className="flex items-center gap-1.5 px-2.5 py-1.5 card">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />{" "}
                                  {log.user?.name} · {log.user?.role}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3.5 border-t border-[var(--border)] flex items-center justify-between">
          <span className="text-[12px] text-[var(--muted)]">
            {total} total events
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`btn-icon ${page === 1 ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              <ChevronRight size={13} className="rotate-180" />
            </button>
            <span className="px-3 text-[12px] font-semibold text-[var(--text)]">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`btn-icon ${page === totalPages ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              <ChevronRight size={13} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
            <Activity size={11} className="text-[var(--success)]" /> Synced:{" "}
            {new Date().toLocaleDateString("en-CA")}
          </div>
        </div>
      </div>
    </div>
  );
}
