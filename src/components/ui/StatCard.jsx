import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ icon, label, value, sub, trend, trendUp, iconBg, iconColor }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={iconBg ? { background: iconBg, color: iconColor } : undefined}>
        {icon}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
      {trend && (
        <span className={`stat-card-badge ${trendUp ? "bg-[var(--success-glow)] text-[var(--success)]" : "bg-[var(--danger-glow)] text-[var(--danger)]"}`}>
          {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {trend}
        </span>
      )}
    </div>
  );
}
