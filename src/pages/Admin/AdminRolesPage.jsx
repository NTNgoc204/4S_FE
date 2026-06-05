import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createRoleRequest,
  fetchRolesRequest,
  updateRoleRequest,
} from "../../feature/admin/adminSlice";

function getRoleId(role) {
  return role?.id ?? role?.roleId ?? "";
}

function getRoleName(role) {
  return role?.name ?? role?.Name ?? "";
}

function getRoleDescription(role) {
  return role?.description ?? role?.Description ?? "";
}

function getRoleUsersCount(role) {
  return role?.usersCount ?? role?.UsersCount ?? 0;
}

function AdminRolesPage() {
  const dispatch = useDispatch();
  const { roles, rolesLoading, createRoleLoading, updateRoleLoading } = useSelector(
    (state) => state.admin,
  );

  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    dispatch(fetchRolesRequest());
  }, [dispatch]);

  const selectedRole = useMemo(
    () => roles.find((role) => getRoleId(role) === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  );

  useEffect(() => {
    if (isCreateMode) {
      setForm({ name: "", description: "" });
      setDirty(false);
      return;
    }

    if (selectedRole) {
      setForm({
        name: getRoleName(selectedRole),
        description: getRoleDescription(selectedRole),
      });
      setDirty(false);
    }
  }, [isCreateMode, selectedRole]);

  const summary = useMemo(() => {
    const totalUsers = roles.reduce((sum, role) => sum + Number(getRoleUsersCount(role) || 0), 0);
    return { totalRoles: roles.length, totalUsers };
  }, [roles]);

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function startCreateMode() {
    if (dirty) {
      const ok = window.confirm("You have unsaved changes. Discard them?");
      if (!ok) return;
    }
    setIsCreateMode(true);
    setSelectedRoleId(null);
    setForm({ name: "", description: "" });
    setDirty(false);
  }

  function startEditMode(role) {
    const nextRoleId = getRoleId(role);
    if (dirty) {
      const ok = window.confirm("You have unsaved changes. Discard them?");
      if (!ok) return;
    }
    setIsCreateMode(false);
    setSelectedRoleId(nextRoleId);
    setForm({
      name: getRoleName(role),
      description: getRoleDescription(role),
    });
    setDirty(false);
  }

  function handleSave() {
    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      window.alert("Role name is required.");
      return;
    }

    if (isCreateMode) {
      dispatch(
        createRoleRequest({
          payload: { name, description },
          onSuccess: (createdRole) => {
            const createdRoleId = getRoleId(createdRole);
            setSelectedRoleId(createdRoleId || null);
            setIsCreateMode(false);
            setDirty(false);
          },
        }),
      );
      return;
    }

    if (!selectedRole) return;

    dispatch(
      updateRoleRequest({
        id: getRoleId(selectedRole),
        patch: { name, description },
        onSuccess: () => setDirty(false),
      }),
    );
  }

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-white/10 bg-[#153251]/82 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-['Sora'] text-2xl font-semibold md:text-3xl">
              Role Management
            </h2>
            <p className="mt-2 text-sm text-slate-300 md:text-base">
              Create and edit roles with only name and description. Delete is disabled.
            </p>
          </div>
          <button
            className="rounded-xl bg-gradient-to-r from-[#19d2ad] to-[#0fbc98] px-4 py-2.5 text-sm font-bold text-[#082339] transition hover:brightness-110"
            onClick={startCreateMode}
            type="button"
          >
            New Role
          </button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard label="Total Roles" value={summary.totalRoles} valueClass="text-[#e8f2ff]" />
        <SummaryCard label="Total Assigned Users" value={summary.totalUsers} valueClass="text-[#0ed8ab]" />
        <SummaryCard label="Mode" value={isCreateMode ? "Create" : "Edit"} valueClass="text-[#f3d459]" />
      </section>

      {rolesLoading ? (
        <SkeletonLoader />
      ) : (
        <section className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
          <article className="rounded-2xl border border-white/10 bg-[#183452]/82 p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-['Sora'] text-lg font-semibold">Roles</h3>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
                {roles.length} items
              </span>
            </div>

            <div className="space-y-3">
              {roles.map((role) => {
                const roleId = getRoleId(role);
                const isSelected = !isCreateMode && selectedRoleId === roleId;

                return (
                  <button
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? "border-[#0ed8ab]/45 bg-[#0ed8ab]/14"
                        : "border-white/10 bg-[#10253e]/72 hover:bg-[#10253e]"
                    }`}
                    key={roleId}
                    onClick={() => startEditMode(role)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-100">{getRoleName(role)}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                          {getRoleDescription(role) || "—"}
                        </p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-slate-300">
                        {getRoleUsersCount(role)} users
                      </span>
                    </div>
                  </button>
                );
              })}

              {roles.length === 0 && (
                <p className="text-sm text-slate-400">No roles found.</p>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#183452]/82 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-['Sora'] text-xl font-semibold">
                  {isCreateMode ? "Create Role" : "Edit Role"}
                </h3>
                <p className="mt-1 text-sm text-slate-300">
                  {isCreateMode
                    ? "Add a new role with name and description."
                    : "Update the selected role in place."}
                </p>
              </div>
              {dirty && (
                <span className="rounded-full border border-[#ecc741]/45 bg-[#ecc741]/14 px-2.5 py-1 text-xs font-semibold text-[#f3d459]">
                  Unsaved changes
                </span>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-slate-300" htmlFor="role-name">
                  Role Name
                </label>
                <input
                  className="w-full rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#ecc741] focus:outline-none"
                  id="role-name"
                  maxLength={50}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="e.g. counselor"
                  type="text"
                  value={form.name}
                />
                <p className="mt-1 text-xs text-slate-500">Maximum 50 characters.</p>
              </div>

              <div>
                <label
                  className="mb-1.5 block text-sm text-slate-300"
                  htmlFor="role-description"
                >
                  Description
                </label>
                <textarea
                  className="min-h-32 w-full resize-none rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#ecc741] focus:outline-none"
                  id="role-description"
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="Describe what this role is for"
                  rows={5}
                  value={form.description}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              {!isCreateMode && (
                <button
                  className="rounded-xl border border-white/12 bg-white/6 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/12"
                  onClick={startCreateMode}
                  type="button"
                >
                  Create New
                </button>
              )}
              <button
                className="rounded-xl bg-gradient-to-r from-[#19d2ad] to-[#0fbc98] px-6 py-2.5 text-sm font-bold text-[#082339] transition hover:brightness-110 disabled:opacity-50"
                disabled={createRoleLoading || updateRoleLoading || !dirty}
                onClick={handleSave}
                type="button"
              >
                {createRoleLoading || updateRoleLoading
                  ? "Saving…"
                  : isCreateMode
                    ? "Create Role"
                    : "Save Changes"}
              </button>
            </div>
          </article>
        </section>
      )}
    </section>
  );
}

function SummaryCard({ label, value, valueClass = "text-slate-100" }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#183452]/82 p-4 md:p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className={`mt-2 font-['Sora'] text-2xl font-semibold ${valueClass}`}>{value}</p>
    </article>
  );
}

function SkeletonLoader() {
  return (
    <div className="grid animate-pulse gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <div className="space-y-3 rounded-2xl border border-white/10 bg-[#183452]/82 p-5">
        {[...Array(4)].map((_, i) => (
          <div className="h-20 rounded-xl bg-white/8" key={i} />
        ))}
      </div>
      <div className="space-y-4 rounded-2xl border border-white/10 bg-[#183452]/82 p-5">
        <div className="h-6 w-40 rounded bg-white/8" />
        <div className="h-10 rounded-xl bg-white/8" />
        <div className="h-28 rounded-xl bg-white/8" />
        <div className="h-10 rounded-xl bg-white/8" />
      </div>
    </div>
  );
}

export default AdminRolesPage;