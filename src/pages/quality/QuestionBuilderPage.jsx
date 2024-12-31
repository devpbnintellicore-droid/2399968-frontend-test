import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import questionApi from "../../api/questionApi";
import {
  AlignLeft,
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
  Circle,
  CheckSquare,
  Download,
  Edit3,
  FileJson,
  GripVertical,
  Hash,
  ImageIcon,
  LayoutGrid,
  List,
  ListOrdered,
  Plus,
  Save,
  Smile,
  ThumbsUp,
  Trash2,
  Type,
  XCircle,
  Zap,
  CheckCircle,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import { AlertTriangle, Info } from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const QUESTION_TYPES = [
  { id: "rating_stars", label: "⭐ Star Rating", icon: "★" },
  { id: "nps", label: "🔢 NPS Scale (0-10)", icon: <Hash size={16} /> },
  { id: "slider", label: "🎚️ Slider", icon: <Zap size={16} /> },
  {
    id: "single_choice",
    label: "🔘 Single Choice",
    icon: <Circle size={16} />,
  },
  {
    id: "multi_choice",
    label: "☑️ Multiple Choice",
    icon: <CheckSquare size={16} />,
  },
  { id: "dropdown", label: "📋 Dropdown", icon: <List size={16} /> },
  { id: "short_text", label: "✏️ Short Answer", icon: <Type size={16} /> },
  { id: "long_text", label: "📝 Long Answer", icon: <AlignLeft size={16} /> },
  { id: "yes_no", label: "👍 Yes / No", icon: <ThumbsUp size={16} /> },
  {
    id: "emoji_reaction",
    label: "😊 Emoji Reaction",
    icon: <Smile size={16} />,
  },
  { id: "date", label: "📅 Date Picker", icon: <Calendar size={16} /> },
  { id: "number", label: "🔢 Number Input", icon: <Hash size={16} /> },
  { id: "ranking", label: "🏆 Ranking", icon: <ListOrdered size={16} /> },
  //{ id: "matrix", label: "📊 Matrix / Grid", icon: <LayoutGrid size={16} /> },
  // { id: "image_choice", label: "🖼️ Image Choice", icon: <ImageIcon size={16} /> },
  {
    id: "linear_scale",
    label: "📏 Linear Scale",
    icon: <Activity size={16} />,
  },
];

const DEFAULT_QUESTION = {
  id: null,
  question: "",
  type: "rating_stars",
  maxStars: 5,
  options: ["Option 1", "Option 2"],
  min: 0,
  max: 10,
  step: 1,
  rows: ["Row 1", "Row 2"],
  columns: ["Col 1", "Col 2"],
};

const SIMPLE_TYPES = [
  "short_text",
  "long_text",
  "yes_no",
  "emoji_reaction",
  "date",
  "number",
];

// ─── Question Preview Components ─────────────────────────────────────────────

const QuestionComponents = {
  rating_stars: ({ value, onChange, maxStars = 5 }) => (
    <div className="flex gap-2 items-center">
      {[...Array(maxStars)].map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`text-2xl transition-all ${value >= i + 1 ? "text-amber-500 scale-110" : "text-[var(--border)] dark:text-[var(--muted)]/40 scale-100"}`}
        >
          ★
        </button>
      ))}
      {value && (
        <span className="ml-3 font-black text-[var(--primary)] dark:text-[var(--primary)] text-sm">
          {value}/{maxStars}
        </span>
      )}
    </div>
  ),

  nps: ({ value, onChange }) => (
    <div>
      <div className="flex gap-1.5 flex-wrap">
        {[...Array(11)].map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`w-9 h-9 rounded-xl font-bold text-xs transition-all border ${
              value === i
                ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg shadow-[var(--primary)]/30"
                : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] hover:border-[var(--primary)]/30"
            }`}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-3 text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest opacity-60">
        <span>Not likely at all</span>
        <span>Extremely likely</span>
      </div>
    </div>
  ),

  slider: ({ value, onChange, min = 0, max = 100, step = 1 }) => (
    <div className="py-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value ?? (max - min) / 2}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--primary)] cursor-pointer h-1.5 rounded-full bg-[var(--border)]"
      />
      <div className="flex justify-between mt-4 text-[11px] font-bold items-center">
        <span className="text-[var(--muted)] uppercase tracking-widest leading-none">
          {min}
        </span>
        <span className="px-3 py-1 bg-[var(--primary-glow)] text-[var(--primary)] rounded-lg shadow-sm border border-[var(--primary)]/10">
          {value ?? "--"}
        </span>
        <span className="text-[var(--muted)] uppercase tracking-widest leading-none">
          {max}
        </span>
      </div>
    </div>
  ),

  single_choice: ({ value, onChange, options = [] }) => (
    <div className="flex flex-col gap-3">
      {(Array.isArray(options) ? options : []).map((opt) => (
        <label
          key={opt}
          className={`flex items-center gap-4 cursor-pointer px-5 py-4 rounded-[20px] border transition-all ${
            value === opt
              ? "bg-[var(--primary-glow)] border-[var(--primary)] shadow-md dark:shadow-none dark:bg-[var(--primary)]/10"
              : "bg-[var(--bg)] border-[var(--border)] hover:border-[var(--primary)]/30 dark:bg-[var(--surface)]"
          }`}
        >
          <input
            type="radio"
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="w-5 h-5 accent-[var(--primary)]"
          />
          <span
            className={`text-sm ${value === opt ? "font-bold text-[var(--primary)]" : "font-semibold text-[var(--text)]"}`}
          >
            {opt}
          </span>
        </label>
      ))}
    </div>
  ),

  multi_choice: ({ value = [], onChange, options = [] }) => {
    const selectedValues = Array.isArray(value) ? value : [];
    const safeOptions = Array.isArray(options) ? options : [];

    return (
    <div className="flex flex-col gap-3">
      {safeOptions.map((opt) => {
        const isChecked = selectedValues.includes(opt);
        return (
          <label
            key={opt}
            className={`flex items-center gap-4 cursor-pointer px-5 py-4 rounded-[20px] border transition-all ${
              isChecked
                ? "bg-[var(--primary-glow)] border-[var(--primary)] shadow-md dark:shadow-none dark:bg-[var(--primary)]/10"
                : "bg-[var(--bg)] border-[var(--border)] hover:border-[var(--primary)]/30 dark:bg-[var(--surface)]"
            }`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() =>
                onChange(
                  isChecked
                    ? selectedValues.filter((v) => v !== opt)
                    : [...selectedValues, opt],
                )
              }
              className="w-5 h-5 accent-[var(--primary)]"
            />
            <span
              className={`text-sm ${isChecked ? "font-bold text-[var(--primary)]" : "font-semibold text-[var(--text)]"}`}
            >
              {opt}
            </span>
          </label>
        );
      })}
    </div>
    );
  },

  dropdown: ({ value, onChange, options = [] }) => (
    <div className="relative">
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-5 py-4 rounded-[18px] bg-[var(--bg)] border border-[var(--border)] text-sm font-bold text-[var(--text)] appearance-none outline-none focus:border-[var(--primary)] shadow-sm"
      >
        <option value="" disabled>
          Select inquiry response...
        </option>
        {(Array.isArray(options) ? options : []).map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
        <ChevronDown size={18} strokeWidth={3} />
      </div>
    </div>
  ),

  short_text: ({
    value,
    onChange,
    placeholder = "Enter synthesis text...",
  }) => (
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-5 py-4 rounded-[18px] bg-[var(--bg)] border border-[var(--border)] text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--primary)] shadow-sm placeholder:opacity-40"
      placeholder={placeholder}
    />
  ),

  long_text: ({
    value,
    onChange,
    placeholder = "Input comprehensive analysis...",
  }) => (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-5 py-4 rounded-[18px] bg-[var(--bg)] border border-[var(--border)] text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--primary)] shadow-sm placeholder:opacity-40 min-h-[140px] resize-none"
      placeholder={placeholder}
    />
  ),

  yes_no: ({ value, onChange }) => (
    <div className="flex gap-4">
      {["Yes", "No"].map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex-1 py-5 rounded-[24px] font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 border transition-all ${
            value === opt
              ? opt === "Yes"
                ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30"
                : "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/30"
              : "bg-[var(--bg)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)]/30"
          }`}
        >
          {opt === "Yes" ? (
            <ThumbsUp size={16} strokeWidth={3} />
          ) : (
            <XCircle size={16} strokeWidth={3} />
          )}
          {opt}
        </button>
      ))}
    </div>
  ),

  emoji_reaction: ({ value, onChange }) => (
    <div className="flex justify-between px-4 sm:px-10">
      {["😠", "😟", "😐", "🙂", "😍"].map((emoji, i) => (
        <button
          key={i}
          onClick={() => onChange(emoji)}
          className={`text-4xl transition-all duration-500 filter hover:scale-125 ${
            value === emoji
              ? "grayscale-0 scale-125 drop-shadow-lg"
              : "grayscale opacity-30 scale-90"
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  ),

  date: ({ value, onChange }) => (
    <div className="relative">
      <input
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-5 py-4 rounded-[18px] bg-[var(--bg)] border border-[var(--border)] text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--primary)] shadow-sm"
      />
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
        <Calendar size={18} strokeWidth={3} />
      </div>
    </div>
  ),

  number: ({ value, onChange, min, max }) => (
    <div className="relative">
      <input
        type="number"
        min={min}
        max={max}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-5 py-4 rounded-[18px] bg-[var(--bg)] border border-[var(--border)] text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--primary)] shadow-sm"
        placeholder="Integer magnitude..."
      />
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
        <Hash size={18} strokeWidth={3} />
      </div>
    </div>
  ),

  ranking: ({ value = [], onChange, options = [] }) => {
    const safeValue = Array.isArray(value) ? value : [];
    const safeOptions = Array.isArray(options) ? options : [];

    const handleMove = (idx, dir) => {
      const newList = [...safeValue];
      const target = dir === "up" ? idx - 1 : idx + 1;
      if (target >= 0 && target < newList.length) {
        [newList[idx], newList[target]] = [newList[target], newList[idx]];
        onChange(newList);
      }
    };

    useEffect(() => {
      if (safeValue.length === 0 && safeOptions.length > 0) onChange([...safeOptions]);
    }, [safeOptions]);

    const displayOptions = safeValue.length > 0 ? safeValue : safeOptions;

    return (
      <div className="flex flex-col gap-2">
        {displayOptions.map((opt, i) => (
          <div
            key={opt}
            className="flex items-center gap-4 px-5 py-3.5 bg-[var(--bg)] dark:bg-[var(--bg)]/40 border border-[var(--border)] shadow-sm rounded-xl"
          >
            <span className="text-[10px] font-bold text-[var(--primary)] bg-[var(--primary-glow)] dark:bg-[var(--primary)]/10 w-6 h-6 rounded-lg flex items-center justify-center border border-[var(--primary)]/10">
              {i + 1}
            </span>
            <span className="flex-1 text-sm font-bold text-[var(--text)]">
              {opt}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => handleMove(i, "up")}
                disabled={i === 0}
                className={`p-1.5 rounded-lg border transition-all ${i === 0 ? "opacity-20 bg-transparent text-[var(--muted)] border-transparent" : "bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30"}`}
              >
                <ChevronUp size={14} strokeWidth={3} />
              </button>
              <button
                onClick={() => handleMove(i, "down")}
                disabled={i === displayOptions.length - 1}
                className={`p-1.5 rounded-lg border transition-all ${i === displayOptions.length - 1 ? "opacity-20 bg-transparent text-[var(--muted)] border-transparent" : "bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30"}`}
              >
                <ChevronDown size={14} strokeWidth={3} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  },

  matrix: ({ value, onChange, rows = [], columns = [] }) => {
    const safeValue = value || {};
    return (
      <div className="overflow-x-auto -mx-8 px-8 pb-4">
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="text-left py-3 px-4 text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest leading-none">
                Inquiry Node
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="text-center py-3 px-2 text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest leading-none min-w-[60px]"
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
                className="bg-[var(--bg)]/50 rounded-2xl border border-[var(--border)] shadow-sm"
              >
                <td className="py-4 px-5 text-xs font-bold text-[var(--text)] rounded-l-2xl border-y border-l border-[var(--border)]">
                  {row}
                </td>
                {columns.map((col, colIdx) => (
                  <td
                    key={col}
                    className={`text-center py-4 px-2 border-y border-[var(--border)] ${colIdx === columns.length - 1 ? "rounded-r-2xl border-r" : ""}`}
                  >
                    <input
                      type="radio"
                      checked={safeValue[row] === col}
                      onChange={() => onChange({ ...safeValue, [row]: col })}
                      className="w-5 h-5 accent-[var(--primary)] cursor-pointer"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },

  image_choice: ({ value, onChange, options = [] }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
      {(Array.isArray(options) ? options : []).map((opt, i) => (
        <div
          key={i}
          onClick={() => onChange(opt)}
          className={`cursor-pointer rounded-3xl overflow-hidden transition-all duration-300 border-4 group hover:shadow-2xl ${
            value === opt
              ? "border-[var(--primary)] shadow-xl dark:shadow-none scale-105"
              : "border-[var(--border)] grayscale opacity-60 hover:opacity-100 hover:grayscale-0 dark:bg-[var(--surface)]"
          }`}
        >
          <div className="aspect-square bg-[var(--surface)] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <ImageIcon
              size={32}
              className="text-[var(--text)] opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500"
            />
            {value === opt && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-[var(--primary)] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-in zoom-in-0 duration-300">
                <CheckCircle size={14} strokeWidth={3} />
              </div>
            )}
          </div>
          <div
            className={`py-4 px-3 text-[10px] font-bold uppercase tracking-widest text-center bg-[var(--bg)] ${value === opt ? "text-[var(--primary)]" : "text-[var(--muted)]"}`}
          >
            {opt}
          </div>
        </div>
      ))}
    </div>
  ),

  linear_scale: ({ value, onChange, min = 1, max = 5 }) => (
    <div className="flex justify-center gap-2 sm:gap-4 py-4">
      {[...Array(max - min + 1)].map((_, i) => {
        const val = min + i;
        return (
          <button
            key={val}
            onClick={() => onChange(val)}
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-[20px] font-bold text-lg transition-all border ${
              value === val
                ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xl shadow-[var(--primary)]/30 scale-110"
                : "bg-[var(--bg)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)]/30"
            }`}
          >
            {val}
          </button>
        );
      })}
    </div>
  ),
};

const DeleteConfirmModal = ({ isOpen, onCancel, onConfirm, questionText }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-[var(--surface)] rounded-xl shadow-2xl overflow-hidden border border-[var(--border)]"
        >
          <div className="p-7 text-center">
            <div className="w-12 h-12 bg-[var(--danger-glow)] text-[var(--danger)] rounded-xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={22} strokeWidth={2.5} />
            </div>
            <h3 className="text-[15px] font-bold text-[var(--text)] mb-2">
              Delete Question?
            </h3>
            <div className="bg-[var(--surface-2)] p-4 rounded-lg border border-[var(--border)] mb-4">
              <p className="text-[12px] text-[var(--muted)] italic mb-1">
                Target:
              </p>
              <p className="text-[13px] font-semibold text-[var(--text)] leading-relaxed">
                "{questionText}"
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[var(--warning-glow)] rounded-lg border border-[var(--warning-glow)] mb-5 text-left">
              <Info
                size={14}
                className="text-[var(--warning)] shrink-0 mt-0.5"
              />
              <p className="text-[11px] text-[var(--warning)] leading-snug">
                This will also purge all historical answers for this question.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="btn-ghost flex-1 justify-center"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="btn-primary flex-1 justify-center"
                style={{ background: "var(--danger)" }}
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ─── Question History Modal ────────────────────────────────────────────────────
const QuestionHistoryModal = ({ isOpen, onClose, questionId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && questionId) {
      const fetchLogs = async () => {
        setLoading(true);
        try {
          const res = await questionApi.getQuestionChangeLogs(questionId);
          setLogs(res.data || []);
        } catch (e) {
          console.error("Failed to load logs", e);
        } finally {
          setLoading(false);
        }
      };
      fetchLogs();
    }
  }, [isOpen, questionId]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-2xl bg-[var(--surface)] rounded-xl shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col max-h-[80vh]"
        >
          <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface-2)]">
            <h3 className="font-bold text-[var(--text)] flex items-center gap-2">
              <Clock size={16} /> Question Version History
            </h3>
            <button
              onClick={onClose}
              className="text-[var(--muted)] hover:text-[var(--text)]"
            >
              <XCircle size={18} />
            </button>
          </div>
          <div className="p-5 overflow-y-auto flex-1">
            {loading ? (
              <div className="text-center text-[var(--muted)] text-sm py-10 animate-pulse">
                Loading audit logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center text-[var(--muted)] text-sm py-10">
                No history available for this question.
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 border border-[var(--border)] rounded-lg bg-[var(--bg)]"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider bg-[var(--accent-glow)] px-2 py-1 rounded">
                        Version {log.questionVersion.version}
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        {new Date(log.changedAt).toLocaleString()}
                      </span>
                    </div>
                    {log.previousValue && (
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-md">
                          <div className="text-[10px] text-red-500 uppercase font-bold mb-1">
                            Previous
                          </div>
                          <pre className="text-[11px] text-[var(--text)] whitespace-pre-wrap">
                            {JSON.stringify(log.previousValue, null, 2)}
                          </pre>
                        </div>
                        <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-md">
                          <div className="text-[10px] text-green-500 uppercase font-bold mb-1">
                            New
                          </div>
                          <pre className="text-[11px] text-[var(--text)] whitespace-pre-wrap">
                            {JSON.stringify(log.newValue, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    {!log.previousValue && (
                      <div className="text-xs text-[var(--muted)] mt-2 italic">
                        Initial creation.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QuestionBuilderPage() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(DEFAULT_QUESTION);
  const [isEditing, setIsEditing] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  // Versions
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);

  // History Modal
  const [historyQuestionId, setHistoryQuestionId] = useState(null);

  useEffect(() => {
    fetchQuestions();
    fetchVersions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await questionApi.getAllQuestions();
      setQuestions(data.data || []);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const res = await questionApi.getQuestionnaireVersions();
      setVersions(res.data || []);
    } catch (error) {
      console.error("Failed to fetch versions:", error);
    }
  };

  const handleSnapshot = async () => {
    try {
      const res = await questionApi.snapshotQuestionnaire();
      toast.success(res.message || "Snapshot created");
      fetchVersions();
    } catch (error) {
      toast.error("Failed to create snapshot");
    }
  };

  const updateCurrent = (patch) =>
    setCurrentQuestion((q) => ({ ...q, ...patch }));

  const buildConfig = (q) => {
    if (q.type === "rating_stars") return { maxStars: q.maxStars };
    if (q.type === "slider") return { min: q.min, max: q.max, step: q.step };
    if (q.type === "nps") return { min: 0, max: 10 };
    if (q.type === "linear_scale") return { min: q.min ?? 1, max: q.max ?? 5 };
    if (q.type === "number") return { min: q.min ?? null, max: q.max ?? null };
    if (
      [
        "single_choice",
        "multi_choice",
        "dropdown",
        "ranking",
        "image_choice",
      ].includes(q.type)
    )
      return { options: q.options };
    if (q.type === "matrix") return { rows: q.rows, columns: q.columns };
    return null;
  };

  const handleAddOrUpdate = async () => {
    if (!currentQuestion.question.trim()) return;

    const payload = {
      question: currentQuestion.question,
      type: currentQuestion.type,
      config: buildConfig(currentQuestion),
    };

    try {
      if (isEditing) {
        const result = await questionApi.updateQuestion(
          currentQuestion.id,
          payload,
        );
        if (result.success) {
          setQuestions(
            questions.map((q) =>
              q.id === currentQuestion.id ? result.data : q,
            ),
          );
          setIsEditing(false);
          toast.success("Question updated successfully");
        }
      } else {
        const result = await questionApi.createQuestion(payload);
        if (result.success) {
          setQuestions([...questions, result.data]);
          toast.success("Question created successfully");
        }
      }
      setCurrentQuestion(DEFAULT_QUESTION);
    } catch (error) {
      console.error("Failed to save question:", error);
      const msg = error.response?.data?.message || "Error saving question";
      toast.error(msg);
    }
  };

  const handleEdit = (q) => {
    setCurrentQuestion({
      ...DEFAULT_QUESTION,
      id: q.id,
      question: q.question,
      type: q.type,
      ...(q.config || {}),
    });
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const result = await questionApi.deleteQuestion(deleteId);
      if (result.success) {
        setQuestions(questions.filter((q) => q.id !== deleteId));
        toast.success("Question and its data purged");
      }
    } catch (error) {
      console.error("Failed to delete question:", error);
      const msg = error.response?.data?.message || "Error deleting question";
      toast.error(msg);
    } finally {
      setDeleteId(null);
    }
  };

  const moveQuestion = (index, dir) => {
    const next = [...questions];
    const target = dir === "up" ? index - 1 : index + 1;
    if (target >= 0 && target < next.length) {
      [next[index], next[target]] = [next[target], next[index]];
      setQuestions(next);
    }
  };

  const exportJson = () => {
    const uri =
      "data:application/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify({ questions }, null, 2));
    Object.assign(document.createElement("a"), {
      href: uri,
      download: "quality-questions.json",
    }).click();
  };

  return (
    <div className="animate-fade-in pb-10">
      <PageHeader
        title="Question Builder"
        subtitle="Build dynamic questions for Quality Review (Manager only)"
        actions={[
          <button
            key="history"
            onClick={() => setShowVersions(!showVersions)}
            className={`btn-ghost ${showVersions ? "bg-[var(--surface-hover)]" : ""}`}
          >
            <Clock size={14} /> View Timeline
          </button>,
          <button
            key="snapshot"
            onClick={handleSnapshot}
            className="btn-primary"
            style={{
              backgroundColor: "var(--success)",
              borderColor: "var(--success)",
            }}
          >
            <Save size={14} /> Archive Snapshot
          </button>,
          <button key="export" onClick={exportJson} className="btn-primary">
            <Download size={14} /> Export JSON
          </button>,
        ]}
      />

      <div
        className={`flex flex-col ${showVersions ? "xl:grid xl:grid-cols-[220px,1fr,300px]" : "xl:grid xl:grid-cols-[1fr,300px]"} gap-4 transition-all`}
      >
        {/* ── Left: Version Timeline Sidebar ── */}
        {showVersions && (
          <div className="order-3 xl:order-1 space-y-4">
            <Card className="sticky top-16 p-4 min-h-[300px]">
              <div className="flex items-center gap-2 mb-4 border-b border-[var(--border)] pb-3">
                <Clock size={16} className="text-[var(--accent)]" />
                <h3 className="text-[13px] font-semibold text-[var(--text)]">
                  Version History
                </h3>
              </div>
              <div className="space-y-4">
                {versions.map((v, i) => (
                  <div
                    key={v.id}
                    className="relative pl-4 border-l-2 border-[var(--border)]"
                  >
                    <div className="absolute w-3 h-3 rounded-full bg-[var(--surface)] border-2 border-[var(--primary)] -left-[7.5px] top-1" />
                    <div className="text-[12px] font-bold text-[var(--text)]">
                      Version {v.versionNumber}
                    </div>
                    <div className="text-[10px] text-[var(--muted)] mb-1">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-[var(--success)]">
                      {v.status}
                    </div>
                    <div className="text-[11px] text-[var(--muted)] mt-1">
                      {v.questions?.length || 0} questions
                    </div>
                  </div>
                ))}
                {versions.length === 0 && (
                  <div className="text-[11px] text-[var(--muted)] text-center italic py-4">
                    No snapshots available.
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ── Center: Question List ── */}
        <div className="space-y-4 order-2 xl:order-2">
          <Card noPad className="overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-[var(--accent)] rounded-full" />
                <h3 className="text-[13px] font-semibold text-[var(--text)]">
                  Question List ({questions.length})
                </h3>
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="py-24 px-10 text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-[var(--surface)] rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner opacity-40">
                  <Type size={40} className="text-[var(--text)]" />
                </div>
                <h4 className="text-lg font-bold text-[var(--text)] tracking-tight mb-2">
                  No Questions Found
                </h4>
                <p className="text-sm font-bold text-[var(--muted)] opacity-60">
                  Start by adding a new question using the editor.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]/30">
                {questions.map((q, idx) => {
                  const Comp = QuestionComponents[q.type];
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={q.id}
                      className="p-4 hover:bg-[var(--table-row-hover)] transition-all group border-b border-[var(--border)] last:border-0"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="pt-1 text-[var(--muted)] opacity-30 group-hover:opacity-100 transition-opacity shrink-0">
                            <GripVertical size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-bold text-[var(--text)] tracking-tight leading-tight mb-2">
                              {q.question}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-semibold px-2.5 py-1 bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)] rounded-md uppercase tracking-wider">
                                {q.type.replace("_", " ")}
                              </span>
                              <button
                                onClick={() => setHistoryQuestionId(q.id)}
                                className="text-[10px] font-semibold px-2.5 py-1 bg-[var(--primary-glow)] text-[var(--primary)] border border-[var(--primary)]/20 rounded-md uppercase tracking-wider flex items-center gap-1 hover:bg-[var(--primary)] hover:text-white transition-colors"
                              >
                                <Activity size={12} /> Audit History
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col gap-3 self-end sm:self-start">
                          <div className="flex gap-1 bg-[var(--bg)] p-1 rounded-xl border border-[var(--border)] shadow-sm">
                            <button
                              onClick={() => moveQuestion(idx, "up")}
                              disabled={idx === 0}
                              className={`p-2 rounded-lg transition-all ${idx === 0 ? "opacity-20 cursor-not-allowed" : "hover:bg-[var(--surface-hover)] hover:text-[var(--primary)]"}`}
                            >
                              <ChevronUp size={14} strokeWidth={3} />
                            </button>
                            <button
                              onClick={() => moveQuestion(idx, "down")}
                              disabled={idx === questions.length - 1}
                              className={`p-2 rounded-lg transition-all ${idx === questions.length - 1 ? "opacity-20 cursor-not-allowed" : "hover:bg-[var(--surface-hover)] hover:text-[var(--primary)]"}`}
                            >
                              <ChevronDown size={14} strokeWidth={3} />
                            </button>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(q)}
                              className="btn-icon"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteId(q.id)}
                              className="btn-icon hover:text-[var(--danger)] hover:border-[var(--danger)]"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Live preview */}
                      <div className="mt-4 p-4 bg-[var(--surface-2)] rounded-lg border border-[var(--border)] opacity-70 pointer-events-none">
                        {Comp ? (
                          <Comp
                            {...(q.config || {})}
                            value={null}
                            onChange={() => {}}
                          />
                        ) : (
                          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] text-center py-4">
                            Preview Not Available
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* ── Right: Question Editor ── */}
        <div className="order-1 xl:order-3">
          <Card className="sticky top-14 p-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center text-[var(--accent)]">
                  <Edit3 size={16} />
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-[var(--text)]">
                    Question Editor
                  </h3>
                  <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">
                    Edit Question Details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowJson(!showJson)}
                className={`btn-icon ${showJson ? "bg-[var(--accent)] text-white border-[var(--accent)]" : ""}`}
              >
                <FileJson size={15} />
              </button>
            </div>

            <AnimatePresence>
              {showJson && (
                <motion.pre
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#1e1e1e] dark:bg-[#0a0a0a] text-[#b5cea8] p-6 rounded-[24px] text-[10px] overflow-x-auto mb-8 font-mono border border-black/50 shadow-2xl"
                >
                  {JSON.stringify({ questions }, null, 2)}
                </motion.pre>
              )}
            </AnimatePresence>

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                  Question Statement
                </label>
                <textarea
                  value={currentQuestion.question}
                  onChange={(e) => updateCurrent({ question: e.target.value })}
                  placeholder="What would you like to ask?"
                  className="input-field min-h-[80px] resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                  Question Type
                </label>
                <div className="relative">
                  <select
                    value={currentQuestion.type}
                    onChange={(e) => {
                      const type = e.target.value;
                      updateCurrent({
                        type,
                        options:
                          type.includes("choice") || type === "dropdown"
                            ? ["Option 1", "Option 2"]
                            : currentQuestion.options,
                        maxStars:
                          type === "rating_stars"
                            ? 5
                            : currentQuestion.maxStars,
                        min:
                          type === "slider" || type === "nps"
                            ? 0
                            : currentQuestion.min,
                        max:
                          type === "nps"
                            ? 10
                            : type === "slider"
                              ? 100
                              : currentQuestion.max,
                        rows:
                          type === "matrix"
                            ? ["Row 1", "Row 2"]
                            : currentQuestion.rows,
                        columns:
                          type === "matrix"
                            ? ["Col 1", "Col 2"]
                            : currentQuestion.columns,
                      });
                    }}
                    className="input-field pr-9 appearance-none cursor-pointer"
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
                    size={18}
                    strokeWidth={3}
                  />
                </div>
              </div>
            </div>

            <motion.div
              key={currentQuestion.type}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[var(--surface-2)] rounded-lg border border-[var(--border)] p-4 mb-4"
            >
              <div className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />{" "}
                Options
              </div>

              {/* Star count */}
              {currentQuestion.type === "rating_stars" && (
                <div className="flex flex-col gap-4">
                  <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest opacity-60 px-2">
                    Number of Stars
                  </span>
                  <div className="flex gap-3">
                    {[3, 5, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => updateCurrent({ maxStars: num })}
                        className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                          currentQuestion.maxStars === num
                            ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30 scale-105"
                            : "bg-[var(--bg)] text-[var(--muted)] border border-[var(--border)] hover:border-[var(--primary)]/30"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Choice options */}
              {(currentQuestion.type === "single_choice" ||
                currentQuestion.type === "multi_choice" ||
                currentQuestion.type === "dropdown") && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest opacity-60 px-2">
                      Choices
                    </span>
                    <button
                      onClick={() =>
                        updateCurrent({
                          options: [...currentQuestion.options, "New Option"],
                        })
                      }
                      className="w-10 h-10 rounded-full bg-[var(--primary-glow)] text-[var(--primary)] flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                    >
                      <Plus size={18} strokeWidth={3} />
                    </button>
                  </div>
                  {currentQuestion.options.map((opt, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={idx}
                      className="flex gap-3 items-center"
                    >
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...currentQuestion.options];
                          newOpts[idx] = e.target.value;
                          updateCurrent({ options: newOpts });
                        }}
                        className="flex-1 px-5 py-4 rounded-[18px] bg-[var(--bg)] border border-[var(--border)] text-sm font-bold text-[var(--text)] focus:border-[var(--primary)] outline-none shadow-sm"
                        placeholder="Option text..."
                      />
                      <button
                        onClick={() =>
                          updateCurrent({
                            options: currentQuestion.options.filter(
                              (_, i) => i !== idx,
                            ),
                          })
                        }
                        className="w-10 h-10 rounded-xl bg-rose-500/5 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Slider config */}
              {currentQuestion.type === "slider" && (
                <div className="grid grid-cols-3 gap-6">
                  {["min", "max", "step"].map((field) => (
                    <div key={field}>
                      <label className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2 block px-1 truncate">
                        {field}
                      </label>
                      <input
                        type="number"
                        value={currentQuestion[field]}
                        onChange={(e) =>
                          updateCurrent({
                            [field]: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Matrix config */}
              {currentQuestion.type === "matrix" && (
                <div className="grid grid-cols-2 gap-8">
                  {[
                    { key: "rows", label: "Rows", btnLabel: "Row" },
                    { key: "columns", label: "Columns", btnLabel: "Col" },
                  ].map(({ key, label, btnLabel }) => (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase text-[var(--muted)] opacity-60">
                          {label}
                        </span>
                        <button
                          onClick={() =>
                            updateCurrent({
                              [key]: [
                                ...currentQuestion[key],
                                `${btnLabel} ${currentQuestion[key].length + 1}`,
                              ],
                            })
                          }
                          className="text-[var(--primary)] hover:scale-110 transition-transform"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>
                      {currentQuestion[key].map((item, idx) => (
                        <input
                          key={idx}
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const updated = [...currentQuestion[key]];
                            updated[idx] = e.target.value;
                            updateCurrent({ [key]: updated });
                          }}
                          className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs font-bold text-[var(--text)] outline-none focus:border-[var(--primary)]"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Simple types */}
              {SIMPLE_TYPES.includes(currentQuestion.type) && (
                <div className="py-8 text-center px-4">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={24} strokeWidth={3} />
                  </div>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                    No Additional Options
                  </p>
                  <p className="text-[9px] font-bold text-[var(--muted)] mt-1 opacity-60 whitespace-pre-wrap">
                    This question type does not require further configuration.
                  </p>
                </div>
              )}
            </motion.div>

            <button
              onClick={handleAddOrUpdate}
              disabled={!currentQuestion.question.trim()}
              className={`btn-primary w-full justify-center py-2.5 ${!currentQuestion.question.trim() ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              {isEditing ? <Save size={14} /> : <Zap size={14} />}
              {isEditing ? "Update Question" : "Add Question"}
            </button>
          </Card>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteId}
        questionText={questions.find((q) => q.id === deleteId)?.question || ""}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />

      <QuestionHistoryModal
        isOpen={!!historyQuestionId}
        questionId={historyQuestionId}
        onClose={() => setHistoryQuestionId(null)}
      />
    </div>
  );
}
