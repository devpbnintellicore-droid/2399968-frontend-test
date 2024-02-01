import { useState } from "react";
import { Upload, FileCheck, X } from "lucide-react";

export default function FileUploader({
  label,
  hint,
  accept,
  maxFiles = Infinity,
  onFilesChange,
}) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);

  const addFiles = (incoming) => {
    if (!incoming || incoming.length === 0) return;
    setFiles((prev) => {
      const room = Math.max(0, maxFiles - prev.length);
      if (room === 0) return prev;
      const updated = [...prev, ...incoming.slice(0, room)];
      if (onFilesChange) onFilesChange(updated);
      return updated;
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    addFiles(dropped);
  };

  const removeFile = (i) =>
    setFiles((prev) => {
      const updated = prev.filter((_, idx) => idx !== i);
      if (onFilesChange) onFilesChange(updated);
      return updated;
    });

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? "var(--primary)" : "var(--border)"}`,
          borderRadius: 12,
          padding: 32,
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          background: dragging ? "var(--primary-glow)" : "transparent",
        }}
      >
        <Upload
          size={28}
          color="var(--muted)"
          style={{ margin: "0 auto 12px" }}
        />
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>
          {hint}
        </div>
        <label
          style={{
            display: "inline-block",
            background: "var(--primary-glow)",
            color: "var(--primary)",
            padding: "7px 18px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: files.length >= maxFiles ? "not-allowed" : "pointer",
            opacity: files.length >= maxFiles ? 0.6 : 1,
          }}
        >
          Browse Files
          <input
            type="file"
            accept={accept}
            style={{ display: "none" }}
            onChange={(e) => addFiles(Array.from(e.target.files))}
            multiple
            disabled={files.length >= maxFiles}
          />
        </label>
      </div>

      {files.length > 0 && (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {files.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                background: "var(--bg)",
                borderRadius: 8,
                border: "1px solid var(--border)",
              }}
            >
              <FileCheck size={14} color="var(--success)" />
              <span
                style={{
                  flex: 1,
                  fontSize: 12,
                  color: "var(--text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {f.name}
              </span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                {(f.size / 1024).toFixed(0)}KB
              </span>
              <button
                onClick={() => removeFile(i)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                  display: "flex",
                }}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
