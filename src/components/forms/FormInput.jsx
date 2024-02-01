export default function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  hint,
  required,
  error,
  ...rest
}) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">
          {label}{" "}
          {required && <span className="text-[var(--danger)]">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)] flex items-center">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...rest}
          className={`input-field ${icon ? "pl-9" : "pl-3.5"} ${error ? "border-rose-500 bg-rose-500/5" : ""}`}
        />
      </div>
      {error ? (
        <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-widest">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-[var(--muted)] mt-1">{hint}</p>
      ) : null}
    </div>
  );
}
