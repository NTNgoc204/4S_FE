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

  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?.userId;

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
      <header className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
        <h2 className="font-['Sora'] text-2xl font-semibold md:text-3xl text-slate-900">
          User Management
        </h2>
        <p className="mt-2 text-sm text-slate-500 md:text-base">
          View, edit user details and toggle active status.
        </p>
      </header>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Total Users" value={summary.total} valueClass="text-slate-900" />
        <SummaryCard label="Active" value={summary.active} valueClass="text-teal-600" />
        <SummaryCard label="Inactive" value={summary.inactive} valueClass="text-amber-600" />
      </section>

      {/* Filters */}
      <article className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by name, email, ID…"
            type="text"
            value={searchText}
          />
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
            onChange={(e) => setStatusFilter(e.target.value)}
            value={statusFilter}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
            onChange={(e) => setRoleFilter(e.target.value)}
            value={roleFilter}
          >
            <option value="all">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
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
          <article className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500 bg-slate-50 font-semibold">
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
                      <tr className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors" key={user.userId}>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-900">{user.username}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </td>
                        <td className="px-4 py-4 text-sm capitalize text-slate-600">
                          {formatRole(user.roleName)}
                        </td>
                        <td className="px-4 py-4 text-sm uppercase text-slate-700 font-medium">
                          {user.planName ?? "—"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500">
                          {formatDate(user.createAt)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge isActive={user.isActive} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <EditActionButton onClick={() => openEditForm(user)} />
                            <ToggleStatusActionButton
                              disabled={user.userId === currentUserId}
                              loading={toggleStatusLoading === user.userId}
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
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                key={user.userId}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{user.username}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <StatusBadge isActive={user.isActive} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <p>Role: <span className="font-semibold text-slate-800">{formatRole(user.roleName)}</span></p>
                  <p>Plan: <span className="font-semibold uppercase text-slate-800">{user.planName ?? "—"}</span></p>
                  <p className="col-span-2">Joined: <span className="font-semibold text-slate-800">{formatDate(user.createAt)}</span></p>
                </div>
                <div className="mt-3 flex gap-2">
                  <EditActionButton fullWidth onClick={() => openEditForm(user)} />
                  <ToggleStatusActionButton
                    disabled={user.userId === currentUserId}
                    loading={toggleStatusLoading === user.userId}
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-3">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl text-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-['Sora'] text-xl font-semibold text-slate-900">Edit User</h3>
                <p className="mt-1 text-sm text-slate-500">{editingUser?.email}</p>
              </div>
              <button
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-sm text-slate-600 transition hover:bg-slate-50 hover:border-slate-300 shadow-sm"
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
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                onClick={closeForm}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50 shadow-sm"
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
    <article className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 font-['Sora'] text-3xl font-semibold ${valueClass}`}>{value}</p>
    </article>
  );
}

function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
        isActive
          ? "border border-teal-200 bg-teal-50 text-teal-700"
          : "border border-amber-200 bg-amber-50 text-amber-700"
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
      className={`${widthClass} inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 shadow-sm`}
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

function ToggleStatusActionButton({ isActive, onClick, fullWidth = false, disabled = false, loading = false }) {
  const widthClass = fullWidth ? "flex-1" : "w-32";
  return (
    <button
      className={`${widthClass} inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition ${
        isActive
          ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100/80"
          : "border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100/80"
      } disabled:opacity-40 disabled:cursor-not-allowed shadow-sm`}
      disabled={disabled || loading}
      onClick={onClick}
      type="button"
      title={disabled && !loading ? "Bạn không thể tự khóa/kích hoạt tài khoản của chính mình" : undefined}
    >
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path d="M12 4v7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M8 6.7a7 7 0 1 0 8 0" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
      <span>{loading ? "…" : isActive ? "Set Inactive" : "Set Active"}</span>
    </button>
  );
}

function SkeletonTable() {
  return (
    <article className="animate-pulse space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {[...Array(4)].map((_, i) => (
        <div className="flex gap-4" key={i}>
          <div className="h-10 flex-1 rounded-lg bg-slate-100" />
          <div className="h-10 w-24 rounded-lg bg-slate-100" />
          <div className="h-10 w-20 rounded-lg bg-slate-100" />
        </div>
      ))}
    </article>
  );
}

function FormField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-600">{label}</p>
      <input
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
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
      <p className="mb-1.5 text-sm font-medium text-slate-600">{label}</p>
      <select
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
        onChange={(e) => onChange(e.target.value)}
        value={value}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default AdminUsersPage;
