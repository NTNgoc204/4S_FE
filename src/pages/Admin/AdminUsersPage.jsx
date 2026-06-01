import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsersRequest,
  fetchRolesRequest,
  updateUserRequest,
  toggleUserStatusRequest,
} from "../../feature/admin/adminSlice";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatRole(roleName) {
  if (!roleName) return "—";
  return roleName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminUsersPage
// ─────────────────────────────────────────────────────────────────────────────
function AdminUsersPage() {
  const dispatch = useDispatch();
  const {
    users,
    usersLoading,
    roles,
    updateUserLoading,
    toggleStatusLoading,
  } = useSelector((state) => state.admin);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({});

  // ── Bootstrap ───────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchUsersRequest());
    dispatch(fetchRolesRequest());
  }, [dispatch]);

  // ── Derived: summary ────────────────────────────────────
  const summary = useMemo(() => {
    const active = users.filter((u) => u.isActive).length;
    return { total: users.length, active, inactive: users.length - active };
  }, [users]);

  // ── Derived: filtered list ──────────────────────────────
  const filteredUsers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return users.filter((u) => {
      const hitKeyword =
        keyword.length === 0 ||
        (u.username ?? "").toLowerCase().includes(keyword) ||
        (u.email ?? "").toLowerCase().includes(keyword) ||
        String(u.userId ?? "").toLowerCase().includes(keyword);
      const hitStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? u.isActive : !u.isActive);
      const hitRole =
        roleFilter === "all" ||
        (u.roleName ?? "").toLowerCase() === roleFilter.toLowerCase();
      return hitKeyword && hitStatus && hitRole;
    });
  }, [users, searchText, statusFilter, roleFilter]);

  // ── Toggle active / inactive ────────────────────────────
  function handleToggleStatus(user) {
    dispatch(
      toggleUserStatusRequest({ userId: user.userId, isActive: !user.isActive }),
    );
  }

  // ── Open / close edit form ──────────────────────────────
  function openEditForm(user) {
    setEditingUser(user);
    setForm({
      username: user.username ?? "",
      address: user.address ?? "",
      phoneNumber: user.phoneNumber ?? "",
      gender: user.gender ?? "Other",
      dob: user.dob ? user.dob.split("T")[0] : "",
      roleId: user.roleId ?? "",
    });
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingUser(null);
    setForm({});
  }

  function updateFormField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ── Save edits via Redux ────────────────────────────────
  function handleSaveUser() {
    if (!editingUser) return;

    const patch = {
      username: form.username.trim() || undefined,
      address: form.address.trim() || undefined,
      phoneNumber: form.phoneNumber.trim() || undefined,
      gender: form.gender || undefined,
      dob: form.dob || undefined,
      roleId: form.roleId || undefined,
    };

    dispatch(
      updateUserRequest({
        userId: editingUser.userId,
        patch,
        onSuccess: closeForm,
      }),
    );
  }

  // ── Render ──────────────────────────────────────────────
  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="rounded-2xl border border-white/10 bg-[#153251]/82 p-5 md:p-6">
        <h2 className="font-['Sora'] text-2xl font-semibold md:text-3xl">
          User Management
        </h2>
        <p className="mt-2 text-sm text-slate-300 md:text-base">
          View, edit user details and toggle active status.
        </p>
      </header>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Total Users" value={summary.total} valueClass="text-[#e8f2ff]" />
        <SummaryCard label="Active" value={summary.active} valueClass="text-[#0ed8ab]" />
        <SummaryCard label="Inactive" value={summary.inactive} valueClass="text-[#f3d459]" />
      </section>

      {/* Filters */}
      <article className="rounded-2xl border border-white/10 bg-[#183452]/82 p-4 md:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
          <input
            className="w-full rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#ecc741] focus:outline-none"
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by name, email, ID…"
            type="text"
            value={searchText}
          />
          <select
            className="rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 text-sm text-slate-100 focus:border-[#ecc741] focus:outline-none"
            onChange={(e) => setStatusFilter(e.target.value)}
            value={statusFilter}
          >
            <option className="bg-[#203a59]" value="all">All Status</option>
            <option className="bg-[#203a59]" value="active">Active</option>
            <option className="bg-[#203a59]" value="inactive">Inactive</option>
          </select>
          <select
            className="rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 text-sm text-slate-100 focus:border-[#ecc741] focus:outline-none"
            onChange={(e) => setRoleFilter(e.target.value)}
            value={roleFilter}
          >
            <option className="bg-[#203a59]" value="all">All Roles</option>
            {roles.map((r) => (
              <option className="bg-[#203a59]" key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </article>

      {/* Table – desktop */}
      {usersLoading ? (
        <SkeletonTable />
      ) : (
        <>
          <article className="hidden overflow-hidden rounded-2xl border border-white/10 bg-[#183452]/82 md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-white/10 text-left text-xs uppercase tracking-[0.12em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={6}>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr className="border-b border-white/6 last:border-b-0" key={user.userId}>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-100">{user.username}</p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                        </td>
                        <td className="px-4 py-4 text-sm capitalize text-slate-300">
                          {formatRole(user.roleName)}
                        </td>
                        <td className="px-4 py-4 text-sm uppercase text-slate-200">
                          {user.planName ?? "—"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-300">
                          {formatDate(user.createAt)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge isActive={user.isActive} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <EditActionButton onClick={() => openEditForm(user)} />
                            <ToggleStatusActionButton
                              disabled={toggleStatusLoading === user.userId}
                              isActive={user.isActive}
                              onClick={() => handleToggleStatus(user)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>

          {/* Card list – mobile */}
          <section className="space-y-3 md:hidden">
            {filteredUsers.map((user) => (
              <article
                className="rounded-2xl border border-white/10 bg-[#183452]/82 p-4"
                key={user.userId}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-100">{user.username}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                  </div>
                  <StatusBadge isActive={user.isActive} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <p>Role: <span className="font-semibold">{formatRole(user.roleName)}</span></p>
                  <p>Plan: <span className="font-semibold uppercase">{user.planName ?? "—"}</span></p>
                  <p className="col-span-2">Joined: <span className="font-semibold">{formatDate(user.createAt)}</span></p>
                </div>
                <div className="mt-3 flex gap-2">
                  <EditActionButton fullWidth onClick={() => openEditForm(user)} />
                  <ToggleStatusActionButton
                    disabled={toggleStatusLoading === user.userId}
                    fullWidth
                    isActive={user.isActive}
                    onClick={() => handleToggleStatus(user)}
                  />
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      {/* Edit modal */}
      {isFormOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#020712]/75 px-3">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#173554] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-['Sora'] text-xl font-semibold">Edit User</h3>
                <p className="mt-1 text-sm text-slate-300">{editingUser?.email}</p>
              </div>
              <button
                className="rounded-lg border border-white/12 bg-white/6 px-2.5 py-1 text-sm text-slate-200 transition hover:bg-white/12"
                onClick={closeForm}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <FormField
                label="Username"
                onChange={(v) => updateFormField("username", v)}
                value={form.username}
              />
              <FormField
                label="Phone Number"
                onChange={(v) => updateFormField("phoneNumber", v)}
                value={form.phoneNumber}
              />
              <FormField
                label="Address"
                onChange={(v) => updateFormField("address", v)}
                value={form.address}
              />
              <FormField
                label="Date of Birth"
                onChange={(v) => updateFormField("dob", v)}
                type="date"
                value={form.dob}
              />
              <FormSelect
                label="Gender"
                onChange={(v) => updateFormField("gender", v)}
                options={[
                  { label: "Male", value: "Male" },
                  { label: "Female", value: "Female" },
                  { label: "Other", value: "Other" },
                ]}
                value={form.gender}
              />
              <FormSelect
                label="Role"
                onChange={(v) => updateFormField("roleId", v)}
                options={roles.map((r) => ({ label: r.name, value: r.id }))}
                value={form.roleId}
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                className="rounded-lg border border-white/12 bg-white/6 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/12"
                onClick={closeForm}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-gradient-to-r from-[#19d2ad] to-[#0fbc98] px-4 py-2 text-sm font-bold text-[#082339] transition hover:brightness-110 disabled:opacity-50"
                disabled={updateUserLoading}
                onClick={handleSaveUser}
                type="button"
              >
                {updateUserLoading ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
function SummaryCard({ label, value, valueClass }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#183452]/82 p-4 md:p-5">
      <p className="text-sm text-slate-300">{label}</p>
      <p className={`mt-2 font-['Sora'] text-3xl font-semibold ${valueClass}`}>{value}</p>
    </article>
  );
}

function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
        isActive
          ? "border border-[#0ed8ab]/45 bg-[#0ed8ab]/16 text-[#0ed8ab]"
          : "border border-[#ecc741]/45 bg-[#ecc741]/16 text-[#f3d459]"
      }`}
    >
      {isActive ? "active" : "inactive"}
    </span>
  );
}

function EditActionButton({ onClick, fullWidth = false }) {
  const widthClass = fullWidth ? "flex-1" : "w-32";
  return (
    <button
      className={`${widthClass} inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-white/12 bg-white/6 px-3 text-sm text-slate-200 transition hover:bg-white/12`}
      onClick={onClick}
      type="button"
    >
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path
          d="m14.7 5.3 4 4L8.5 19.5l-4 1 1-4L14.7 5.3Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
      <span>Edit</span>
    </button>
  );
}

function ToggleStatusActionButton({ isActive, onClick, fullWidth = false, disabled = false }) {
  const widthClass = fullWidth ? "flex-1" : "w-32";
  return (
    <button
      className={`${widthClass} inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition ${
        isActive
          ? "border border-[#ecc741]/45 bg-[#ecc741]/14 text-[#f3d459] hover:bg-[#ecc741]/24"
          : "border border-[#0ed8ab]/40 bg-[#0ed8ab]/14 text-[#0ed8ab] hover:bg-[#0ed8ab]/22"
      } disabled:opacity-50`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path d="M12 4v7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M8 6.7a7 7 0 1 0 8 0" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
      <span>{disabled ? "…" : isActive ? "Set Inactive" : "Set Active"}</span>
    </button>
  );
}

function SkeletonTable() {
  return (
    <article className="animate-pulse space-y-3 rounded-2xl border border-white/10 bg-[#183452]/82 p-5">
      {[...Array(4)].map((_, i) => (
        <div className="flex gap-4" key={i}>
          <div className="h-10 flex-1 rounded-lg bg-white/8" />
          <div className="h-10 w-24 rounded-lg bg-white/8" />
          <div className="h-10 w-20 rounded-lg bg-white/8" />
        </div>
      ))}
    </article>
  );
}

function FormField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <p className="mb-1.5 text-sm text-slate-300">{label}</p>
      <input
        className="w-full rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#ecc741] focus:outline-none"
        onChange={(e) => onChange(e.target.value)}
        type={type}
        value={value}
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div>
      <p className="mb-1.5 text-sm text-slate-300">{label}</p>
      <select
        className="w-full rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 text-sm text-slate-100 focus:border-[#ecc741] focus:outline-none"
        onChange={(e) => onChange(e.target.value)}
        value={value}
      >
        {options.map((opt) => (
          <option className="bg-[#203a59] text-slate-100" key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default AdminUsersPage;
