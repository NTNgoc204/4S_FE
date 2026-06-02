import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRolesRequest,
  createRoleRequest,
  updateRoleRequest,
} from "../../feature/admin/adminSlice";

// ─────────────────────────────────────────────────────────────────────────────
// AdminRolesPage
// ─────────────────────────────────────────────────────────────────────────────
function AdminRolesPage() {
  const dispatch = useDispatch();
  const { roles, rolesLoading, createRoleLoading, updateRoleLoading } =
    useSelector((state) => state.admin);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null); // null = create mode
  const [form, setForm] = useState({ name: "", description: "" });

  // ── Fetch on mount ──────────────────────────────────────
  useEffect(() => {
    dispatch(fetchRolesRequest());
  }, [dispatch]);

  // ── Form helpers ────────────────────────────────────────
  function openCreateForm() {
    setEditingRole(null);
    setForm({ name: "", description: "" });
    setIsFormOpen(true);
  }

  function openEditForm(role) {
    setEditingRole(role);
    setForm({ name: role.name ?? "", description: role.description ?? "" });
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingRole(null);
    setForm({ name: "", description: "" });
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ── Save ────────────────────────────────────────────────
  function handleSave() {
    const trimmedName = form.name.trim();
    if (!trimmedName) return;

    if (editingRole) {
      dispatch(
        updateRoleRequest({
          id: editingRole.id,
          patch: { name: trimmedName, description: form.description.trim() },
          onSuccess: () => {
            closeForm();
            dispatch(fetchRolesRequest());
          },
        }),
      );
    } else {
      dispatch(
        createRoleRequest({
          payload: { name: trimmedName, description: form.description.trim() },
          onSuccess: () => {
            closeForm();
            dispatch(fetchRolesRequest());
          },
        }),
      );
    }
  }

  const isSaving = createRoleLoading || updateRoleLoading;

  // ── Render ──────────────────────────────────────────────
  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-['Sora'] text-2xl font-semibold md:text-3xl text-slate-900">
              Role Management
            </h2>
            <p className="mt-2 text-sm text-slate-500 md:text-base">
              Create and edit roles. Each role has a name and description.
            </p>
          </div>
          <button
            className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:brightness-110 shadow-sm"
            onClick={openCreateForm}
            type="button"
          >
            + New Role
          </button>
        </div>
      </header>

      {/* Role list */}
      {rolesLoading ? (
        <SkeletonList />
      ) : roles.length === 0 ? (
        <article className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">No roles found. Create one to get started.</p>
        </article>
      ) : (
        <>
          {/* Desktop table */}
          <article className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500 bg-slate-50 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Role Name</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Users</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors"
                      key={role.id}
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">{role.name}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {role.description || "—"}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600 shadow-sm">
                          {role.usersCount ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                          onClick={() => openEditForm(role)}
                          type="button"
                        >
                          <EditIcon />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          {/* Mobile cards */}
          <section className="space-y-3 md:hidden">
            {roles.map((role) => (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-slate-800"
                key={role.id}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{role.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {role.description || "No description"}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600 shadow-sm">
                    {role.usersCount ?? 0} users
                  </span>
                </div>
                <div className="mt-3">
                  <button
                    className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                    onClick={() => openEditForm(role)}
                    type="button"
                  >
                    <EditIcon />
                    Edit
                  </button>
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      {/* Create / Edit Modal */}
      {isFormOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-3">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl text-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-['Sora'] text-xl font-semibold text-slate-900">
                  {editingRole ? "Edit Role" : "Create Role"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {editingRole
                    ? `Editing "${editingRole.name}"`
                    : "Add a new role to the system."}
                </p>
              </div>
              <button
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-sm text-slate-600 transition hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                onClick={closeForm}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-slate-600"
                  htmlFor="role-name"
                >
                  Role Name <span className="text-rose-500">*</span>
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
                  id="role-name"
                  maxLength={50}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. accountant, counselor"
                  type="text"
                  value={form.name}
                />
              </div>
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-slate-600"
                  htmlFor="role-description"
                >
                  Description
                </label>
                <textarea
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
                  id="role-description"
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="What does this role do?"
                  rows={3}
                  value={form.description}
                />
              </div>
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
                disabled={isSaving || !form.name.trim()}
                onClick={handleSave}
                type="button"
              >
                {isSaving
                  ? "Saving…"
                  : editingRole
                    ? "Save Changes"
                    : "Create Role"}
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
function EditIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="m14.7 5.3 4 4L8.5 19.5l-4 1 1-4L14.7 5.3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SkeletonList() {
  return (
    <article className="animate-pulse space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {[...Array(3)].map((_, i) => (
        <div className="flex gap-4" key={i}>
          <div className="h-10 flex-1 rounded-lg bg-slate-100" />
          <div className="h-10 w-48 rounded-lg bg-slate-100" />
          <div className="h-10 w-16 rounded-lg bg-slate-100" />
        </div>
      ))}
    </article>
  );
}

export default AdminRolesPage;