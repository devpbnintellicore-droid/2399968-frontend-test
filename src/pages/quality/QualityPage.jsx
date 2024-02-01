import { useState, useEffect, useRef } from "react";
import {
  Activity,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  Droplets,
  Eye,
  ImageIcon,
  Smile,
  Utensils,
  Wind,
  XCircle,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import questionApi from "../../api/questionApi";
import experimentApi from "../../api/experimentApi";
import sensoryApi from "../../api/sensoryApi";

const STATIC_QUESTIONS = [
  {
    id: "static_overall",
    question: "What did you think about the test overall?",
    type: "long_text",
  },
  {
    id: "static_satisfaction",
    question: "How satisfied are you with the test experience?",
    type: "rating_stars",
  },
  {
    id: "static_understanding",
    question: "Was the test easy to understand?",
    type: "yes_no",
  },
  {
    id: "static_expectations",
    question: "Did the test meet your expectations?",
    type: "yes_no",
  },
  {
    id: "static_quality",
    question: "How would you rate the quality of the test?",
    type: "rating_stars",
  },
];

const QuestionComponents = {
  rating_stars: ({ value, onChange, maxStars = 5 }) => (
    <div className="flex items-center gap-2.5">
      {[...Array(maxStars)].map((_, i) => {
        const star = i + 1;
        const isActive = value >= star;
        return (
          <button
            key={star}
            onClick={() => onChange(star)}
            className={`text-2xl transition-all duration-300 transform hover:scale-125 focus:outline-none ${
              isActive
                ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                : "text-[var(--border)]"
            }`}
          >
            ★
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-4 font-black text-sm text-[var(--primary)] uppercase tracking-widest bg-[var(--primary-glow)] px-3 py-1 rounded-full border border-[var(--primary)]/20 shadow-sm">
          {value}/{maxStars}
        </span>
      )}
    </div>
  ),

  short_text: ({ value, onChange, placeholder = "Input text payload..." }) => (
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] outline-none transition-all placeholder:opacity-40"
      placeholder={placeholder}
    />
  ),

  long_text: ({
    value,
    onChange,
    placeholder = "Detailed assessment remarks...",
  }) => (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] outline-none transition-all placeholder:opacity-40 min-h-[140px] resize-none"
      placeholder={placeholder}
    />
  ),

  yes_no: ({ value, onChange }) => (
    <div className="flex gap-4">
      {["Yes", "No"].map((opt) => {
        const isActive = value === opt;
        const isYes = opt === "Yes";
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all duration-500 border ${
              isActive
                ? isYes
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-xl shadow-emerald-500/20 scale-[1.02]"
                  : "bg-rose-500 text-white border-rose-500 shadow-xl shadow-rose-500/20 scale-[1.02]"
                : "bg-[var(--bg)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)]/50 hover:text-[var(--text)]"
            }`}
          >
            {isYes ? (
              <CheckCircle size={18} strokeWidth={2.5} />
            ) : (
              <XCircle size={18} strokeWidth={2.5} />
            )}
            {opt}
          </button>
        );
      })}
    </div>
  ),

  nps: ({ value, onChange }) => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2.5">
        {[...Array(11)].map((_, i) => {
          const isActive = value === i;
          return (
            <button
              key={i}
              onClick={() => onChange(i)}
              className={`w-11 h-11 rounded-[14px] font-black text-xs transition-all duration-300 border ${
                isActive
                  ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xl shadow-[var(--primary)]/30 scale-110"
                  : "bg-[var(--bg)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--text)]"
              }`}
            >
              {i}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between items-center px-1 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest opacity-60">
        <span>Not likely at all</span>
        <span>Extremely likely</span>
      </div>
    </div>
  ),

  slider: ({ value, onChange, min = 0, max = 100, step = 1 }) => (
    <div className="py-2 space-y-6">
      <div className="relative h-2 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)]">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value ?? (max - min) / 2}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-x-0 -top-1.5 w-full h-5 opacity-0 cursor-pointer z-20"
        />
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-[var(--primary)] to-amber-500 rounded-full shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)] transition-all duration-300"
          style={{
            width: `${(((value ?? (max - min) / 2) - min) / (max - min)) * 100}%`,
          }}
        />
      </div>
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <span className="text-[var(--muted)]">{min}</span>
        <span className="bg-[var(--primary-glow)] text-[var(--primary)] px-4 py-1.5 rounded-full border border-[var(--primary)]/20 shadow-sm text-xs">
          {value ?? "--"}
        </span>
        <span className="text-[var(--muted)]">{max}</span>
      </div>
    </div>
  ),

  single_choice: ({ value, onChange, options = [] }) => (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const isActive = value === opt;
        return (
          <label
            key={opt}
            className={`flex items-center gap-4 py-4 px-5 rounded-[20px] cursor-pointer transition-all duration-300 border group ${
              isActive
                ? "bg-[var(--primary-glow)] border-[var(--primary)] shadow-lg shadow-[var(--primary)]/5"
                : "bg-[var(--bg)] border-[var(--border)] hover:border-[var(--primary)]/30"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                isActive
                  ? "border-[var(--primary)]"
                  : "border-[var(--border)] group-hover:border-[var(--primary)]/50"
              }`}
            >
              {isActive && (
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />
              )}
            </div>
            <input
              type="radio"
              checked={isActive}
              onChange={() => onChange(opt)}
              className="hidden"
            />
            <span
              className={`text-sm font-bold tracking-tight transition-colors ${isActive ? "text-[var(--text)]" : "text-[var(--muted)] group-hover:text-[var(--text)]"}`}
            >
              {opt}
            </span>
          </label>
        );
      })}
    </div>
  ),

  multi_choice: ({ value = [], onChange, options = [] }) => (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const isChecked = value.includes(opt);
        return (
          <label
            key={opt}
            className={`flex items-center gap-4 py-4 px-5 rounded-[20px] cursor-pointer transition-all duration-300 border group ${
              isChecked
                ? "bg-[var(--primary-glow)] border-[var(--primary)] shadow-lg shadow-[var(--primary)]/5"
                : "bg-[var(--bg)] border-[var(--border)] hover:border-[var(--primary)]/30"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                isChecked
                  ? "bg-[var(--primary)] border-[var(--primary)]"
                  : "border-[var(--border)] group-hover:border-[var(--primary)]/50"
              }`}
            >
              {isChecked && (
                <div className="w-2 h-3 border-r-2 border-b-2 border-white rotate-45 mb-1" />
              )}
            </div>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() =>
                onChange(
                  isChecked ? value.filter((v) => v !== opt) : [...value, opt],
                )
              }
              className="hidden"
            />
            <span
              className={`text-sm font-bold tracking-tight transition-colors ${isChecked ? "text-[var(--text)]" : "text-[var(--muted)] group-hover:text-[var(--text)]"}`}
            >
              {opt}
            </span>
          </label>
        );
      })}
    </div>
  ),

  dropdown: ({ value, onChange, options = [] }) => (
    <div className="relative group">
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl px-5 py-4 text-sm font-bold text-[var(--text)] focus:ring-4 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] outline-none transition-all appearance-none cursor-pointer pr-12"
      >
        <option value="" disabled className="text-[var(--muted)]">
          Select target protocol...
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[var(--surface)]">
            {opt}
          </option>
        ))}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)] group-focus-within:text-[var(--primary)] transition-colors">
        <ChevronDown size={20} />
      </div>
    </div>
  ),

  emoji_reaction: ({ value, onChange }) => (
    <div className="flex justify-between items-center px-4 py-6 bg-[var(--bg)] rounded-[32px] border border-[var(--border)]/50 shadow-inner">
      {["😠", "😟", "😐", "🙂", "😍"].map((emoji, i) => {
        const isActive = value === emoji;
        return (
          <button
            key={i}
            onClick={() => onChange(emoji)}
            className={`text-5xl transition-all duration-500 hover:scale-125 hover:-translate-y-2 focus:outline-none ${
              isActive
                ? "filter-none opacity-100 scale-125 drop-shadow-[0_10px_15px_rgba(var(--primary-rgb),0.2)]"
                : "grayscale opacity-30 hover:grayscale-0 hover:opacity-60"
            }`}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  ),

  date: ({ value, onChange }) => (
    <input
      type="date"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl px-5 py-4 text-sm font-bold text-[var(--text)] focus:ring-4 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] outline-none transition-all"
    />
  ),

  number: ({ value, onChange, min, max }) => (
    <input
      type="text"
      inputMode="numeric"
      value={value || ""}
      onChange={(e) => {
        const val = e.target.value;
        if (val === "") {
          onChange("");
          return;
        }
        const num = parseInt(val.replace(/\D/g, ""), 10);
        if (!isNaN(num)) {
          let finalVal = num;
          if (max !== undefined) finalVal = Math.min(max, finalVal);
          if (min !== undefined) finalVal = Math.max(min, finalVal);
          onChange(finalVal);
        }
      }}
      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl px-5 py-4 text-sm font-bold text-[var(--text)] focus:ring-4 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] outline-none transition-all font-mono"
      placeholder="0.00"
    />
  ),

  ranking: ({ value = [], onChange, options = [] }) => {
    const handleMove = (idx, dir) => {
      const newList = [...value];
      const target = dir === "up" ? idx - 1 : idx + 1;
      if (target >= 0 && target < newList.length) {
        [newList[idx], newList[target]] = [newList[target], newList[idx]];
        onChange(newList);
      }
    };

    useEffect(() => {
      if (value.length === 0 && options.length > 0) onChange([...options]);
    }, [options]);

    return (
      <div className="flex flex-col gap-3">
        {(value.length > 0 ? value : options).map((opt, i) => (
          <div
            key={opt}
            className="flex items-center gap-4 p-5 bg-[var(--bg)] border border-[var(--border)] rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-glow)] flex items-center justify-center text-xs font-black text-[var(--primary)] shadow-[0_0_12px_rgba(var(--primary-rgb),0.1)]">
              {i + 1}
            </div>
            <span className="flex-1 text-sm font-bold text-[var(--text)] tracking-tight">
              {opt}
            </span>
            <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleMove(i, "up")}
                disabled={i === 0}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  i === 0
                    ? "text-[var(--muted)] opacity-20"
                    : "bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--primary)] hover:text-white"
                }`}
              >
                <ChevronUp size={16} strokeWidth={3} />
              </button>
              <button
                onClick={() => handleMove(i, "down")}
                disabled={i === (value.length || options.length) - 1}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  i === (value.length || options.length) - 1
                    ? "text-[var(--muted)] opacity-20"
                    : "bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--primary)] hover:text-white"
                }`}
              >
                <ChevronDown size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  },

  matrix: ({ value = {}, onChange, rows = [], columns = [] }) => (
    <div className="overflow-x-auto scrollbar-hide">
      <table className="w-full border-separate border-spacing-y-3">
        <thead>
          <tr>
            <th className="text-left px-6 py-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] opacity-60">
              Verification Node
            </th>
            {columns.map((col) => (
              <th
                key={col}
                className="text-center px-4 py-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] opacity-60"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row}
              className="bg-[var(--bg)] shadow-sm hover:shadow-md transition-all duration-300"
            >
              <td className="px-6 py-5 text-sm font-black text-[var(--text)] rounded-l-[24px] border-l border-y border-[var(--border)]">
                {row}
              </td>
              {columns.map((col, idx) => (
                <td
                  key={col}
                  className={`text-center px-4 py-5 border-y border-[var(--border)] ${idx === columns.length - 1 ? "rounded-r-[24px] border-r" : ""}`}
                >
                  <label className="flex items-center justify-center cursor-pointer group">
                    <input
                      type="radio"
                      checked={value[row] === col}
                      onChange={() => onChange({ ...value, [row]: col })}
                      className="hidden"
                    />
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        value[row] === col
                          ? "border-[var(--primary)] bg-[var(--primary-glow)]"
                          : "border-[var(--border)] group-hover:border-[var(--primary)]/30"
                      }`}
                    >
                      {value[row] === col && (
                        <div className="w-3 h-3 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />
                      )}
                    </div>
                  </label>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),

  image_choice: ({ value, onChange, options = [] }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {options.map((opt, i) => {
        const isActive = value === opt;
        return (
          <div
            key={i}
            onClick={() => onChange(opt)}
            className={`group cursor-pointer rounded-[28px] overflow-hidden transition-all duration-500 border-2 ${
              isActive
                ? "border-[var(--primary)] shadow-2xl shadow-[var(--primary)]/10 scale-[1.02]"
                : "border-[var(--border)] hover:border-[var(--primary)]/30"
            }`}
          >
            <div className="relative h-40 bg-[var(--bg-subtle)] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-black/0 to-black/5" />
              <ImageIcon
                size={48}
                className={`transition-all duration-700 ${isActive ? "text-[var(--primary)] opacity-100 scale-125" : "text-[var(--muted)] opacity-20 group-hover:opacity-40"}`}
              />
            </div>
            <div
              className={`p-4 text-center text-xs font-black uppercase tracking-widest transition-colors ${
                isActive
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--bg)] text-[var(--muted)] group-hover:text-[var(--text)]"
              }`}
            >
              {opt}
            </div>
          </div>
        );
      })}
    </div>
  ),

  linear_scale: ({ value, onChange, min = 1, max = 5 }) => (
    <div className="flex justify-center gap-4 py-2">
      {[...Array(max - min + 1)].map((_, i) => {
        const val = min + i;
        const isActive = value === val;
        return (
          <button
            key={val}
            onClick={() => onChange(val)}
            className={`w-14 h-14 rounded-full font-black text-lg transition-all duration-500 border-2 ${
              isActive
                ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xl shadow-[var(--primary)]/30 scale-110"
                : "bg-[var(--bg)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)]/50 hover:text-[var(--text)]"
            }`}
          >
            {val}
          </button>
        );
      })}
    </div>
  ),
};

const RatingRow = ({ icon: Icon, label, value, onChange, color }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-[var(--text)] opacity-50">
        <Icon size={12} style={{ color }} />
        {label}
      </div>
      {value > 0 && (
        <div
          className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[var(--bg)] border border-[var(--border)]"
          style={{ color }}
        >
          {value}/10
        </div>
      )}
    </div>
    <div className="relative group">
      <input
        type="text"
        inputMode="numeric"
        value={value === 0 ? "" : value}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "") {
            onChange(0);
            return;
          }
          const num = parseInt(val.replace(/\D/g, ""), 10);
          if (!isNaN(num)) {
            onChange(Math.min(10, num));
          }
        }}
        placeholder="Score (0-10)"
        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-center text-sm font-black transition-all duration-300 focus:ring-2 focus:ring-[var(--primary)]/10 focus:border-current outline-none placeholder:font-bold placeholder:text-[10px] placeholder:opacity-30 text-[var(--text)]"
        style={{
          color: value > 0 ? color : "var(--text)",
          borderColor: value > 0 ? `${color}30` : "var(--border)",
          backgroundColor: value > 0 ? `${color}03` : "var(--bg)",
        }}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-[var(--muted)] uppercase opacity-30 pointer-events-none tracking-widest">
        PTS
      </div>
    </div>
  </div>
);

