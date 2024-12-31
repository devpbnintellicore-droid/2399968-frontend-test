import React, { useState, useMemo, useEffect } from "react";
import {
  FlaskConical, CheckCircle, Clock, Plus, FileText, ShieldCheck,
  BarChart3, ArrowRight, Utensils, ChefHat, ClipboardCheck, ShoppingCart,
  Database, BookOpen, Sparkles,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import PageHeader from "../../components/ui/PageHeader";
import { getDashboard, getReviewerDashboard, getManagerDashboard } from "../../api/experimentApi";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload || {};
  return (
    <div className="card p-3 text-xs shadow-xl">
      <div className="font-semibold text-[var(--text)] mb-2">
        Month: {row.monthLabel || label}
      </div>
      <div className="space-y-1 text-[var(--muted)]">
        <div>Total Experiments: <span className="font-semibold text-[var(--text)]">{row.total ?? 0}</span></div>
        <div>Completed: <span className="font-semibold text-[var(--success)]">{row.completed ?? 0}</span></div>
        <div>Pending Review: <span className="font-semibold text-[var(--warning)]">{row.pendingReview ?? 0}</span></div>
        <div>Source: <span className="font-semibold text-[var(--text)]">{row.source || "Experiment.createdAt"}</span></div>
      </div>
    </div>
  );
};

const ChartCard = ({ title, data, loading, error }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <BarChart3 size={14} className="text-[var(--accent)]" />
        <span className="text-[13px] font-semibold text-[var(--text)]">{title}</span>
      </div>
    </div>
    <p className="text-[11px] text-[var(--muted)] mb-3">
      Evidence source: Experiment.createdAt. Formula: count experiments grouped by created month; completed means at least one review or sensory evaluation exists.
    </p>
    <div className="h-[220px]">
      {loading ? (
        <div className="h-full flex items-center justify-center text-[12px] text-[var(--muted)]">Loading chart data...</div>
      ) : error ? (
        <div className="h-full flex items-center justify-center text-[12px] text-[var(--danger)]">{error}</div>
      ) : data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-[12px] text-[var(--muted)]">No experiment data found.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--accent)", opacity: 0.04 }} />
            <Bar dataKey="completed" name="Completed" stackId="experiments" fill="var(--success)" radius={[0, 0, 0, 0]} animationDuration={900} />
            <Bar dataKey="pendingReview" name="Pending Review" stackId="experiments" fill="var(--warning)" radius={[4, 4, 0, 0]} animationDuration={900} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  </Card>
);

