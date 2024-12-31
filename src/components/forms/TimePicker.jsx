import { useEffect, useMemo, useRef, useState } from "react";
import { Clock } from "lucide-react";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

const parseTime = (value) => {
  if (!value) return null;
  const parts = String(value).split(":");
  if (parts.length < 2) return null;
  const hour24 = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  if (Number.isNaN(hour24) || Number.isNaN(minute)) return null;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour: hour12, minute, ampm };
};

const formatDisplayTime = (hour, minute, ampm) => {
  const h = String(hour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${h}:${m} ${ampm}`;
};

const to24Hour = (hour, minute, ampm) => {
  const base = hour % 12;
  const hour24 = ampm === "PM" ? base + 12 : base;
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const roundToStep = (minute, step = 5) =>
  Math.round(minute / step) * step;

export default function TimePicker({
  label,
  value,
  onChange,
  required,
  placeholder = "HH:MM AM",
  error,
}) {
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hour");

  const initial = useMemo(() => {
    const parsed = parseTime(value);
    if (parsed) return parsed;
    const now = new Date();
    const minute = roundToStep(now.getMinutes());
    const hour24 = now.getHours();
    const ampm = hour24 >= 12 ? "PM" : "AM";
    const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return { hour, minute, ampm };
  }, [value]);

  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [ampm, setAmpm] = useState(initial.ampm);
  const hasValue = Boolean(value);

  useEffect(() => {
    const parsed = parseTime(value);
    if (!parsed) return;
    setHour(parsed.hour);
    setMinute(parsed.minute);
    setAmpm(parsed.ampm);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const updateTime = (nextHour, nextMinute, nextAmpm) => {
    setHour(nextHour);
    setMinute(nextMinute);
    setAmpm(nextAmpm);
    onChange?.({ target: { value: to24Hour(nextHour, nextMinute, nextAmpm) } });
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      inputRef.current?.focus();
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveSection((s) =>
        s === "hour" ? "ampm" : s === "minute" ? "hour" : "minute",
      );
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActiveSection((s) =>
        s === "hour" ? "minute" : s === "minute" ? "ampm" : "hour",
      );
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const dir = e.key === "ArrowUp" ? -1 : 1;
      if (activeSection === "hour") {
        const idx = HOURS.indexOf(hour);
        const nextHour = HOURS[(idx + dir + HOURS.length) % HOURS.length];
        updateTime(nextHour, minute, ampm);
      } else if (activeSection === "minute") {
        const idx = MINUTES.indexOf(minute);
        const nextMinute = MINUTES[(idx + dir + MINUTES.length) % MINUTES.length];
        updateTime(hour, nextMinute, ampm);
      } else {
        updateTime(hour, minute, ampm === "AM" ? "PM" : "AM");
      }
    }
  };

  return (
    <div ref={rootRef} className="relative">
      {label && (
        <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">
          {label}{" "}
          {required && <span className="text-[var(--danger)]">*</span>}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none flex items-center">
          <Clock size={16} />
        </span>
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={hasValue ? formatDisplayTime(hour, minute, ampm) : ""}
          placeholder={placeholder}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={handleKeyDown}
          aria-label={label || "Time picker"}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={`input-field pl-9 cursor-pointer ${error ? "border-rose-500 bg-rose-500/5" : ""}`}
        />
      </div>

      {error && (
        <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-widest">{error}</p>
      )}

      <div
        role="dialog"
        aria-hidden={!open}
        className={`absolute top-[calc(100%+8px)] left-0 w-[260px] max-w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-2.5 transition-all duration-150 z-50 ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-1.5 pointer-events-none"
        }`}
        onKeyDown={handleKeyDown}
      >
        <div className="flex gap-2.5">
          <div className="flex-1">
            <div className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1">
              Hour
            </div>
            <div
              className="max-h-[120px] overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] scrollbar-hide"
              onMouseEnter={() => setActiveSection("hour")}
            >
              {HOURS.map((h) => {
                const selected = h === hour;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => updateTime(h, minute, ampm)}
                    className={`w-full p-1.5 px-2 text-left border-none cursor-pointer text-xs transition-colors ${
                      selected ? "bg-[var(--primary-glow)] text-[var(--primary)] font-bold" : "bg-transparent text-[var(--text)] font-semibold hover:bg-[var(--bg-hover)]"
                    }`}
                  >
                    {String(h).padStart(2, "0")}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1">
            <div className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1">
              Minute
            </div>
            <div
              className="max-h-[120px] overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] scrollbar-hide"
              onMouseEnter={() => setActiveSection("minute")}
            >
              {MINUTES.map((m) => {
                const selected = m === minute;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateTime(hour, m, ampm)}
                    className={`w-full p-1.5 px-2 text-left border-none cursor-pointer text-xs transition-colors ${
                      selected ? "bg-[var(--primary-glow)] text-[var(--primary)] font-bold" : "bg-transparent text-[var(--text)] font-semibold hover:bg-[var(--bg-hover)]"
                    }`}
                  >
                    {String(m).padStart(2, "0")}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-[70px]">
            <div className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1">
              AM/PM
            </div>
            <div
              className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-1.5"
              onMouseEnter={() => setActiveSection("ampm")}
            >
              {["AM", "PM"].map((period) => {
                const selected = period === ampm;
                return (
                  <button
                    key={period}
                    type="button"
                    onClick={() => updateTime(hour, minute, period)}
                    className={`w-full p-1.5 px-1 rounded-md border transition-all duration-150 text-xs font-bold cursor-pointer ${
                      selected
                        ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                        : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--bg-hover)]"
                    }`}
                  >
                    {period}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
