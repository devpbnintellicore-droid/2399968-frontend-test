import { Monitor } from "lucide-react";

export default function DeviceRestriction() {
  return (
    <div className="fixed inset-0 bg-[var(--bg)] flex items-center justify-center p-6 z-[9999]">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--accent-glow)] flex items-center justify-center">
          <Monitor size={40} className="text-[var(--accent)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-3">
          Desktop And Laptop Only
        </h1>
        <p className="text-[var(--muted)] text-sm leading-relaxed">
          This dashboard is optimized for desktop and laptop screens only. 
          Please access from a PC or laptop for the best experience.
        </p>
      </div>
    </div>
  );
}