const normalizeWorkflowStatus = (status) => {
  const value = String(status || "Pending").toUpperCase();
  const labels = {
    DRAFT: "Draft",
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under Review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    COMPLETED: "Completed",
    PENDING: "Pending",
  };
  return labels[value] || status || "Pending";
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const roleRaw = localStorage.getItem("ck_role") || "Manager";
  const role = roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1).toLowerCase();
  const userEmail = localStorage.getItem("ck_auth_email") || "Admin";
  const username = userEmail.split("@")[0];
  const currentYear = new Date().getFullYear();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedChartYear, setSelectedChartYear] = useState(currentYear);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        // CRA users are authenticated staff, but they are not managers. The
        // manager dashboard endpoint intentionally returns 403 for CRA.
        // Use the general dashboard endpoint for CRA instead.
        const fetchFn = role === "Reviewer"
          ? getReviewerDashboard
          : role === "Chef" || role === "CRA"
            ? getDashboard
            : getManagerDashboard;
        const params = role === "Chef" || role === "Reviewer" || role === "CRA"
          ? {}
          : { year: selectedChartYear };
        const data = await fetchFn(params);
        setDashboardData(data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setLoadError(error?.response?.data?.message || "Failed to load dashboard evidence.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, [role, selectedChartYear]);

  const allExperiments = useMemo(() => {
    const list = role === "Chef"
      ? dashboardData?.recentExperiments
      : dashboardData?.pipeline || dashboardData?.recentExperiments;
    return (list || []).map((exp) => {
      const createdAt = exp.createdAt ? new Date(exp.createdAt) : null;
      return {
        ...exp,
        id: exp.publicId || exp.id,
        batchNo: exp.batchPublicId || exp.batchNo || "-",
        recipe: exp.recipe || exp.recipeName || "Unknown Recipe",
        date: createdAt ? createdAt.toLocaleDateString("en-CA") : exp.date || "-",
        time: createdAt ? createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : exp.time || "-",
        status: normalizeWorkflowStatus(exp.status),
        chef: exp.chef || "-",
        aiScore: exp.aiScore ?? null,
        aiScoreState: exp.aiScoreState || { state: exp.aiScore == null ? "Pending Analysis" : "Analysis Completed", value: exp.aiScore },
      };
    });
  }, [dashboardData, role]);

  const stats = useMemo(() => {
    const apiStats = dashboardData?.stats || { totalExperiments: 0, qualityApproved: 0, pendingReview: 0, totalReviews: 0, approved: 0, awaitingAudit: 0 };
    return {
      all: role === "Chef" ? apiStats.totalExperiments : apiStats.totalReviews,
      completed: role === "Chef" ? apiStats.qualityApproved : apiStats.approved,
      pending: role === "Chef" ? apiStats.pendingReview : apiStats.awaitingAudit,
      data: allExperiments,
    };
  }, [dashboardData, allExperiments, role]);

  const totalMonthlyData = useMemo(() => {
    return dashboardData?.chartData || [];
  }, [dashboardData]);

  const chartYearOptions = useMemo(() => {
    const years = Array.isArray(dashboardData?.chartYears) && dashboardData.chartYears.length
      ? dashboardData.chartYears
      : [selectedChartYear];
    return Array.from(new Set([selectedChartYear, ...years]))
      .map((year) => Number(year))
      .filter((year) => Number.isFinite(year))
      .sort((a, b) => b - a);
  }, [dashboardData, selectedChartYear]);

  const staffCounts = useMemo(() => {
    if (dashboardData?.stats?.totalChefs !== undefined) {
      return {
        chefs: dashboardData.stats.totalChefs,
        reviewers: dashboardData.stats.totalReviewers,
        cra: dashboardData.stats.totalCras,
        managers: dashboardData.stats.totalManagers || 0,
        active: dashboardData.stats.activeStaff || 0,
        inactive: dashboardData.stats.inactiveStaff || 0,
        total: dashboardData.stats.totalStaff || 0,
      };
    }
    return { chefs: 0, reviewers: 0, cra: 0, managers: 0, active: 0, inactive: 0, total: 0 };
  }, [dashboardData]);

  // ── Chef Dashboard ──
  const renderChefDashboard = () => (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Hello, {username} 👋</h1>
          <p className="page-subtitle">Executive Chef · Kitchen Experiment Center</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/recipes")} className="btn-primary"><Plus size={14} /> Create Experiment</button>
          <button onClick={() => navigate("/all-recipes")} className="btn-ghost"><Utensils size={14} /> All Recipes</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Utensils size={20} />} label="Total Experiments" value={stats.all} iconBg="rgba(41,71,147,0.15)" iconColor="#6B8FD4" />
        <StatCard icon={<CheckCircle size={20} />} label="Quality Approved" value={stats.completed} iconBg="rgba(18,183,106,0.15)" iconColor="var(--success)" />
        <StatCard icon={<Clock size={20} />} label="Pending Review" value={stats.pending} iconBg="rgba(247,144,9,0.15)" iconColor="var(--warning)" />
      </div>
      <ChartCard title="My Experiment Trends" data={totalMonthlyData} loading={isLoading} error={loadError} />
      <Card noPad className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center gap-2">
          <FlaskConical size={14} className="text-[var(--accent)]" />
          <span className="text-[13px] font-semibold text-[var(--text)]">My Experiment History</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr><th className="pl-6">Recipe</th><th className="hidden sm:table-cell">Date</th><th className="text-center">Status</th><th className="text-right pr-6">Time</th></tr></thead>
            <tbody>
              {stats.data.map((exp) => (
                <tr key={exp.id} className="table-row">
                  <td className="pl-6">
                    <div className="font-medium text-[var(--text)] text-[13px]">{exp.recipe}</div>
                    <div className="table-cell-mono text-[var(--muted)] mt-0.5">{exp.id}</div>
                  </td>
                  <td className="table-cell-muted hidden sm:table-cell">{exp.date}</td>
                  <td className="text-start"><StatusPill status={exp.status} /></td>
                  <td className="text-start  pr-6 table-cell-muted">{exp.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  // ── Reviewer Dashboard ──
  const renderReviewerDashboard = () => (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Quality Review Dashboard</h1>
          <p className="page-subtitle">Monitor and audit experiment quality standards.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/quality")} className="btn-primary"><ShieldCheck size={14} /> Add Review</button>
          <button onClick={() => navigate("/reviews")} className="btn-ghost"><FileText size={14} /> Feedback Logs</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<FileText size={20} />} label="Total Reviews" value={stats.all} iconBg="rgba(41,71,147,0.15)" iconColor="#6B8FD4" />
        <StatCard icon={<CheckCircle size={20} />} label="Approved" value={stats.completed} iconBg="rgba(18,183,106,0.15)" iconColor="var(--success)" />
        <StatCard icon={<Clock size={20} />} label="Awaiting Audit" value={stats.pending} iconBg="rgba(240,68,56,0.15)" iconColor="var(--danger)" />
      </div>
      <Card noPad className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center gap-2">
          <ClipboardCheck size={14} className="text-[var(--accent)]" />
          <span className="text-[13px] font-semibold text-[var(--text)]">Review Pipeline</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr><th className="pl-6">Experiment</th><th className="hidden sm:table-cell">Chef</th><th className="hidden lg:table-cell">Date</th><th className="text-center">Status</th><th className="text-right pr-6">Actions</th></tr></thead>
            <tbody>
              {stats.data.map((exp) => (
                <tr key={exp.id} className="table-row">
                  <td className="pl-6">
                    <div className="font-medium text-[var(--text)] text-[13px]">{exp.recipe}</div>
                    <div className="table-cell-mono text-[var(--muted)] mt-0.5">{exp.id}</div>
                  </td>
                  <td className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent-glow)] flex items-center justify-center text-[10px] font-bold text-[var(--accent-light)]">{exp.chef?.charAt(0) || "-"}</div>
                      <span className="text-[13px] text-[var(--text)]">{exp.chef || "-"}</span>
                    </div>
                  </td>
                  <td className="table-cell-muted hidden lg:table-cell">{exp.date}</td>
                  <td className="table-cell-muted hidden lg:table-cell"><StatusPill status={exp.status} /></td>
                  <td className="text-right pr-6"><button onClick={() => navigate("/reviews")} className="btn-icon"><ArrowRight size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  // ── Manager / CRA Dashboard ──
  return (
    <div className="animate-fade-in">
      {role === "Chef" ? renderChefDashboard() : role === "Reviewer" ? renderReviewerDashboard() : (
        <div className="space-y-5">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<ShoppingCart size={20} />} label="Total Experiments" value={dashboardData?.stats?.totalExperiments ?? 0}
              sub="this month" iconBg="rgba(41,71,147,0.15)" iconColor="#6B8FD4" />
            <StatCard icon={<Database size={20} />} label="Completed" value={dashboardData?.stats?.qualityApproved ?? 0}
              sub="in system" iconBg="rgba(41,71,147,0.15)" iconColor="#6B8FD4" />
            <StatCard icon={<BookOpen size={20} />} label="Pending Review" value={dashboardData?.stats?.pendingReview ?? 0}
              sub="unique items" iconBg="rgba(41,71,147,0.15)" iconColor="#6B8FD4" />
            <StatCard icon={<Sparkles size={20} />} label="Staff Count" value={staffCounts.total || 0}
              sub={`${staffCounts.active} active / ${staffCounts.inactive} inactive`} iconBg="rgba(41,71,147,0.15)" iconColor="#6B8FD4" />
          </div>

          {/* Chart + Staff */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
            <Card className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 size={14} className="text-[var(--accent)]" />
                  <span className="text-[13px] font-semibold text-[var(--text)]">Monthly Experiments</span>
                  <span className="text-[11px] text-[var(--muted)]">for {selectedChartYear}</span>
                </div>
                <select
                  value={selectedChartYear}
                  onChange={(event) => setSelectedChartYear(Number(event.target.value))}
                  disabled={isLoading}
                  className="h-9 min-w-[110px] rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-[12px] font-semibold text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Select chart year"
                >
                  {chartYearOptions.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-[var(--muted)] mb-3">
                Evidence source: Experiment.createdAt. Formula: count experiments grouped by created month.
              </p>
              <div className="h-[220px]">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center text-[12px] text-[var(--muted)]">Loading chart data...</div>
                ) : loadError ? (
                  <div className="h-full flex items-center justify-center text-[12px] text-[var(--danger)]">{loadError}</div>
                ) : totalMonthlyData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[12px] text-[var(--muted)]">No experiment data found.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={totalMonthlyData} barCategoryGap="35%">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--accent)", opacity: 0.04 }} />
                      <Bar dataKey="completed" name="Completed" stackId="experiments" fill="var(--success)" radius={[0, 0, 0, 0]} animationDuration={900} />
                      <Bar dataKey="pendingReview" name="Pending Review" stackId="experiments" fill="var(--warning)" radius={[4, 4, 0, 0]} animationDuration={900} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            <Card className="p-5">
              <div className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Staff Overview</div>
              <p className="text-[11px] text-[var(--muted)] mb-3">
                Historical staffing includes active and inactive users retained in the database.
              </p>
              <div className="space-y-3">
                {[
                  { label: "Active Staff", count: staffCounts.active, icon: CheckCircle },
                  { label: "Inactive Staff", count: staffCounts.inactive, icon: Clock },
                  { label: "Total Chefs", count: staffCounts.chefs, icon: ChefHat },
                  { label: "Total Reviewers", count: staffCounts.reviewers, icon: ShieldCheck },
                  { label: "Total CRA", count: staffCounts.cra, icon: ClipboardCheck },
                ].map(({ label, count, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--accent-glow)] text-[var(--accent)]">
                        <Icon size={14} />
                      </div>
                      <span className="text-[13px] text-[var(--text)]">{label}</span>
                    </div>
                    <span className="text-[15px] font-bold text-[var(--text)]">{count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Experiments Table */}
          {role === "Manager" && (
            <Card noPad className="overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 size={14} className="text-[var(--accent)]" />
                  <span className="text-[13px] font-semibold text-[var(--text)]">Recent Experiments</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="table table-fixed w-full">
                  <thead><tr><th className="pl-6 w-[10%]">ID</th><th className="w-[30%]">Recipe</th><th className="hidden sm:table-cell w-[12%]">Date</th><th className="w-[22%]">Operator</th><th className="w-[18%]">AI Score</th><th className="text-center w-[8%]">Actions</th></tr></thead>
                  <tbody>
                    {allExperiments.map((e) => (
                      <tr key={e.id} className="table-row">
                        <td className="pl-6 align-middle table-cell-mono text-[var(--accent)]">{e.id}</td>
                        <td className="align-middle"><div className="font-medium text-[var(--text)] text-[13px]">{e.recipe}</div></td>
                        <td className="align-middle table-cell-muted hidden sm:table-cell">{e.date}</td>
                        <td className="align-middle">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[var(--accent-glow)] flex items-center justify-center text-[10px] font-bold text-[var(--accent-light)]">
                              {(e.chef || "-").split(" ").map((n) => n[0]).join("")}
                            </div>
                            <span className="text-[13px] text-[var(--text)]">{e.chef || "-"}</span>
                          </div>
                        </td>
                        <td className="align-middle">
                          <div className="flex items-center gap-2">
                            {e.aiScoreState?.state === "Analysis Completed" ? (
                              <>
                                <progress
                                  value={e.aiScoreState.value}
                                  max="100"
                                  className="w-16 h-1.5 rounded-full overflow-hidden flex-shrink-0 accent-[var(--accent)]"
                                />
                                <span className="text-[12px] font-semibold text-[var(--text)] min-w-[32px]">{e.aiScoreState.value}%</span>
                              </>
                            ) : (
                              <span className="text-[12px] font-semibold text-[var(--muted)] min-w-[90px]">{e.aiScoreState?.state || "Pending Analysis"}</span>
                            )}
                          </div>
                        </td>
                        <td className="align-middle">
                          <div className="flex justify-center">
                            <button onClick={() => navigate("/reviews")} className="btn-icon"><ArrowRight size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const normalized = String(status || "").toUpperCase();
  const isCompleted = ["COMPLETED", "APPROVED", "PASS"].includes(normalized);
  const isPending = ["PENDING", "REVIEW", "SUBMITTED", "UNDER REVIEW", "UNDER_REVIEW"].includes(normalized);
  return (
    <span className={`badge ${isCompleted ? "bg-[var(--success-glow)] text-[var(--success)]" : isPending ? "bg-[var(--warning-glow)] text-[var(--warning)]" : "bg-[var(--danger-glow)] text-[var(--danger)]"}`}>
      <span className={`badge-dot ${isCompleted ? "bg-[var(--success)]" : isPending ? "bg-[var(--warning)]" : "bg-[var(--danger)]"}`} />
      {status}
    </span>
  );
}