//  Main Component

export default function QualityPage() {
  const [experimentsState, setExperimentsState] = useState([]);
  const [questions, setQuestions] = useState([]);
  const isCurrentlySubmitting = useRef(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reviewType, setReviewType] = useState("rating");
  const [queueFilter, setQueueFilter] = useState("Pending");
  const [sensoryScores, setSensoryScores] = useState({
    taste: 0,
    aroma: 0,
    visual: 0,
    consistency: 0,
    saltiness: 0,
    spiciness: 0,
    oiliness: 0,
    freshness: 0,
    aftertaste: 0,
  });
  const [formAnswers, setFormAnswers] = useState({});
  const [remarks, setRemarks] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [expRes, quesRes] = await Promise.all([
          experimentApi.getAllExperiments({ limit: 200 }),
          questionApi.getAllQuestions(),
        ]);

        // Map backend experiment data to UI expected format if necessary
        const mappedExps = (expRes.data?.data || []).map((exp) => ({
          ...exp,
          id: exp.publicId || `EXP-${new Date(exp.createdAt || Date.now()).getFullYear()}-${String(exp.id).padStart(4, "0")}`,
          dbId: exp.id,
          recipe: exp.recipeName,
          version: exp.recipeVersion,
          date: exp.experimentDate
            ? new Date(exp.experimentDate).toISOString().split("T")[0]
            : "",
          time: exp.experimentTime || "",
          chef: exp.chef?.name || "System",
          status: exp.status === "SUBMITTED" ? "Pending" : "Completed",
          aiScore: exp.aiScoreState?.value ?? null,
          aiScoreState: exp.aiScoreState,
          batchNo: exp.batchPublicId || `BT-${new Date(exp.createdAt || Date.now()).getFullYear()}-${String(exp.id).padStart(4, "0")}`,
          image:
            exp.images?.[0]?.imageUrl ||
            "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398",
          ingredients: exp.ingredients || [],
        }));

        setExperimentsState(mappedExps);
        const uniqueQuestions = Array.from(
          new Map((quesRes.data || []).map((q) => [q.id, q])).values()
        );
        setQuestions(uniqueQuestions);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load review data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingExps = experimentsState.filter((e) => e.status === "Pending");

  const ingredientText = selected?.ingredients?.length
    ? selected.ingredients
        .map((ing) => ing.name)
        .filter(Boolean)
        .join(", ")
    : "—";

  const handleSelect = (exp) => {
    setSelected(exp);
    setStatusMessage(null);
    setRemarks("");
    setSensoryScores({
      taste: 0,
      aroma: 0,
      visual: 0,
      consistency: 0,
      saltiness: 0,
      spiciness: 0,
      oiliness: 0,
      freshness: 0,
      aftertaste: 0,
    });
    setFormAnswers({});
    setActiveImageIdx(0);
  };

  const handleSubmitReview = async () => {
    if (!selected || isCurrentlySubmitting.current) return;
    
    isCurrentlySubmitting.current = true;
    setIsSubmitting(true);

    // Validation: Check if all sensory scores are provided
    const missingScores = Object.entries(sensoryScores).some(
      ([_, val]) => val === 0,
    );
    if (missingScores) {
      toast.error("Please provide all sensory ratings (1-10)");
      return;
    }

    // Validation: Check if remarks are provided
    if (!remarks.trim() || remarks.trim().length <= 10) {
      toast.error("Please provide final expert synthesis remarks (must be > 10 chars)");
      return;
    }

    // Validation: Check if all compliance questions are answered
    // Check if every question has an answer or is marked N/A
    const allAnswered = questions.every(q => {
      const val = formAnswers[q.id];
      return val !== undefined && val !== null && val !== "";
    });

    if (!allAnswered) {
      toast.error(
        "Please answer all compliance questions in the 'Logic Inquiries' tab. Use 'N/A' if a question is not applicable.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Submit Sensory Evaluation
      await sensoryApi.createSensory({
        cookingExperimentId: selected.dbId,
        tasteConsistency: sensoryScores.taste,
        aromaticVolatility: sensoryScores.aroma,
        sodiumProjection: sensoryScores.saltiness,
        chromaticAppeal: sensoryScores.visual,
        structuralIntegrity: sensoryScores.consistency,
        scovillePerception: sensoryScores.spiciness,
        lipidSaturation: sensoryScores.oiliness,
        cellularFreshness: sensoryScores.freshness,
        palatePersistence: sensoryScores.aftertaste,
        finalExpertNote: remarks,
      });

      // console.log("Sensory review submitted successfully")

      // 2. Submit Question Answers (Batch)
      const answers = Object.entries(formAnswers).map(([qId, val]) => ({
        questionId: parseInt(qId),
        experimentId: selected.dbId,
        answerValue: val,
      }));

      await questionApi.submitBatchAnswers(answers);

      toast.success("Review submitted successfully");

      const updatedExperiments = experimentsState.map((exp) =>
        exp.id === selected.id ? { ...exp, status: "Completed" } : exp,
      );
      setExperimentsState(updatedExperiments);
      setStatusMessage({ text: "Protocol audit verified and encrypted." });

      setTimeout(() => {
        setSelected(null);
        setStatusMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
      isCurrentlySubmitting.current = false;
    }
  };

  const isFormValid =
    Object.values(sensoryScores).every((val) => val > 0) &&
    remarks.trim().length > 0 &&
    questions.every((q) => {
      const val = formAnswers[q.id];
      return val !== undefined && val !== null && val !== "";
    });

  const queueItems = experimentsState.filter((e) =>
    queueFilter === "All" ? true : e.status === queueFilter,
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-8 pb-20">
      <PageHeader
        title="Review Recipe"
        subtitle="Execute high-fidelity sensory audits on production experiment batches."
        actions={[
          <div
            key="pending"
            className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border text-[11px] font-black uppercase tracking-[0.15em] shadow-sm ${
              pendingExps.length > 0
                ? "bg-amber-500/5 border-amber-500/20 text-amber-500"
                : "bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
            }`}
          >
            <Clock
              size={16}
              strokeWidth={3}
              className={pendingExps.length > 0 ? "animate-pulse" : ""}
            />
            {pendingExps.length} Audits Pending
          </div>,
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-4 lg:gap-6 items-start">
        {/* Left: Review Queue Sidebar */}
        <Card
          noPad
          className="lg:sticky lg:top-24 max-h-[calc(100vh-140px)] overflow-hidden flex flex-col"
        >
          <div className="p-5 border-b border-[var(--border)]">
            <h3 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-0.5">
              Telemetry Queue
            </h3>
            <div className="text-[13px] font-bold text-[var(--text)]">
              Review Queue
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3 space-y-2">
            {queueItems.length === 0 ? (
              <div className="py-20 px-6 text-center">
                <div className="w-16 h-16 bg-[var(--surface)] rounded-full flex items-center justify-center mx-auto mb-4 opacity-30">
                  <Activity size={24} />
                </div>
                <div className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest leading-relaxed">
                  Null Signal:
                  <br />
                  Audit Stream Empty
                </div>
              </div>
            ) : (
              queueItems.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => handleSelect(exp)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    selected?.id === exp.id
                      ? "bg-[var(--primary)] text-white shadow-lg"
                      : "bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--primary)]/40"
                  }`}
                >
                  {selected?.id === exp.id && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-3xl rounded-full -mr-12 -mt-12 animate-pulse" />
                  )}

                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <span
                      className={`text-sm font-black tracking-tight leading-tight ${selected?.id === exp.id ? "text-white" : "text-[var(--text)]"}`}
                    >
                      {exp.recipe}
                    </span>
                    <div className="opacity-100 transition-opacity">
                      <StatusBadge status={exp.status} size="sm" />
                    </div>
                  </div>

                  <div
                    className={`flex justify-between items-center text-[10px] font-black uppercase tracking-widest relative z-10 ${selected?.id === exp.id ? "text-white/70" : "text-[var(--muted)]"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          selected?.id === exp.id
                            ? "bg-white/20 px-2 py-0.5 rounded"
                            : "bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)]"
                        }
                      >
                        {exp.id}
                      </span>
                    </div>
                    {/* <div className="flex items-center gap-1.5">
                      <Activity
                        size={10}
                        className={
                          exp.aiScore > 80
                            ? "text-emerald-500"
                            : "text-amber-500"
                        }
                      />
                      <span>{exp.aiScore}% Fidelity</span>
                    </div> */}
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Right: Review Detailed Form */}
        <div className="flex flex-col gap-8">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Card
                  noPad
                  className="overflow-hidden border-[var(--border)] shadow-2xl shadow-black/5 rounded-[40px] bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] border-t-[8px] border-t-[var(--primary)]"
                >
                  <div className="p-6 lg:p-8 xl:p-10">
                    {/* Experiment Header Info */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="bg-[var(--primary-glow)] text-[var(--primary)] px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-[var(--primary)]/10 shadow-sm">
                            {selected.id}
                          </span>
                          <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest opacity-60">
                            Telemetry Registered by {selected.chef}
                          </span>
                        </div>
                        <h2 className="text-3xl lg:text-3xl xl:text-4xl font-black text-[var(--text)] tracking-tighter leading-tight">
                          {selected.recipe}
                        </h2>
                        <div className="flex flex-wrap items-center gap-5 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">
                          <div className="flex items-center gap-2 text-[var(--text)]">
                            <Clock
                              size={14}
                              className="text-[var(--primary)]"
                            />
                            {selected.date} @ {selected.time}
                          </div>
                          <div className="w-1 h-1 rounded-full bg-[var(--border)]" />
                          <div className="flex items-center gap-2 text-[var(--text)]">
                            <Wind size={14} className="text-amber-500" />
                            Iteration {selected.version}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Image Preview & Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                      <div className="flex flex-col gap-4">
                        <div className="aspect-video rounded-[32px] overflow-hidden border-4 border-[var(--bg)] shadow-2xl relative group">
                          <img
                            src={
                              selected.images?.[activeImageIdx]?.imageUrl ||
                              selected.image
                            }
                            alt={selected.recipe}
                            className="w-full h-full object-contain transition-all duration-1000 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                            <div className="text-white text-[10px] font-black uppercase tracking-widest">
                              Batch Reference Imagery // {selected.batchNo}
                            </div>
                          </div>
                        </div>

                        {selected.images?.length > 1 && (
                          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {selected.images.map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveImageIdx(idx)}
                                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                                  activeImageIdx === idx
                                    ? "border-[var(--primary)] scale-105 shadow-lg"
                                    : "border-[var(--border)] opacity-60 hover:opacity-100"
                                }`}
                              >
                                <img
                                  src={img.imageUrl}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {[
                          {
                            label: "Target Profile",
                            value: ingredientText,
                            icon: Utensils,
                            color: "#3b82f6",
                          },
                          {
                            label: "Core Temp",
                            value: `${selected.temperature}°C`,
                            icon: Droplets,
                            color: "#6366f1",
                          },
                          {
                            label: "Process Timing",
                            value: `${selected.duration}m`,
                            icon: Clock,
                            color: "#f59e0b",
                          },
                        ].map(({ label, value, icon: Icon, color }) => (
                          <div
                            key={label}
                            className="p-4 bg-[var(--bg)] border border-[var(--border)]/50 rounded-[20px] shadow-sm relative overflow-hidden group"
                          >
                            <div className="flex items-center gap-3.5 text-[9px] font-black text-[var(--muted)] uppercase tracking-widest group-hover:text-[var(--text)] transition-colors">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--surface)] border border-[var(--border)] group-hover:scale-110 transition-transform"
                                style={{ color }}
                              >
                                <Icon size={12} />
                              </div>
                              <div className="flex-1">
                                <div className="opacity-40 mb-0.5">{label}</div>
                                <div className="text-xs font-black text-[var(--text)] tracking-tight">
                                  {value}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Form Controls Section */}
                    <div className="bg-[var(--surface)] p-8 lg:p-10 rounded-[40px] border border-[var(--border)]/50 shadow-inner">
                      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--primary-glow)] flex items-center justify-center text-[var(--primary)] shadow-inner transform -rotate-3">
                            <Activity size={20} strokeWidth={2.5} />
                          </div>
                          <h3 className="text-xl font-black tracking-tight text-[var(--text)]">
                            Sensory Evaluation
                          </h3>
                        </div>

                        <div className="flex p-0.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl gap-0.5 shadow-sm">
                          {[
                            { key: "rating", label: "Ratings" },
                            { key: "qa", label: "Logic" },
                          ].map(({ key, label }) => (
                            <button
                              key={key}
                              onClick={() => setReviewType(key)}
                              className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${
                                reviewType === key
                                  ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20 scale-[1.02]"
                                  : "text-[var(--muted)] hover:text-[var(--text)]"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Content Switching Area */}
                      <motion.div
                        key={reviewType}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="min-h-[300px]"
                      >
                        {reviewType === "rating" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-x-6 xl:gap-x-10 gap-y-2">
                            {[
                              {
                                label: "Taste Consistency",
                                icon: Utensils,
                                color: "#3b82f6",
                                key: "taste",
                              },
                              {
                                label: "Aromatic Volatility",
                                icon: Wind,
                                color: "#f59e0b",
                                key: "aroma",
                              },
                              {
                                label: "Sodium Projection",
                                icon: Zap,
                                color: "#8b5cf6",
                                key: "saltiness",
                              },
                              {
                                label: "Chromatic Appeal",
                                icon: Eye,
                                color: "#ec4899",
                                key: "visual",
                              },
                              {
                                label: "Structural Integrity",
                                icon: Activity,
                                color: "#f97316",
                                key: "consistency",
                              },
                              {
                                label: "Scoville Perception",
                                icon: Zap,
                                color: "#ef4444",
                                key: "spiciness",
                              },
                              {
                                label: "Lipid Saturation",
                                icon: Droplets,
                                color: "#64748b",
                                key: "oiliness",
                              },
                              {
                                label: "Cellular Freshness",
                                icon: Activity,
                                color: "#06b6d4",
                                key: "freshness",
                              },
                              {
                                label: "Palate Persistence",
                                icon: Smile,
                                color: "#d946ef",
                                key: "aftertaste",
                              },
                            ].map((field) => (
                              <RatingRow
                                key={field.key}
                                label={field.label}
                                icon={field.icon}
                                color={field.color}
                                value={sensoryScores[field.key]}
                                onChange={(val) =>
                                  setSensoryScores((prev) => ({
                                    ...prev,
                                    [field.key]: val,
                                  }))
                                }
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {questions.length === 0 ? (
                              <div className="py-20 px-10 bg-[var(--bg)]/50 border-2 border-dashed border-[var(--border)] rounded-[40px] text-center max-w-lg mx-auto">
                                <div className="w-16 h-16 bg-[var(--surface)] rounded-full flex items-center justify-center mx-auto mb-6 opacity-40 shadow-inner">
                                  <Activity size={32} />
                                </div>
                                <p className="text-lg font-black text-[var(--muted)] tracking-tight">
                                  Null Protocol Configurations
                                </p>
                                <p className="text-xs font-bold text-[var(--muted)] mt-2 opacity-60">
                                  Dynamic inquiry vectors must be initialized in
                                  the control center.
                                </p>
                              </div>
                            ) : (
                              questions.map((q, i) => {
                                const Comp = QuestionComponents[q.type];
                                return (
                                  <div
                                    key={q.id}
                                    className="p-6 bg-[var(--bg)] border border-[var(--border)]/50 rounded-2xl shadow-sm hover:shadow-lg hover:border-[var(--primary)]/20 transition-all duration-500 group"
                                  >
                                    <div className="flex items-start gap-4 mb-6">
                                      <div className="flex-1 flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-xl bg-[var(--primary-glow)] flex items-center justify-center text-[10px] font-black text-[var(--primary)] border border-[var(--primary)]/20 shadow-inner group-hover:scale-110 transition-transform mt-0.5">
                                          {i + 1}
                                        </div>
                                        <h4 className="text-base font-black tracking-tight pt-1.5 text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                                          {q.question}
                                        </h4>
                                      </div>
                                      <button 
                                        onClick={() => setFormAnswers(prev => ({...prev, [q.id]: formAnswers[q.id] === 'N/A' ? undefined : 'N/A'}))}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border ${formAnswers[q.id] === 'N/A' ? 'bg-[var(--warning-glow)] text-[var(--warning)] border-[var(--warning)]' : 'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'}`}
                                      >
                                        N/A
                                      </button>
                                    </div>
                                    <div className="px-1">
                                      {formAnswers[q.id] === 'N/A' ? (
                                        <div className="p-4 bg-[var(--surface-2)] text-[var(--muted)] text-[11px] font-bold uppercase tracking-wider rounded-xl border border-[var(--border)] text-center italic">
                                          Marked as Not Applicable
                                        </div>
                                      ) : Comp ? (
                                        <Comp
                                          {...q}
                                          value={formAnswers[q.id]}
                                          onChange={(val) =>
                                            setFormAnswers((prev) => ({
                                              ...prev,
                                              [q.id]: val,
                                            }))
                                          }
                                        />
                                      ) : (
                                        <div className="p-4 bg-rose-500/5 text-rose-500 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl border border-rose-500/20">
                                          ERR: Critical Component Missing [
                                          {q.type}]
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* Master Action Block */}
                    <div className="mt-12 p-6 lg:p-8 bg-[var(--bg)] border border-[var(--border)] rounded-[32px] shadow-inner relative overflow-hidden group">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <CheckCircle size={20} />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text)]">
                          Final Expert Authorization
                        </h4>
                      </div>

                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Input qualitative synthesis..."
                        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-6 py-5 text-sm font-bold text-[var(--text)] focus:ring-4 focus:ring-[var(--primary)]/5 focus:border-[var(--primary)] outline-none transition-all placeholder:opacity-30 min-h-[140px] shadow-inner resize-none mb-6"
                      />

                      <button
                        disabled={!isFormValid || isSubmitting}
                        onClick={handleSubmitReview}
                        className={`w-full group relative overflow-hidden py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] transition-all duration-700 ${
                          !isFormValid || isSubmitting
                            ? "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
                            : "bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/30 hover:scale-[1.01] active:scale-[0.99]"
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="relative z-10 flex items-center justify-center gap-4">
                          {isSubmitting ? (
                            <Activity size={16} className="animate-spin" />
                          ) : (
                            <Zap size={16} fill="currentColor" />
                          )}
                          Authorize Protocol Audit
                        </span>
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Card className="text-center py-24 px-8">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                  <div
                    className="absolute top-0 left-0 w-full h-full animate-[spin_100s_linear_infinite]"
                    style={{
                      backgroundImage:
                        "radial-gradient(var(--primary) 1px, transparent 0)",
                      backgroundSize: "60px 60px",
                    }}
                  />
                </div>
                <div className="relative z-10">
                  <div className="w-32 h-32 bg-[var(--primary-glow)] rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-inner group-hover:rotate-12 group-hover:scale-110 transition-all duration-700">
                    <Activity
                      size={64}
                      className="text-[var(--primary)] opacity-40 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <h3 className="text-4xl font-black text-[var(--text)] tracking-tighter mb-4">
                    Neural Stream Initialized
                  </h3>
                  <p className="text-base font-bold text-[var(--muted)] max-w-md mx-auto leading-relaxed mb-12">
                    Select an active protocol verification vector from the
                    telemetry queue to execute high-fidelity sensory audits.
                  </p>
                  <div className="flex flex-wrap justify-center gap-6">
                    {[
                      "Biometrics - OK",
                      "AI Core - Sync",
                      "Audit Stream - Live",
                      "Node 042 - Active",
                    ].map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-2 px-6 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl"
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
                          {tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-20 hover:opacity-100 transition-opacity cursor-default">
                  <Activity size={14} className="animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                    Waiting for batch selection...
                  </span>
                </div>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
