import React, { useState, useEffect } from "react";
import {
  Search,
  ChefHat,
  Clock,
  Star,
  ArrowRight,
  LayoutGrid,
  List,
  X,
  Shield,
  Activity,
  Zap,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import experimentApi from "../../api/experimentApi";
import toast from "react-hot-toast";

const sensoryLabels = [
  { key: "taste", label: "Taste & Flavor" },
  { key: "aroma", label: "Aroma & Scent" },
  { key: "saltiness", label: "Saltiness" },
  { key: "visual", label: "Visual Appeal" },
  { key: "consistency", label: "Texture & Consistency" },
  { key: "spiciness", label: "Spiciness" },
  { key: "oiliness", label: "Oiliness" },
  { key: "freshness", label: "Freshness" },
  { key: "aftertaste", label: "Aftertaste" },
];

const VERSION_FIELD_LABELS = {
  recipeName: "Recipe name",
  recipeVersion: "Version",
  temperature: "Temperature",
  duration: "Cooking duration",
  expectedTexture: "Expected texture",
  achievedTexture: "Achieved texture",
  expectedOutput: "Expected output",
  actualOutput: "Actual output",
  remarks: "Chef remarks",
  ingredients: "Ingredients",
};

const formatAnswerValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (typeof value === "object") {
    if (value.raw) return String(value.raw);
    if (typeof value.value === "boolean") return value.value ? "Yes" : "No";
    if (value.value !== undefined && value.value !== null) return String(value.value);
    return "—";
  }
  return String(value);
};

const formatVersionChangeSummary = (history) => {
  if (!history?.changeSummary) return "Recipe version logged";
  const summary = String(history.changeSummary);
  if (summary === "Initial recipe created") {
    return summary;
  }

  if (summary.includes(" changed from ")) {
    // If it's a long auto-generated string with changes, just say it's updated. 
    // The details are already shown in the table below.
    return "Recipe updated";
  }

  return summary
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((field) => VERSION_FIELD_LABELS[field] || field)
    .join(", ");
};

