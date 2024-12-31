import { useState, useEffect } from "react";
import { CheckCircle, Clock, Search, Calendar, ChevronDown, Activity, Star, ThumbsUp, ThumbsDown, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBadge from "../../components/ui/StatusBadge";
import { getAllReviews } from "../../api/experimentApi";

const sensoryLabels = [
  { key: "taste", label: "Taste", color: "#3b82f6" },
  { key: "aroma", label: "Aroma", color: "#f59e0b" },
  { key: "saltiness", label: "Saltiness", color: "#8b5cf6" },
  { key: "visual", label: "Visual", color: "#10b981" },
  { key: "consistency", label: "Texture", color: "#4263EB" },
  { key: "spiciness", label: "Spiciness", color: "#ef4444" },
  { key: "oiliness", label: "Oiliness", color: "#84cc16" },
  { key: "freshness", label: "Freshness", color: "#06b6d4" },
  { key: "aftertaste", label: "Aftertaste", color: "#d946ef" },
];

export default function ReviewsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [reviewsData, setReviewsData] = useState({ data: [], stats: { total: 0, pending: 0, completed: 0 } });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await getAllReviews({
          search: searchQuery.trim(),
          status: statusFilter,
        });
        setReviewsData(res.data);
      } catch (err) { console.error("Failed to fetch reviews:", err); }
      finally { setLoading(false); }
    };
    const timer = setTimeout(fetchReviews, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  useEffect(() => { setPage(1); setExpandedId(null); }, [searchQuery, statusFilter]);

  const experimentsList = reviewsData.data || [];
  const totalPages = Math.max(1, Math.ceil(experimentsList.length / PAGE_SIZE));
  const pagedList = experimentsList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const { total: totalCount, pending: pendingCount, completed: completedCount } = reviewsData.stats;
  const role = localStorage.getItem("ck_role");
  const showAIScore = role === "Manager";

  const statusTabs = [
    { id: "all", label: "All Feedbacks", count: totalCount },
    { id: "pending", label: "Pending", count: pendingCount },
    { id: "completed", label: "Completed", count: completedCount },
  ];

  const getScoreColor = (score) => score >= 8 ? "var(--success)" : score >= 5 ? "var(--warning)" : "var(--danger)";

  const getIngredientText = (exp) =>
    exp?.ingredients?.length ? exp.ingredients.map(i => i.name).filter(Boolean).join(", ") : "—";

  const renderAnswer = (q, answer) => {
    if (answer === undefined || answer === null) return <span className="text-[var(--muted)] italic text-[11px]">—</span>;
    if (q?.type === "rating_stars" || (typeof answer === "number" && answer <= 5)) {
      return <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} className={s <= answer ? "fill-amber-500 text-amber-500" : "text-[var(--border)]"} />)}</div>;
    }
    if (q?.type === "yes_no") {
      return answer === "yes"
        ? <span className="badge bg-[var(--success-glow)] text-[var(--success)] text-[10px]"><ThumbsUp size={9} /> Yes</span>
        : <span className="badge bg-[var(--danger-glow)] text-[var(--danger)] text-[10px]"><ThumbsDown size={9} /> No</span>;
    }
    const isLongText = String(answer).length > 100;
    return <p className={`text-[11px] text-[var(--text)] leading-relaxed whitespace-pre-wrap ${isLongText ? "text-left" : "text-right"}`}>{String(answer)}</p>;
  };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Quality Feedback</h1>
          <p className="page-subtitle">Comprehensive review history and quality assurance metrics.</p>
        </div>
        <div className="flex gap-2">
          <span className="badge bg-[var(--warning-glow)] text-[var(--warning)]"><Clock size={11} className="animate-pulse" /> {pendingCount} Pending</span>
          <span className="badge bg-[var(--success-glow)] text-[var(--success)]"><CheckCircle size={11} /> {completedCount} Approved</span>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="card p-3 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex-1 relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
          <input type="text" placeholder="Search by recipe, ID, or chef..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-9" />
        </div>
        <div className="flex gap-1 p-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg">
          {statusTabs.map((tab) => (
            <button key={tab.id} onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${statusFilter === tab.id ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:text-[var(--text)]"}`}>
              {tab.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusFilter === tab.id ? "bg-white/20" : "bg-[var(--border)] text-[var(--muted)]"}`}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {/* Header */}
        <div className="grid px-5 py-3 border-b border-[var(--border)] bg-[var(--table-head-bg)]"
          style={{ gridTemplateColumns: showAIScore ? "1fr 130px 110px 70px 100px 100px 44px" : "1fr 130px 110px 70px 100px 44px" }}>
          {["Experiment Identity", "Primary Chef", "Submission Date", "Timestamp", ...(showAIScore ? ["AI Consensus"] : []), "Audit Status", ""].map((h, i) => (
            <span key={i} className="text-[10px] font-semibold text-[var(--table-head-text)] uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-[var(--muted)] text-[13px]">
            <Activity size={18} className="animate-spin mx-auto mb-2" /> Loading...
          </div>
        ) : experimentsList.length === 0 ? (
          <div className="py-16 text-center">
            <Search size={24} className="text-[var(--muted)] mx-auto mb-2 opacity-40" />
            <p className="text-[13px] text-[var(--muted)]">No records found</p>
          </div>
        ) : pagedList.map((exp) => {
          const isExpanded = expandedId === exp.id;
          const reviewData = exp.reviewData;
          return (
            <div key={exp.id} className="border-b border-[var(--border)] last:border-0">
              <div onClick={() => setExpandedId(isExpanded ? null : exp.id)} className={`grid px-5 py-4 cursor-pointer transition-colors group ${isExpanded ? "bg-[var(--accent-glow)]" : "hover:bg-[var(--table-row-hover)]"}`}
                style={{ gridTemplateColumns: showAIScore ? "1fr 130px 110px 70px 100px 100px 44px" : "1fr 130px 110px 70px 100px 44px" }}>
                <div>
                  <div className={`text-[13px] font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors`}>{exp.recipe}</div>
                  <div className="text-[10px] text-[var(--muted)] mt-0.5">{exp.id} · {exp.batchNo}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--accent-glow)] flex items-center justify-center text-[9px] font-bold text-[var(--accent)]">
                    {exp.chef?.split(" ").map(n => n[0]).join("")}
                  </div>
                  <span className="text-[12px] text-[var(--text)]">{exp.chef}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
                  <Calendar size={11} className="opacity-50" /> {exp.date}
                </div>
                <div className="flex items-center text-[12px] text-[var(--muted)]">{exp.time || "—"}</div>
                {showAIScore && (
                  <div className="flex items-center">
                    {exp.aiScoreState?.state === "Analysis Completed" ? (
                      <div className="flex items-center gap-2 w-full max-w-[100px]">
                        <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                          <div style={{ width: `${exp.aiScoreState.value}%` }}
                            className={`h-full rounded-full ${exp.aiScoreState.value > 80 ? "bg-[var(--success)]" : exp.aiScoreState.value > 60 ? "bg-[var(--warning)]" : "bg-[var(--danger)]"}`} />
                        </div>
                        <span className="text-[11px] font-semibold text-[var(--text)] w-7 text-right">{exp.aiScoreState.value}%</span>
                      </div>
                    ) : <span className="text-[10px] font-semibold text-[var(--muted)]">{exp.aiScoreState?.state || "Pending Analysis"}</span>}
                  </div>
                )}
                <div className="flex items-center"><StatusBadge status={exp.status} /></div>
                <div className="flex items-center justify-end">
                  <div className={`btn-icon transition-transform ${isExpanded ? "rotate-180 bg-[var(--accent)] text-white border-[var(--accent)]" : ""}`}>
                    <ChevronDown size={13} />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <div className="px-5 py-5 bg-[var(--surface-2)] border-t border-[var(--border)] space-y-5">
                      {/* Experiment meta */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: "Ingredients", val: getIngredientText(exp) },
                          { label: "Temperature", val: `${exp.temp}°C` },
                          { label: "Version", val: exp.version },
                          { label: "Duration", val: `${exp.timing} min` },
                        ].map(({ label, val }) => (
                          <div key={label} className="card p-3">
                            <div className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">{label}</div>
                            <div className="text-[13px] font-semibold text-[var(--text)] truncate">{val}</div>
                          </div>
                        ))}
                      </div>

                      {reviewData ? (
                        <div className="space-y-4">
                          {/* Reviewer */}
                          <div className="flex items-center justify-between p-3.5 card border-l-4 border-l-[var(--accent)]">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center text-[11px] font-bold text-[var(--accent)]">
                                {reviewData.reviewedBy?.charAt(0)}
                              </div>
                              <div>
                                <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Reviewed By</div>
                                <div className="text-[13px] font-semibold text-[var(--text)]">{reviewData.reviewedBy}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                              <Calendar size={11} /> {reviewData.reviewedDate}
                            </div>
                          </div>

                          {/* Sensory scores */}
                          <div>
                            <div className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2.5">Sensory Analytics</div>
                            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
                              {sensoryLabels.map((s) => {
                                const val = reviewData.sensoryScores?.[s.key];
                                return (
                                  <div key={s.key} className="card p-2.5 text-center">
                                    <div className="text-[9px] text-[var(--muted)] uppercase tracking-wider mb-1 truncate">{s.label}</div>
                                    <div className="text-[15px] font-bold" style={{ color: getScoreColor(val) }}>{val ?? "—"}</div>
                                    <div className="text-[9px] text-[var(--muted)]">/10</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Q&A */}
                          {exp.staticQuestions?.length > 0 && (
                            <div>
                              <div className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2.5">Compliance Assessment</div>
                              <div className="space-y-2">
                                {Array.from(new Map(exp.staticQuestions.map(q => [q.id, q])).values()).map((q, i) => (
                                  <div key={q.id} className="card p-3 flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex items-start gap-2.5 flex-1 min-w-[200px]">
                                      <span className="w-5 h-5 rounded-full bg-[var(--accent-glow)] flex items-center justify-center text-[9px] font-bold text-[var(--accent)] shrink-0 mt-0.5">{i + 1}</span>
                                      <span className="text-[12px] text-[var(--text)] leading-tight">{q.question}</span>
                                    </div>
                                    <div className="flex-1 md:max-w-[60%]">{renderAnswer(q, q.answer)}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Remarks */}
                          {reviewData.remarks && (
                            <div className="card p-4 border-l-4 border-l-[var(--accent)]">
                              <div className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <MessageSquare size={11} /> Reviewer Conclusion
                              </div>
                              <p className="text-[13px] text-[var(--text)] leading-relaxed italic">"{reviewData.remarks}"</p>
                            </div>
                          )}

                          {/* AI Lifecycle Timeline */}
                          {showAIScore && exp.aiAnalysisRecord && (
                            <div className="mt-6 border-t border-[var(--border)] pt-6">
                              <div className="flex items-center gap-2 mb-4">
                                <Activity size={14} className="text-[var(--accent)]" />
                                <div className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">AI Analysis Lifecycle</div>
                              </div>
                              <div className="space-y-4">
                                <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl relative overflow-hidden">
                                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${exp.aiAnalysisRecord.status === 'COMPLETED' ? 'bg-[var(--success)]' : exp.aiAnalysisRecord.status === 'FAILED' ? 'bg-[var(--danger)]' : 'bg-[var(--warning)]'}`} />
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <div className="text-[12px] font-bold text-[var(--text)]">Run {exp.aiAnalysisRecord.id}</div>
                                      <div className="text-[10px] text-[var(--muted)]">{new Date(exp.aiAnalysisRecord.createdAt).toLocaleString()}</div>
                                    </div>
                                    <StatusBadge status={exp.aiAnalysisRecord.status} size="sm" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                      <div className="text-[10px] font-bold text-[var(--muted)] uppercase">Retries</div>
                                      <div className="text-[13px] font-semibold">{exp.aiAnalysisRecord.retryCount}</div>
                                    </div>
                                    {exp.aiAnalysisRecord.lastError && (
                                      <div className="col-span-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-[11px] text-red-500 font-mono mt-2">
                                        {exp.aiAnalysisRecord.lastError}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {exp.aiAnalysisRecord.retries && exp.aiAnalysisRecord.retries.length > 0 && (
                                  <div className="pl-6 space-y-3 border-l-2 border-[var(--border)] ml-3">
                                    {exp.aiAnalysisRecord.retries.map(retry => (
                                      <div key={retry.id} className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg relative">
                                        <div className="absolute w-3 h-3 rounded-full bg-[var(--surface)] border-2 border-[var(--danger)] -left-[23px] top-4" />
                                        <div className="flex justify-between items-center mb-1">
                                          <div className="text-[11px] font-bold text-[var(--text)]">Retry Attempt</div>
                                          <div className="text-[10px] text-[var(--muted)]">{new Date(retry.attemptedAt).toLocaleString()}</div>
                                        </div>
                                        <div className="text-[10px] text-[var(--danger)] bg-[var(--danger-glow)] p-2 rounded mt-2 break-words font-mono">
                                          {retry.errorMessage}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        </div>
                      ) : (
                        <div className="card p-8 text-center border-dashed">
                          <Clock size={24} className="text-[var(--warning)] mx-auto mb-2 animate-pulse" />
                          <div className="text-[13px] font-semibold text-[var(--text)] mb-1">Pending Review</div>
                          <p className="text-[12px] text-[var(--muted)]">An authorized Reviewer must conduct a sensory audit.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      {/* Pagination */}
      {!loading && experimentsList.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[var(--muted)]">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, experimentsList.length)} of {experimentsList.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-icon disabled:opacity-30">
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx - 1] > 1) acc.push("..."); acc.push(p); return acc; }, [])
              .map((p, i) => p === "..." ? (
                <span key={`e${i}`} className="px-1 text-[var(--muted)] text-[12px]">…</span>
              ) : (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition-all ${page === p ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"}`}>
                  {p}
                </button>
              ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-icon disabled:opacity-30">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
