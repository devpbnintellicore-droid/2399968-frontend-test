const STATUS_CONFIG = {
  Completed: { dot: "bg-[var(--success)]",  cls: "bg-[var(--success-glow)] text-[var(--success)]" },
  COMPLETED: { dot: "bg-[var(--success)]",  cls: "bg-[var(--success-glow)] text-[var(--success)]" },
  Pending:   { dot: "bg-[var(--warning)]",  cls: "bg-[var(--warning-glow)] text-[var(--warning)]" },
  DRAFT:     { dot: "bg-[var(--muted)]",    cls: "bg-[var(--surface-2)] text-[var(--muted)]" },
  Submitted: { dot: "bg-[var(--accent)]",   cls: "bg-[var(--accent-glow)] text-[var(--accent-light)]" },
  SUBMITTED: { dot: "bg-[var(--accent)]",   cls: "bg-[var(--accent-glow)] text-[var(--accent-light)]" },
  UNDER_REVIEW: { dot: "bg-[var(--warning)]", cls: "bg-[var(--warning-glow)] text-[var(--warning)]" },
  APPROVED:  { dot: "bg-[var(--success)]",  cls: "bg-[var(--success-glow)] text-[var(--success)]" },
  REJECTED:  { dot: "bg-[var(--danger)]",   cls: "bg-[var(--danger-glow)] text-[var(--danger)]" },
  Cancel:    { dot: "bg-[var(--danger)]",   cls: "bg-[var(--danger-glow)] text-[var(--danger)]" },
  Review:    { dot: "bg-[var(--warning)]",  cls: "bg-[var(--warning-glow)] text-[var(--warning)]" },
  Low:       { dot: "bg-[var(--success)]",  cls: "bg-[var(--success-glow)] text-[var(--success)]" },
  Medium:    { dot: "bg-[var(--warning)]",  cls: "bg-[var(--warning-glow)] text-[var(--warning)]" },
  High:      { dot: "bg-[var(--danger)]",   cls: "bg-[var(--danger-glow)] text-[var(--danger)]" },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span className={`badge ${cfg.cls}`}>
      <span className={`badge-dot ${cfg.dot}`} />
      {status}
    </span>
  );
}
