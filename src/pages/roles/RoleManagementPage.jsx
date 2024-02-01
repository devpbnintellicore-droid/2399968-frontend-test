import React, { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import staffApi from "../../api/staffApi";
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  X,
  Eye,
  EyeOff,
  ChefHat,
  ShieldCheck,
  ClipboardCheck,
  Crown,
  Search,
  Mail,
  Lock,
  User,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";

const avatarColors = [
  "from-blue-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-violet-400 to-purple-500",
  "from-pink-400 to-rose-500",
  "from-cyan-400 to-blue-500",
  "from-orange-400 to-rose-500",
];
const getAvatarColor = (id) => avatarColors[id % avatarColors.length];

function StaffModal({
  title,
  icon: Icon,
  onClose,
  onSubmit,
  children,
  submitLabel = "Save",
  isSubmitting,
}) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface)] rounded-xl shadow-2xl border border-[var(--border)] w-full max-w-md mx-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center text-[var(--accent)]">
              <Icon size={14} />
            </div>
            <h3 className="text-[14px] font-bold text-[var(--text)]">
              {title}
            </h3>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={14} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-3.5">
          {children}
          <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1 justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 justify-center disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-[11px] text-[var(--danger)]">{error}</p>
      )}
    </div>
  );
}

function CreateModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Chef",
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 3)
      e.name = "Name must be at least 3 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Valid email required";
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*!_])[A-Za-z\d@#$%&*!_]{8,}$/.test(form.password))
      e.password = "Use 8+ characters with uppercase, lowercase, number, and special character";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave(form);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create staff");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StaffModal
      title="Add New Staff"
      icon={UserPlus}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Create Staff"
      isSubmitting={isSubmitting}
    >
      <FormField label="Full Name" error={errors.name}>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Ravi Kumar"
          className="input-field"
        />
      </FormField>
      <FormField label="Email Address" error={errors.email}>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="e.g. ravi@kitchen.com"
          className="input-field"
        />
      </FormField>
      <FormField label="Password" error={errors.password}>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Minimum 6 characters"
            className="input-field pr-9"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          >
            {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
      </FormField>
      <FormField label="Role">
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="input-field"
        >
          <option value="Chef">Chef</option>
          <option value="Reviewer">Reviewer</option>
          <option value="CRA">CRA</option>
          {/* <option value="Manager">Manager</option> */}
        </select>
      </FormField>
    </StaffModal>
  );
}

function EditModal({ staff, onSave, onClose }) {
  const [form, setForm] = useState({ ...staff, password: "" });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 3)
      e.name = "Name must be at least 3 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Valid email required";
    if (form.password && form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave(form);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update staff");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StaffModal
      title="Edit Staff Member"
      icon={Edit3}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
      isSubmitting={isSubmitting}
    >
      <FormField label="Name" error={errors.name}>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input-field"
        />
      </FormField>
      <FormField label="Email" error={errors.email}>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input-field"
        />
      </FormField>
      <FormField
        label="Password (leave blank to keep current)"
        error={errors.password}
      >
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="New password..."
            className="input-field pr-9"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          >
            {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Role">
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="input-field"
          >
            <option value="CHEF">Chef</option>
            <option value="REVIEWER">Reviewer</option>
            <option value="CRA">CRA</option>
            {/* <option value="MANAGER">Manager</option> */}
          </select>
        </FormField>
        <FormField label="Status">
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="input-field"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </FormField>
      </div>
    </StaffModal>
  );
}