const formatTimelineValue = (value) => {
  if (value === null || value === undefined || value === "") return "blank";
  if (Array.isArray(value)) {
    if (!value.length) return "none";
    return value
      .map((item) =>
        typeof item === "object"
          ? `${item.name || "Item"} ${item.quantity ?? ""} ${item.unit || ""}`.trim()
          : String(item),
      )
      .join("; ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getChangedTimelineRows = (history) => {
  const oldValue = history?.oldValue || {};
  const newValue = history?.newValue || {};
  const keys = Object.keys(newValue).filter(
    (key) => JSON.stringify(oldValue?.[key]) !== JSON.stringify(newValue?.[key]),
  );
  return keys.map((key) => ({
    field: VERSION_FIELD_LABELS[key] || key,
    oldValue: formatTimelineValue(oldValue?.[key]),
    newValue: formatTimelineValue(newValue?.[key]),
  }));
};

const ExperimentDetailModal = ({ recipe, onClose, onStatusChange }) => {
  if (!recipe) return null;
  const role = localStorage.getItem("ck_role");
  const canApprove = ["MANAGER", "REVIEWER"].includes(String(role || "").toUpperCase());
  const ingredients = recipe.ingredients || [];
  const reviewData = {
    sensoryScores: recipe.sensoryScores || {},
    remarks: recipe.remarks || "",
    reviewedBy: recipe.reviewerName || null,
    reviewedDate: recipe.reviewedDate || null,
  };
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = async () => {
    if (isActionSubmitting) return;
    setIsActionSubmitting(true);
    try {
      await experimentApi.approveExperiment(recipe.dbId);
      await onStatusChange?.(recipe, "APPROVED");
      toast.success("Experiment approved");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve experiment");
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleReject = () => {
    if (isActionSubmitting) return;
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (isActionSubmitting || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setIsActionSubmitting(true);
    try {
      await experimentApi.rejectExperiment(recipe.dbId, rejectionReason.trim());
      await onStatusChange?.(recipe, "REJECTED");
      toast.success("Experiment rejected");
      setIsRejectDialogOpen(false);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject experiment");
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editNotesText, setEditNotesText] = useState(recipe.remarks || "");
  const [editNotesReason, setEditNotesReason] = useState("");
  const isLocked = ["APPROVED", "COMPLETED"].includes(String(recipe.status).toUpperCase());

  const handleUpdateNotes = async () => {
    if (!editNotesReason.trim()) {
      toast.error("Please provide a reason for the edit");
      return;
    }
    try {
      await experimentApi.updateRemarks(recipe.dbId, editNotesText, editNotesReason);
      toast.success("Chef notes updated");
      setIsEditingNotes(false);
      onClose(); // simple way to trigger refresh since it closes modal
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update notes");
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--surface)] rounded-xl shadow-2xl border border-[var(--border)] animate-slide-up no-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--surface)] px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between z-10">
          <div className="min-w-0 flex-1 pr-3">
            <h2 className="text-[14px] font-bold text-[var(--text)] truncate">
              {recipe.recipe}
            </h2>
            <p className="text-[11px] text-[var(--muted)]">
              {recipe.id} · Batch: {recipe.batchNo}
            </p>
            <p className="text-[10px] text-[var(--muted)] mt-0.5">
              Auto-generated ID. This ID is generated automatically at creation time.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {recipe.aiScoreState?.state === "Analysis Completed" ? (
              <span className="text-[13px] font-bold text-[var(--accent)]">
                {recipe.aiScoreState.value}
                <span className="text-[10px] text-[var(--muted)]">/100</span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-[var(--muted)]">
                {recipe.aiScoreState?.state || "AI Status: Pending Analysis"}
              </span>
            )}
            <StatusBadge status={recipe.status} />
            <button onClick={onClose} className="btn-icon">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Recipe Image */}
          {recipe.image && (
            <div
              className="w-full rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center"
              style={{ minHeight: "200px", maxHeight: "400px" }}
            >
              <img
                src={recipe.image}
                alt={recipe.recipe}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Chef info */}
          <div className="flex items-center gap-2.5 p-3 bg-[var(--accent-glow)] rounded-lg border border-[var(--border)]">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
              {(recipe.chef || "?")
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <div className="text-[12px] font-semibold text-[var(--text)]">
                {recipe.chef || "Unknown Chef"}
              </div>
              <div className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                <Clock size={9} /> {recipe.date}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { label: "Ingredients", value: ingredients.length },
              { label: "Temperature", value: `${recipe.temp}°C` },
              { label: "Version", value: recipe.version },
              { label: "Duration", value: `${recipe.timing}m` },
              { label: "Created By", value: recipe.chef || "Unknown Chef" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-[var(--surface-2)] rounded-lg p-3 border border-[var(--border)]"
              >
                <div className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">
                  {label}
                </div>
                <div className="text-[13px] font-semibold text-[var(--text)]">
                  {value || "—"}
                </div>
              </div>
            ))}
          </div>

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                  Ingredients
                </h3>
                <span className="text-[10px] px-2 py-0.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-full text-[var(--muted)]">
                  {ingredients.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg"
                  >
                    <span className="text-[12px] font-medium text-[var(--text)]">
                      {ing.name}
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-glow)] px-2 py-0.5 rounded-md">
                      {ing.quantity} {ing.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sensory Scores */}
          {reviewData.reviewedBy && (
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border)] mb-3">
                <div>
                  <div className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                    Reviewed By
                  </div>
                  <div className="text-[12px] font-semibold text-[var(--text)]">
                    {reviewData.reviewedBy}
                  </div>
                </div>
                <div className="text-[11px] text-[var(--muted)]">
                  {reviewData.reviewedDate}
                </div>
              </div>
              <h3 className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2.5">
                Sensory Scores
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sensoryLabels.map(({ key, label }) => {
                  const val = reviewData.sensoryScores[key];
                  return (
                    <div
                      key={key}
                      className="flex justify-between items-center px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg"
                    >
                      <span className="text-[11px] text-[var(--muted)]">
                        {label}
                      </span>
                      <span className="text-[12px] font-bold text-[var(--accent)]">
                        {val ? `${val}/10` : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Review Answers */}
          {recipe.reviewAnswers?.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2.5">
                Feedback Answers
              </h3>
              <div className="space-y-3">
                {Array.from(
                  new Map(
                    recipe.reviewAnswers
                      .filter((ans) => ans.question)
                      .map((ans) => [ans.questionId, ans])
                  ).values()
                ).map((ans, idx) => (
                  <div
                    key={ans.id || idx}
                    className="p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg"
                  >
                    <p className="text-[12px] font-semibold text-[var(--text)] mb-1">
                      {ans.question?.question || "Question"}
                    </p>
                    <p className="text-[12px] text-[var(--muted)]">
                      {formatAnswerValue(ans.answerValue)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg">
            <h3 className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
              Evidence / Calculation Details
            </h3>
            <div className="space-y-1 text-[12px] text-[var(--muted)]">
              <div>Recipe and experiment IDs are generated by the backend after database creation.</div>
              <div>Version increments automatically from the latest stored recipe version and is not manually editable by normal users.</div>
              <div>Created At: <span className="font-semibold text-[var(--text)]">{recipe.createdAtLabel || recipe.date || "—"}</span></div>
            </div>
          </div>

          {recipe.versionHistory && (
            <div>
              <h3 className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
                Recipe Version History
              </h3>
              <div className="p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-[12px]">
                <div className="font-semibold text-[var(--text)]">
                  {recipe.versionHistory.version} - {formatVersionChangeSummary(recipe.versionHistory)}
                </div>
                <div className="text-[var(--muted)] mt-1">
                  Modified By: {recipe.versionHistory.modifiedBy || recipe.chef || "System"}
                </div>
                <div className="text-[var(--muted)]">
                  Modified Date: {recipe.versionHistory.modifiedAt ? new Date(recipe.versionHistory.modifiedAt).toLocaleDateString("en-CA") : recipe.date}
                </div>
                {getChangedTimelineRows(recipe.versionHistory).length > 0 && (
                  <div className="mt-3 overflow-x-auto">
                    <table className="table text-[11px]">
                      <thead>
                        <tr>
                          <th>Changed Field</th>
                          <th>Old Value</th>
                          <th>New Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getChangedTimelineRows(recipe.versionHistory).map((row) => (
                          <tr key={row.field}>
                            <td>{row.field}</td>
                            <td className="text-[var(--muted)]">{row.oldValue}</td>
                            <td className="text-[var(--text)]">{row.newValue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg">
            <h3 className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
              Approval Evidence
            </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] text-[var(--muted)]">
            <div>Submitted At: <span className="font-semibold text-[var(--text)]">{recipe.submittedAt ? new Date(recipe.submittedAt).toLocaleString() : "Not Available"}</span></div>
            <div>Reviewed At: <span className="font-semibold text-[var(--text)]">{recipe.reviewedAt ? new Date(recipe.reviewedAt).toLocaleString() : "Not Available"}</span></div>
            <div>Approved At: <span className="font-semibold text-[var(--text)]">{recipe.approvedAt ? new Date(recipe.approvedAt).toLocaleString() : "Not Available"}</span></div>
            <div>Approved By: <span className="font-semibold text-[var(--text)]">{recipe.approvedBy?.name || "Not Available"}</span></div>
            <div>Rejected At: <span className="font-semibold text-[var(--text)]">{recipe.rejectedAt ? new Date(recipe.rejectedAt).toLocaleString() : "Not Available"}</span></div>
            <div>Rejected By: <span className="font-semibold text-[var(--text)]">{recipe.rejectedBy?.name || "Not Available"}</span></div>
          </div>
            {canApprove && recipe.dbId && !["APPROVED", "REJECTED", "COMPLETED"].includes(String(recipe.status).toUpperCase()) && (
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isActionSubmitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isActionSubmitting ? "Saving..." : "Approve"}
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isActionSubmitting}
                  className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject
                </button>
              </div>
            )}
          </div>

          {recipe.reviewConclusion && (
            <div className="p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg">
              <h3 className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
                Reviewer Conclusion Source
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] text-[var(--muted)]">
                <div>Source: <span className="font-semibold text-[var(--text)]">{recipe.reviewConclusion.source || "Not Available"}</span></div>
                <div>Written By: <span className="font-semibold text-[var(--text)]">{recipe.reviewConclusion.writtenBy || "Not Available"}</span></div>
                <div>Written At: <span className="font-semibold text-[var(--text)]">{recipe.reviewConclusion.writtenAt ? new Date(recipe.reviewConclusion.writtenAt).toLocaleString() : "Not Available"}</span></div>
                <div>Updated At: <span className="font-semibold text-[var(--text)]">{recipe.reviewConclusion.updatedAt ? new Date(recipe.reviewConclusion.updatedAt).toLocaleString() : "Not Available"}</span></div>
              </div>
            </div>
          )}

          {/* Output */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                label: "Expected Output",
                value:
                  recipe.expOutputValue != null
                    ? `${recipe.expOutputValue} ${recipe.expOutputUnit || "g"}`
                    : "—",
              },
              {
                label: "Actual Output",
                value:
                  recipe.actOutputValue != null
                    ? `${recipe.actOutputValue} ${recipe.actOutputUnit || "g"}`
                    : "—",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg"
              >
                <div className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">
                  {label}
                </div>
                <div className="text-[15px] font-bold text-[var(--text)]">
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Remarks */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                Chef Notes
              </h3>
              {isLocked ? (
                <span className="text-[10px] font-semibold text-[var(--danger)] bg-[var(--danger-glow)] px-2 py-0.5 rounded-full">
                  Locked after approval
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingNotes(!isEditingNotes)}
                  className="text-[11px] font-semibold text-[var(--accent)] hover:underline"
                >
                  {isEditingNotes ? "Cancel" : "Edit Notes"}
                </button>
              )}
            </div>
            
            {isEditingNotes ? (
              <div className="p-3 bg-[var(--surface-2)] border border-[var(--accent)] rounded-lg space-y-3">
                <div>
                  <label className="text-[10px] font-semibold text-[var(--muted)] uppercase">New Note</label>
                  <textarea
                    value={editNotesText}
                    onChange={(e) => setEditNotesText(e.target.value)}
                    className="w-full mt-1 p-2 bg-[var(--surface)] border border-[var(--border)] rounded text-[12px] min-h-[80px]"
                    placeholder="Enter new notes..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[var(--muted)] uppercase">Reason for Edit</label>
                  <input
                    type="text"
                    value={editNotesReason}
                    onChange={(e) => setEditNotesReason(e.target.value)}
                    className="w-full mt-1 p-2 bg-[var(--surface)] border border-[var(--border)] rounded text-[12px]"
                    placeholder="e.g. Corrected typo in texture description"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsEditingNotes(false)} className="btn-ghost py-1 px-3 text-[11px]">
                    Cancel
                  </button>
                  <button type="button" onClick={handleUpdateNotes} className="btn-primary py-1 px-3 text-[11px]">
                    Save Notes
                  </button>
                </div>
              </div>
            ) : (
              recipe.remarks ? (
                <div className="p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-[12px] text-[var(--text)] leading-relaxed">
                  {recipe.remarks}
                </div>
              ) : (
                <div className="text-[12px] text-[var(--muted)] italic">No notes provided</div>
              )
            )}
          </div>

          {recipe.noteHistory?.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
                Chef Notes History
              </h3>
              <div className="space-y-2">
                {recipe.noteHistory.map((note) => (
                  <div key={note.id} className="p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-[12px]">
                    <div className="font-semibold text-[var(--text)]">{new Date(note.modifiedAt).toLocaleString()}</div>
                    <div className="text-[var(--muted)] mt-1">Reason: {note.reason || "Not provided"}</div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div><span className="text-[var(--muted)]">Old:</span> {note.oldValue || "blank"}</div>
                      <div><span className="text-[var(--muted)]">New:</span> {note.newValue || "blank"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {isRejectDialogOpen && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rejection-dialog-title"
            className="w-full max-w-md bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-2xl p-5 animate-slide-up"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 id="rejection-dialog-title" className="text-base font-bold text-[var(--text)]">
                  Reject experiment
                </h2>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Provide a reason for rejecting this recipe version.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRejectDialogOpen(false)}
                disabled={isActionSubmitting}
                className="btn-icon disabled:opacity-50"
                aria-label="Close rejection dialog"
              >
                <X size={14} />
              </button>
            </div>
            <textarea
              autoFocus
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setIsRejectDialogOpen(false)}
                disabled={isActionSubmitting}
                className="btn-ghost disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={isActionSubmitting || !rejectionReason.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isActionSubmitting ? "Rejecting..." : "Reject experiment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VersionListModal = ({
  versions,
  baseName,
  onClose,
  onSelect,
  canSelect = true,
}) => {
  if (!versions) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto bg-[var(--surface)] rounded-xl shadow-2xl border border-[var(--border)] animate-slide-up no-scrollbar">
        <div className="sticky top-0 bg-[var(--surface)] px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between z-10">
          <div>
            <h2 className="text-[14px] font-bold text-[var(--text)]">
              Recipe History
            </h2>
            <p className="text-[11px] text-[var(--muted)] uppercase tracking-wider">
              {baseName}
            </p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={14} />
          </button>
        </div>
        <div className="p-4 space-y-2.5">
          {versions.map((ver) => (
            <div
              key={ver.id}
              className="flex items-center justify-between p-3.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[11px] font-bold text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
                  {ver.version}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-[var(--text)]">
                    {ver.recipe}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                      <Clock size={9} /> {ver.date}
                    </span>
                    <StatusBadge status={ver.status} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {ver.aiScoreState?.state === "Analysis Completed" ? (
                  <div className="text-right">
                    <div className="text-[13px] font-bold text-[var(--accent)]">
                      {ver.aiScoreState.value}%
                    </div>
                    <div className="text-[9px] text-[var(--muted)] uppercase">
                      AI Score
                    </div>
                  </div>
                ) : (
                  <div className="text-right">
                    <div className="text-[11px] font-semibold text-[var(--muted)]">
                      {ver.aiScoreState?.state || "Pending Analysis"}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => onSelect(ver)}
                  disabled={!canSelect}
                  className="btn-primary py-1.5 px-3 text-[11px] disabled:opacity-50"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RecipeDetailModal = ExperimentDetailModal;
const VersionDetailModal = ExperimentDetailModal;

export default function AllRecipesPage() {
  const role = localStorage.getItem("ck_role");
  const canOpenVersionDetails = role !== "CRA";
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [experimentsData, setExperimentsData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const pageSize = 12;

  const fetchExperiments = async () => {
    setIsLoading(true);
    try {
      const response = await experimentApi.getAllRecipes({
        search: searchTerm.trim(),
        page,
        limit: pageSize,
      });
      if (response.success) {
        setExperimentsData(response.data.data);
        setTotalPages(response.data.meta.totalPages);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load recipes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, [searchTerm, page]);

  const fetchHistory = async (recipeName) => {
    setHistoryLoading(true);
    try {
      const response = await experimentApi.getRecipeHistory(recipeName);
      if (response.success) {
        const mapped = response.data.data.map((ver) => ({
          ...ver,
          id: ver.publicId || ver.id,
          dbId: ver.id,
          recipe: ver.recipeName,
          chef: ver.chefName || ver.chef?.name || "Unknown Chef",
          date: new Date(ver.createdAt).toLocaleDateString(),
          createdAtLabel: new Date(ver.createdAt).toLocaleString(),
          submittedAt: ver.submittedAt,
          reviewedAt: ver.reviewedAt,
          approvedAt: ver.approvedAt,
          rejectedAt: ver.rejectedAt,
          completedAt: ver.completedAt,
          submittedBy: ver.submittedBy,
          reviewedBy: ver.reviewedBy,
          approvedBy: ver.approvedBy,
          rejectedBy: ver.rejectedBy,
          aiScore: ver.score ?? null,
          aiScoreState: ver.aiScoreState,
          status: ver.status,
          temp: ver.temperature || 0,
          timing: ver.duration || 0,
          version: ver.recipeVersion,
          batchNo: ver.batchPublicId || "Not Available",
          expOutputValue: ver.expectedOutput,
          expOutputUnit: "g",
          actOutputValue: ver.actualOutput,
          actOutputUnit: "g",
          remarks: ver.remarks,
          image: ver.images?.[0]?.imageUrl || "",
          ingredients: ver.ingredients || [],
          sensoryScores: ver.sensoryEvaluations?.[0]
            ? {
                taste: ver.sensoryEvaluations[0].tasteConsistency,
                aroma: ver.sensoryEvaluations[0].aromaticVolatility,
                saltiness: ver.sensoryEvaluations[0].sodiumProjection,
                visual: ver.sensoryEvaluations[0].chromaticAppeal,
                consistency: ver.sensoryEvaluations[0].structuralIntegrity,
                spiciness: ver.sensoryEvaluations[0].scovillePerception,
                oiliness: ver.sensoryEvaluations[0].lipidSaturation,
                freshness: ver.sensoryEvaluations[0].cellularFreshness,
                aftertaste: ver.sensoryEvaluations[0].palatePersistence,
              }
            : null,
          reviewerName: ver.sensoryEvaluations?.[0]?.reviewer?.name || null,
          reviewedDate: ver.sensoryEvaluations?.[0]?.createdAt
            ? new Date(ver.sensoryEvaluations[0].createdAt).toLocaleDateString()
            : null,
          reviewAnswers: ver.reviewAnswers || [],
          versionHistory: ver.versionHistory,
          noteHistory: ver.noteHistory || [],
          reviewConclusion: ver.reviewConclusion,
        }));
        setSelectedBase({ name: recipeName, versions: mapped });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleStatusChange = async (recipe, status) => {
    // Update the open modal/history immediately so the action buttons disappear
    // without waiting for another render caused by a full page refresh.
    setSelectedVersion((current) =>
      current?.dbId === recipe.dbId ? { ...current, status } : current,
    );
    setSelectedBase((current) =>
      current
        ? {
            ...current,
            versions: current.versions.map((version) =>
              version.dbId === recipe.dbId ? { ...version, status } : version,
            ),
          }
        : current,
    );

    // Reconcile the optimistic UI with the server response in the background.
    await Promise.all([fetchExperiments(), fetchHistory(recipe.recipe)]);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="page-title">All Recipes</h1>
          <p className="page-subtitle">
            Explore and manage the complete collection of kitchen experiments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search recipes or chefs..."
              className="input-field pl-9 w-56"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* View toggle */}
          <div className="flex items-center bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "table" ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {experimentsData?.map((item) => (
            <div
              key={item.baseName}
              className="card flex flex-col hover:shadow-[var(--card-shadow-hover)] transition-all group"
            >
              <div className="p-4 flex-1">
                <div className="flex items-center justify-end mb-3">
                  <span className="table-cell-mono text-[var(--muted)]">
                    {item?.latest?.id}
                  </span>
                </div>
                <h3 className="text-[14px] font-semibold text-[var(--text)] mb-2 truncate group-hover:text-[var(--accent)] transition-colors">
                  {item?.baseName}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent-glow)] flex items-center justify-center text-[9px] font-bold text-[var(--accent)]">
                    {item?.latest?.chef
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <span className="text-[11px] text-[var(--muted)] truncate">
                    {item?.latest?.chef}
                  </span>
                </div>
                <div className="flex items-center gap-4 pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                    <Clock size={11} /> {item?.latest?.timing}m
                  </div>
                  {item?.latest?.aiScoreState?.state === "Analysis Completed" ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                      <Star size={11} /> {item?.latest?.aiScoreState.value}%
                    </div>
                  ) : (
                    <div className="text-[10px] font-semibold text-[var(--muted)] truncate max-w-[100px]">
                      {item?.latest?.aiScoreState?.state || "AI Status: Pending Analysis"}
                    </div>
                  )}
                </div>
              </div>
              <div className="px-4 py-3 flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface-2)] rounded-b-[10px]">
                <div>
                  <div className="text-[9px] uppercase tracking-wider font-semibold text-[var(--muted)]">
                    Created On
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--text)]">
                    {item?.latest?.date}
                  </div>
                </div>
                <button
                  onClick={() => fetchHistory(item.baseName)}
                  disabled={historyLoading}
                  className="btn-icon hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] disabled:opacity-50"
                >
                  {historyLoading && selectedBase?.name === item.baseName ? (
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRight size={14} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Recipe Name</th>
                  <th>Chef</th>
                  <th>Duration</th>
                  <th>AI Score</th>
                  <th>Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {experimentsData.map((item) => (
                  <tr key={item.baseName} className="table-row">
                    <td className="table-cell-mono text-[var(--accent)]">
                      {item.latest.id}
                    </td>
                    <td>
                      <span className="font-medium text-[var(--text)]">
                        {item.baseName}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[var(--accent-glow)] flex items-center justify-center text-[10px] font-bold text-[var(--accent)]">
                          {item.latest.chef
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <span className="text-[12px] text-[var(--text)]">
                          {item.latest.chef}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell-muted">{item.latest.timing}m</td>
                    <td>
                      {item.latest.aiScoreState?.state === "Analysis Completed" ? (
                        <span className="font-semibold text-[var(--accent)]">
                          {item.latest.aiScoreState.value}%
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-[var(--muted)]">
                          {item.latest.aiScoreState?.state || "Pending Analysis"}
                        </span>
                      )}
                    </td>
                    <td className="table-cell-muted">{item.latest.date}</td>
                    <td className="text-right">
                      <button
                        onClick={() => fetchHistory(item.baseName)}
                        disabled={historyLoading}
                        className="btn-icon ml-auto hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] disabled:opacity-50"
                      >
                        {historyLoading &&
                        selectedBase?.name === item.baseName ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ArrowRight size={13} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && experimentsData.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[12px] text-[var(--muted)]">
            Loading experiments...
          </p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && experimentsData.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] rounded-xl flex items-center justify-center mb-3">
            <ChefHat size={24} />
          </div>
          <h3 className="text-[14px] font-semibold text-[var(--text)]">
            No recipes found
          </h3>
          <p className="text-[12px] text-[var(--muted)] mt-1">
            Try adjusting your search.
          </p>
        </div>
      )}

      {/* Pagination */}
      {experimentsData.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-ghost py-1.5 px-3 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-[12px] text-[var(--muted)]">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-ghost py-1.5 px-3 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      {selectedBase && (
        <VersionListModal
          baseName={selectedBase.name}
          versions={selectedBase.versions}
          onClose={() => setSelectedBase(null)}
          onSelect={(version) => {
            if (canOpenVersionDetails) setSelectedVersion(version);
          }}
          canSelect={canOpenVersionDetails}
        />
      )}
      {canOpenVersionDetails && selectedVersion && (
        <VersionDetailModal
          recipe={selectedVersion}
          onClose={() => setSelectedVersion(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
