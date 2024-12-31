import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const parseISODate = (value) => {
  if (!value) return null;
  const parts = String(value).split("-");
  if (parts.length !== 3) return null;
  const [y, m, d] = parts.map((p) => parseInt(p, 10));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const formatISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDisplayDate = (date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = MONTHS[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
};

const isSameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const clampToStartOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export default function DatePicker({
  label,
  value,
  onChange,
  required,
  min,
  placeholder = "DD MMM YYYY",
  error,
}) {
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeDate, setActiveDate] = useState(() => parseISODate(value));
  const [viewMonth, setViewMonth] = useState(() => {
    const base = parseISODate(value) || new Date();
    return base.getMonth();
  });
  const [viewYear, setViewYear] = useState(() => {
    const base = parseISODate(value) || new Date();
    return base.getFullYear();
  });

  const minDate = useMemo(() => {
    const parsed = parseISODate(min);
    return parsed ? clampToStartOfDay(parsed) : null;
  }, [min]);

  useEffect(() => {
    const parsed = parseISODate(value);
    setActiveDate(parsed);
    if (parsed) {
      setViewMonth(parsed.getMonth());
      setViewYear(parsed.getFullYear());
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const today = useMemo(() => clampToStartOfDay(new Date()), []);

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startDay = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const calendarDays = useMemo(() => {
    const cells = [];
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i -= 1) {
      const day = prevMonthDays - i;
      cells.push({
        date: new Date(viewYear, viewMonth - 1, day),
        current: false,
      });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({
        date: new Date(viewYear, viewMonth, day),
        current: true,
      });
    }
    while (cells.length < 42) {
      const nextDay = cells.length - (startDay + daysInMonth) + 1;
      cells.push({
        date: new Date(viewYear, viewMonth + 1, nextDay),
        current: false,
      });
    }
    return cells;
  }, [viewYear, viewMonth, startDay, daysInMonth]);

  const handleSelect = (date) => {
    if (minDate && clampToStartOfDay(date) < minDate) return;
    setActiveDate(date);
    onChange?.({ target: { value: formatISODate(date) } });
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    const current = activeDate || new Date(viewYear, viewMonth, 1);
    let next = current;
    if (e.key === "ArrowLeft") next = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1);
    if (e.key === "ArrowRight") next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
    if (e.key === "ArrowUp") next = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 7);
    if (e.key === "ArrowDown") next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7);
    if (e.key === "Home") next = new Date(current.getFullYear(), current.getMonth(), 1);
    if (e.key === "End") next = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(current);
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }
    if (next !== current) {
      e.preventDefault();
      setActiveDate(next);
      setViewMonth(next.getMonth());
      setViewYear(next.getFullYear());
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
          <Calendar size={16} />
        </span>
        <input
          ref={buttonRef}
          type="text"
          readOnly
          value={activeDate ? formatDisplayDate(activeDate) : ""}
          placeholder={placeholder}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={handleKeyDown}
          aria-label={label || "Date picker"}
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
        className={`absolute top-[calc(100%+8px)] left-0 w-[280px] max-w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-2.5 transition-all duration-150 z-50 ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-1.5 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between mb-2 gap-2">
          <button
            type="button"
            onClick={() => {
              const prev = new Date(viewYear, viewMonth - 1, 1);
              setViewMonth(prev.getMonth());
              setViewYear(prev.getFullYear());
            }}
            aria-label="Previous month"
            className="w-8 h-8 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--muted)] flex items-center justify-center cursor-pointer hover:bg-[var(--primary-glow)] hover:text-[var(--primary)] transition-colors"
          >
            <ChevronLeft size={14} />
          </button>

          <div className="flex gap-2 items-center">
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
              className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-1 px-1.5 text-[11px] text-[var(--text)] font-semibold outline-none"
              aria-label="Select month"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={viewYear}
              onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
              className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-1 px-1.5 text-[11px] text-[var(--text)] font-semibold outline-none"
              aria-label="Select year"
            >
              {Array.from({ length: 12 }, (_, i) => viewYear - 10 + i).map(
                (year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ),
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = new Date(viewYear, viewMonth + 1, 1);
              setViewMonth(next.getMonth());
              setViewYear(next.getFullYear());
            }}
            aria-label="Next month"
            className="w-8 h-8 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--muted)] flex items-center justify-center cursor-pointer hover:bg-[var(--primary-glow)] hover:text-[var(--primary)] transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-[9px] font-bold text-[var(--muted)] text-center"
            >
              {day}
            </div>
          ))}
        </div>

        <div
          role="grid"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="grid grid-cols-7 gap-1 outline-none"
        >
          {calendarDays.map(({ date, current }, idx) => {
            const isSelected = isSameDay(date, activeDate);
            const isToday = isSameDay(date, today);
            const isDisabled = minDate && clampToStartOfDay(date) < minDate;
            return (
              <button
                key={`${date.toISOString()}-${idx}`}
                type="button"
                onClick={() => handleSelect(date)}
                disabled={isDisabled}
                className={`h-7 rounded-lg text-[11px] font-bold transition-all duration-150 border outline-none ${
                    isDisabled ? "cursor-not-allowed opacity-40 bg-transparent text-[var(--muted)] border-transparent" : "cursor-pointer"
                } ${
                    isSelected
                      ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm"
                      : isToday
                        ? "bg-[var(--primary-glow)] text-[var(--primary)] border-transparent"
                        : "bg-transparent border-transparent hover:bg-[var(--bg)] text-[var(--text)]"
                  } ${!current && !isSelected ? "text-[var(--muted)]" : ""}`}
                aria-label={formatDisplayDate(date)}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
