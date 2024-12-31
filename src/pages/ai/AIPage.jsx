import { useState, useEffect, useRef } from "react";
import { Search, Download, Activity, Shield, ShieldCheck, ChefHat, Star, Zap, ChevronDown, FileText, Thermometer, Clock, Layers, FlaskConical, CheckCircle2, AlertCircle, X, Check, Calendar, Loader2, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import experimentApi from "../../api/experimentApi";
import aiApi from "../../api/aiApi";
import toast from "react-hot-toast";

function FilterDropdown({ label, icon: Icon, options, selectedValue, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const isAll = !selectedValue || selectedValue.startsWith("All");
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 min-w-[150px] rounded-lg border text-[12px] font-medium transition-all bg-[var(--surface)] ${isOpen ? "border-[var(--accent)] shadow-[0_0_0_3px_var(--accent-glow)]" : "border-[var(--border)] hover:border-[var(--muted)]"}`}>
        <Icon size={13} className="text-[var(--accent)] shrink-0" />
        <span className={`flex-1 truncate ${isAll ? "text-[var(--muted)]" : "text-[var(--text)]"}`}>{isAll ? `All ${label}s` : selectedValue}</span>
        {!isAll && <X size={10} className="text-[var(--muted)] hover:text-[var(--danger)] shrink-0" onClick={e => { e.stopPropagation(); onChange(options[0]); }} />}
        <ChevronDown size={11} className={`text-[var(--muted)] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[160px] bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.15)] z-[100] overflow-hidden animate-fade-in">
          <div className="p-1.5 max-h-[240px] overflow-y-auto no-scrollbar">
            {options.map(opt => (
              <div key={opt} onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-[12px] font-medium transition-colors ${selectedValue === opt ? "bg-[var(--accent)] text-white" : "text-[var(--text)] hover:bg-[var(--surface-hover)]"}`}>
                <span>{opt}</span>
                {selectedValue === opt && <Check size={11} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExperimentCard({ data }) {
  const [expanded, setExpanded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const runAnalysis = async () => {
    if (analyzing) return;
    setAnalyzing(true);
    try {
      const res = await aiApi.analyzeExperiment(data.dbId);
      if (res.success) setAiResult(res.data);
      else toast.error(res.message || "AI analysis failed");
    } catch (err) {
      console.error("AI analysis failed", err);
      toast.error(err?.response?.data?.message || "AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const varianceValue = Number(data.yieldDeviation?.resultPercent);
  const variance = Number.isFinite(varianceValue) ? Math.abs(varianceValue) : 0;
  const barColor = variance < 5 ? "var(--success)" : variance < 15 ? "var(--warning)" : "var(--danger)";

  const FALLBACK_STRINGS = [
    "fallback takeaway",
    "fallback recommendation",
    "no specific ai takeaway",
    "no specific improvement area",
    "continue manual reviewer assessment",
    "reviewer evidence remains the primary audit source",
  ];
  const isFallback = (s) => FALLBACK_STRINGS.some(f => String(s).toLowerCase().includes(f));
  const filterFallbacks = (arr) => (Array.isArray(arr) ? arr.filter(s => !isFallback(s)) : []);

  const activeAi = aiResult
    ? { ...aiResult, keyTakeaways: filterFallbacks(aiResult.keyTakeaways), improvementAreas: filterFallbacks(aiResult.improvementAreas) }
    : {
        summary: isFallback(data.aiReason) ? null : data.aiReason,
        sentiment: data.aiResult,
        keyTakeaways: filterFallbacks(data.aiKeyTakeaways),
        improvementAreas: filterFallbacks(data.aiImprovementAreas),
        recommendationStatus: data.aiRecommendationStatus,
      };
  const hasAiEvidence = Boolean(activeAi.summary || activeAi.sentiment);
  const hasPreviousFailures = !hasAiEvidence && data.aiAnalysisRecord?.failures?.length > 0;

  const metrics = [
    { label: "Precision", val: data.temp, icon: Thermometer },
    { label: "Cycle", val: data.timing, icon: Clock },
    { label: "Target Texture", val: data.expTexture, icon: FlaskConical },
    { label: "Actual Texture", val: data.actTexture, icon: Layers },
    { label: "Predicted Yield", val: data.expYield, icon: Zap },
    { label: "Actual Yield", val: data.actYield, icon: Activity },
    { label: "Texture Result", val: data.textureAcceptance || "N/A", icon: ShieldCheck },
  ];

  return (
    <div className="card p-0 overflow-hidden mb-4">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* <img src={data.image} alt={data.recipe} className="w-16 h-16 rounded-xl object-cover border border-[var(--border)] shrink-0" /> */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="badge bg-[var(--accent-glow)] text-[var(--accent-light)] border border-[var(--accent-glow)]">{data.id}</span>
                <span className="badge bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)]">Version {data.batchNo}</span>
                <StatusBadge status={data.status} />
              </div>
              <h3 className="text-[16px] font-bold text-[var(--text)] truncate">{data.recipe}</h3>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--muted)]">
                <span className="flex items-center gap-1"><Calendar size={10} /> {data.date}</span>
                {data.time && <span className="flex items-center gap-1"><Clock size={10} /> {data.time}</span>}
                <span className="flex items-center gap-1 text-[var(--success)]"><CheckCircle2 size={10} /> {data.status}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {analyzing && <span className="badge bg-[var(--accent-glow)] text-[var(--accent-light)]"><Loader2 size={10} className="animate-spin" /> Analyzing</span>}
            {hasAiEvidence && !analyzing && <span className="badge bg-[var(--success-glow)] text-[var(--success)]"><Brain size={10} /> AI Ready</span>}
            {!hasAiEvidence && (
              <button onClick={runAnalysis} disabled={analyzing} className={`py-1.5 px-3 text-[11px] ${hasPreviousFailures ? "btn-secondary border border-[var(--danger)]/40 text-[var(--danger)] hover:bg-[var(--danger-glow)]" : "btn-primary"}`}>
                {analyzing ? <Loader2 size={12} className="animate-spin" /> : <Brain size={12} />}
                {hasPreviousFailures ? "Retry AI" : "Run AI"}
              </button>
            )}
            <button onClick={() => setExpanded(!expanded)}
              className={`btn-icon transition-transform ${expanded ? "rotate-180 bg-[var(--accent)] text-white border-[var(--accent)]" : ""}`}>
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-4">
          {metrics.map(({ label, val, icon: Icon }) => (
            <div key={label} className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-3">
              <div className="text-[9px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Icon size={10} className="text-[var(--accent)] opacity-70" /> {label}
              </div>
              <div className="text-[13px] font-semibold text-[var(--text)]">{val}</div>
            </div>
          ))}
        </div>

        {/* AI Analysis */}
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-4">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Variance circle */}
            <div className="flex flex-col items-center shrink-0">
              <div className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Yield Deviation</div>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="48" cy="48" r="42" className="fill-none stroke-[var(--border)]" strokeWidth="6" />
                  <circle cx="48" cy="48" r="42" className="fill-none transition-all duration-1000"
                    strokeWidth="6" strokeDasharray="263.9" strokeDashoffset={263.9 - (263.9 * Math.min(variance, 100)) / 100}
                    stroke={barColor} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[18px] font-bold text-[var(--text)]">{data.yieldDeviation?.resultPercent ?? "N/A"}%</span>
                  <span className="text-[9px] text-[var(--muted)] uppercase">Variance</span>
                </div>
              </div>
            </div>
            {/* Analysis text */}
            <div className="flex-1 w-full space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--border)] ${variance < 10 ? "text-[var(--success)]" : "text-[var(--warning)]"}`}>
                    {variance < 10 ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-[var(--text)]">{hasAiEvidence ? activeAi.sentiment : data.aiScoreState?.state || data.varianceStatus}</div>
                    <div className="text-[10px] text-[var(--muted)] flex items-center gap-1"><Brain size={9} className="text-[var(--accent)]" /> AI Neural Validation</div>
                  </div>
                </div>
                {hasAiEvidence && <span className="badge bg-[var(--accent-glow)] text-[var(--accent-light)]">Analysis: {activeAi.sentiment}</span>}
              </div>
              <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ backgroundColor: barColor, width: `${Math.min(100, Math.max(5, variance))}%` }} />
              </div>
              <p className="text-[12px] text-[var(--muted)] leading-relaxed italic">
                {hasAiEvidence ? `"${activeAi.summary}"` : `Waiting for intentionally triggered AI analysis for ${data.recipe} ${data.version}.`}
              </p>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-[11px] text-[var(--muted)]">
                <div className="font-bold uppercase tracking-wider text-[var(--text)]">Yield Variance Formula</div>
                <div>{data.yieldDeviation?.formula || "((Actual Yield - Predicted Yield) / Predicted Yield) * 100"}</div>
                <div>Source: {data.yieldDeviation?.calculationSource || "Backend yield deviation evidence unavailable"}</div>
                <div>Predicted: {data.yieldDeviation?.predictedYield ?? "N/A"} · Actual: {data.yieldDeviation?.actualYield ?? "N/A"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-5 pb-5 pt-0 space-y-4 border-t border-[var(--border)]">
              <div className="pt-4" />
              {/* AI Insights */}
              {hasAiEvidence && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="card p-4 border-l-4 border-l-[var(--success)]">
                    <h4 className="text-[10px] font-semibold text-[var(--success)] uppercase tracking-wider mb-2.5 flex items-center gap-1.5"><CheckCircle2 size={11} /> Key Takeaways</h4>
                    {activeAi.keyTakeaways?.length > 0
                      ? <ul className="space-y-1.5">{activeAi.keyTakeaways.map((p, i) => <li key={i} className="flex items-start gap-2 text-[12px] text-[var(--text)]"><div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] mt-1.5 shrink-0" />{p}</li>)}</ul>
                      : <p className="text-[12px] text-[var(--muted)] italic">No specific takeaways returned by AI.</p>}
                  </div>
                  <div className="card p-4 border-l-4 border-l-[var(--warning)]">
                    <h4 className="text-[10px] font-semibold text-[var(--warning)] uppercase tracking-wider mb-2.5 flex items-center gap-1.5"><AlertCircle size={11} /> Improvement Areas</h4>
                    <div className="text-[10px] font-bold text-[var(--muted)] mb-2">Status: {activeAi.recommendationStatus || "Pending"}</div>
                    {activeAi.improvementAreas?.length > 0
                      ? <ul className="space-y-1.5">{activeAi.improvementAreas.map((p, i) => <li key={i} className="flex items-start gap-2 text-[12px] text-[var(--text)]"><div className="w-1.5 h-1.5 rounded-full bg-[var(--warning)] mt-1.5 shrink-0" />{p}</li>)}</ul>
                      : <p className="text-[12px] text-[var(--muted)] italic">No improvement areas identified.</p>}
                  </div>
                </div>
              )}
              <div className="card p-4">
                <h4 className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider mb-3 flex items-center gap-1.5"><FileText size={11} /> AI Evidence Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-[var(--text)]">
                  <div><span className="text-[var(--muted)]">Analysis ID:</span> {data.aiAnalysisId || "Pending"}</div>
                  <div><span className="text-[var(--muted)]">Model:</span> {data.aiModelVersion || data.aiAnalysisRecord?.modelVersion || "Pending"}</div>
                  <div><span className="text-[var(--muted)]">Confidence:</span> {data.aiConfidenceScore != null ? `${data.aiConfidenceScore}%` : data.aiAnalysisRecord?.confidenceScore != null ? `${data.aiAnalysisRecord.confidenceScore}%` : "Pending"}</div>
                  <div><span className="text-[var(--muted)]">Generated By:</span> {data.aiGeneratedBy || data.aiAnalysisRecord?.generatedBy || "Pending"}</div>
                  <div><span className="text-[var(--muted)]">Generated At:</span> {data.aiGeneratedAt ? new Date(data.aiGeneratedAt).toLocaleString() : data.aiAnalysisRecord?.generatedAt ? new Date(data.aiAnalysisRecord.generatedAt).toLocaleString() : "Pending"}</div>
                  <div><span className="text-[var(--muted)]">Data Source:</span> {data.aiDataSource || data.aiAnalysisRecord?.dataSource || "Sensory & Compliance"}</div>
                </div>
              </div>
              {data.aiAnalysisRecord && (
                <div className="card p-4">
                  <h4 className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider mb-3 flex items-center gap-1.5"><Brain size={11} /> AI Lifecycle Timeline</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div><span className="text-[var(--muted)]">Status:</span> {data.aiAnalysisRecord.status}</div>
                    <div><span className="text-[var(--muted)]">Generated:</span> {data.aiAnalysisRecord.generatedAt ? new Date(data.aiAnalysisRecord.generatedAt).toLocaleString() : "Pending"}</div>
                    <div><span className="text-[var(--muted)]">Retries:</span> {data.aiAnalysisRecord.retryCount ?? 0}</div>
                  </div>
                  {data.aiAnalysisRecord.failures?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {data.aiAnalysisRecord.failures.map((failure) => (
                        <div key={failure.id} className="rounded-lg border border-[var(--danger)]/20 bg-[var(--danger-glow)] p-2 text-[11px] text-[var(--danger)]">
                          {failure.reason} · {new Date(failure.failureTime).toLocaleString()}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* Details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="card p-3">
                  <div className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Sensory Calibration</div>
                  <div className="flex items-center gap-2">
                    <div><div className="text-[9px] text-[var(--muted)]">Expected</div><div className="text-[12px] font-semibold text-[var(--text)]">{data.expTexture}</div></div>
                    <div className="w-px h-6 bg-[var(--border)]" />
                    <div><div className="text-[9px] text-[var(--muted)]">Actual</div><div className="text-[12px] font-semibold text-[var(--accent)]">{data.actTexture}</div></div>
                  </div>
                </div>
                <div className="card p-3">
                  <div className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Submitted By</div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--accent-glow)] flex items-center justify-center text-[9px] font-bold text-[var(--accent)]">{data.submittedBy.split(" ").map(n => n[0]).join("")}</div>
                    <div><div className="text-[12px] font-semibold text-[var(--text)]">{data.submittedBy}</div><div className="text-[9px] text-[var(--muted)]">Submitter</div></div>
                  </div>
                </div>
                <div className="card p-3">
                  <div className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Version</div>
                  <div className="flex items-center gap-1.5"><FileText size={13} className="text-[var(--accent)]" /><span className="text-[12px] font-semibold text-[var(--text)]">{data.version} — Stable</span></div>
                </div>
                <div className="card p-3">
                  <div className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Reviewer</div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[9px] font-bold text-[var(--muted)]">{data.reviewedBy?.split(" ").map(n => n[0]).join("") || "?"}</div>
                    <div><div className="text-[12px] font-semibold text-[var(--text)]">{data.reviewedBy || "Pending"}</div><div className="text-[9px] text-[var(--muted)]">Reviewer</div></div>
                  </div>
                </div>
              </div>
              {/* Remarks */}
              <div className="card p-4">
                <div className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Experiment Remarks</div>
                <p className="text-[12px] text-[var(--text)] leading-relaxed">{data.remarks}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const AI_READY_STATUSES = new Set(["APPROVED", "COMPLETED"]);
const isAiReadyStatus = (status) =>
  AI_READY_STATUSES.has(String(status || "").trim().toUpperCase());

export default function AIPage() {
  const [search, setSearch] = useState("");
  const [chefFilter, setChefFilter] = useState("All Chefs");
  const [reviewerFilter, setReviewerFilter] = useState("All Reviewers");
  const [recipeFilter, setRecipeFilter] = useState("");
  const [experiments, setExperiments] = useState([]);
  const [recipeOptions, setRecipeOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const reportLoadingRef = useRef(false);
  const role = localStorage.getItem("ck_role");

  useEffect(() => { fetchExperiments(); fetchRecipeOptions(); }, []);

  const fetchRecipeOptions = async () => {
    try {
      const res = await experimentApi.getRecipeSuggestions("", 500);
      if (res.success && Array.isArray(res.data)) {
        const names = [...new Set(res.data.map(n => String(n || "").trim()).filter(Boolean))].sort();
        setRecipeOptions(names);
      }
    } catch (err) { console.error("Failed to load recipe list", err); }
  };

  const fetchExperiments = async () => {
    try {
      setLoading(true);
      const res = await experimentApi.getAllExperiments({ limit: 100000 });
      if (res.success && res.data && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map(e => ({
          id: e.publicId || e.id, dbId: e.id, recipe: e.recipeName,
          batchNo: e.batchPublicId || "Not Available",
          date: e.experimentDate ? new Date(e.experimentDate).toLocaleDateString() : "N/A",
          time: e.experimentTime || "",
          temp: e.temperature ? `${e.temperature}°C` : "N/A",
          timing: e.duration ? `${e.duration}m` : "N/A",
          expTexture: e.expectedTexture || "N/A", actTexture: e.achievedTexture || "N/A",
          expYield: e.yieldDeviation?.predictedYield != null ? `${e.yieldDeviation.predictedYield}kg` : "N/A",
          actYield: e.yieldDeviation?.actualYield != null ? `${e.yieldDeviation.actualYield}kg` : "N/A",
          yieldDeviation: e.yieldDeviation || null,
          varianceStatus: "Awaiting Analysis",
          submittedBy: e.chef?.name || "Unknown Chef", submittedByRole: e.chef?.role || null,
          version: e.recipeVersion || "v1.0",
          status: e.status || "Not Available",
          aiScore: e.aiScore ?? null,
          aiScoreState: e.aiScoreState || { state: e.aiScore == null ? "Pending Analysis" : "Analysis Completed", value: e.aiScore },
          aiAnalysisId: e.aiAnalysisId,
          aiModelVersion: e.aiModelVersion,
          aiDataSource: e.aiDataSource,
          aiGeneratedBy: e.aiGeneratedBy,
          aiGeneratedAt: e.aiGeneratedAt,
          aiConfidenceScore: e.aiConfidenceScore,
          aiResult: e.aiResult,
          aiReason: e.aiReason,
          aiKeyTakeaways: e.aiKeyTakeaways || [],
          aiImprovementAreas: e.aiImprovementAreas || [],
          aiRecommendationStatus: e.aiRecommendationStatus,
          aiAnalysisRecord: e.aiAnalysisRecord,
          textureAcceptance: e.textureAcceptance || e.textureAcceptanceResult,
          reviewedBy: e.sensoryEvaluations?.[0]?.reviewer?.name || null,
          remarks: e.remarks || "No remarks provided.",
          image: e.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1604908176997-43149b0a7c0c",
        }));
        setExperiments(mapped);
      }
    } catch (err) { console.error(err); toast.error("Failed to load experiments"); }
    finally { setLoading(false); }
  };

  const chefs = ["All Chefs", ...new Set(experiments.filter(e => e.submittedByRole === "CHEF").map(a => a.submittedBy).filter(Boolean))];
  const reviewers = ["All Reviewers", ...new Set(experiments.map(a => a.reviewedBy).filter(Boolean))];
  const recipes = recipeOptions.length > 0
    ? recipeOptions
    : [...new Set(experiments.map(a => a.recipe).filter(Boolean))];

  useEffect(() => { if (!recipeFilter && recipes.length > 0) setRecipeFilter(recipes[0]); }, [recipes, recipeFilter]);

  const filtered = experiments.filter(a => {
    if (!isAiReadyStatus(a.status)) return false;
    if (recipeFilter && a.recipe !== recipeFilter) return false;
    if (
      search.trim() &&
      !a.recipe.toLowerCase().includes(search.trim().toLowerCase()) &&
      !a.id.toLowerCase().includes(search.trim().toLowerCase())
    )
      return false;
    if (chefFilter !== "All Chefs" && a.submittedBy !== chefFilter) return false;
    if (reviewerFilter !== "All Reviewers" && a.reviewedBy !== reviewerFilter) return false;
    return true;
  });

  const completedCount = experiments.filter(e => isAiReadyStatus(e.status)).length;

  const handleExportPortfolio = async () => {
    if (reportLoadingRef.current) return;
    if (!recipeFilter) { toast.error("Please select a recipe first"); return; }
    let toastId;
    try {
      reportLoadingRef.current = true; setReportLoading(true);
      toastId = toast.loading(`Generating ${recipeFilter} Report...`);
      const res = await aiApi.generateRecipeReport(encodeURIComponent(recipeFilter));
      if (toastId) toast.dismiss(toastId);
      if (res?.success) { toast.success(`${recipeFilter} Report Ready`); window.open(res.url, "_blank"); return; }
      toast.error(res?.message || "Failed to generate report");
    } catch (err) {
      if (toastId) toast.dismiss(toastId);
      toast.error(err?.response?.data?.message || err?.message || "Failed to generate report");
    } finally { reportLoadingRef.current = false; setReportLoading(false); }
  };

  // Compute stats
  const yieldExps = experiments.filter(e => isAiReadyStatus(e.status) && e.expYield !== "N/A" && e.actYield !== "N/A");
  const yieldReliability = yieldExps.length > 0
    ? (yieldExps.reduce((sum, e) => { const exp = parseFloat(e.expYield), act = parseFloat(e.actYield); return (!exp || !act) ? sum : sum + Math.min(100, (act / exp) * 100); }, 0) / yieldExps.length).toFixed(1) + "%"
    : null;
  const textureExps = experiments.filter(e => isAiReadyStatus(e.status) && e.expTexture !== "N/A" && e.actTexture !== "N/A");
  const normalize = v => String(v || "").toLowerCase().trim().replace(/\s+/g, " ");
  const texturePrecision = textureExps.length > 0
    ? ((textureExps.filter(e => { const ex = normalize(e.expTexture), ac = normalize(e.actTexture); return ex === ac || ac.includes(ex) || ex.includes(ac); }).length / textureExps.length) * 100).toFixed(1) + "%"
    : null;

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
      <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
      <p className="text-[12px] text-[var(--muted)]">Loading AI Analytics...</p>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-5 pb-10">
      {reportLoading && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[min(92vw,420px)] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent-glow)] text-[var(--accent-light)]">
              <Loader2 size={32} className="animate-spin" />
            </div>
            <h2 className="mb-2 text-lg font-black text-[var(--text)]">
              Your report is being generated
            </h2>
            <p className="mx-auto max-w-xs text-sm font-semibold leading-6 text-[var(--muted)]">
              Please do not change tab or refresh this page until the portfolio report is ready.
            </p>
            <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[11px] font-black uppercase tracking-widest text-[var(--accent-light)]">
              Generating {recipeFilter || "Portfolio"} Report...
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">AI Analytics</h1>
          <p className="page-subtitle">Approve or reject production batches based on deep neural analysis of variance data.</p>
        </div>
        <span className="badge bg-[var(--accent-glow)] text-[var(--accent-light)] border border-[var(--accent-glow)]">
          <Activity size={11} className="animate-pulse" /> AI Training Online
        </span>
      </div>

      {/* Stat Cards */}
      {role === "Manager" && completedCount > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {yieldReliability && <StatCard icon={<Zap size={20} />} label="Yield Reliability" value={yieldReliability} sub={`Based on ${yieldExps.length} batches`} iconBg="rgba(66,99,235,0.15)" iconColor="#7B9EFF" />}
          {texturePrecision && <StatCard icon={<Star size={20} />} label="Texture Precision" value={texturePrecision} sub={`${textureExps.length} comparisons`} iconBg="rgba(66,99,235,0.15)" iconColor="#7B9EFF" />}
          <StatCard icon={<Shield size={20} />} label="Security Signatures" value={completedCount} sub="Verified Protocols" iconBg="rgba(66,99,235,0.15)" iconColor="#7B9EFF" />
          <StatCard icon={<Activity size={20} />} label="Analytic Throughput" value={experiments.length} sub="Experiments Processed" iconBg="rgba(66,99,235,0.15)" iconColor="#7B9EFF" />
        </div>
      )}

      {/* Toolbar */}
      <div className="card p-3 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex-1 relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search experiments by name or ID..." className="input-field pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterDropdown label="Recipe" icon={FileText} options={recipes} selectedValue={recipeFilter} onChange={setRecipeFilter} />
          <FilterDropdown label="Submitter" icon={ChefHat} options={chefs} selectedValue={chefFilter} onChange={setChefFilter} />
          <FilterDropdown label="Reviewer" icon={ShieldCheck} options={reviewers} selectedValue={reviewerFilter} onChange={setReviewerFilter} />
          <button onClick={handleExportPortfolio} disabled={reportLoading} className={`btn-primary ${reportLoading ? "opacity-60 cursor-not-allowed" : ""}`}>
            {reportLoading ? <><Loader2 size={13} className="animate-spin" /> Generating...</> : <><Download size={13} /> Portfolio Report</>}
          </button>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Result Set: {filtered.length} entities found</span>
          <span className="flex items-center gap-1.5 text-[11px] text-[var(--accent)]"><div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" /> Real-time Sync Active</span>
        </div>
        {filtered.map(e => <ExperimentCard key={e.id} data={e} />)}
        {filtered.length === 0 && (
          <div className="card p-16 text-center border-dashed">
            <Search size={28} className="text-[var(--muted)] mx-auto mb-3 opacity-30" />
            <div className="text-[14px] font-semibold text-[var(--text)] mb-1">No Intelligence Data</div>
            <p className="text-[12px] text-[var(--muted)]">No experiments match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