export default function RoleManagementPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    CHEF: 0,
    REVIEWER: 0,
    CRA: 0,
    MANAGER: 0,
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const [staffData, statsData] = await Promise.all([
        staffApi.getAllStaff(),
        staffApi.getStaffStats(),
      ]);
      setStaff(staffData.data || []);
      const b = statsData.data || {};
      setStats({
        CHEF: b.chefs || 0,
        REVIEWER: b.reviewers || 0,
        CRA: b.cras || 0,
        MANAGER: b.managers || 0,
        total: b.total || 0,
        active: b.activeCount || 0,
        inactive: b.inactiveCount || 0,
      });
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return staff;
    const q = searchQuery.trim().toLowerCase();
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q),
    );
  }, [staff, searchQuery]);

  const handleCreate = async (formData) => {
    await staffApi.createStaff({
      ...formData,
      role: formData.role.toUpperCase(),
    });
    fetchStaff();
    setShowCreateForm(false);
    toast.success("Staff created successfully");
  };

  const handleEdit = async (editedStaff) => {
    await staffApi.updateStaff(editedStaff.id, {
      ...editedStaff,
      role: editedStaff.role.toUpperCase(),
    });
    fetchStaff();
    setEditModal(null);
    toast.success("Staff updated");
  };

  const handleDelete = async (id) => {
    try {
      await staffApi.deleteStaff(id);
      fetchStaff();
      setDeleteModal(null);
      toast.success("Staff deactivated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to deactivate");
    }
  };
  const handleToggleStatus = async (id, currentStatus) => {
    if (togglingId) return;
    try {
      setTogglingId(id);
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await staffApi.updateStaff(id, { status: newStatus });
      fetchStaff();
      toast.success(`Staff status updated to ${newStatus.toLowerCase()}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  const statCards = [
    { label: "Total Staff", value: stats.total, icon: Users },
    { label: "Inactive", value: stats.inactive, icon: AlertCircle },
    { label: "CRA", value: stats.CRA, icon: ShieldCheck },
    { label: "Chef", value: stats.CHEF, icon: ChefHat },
  ];

  const getRoleLabel = (role) => {
    const map = {
      CHEF: "Chef",
      REVIEWER: "Reviewer",
      CRA: "CRA",
      MANAGER: "Manager",
    };
    return map[role?.toUpperCase()] || role;
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Role Management</h1>
          <p className="page-subtitle">
            Manage your team members and their permissions
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="stat-card">
            <div className="stat-card-icon">
              <Icon size={20} />
            </div>
            <div className="stat-card-value">{loading ? "—" : value}</div>
            <div className="stat-card-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Staff Directory */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[14px] font-semibold text-[var(--text)]">
              Staff Directory
            </h2>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">
              {loading ? "..." : stats.total} members ·{" "}
              {loading ? "..." : stats.active} active · {loading ? "..." : stats.inactive} inactive
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Role..."
                className="input-field pl-9 w-44"
              />
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              <UserPlus size={14} /> Add Staff
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="table-row">
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(s.id)} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}
                      >
                        {s.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="text-[13px] font-medium text-[var(--text)]">
                        {s.name}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell-muted">{s.email}</td>
                  <td>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]">
                      {getRoleLabel(s.role)}
                    </span>
                    {/* {s.role?.toUpperCase() === "REVIEWER" && s.reviewerAssignment && (
                      <div className="text-[10px] text-[var(--muted)] mt-1">
                        Assigned by #{s.reviewerAssignment.assignedBy || "N/A"} on {s.reviewerAssignment.assignedAt ? new Date(s.reviewerAssignment.assignedAt).toLocaleDateString("en-CA") : "Not Available"}
                      </div>
                    )} */}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(s.id, s.status)}
                      disabled={togglingId === s.id || s.role?.toUpperCase() === "MANAGER"}
                      className={`badge group transition-all ${s.role?.toUpperCase() !== "MANAGER" ? "hover:scale-105 active:scale-95" : "cursor-default"} disabled:opacity-50 ${togglingId === s.id ? "disabled:cursor-wait" : ""} ${s.status === "ACTIVE" ? "bg-[var(--success-glow)] text-[var(--success)]" : "bg-[var(--surface-2)] text-[var(--muted)]"}`}
                    >
                      <span
                        className={`badge-dot ${s.status === "ACTIVE" ? "bg-[var(--success)]" : "bg-[var(--muted)]"}`}
                      />
                      {togglingId === s.id ? "..." : s.status === "ACTIVE" ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="table-cell-muted">
                    <div>
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleDateString("en-CA")
                        : "—"}
                    </div>
                    {s.deactivatedAt && (
                      <div className="text-[10px] text-[var(--muted)] mt-0.5">
                        Inactive {new Date(s.deactivatedAt).toLocaleDateString("en-CA")}
                      </div>
                    )}
                    {s.roleHistory?.length > 0 && (
                      <div className="text-[10px] text-[var(--accent)] mt-0.5">
                        Last change: {s.roleHistory[0].oldRole || "New"} → {s.roleHistory[0].newRole || "Unknown"}
                      </div>
                    )}
                  </td>
                  <td>
                    {s.role?.toUpperCase() !== "MANAGER" && (
                      <div className="flex items-center gap-1">
                        {/* <button onClick={() => setEditModal({ ...s })} className="btn-icon" title="Edit"><Edit3 size={13} /></button> */}
                        {/* <button onClick={() => setDeleteModal(s)} className="btn-icon hover:text-[var(--danger)] hover:border-[var(--danger)]" title="Delete"><Trash2 size={13} /></button> */}
                        {/* <button onClick={() => setEditModal({ ...s })} className="btn-icon" title="Edit">
                          <Edit3 size={13} />
                        </button> */}
                        <button
                          onClick={() => setDeleteModal(s)}
                          className="btn-icon hover:text-[var(--danger)] hover:border-[var(--danger)]"
                          title="Deactivate"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-[var(--muted)] text-[13px]"
                  >
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showCreateForm && (
        <CreateModal
          onSave={handleCreate}
          onClose={() => setShowCreateForm(false)}
        />
      )}
      {editModal && (
        <EditModal
          staff={editModal}
          onSave={handleEdit}
          onClose={() => setEditModal(null)}
        />
      )}

      {deleteModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setDeleteModal(null)}
        >
          <div
            className="bg-[var(--surface)] rounded-xl shadow-2xl border border-[var(--border)] w-full max-w-sm mx-4 p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-11 h-11 rounded-full bg-[var(--danger-glow)] flex items-center justify-center mx-auto mb-3">
                <Trash2 size={20} className="text-[var(--danger)]" />
              </div>
              <h3 className="text-[14px] font-bold text-[var(--text)] mb-1">
                Deactivate Staff Member
              </h3>
              <p className="text-[12px] text-[var(--muted)] mb-4">
                Are you sure you want to deactivate{" "}
                <strong className="text-[var(--text)]">
                  {deleteModal.name}
                </strong>
                ?
              </p>
              {(deleteModal.experimentCount > 0 ||
                deleteModal.reviewCount > 0) && (
                <div className="mb-4 p-3 bg-[var(--warning-glow)] rounded-lg text-left">
                  <p className="text-[11px] font-semibold text-[var(--warning)] flex items-center gap-1.5 mb-1">
                    <AlertCircle size={11} /> Related data will be retained
                  </p>
                  {deleteModal.experimentCount > 0 && (
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      • {deleteModal.experimentCount} experiments
                    </p>
                  )}
                  {deleteModal.reviewCount > 0 && (
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      • {deleteModal.reviewCount} reviews
                    </p>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="btn-ghost flex-1 justify-center"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteModal.id)}
                  className="btn-primary flex-1 justify-center bg-[var(--danger)]"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
