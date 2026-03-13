import { useMemo, useState } from "react";

const INITIAL_USERS = [
  {
    id: "u-1001",
    fullName: "Nguyen Minh Anh",
    email: "minhanh@gmail.com",
    role: "student",
    plan: "pro",
    status: "active",
    joinedAt: "2026-01-22",
  },
  {
    id: "u-1002",
    fullName: "Tran Gia Bao",
    email: "giabao@gmail.com",
    role: "student",
    plan: "free",
    status: "active",
    joinedAt: "2026-02-03",
  },
  {
    id: "u-1003",
    fullName: "Le Thi Quynh",
    email: "quynh.le@school.edu.vn",
    role: "school-manager",
    plan: "edu",
    status: "inactive",
    joinedAt: "2025-12-14",
  },
  {
    id: "u-1004",
    fullName: "Pham Tuan Kiet",
    email: "kiet.pham@gmail.com",
    role: "student",
    plan: "free",
    status: "active",
    joinedAt: "2026-02-20",
  },
  {
    id: "u-1005",
    fullName: "Doan Khanh Linh",
    email: "khanhlinh@college.vn",
    role: "counselor",
    plan: "pro",
    status: "inactive",
    joinedAt: "2025-11-05",
  },
];

const EMPTY_FORM = {
  fullName: "",
  email: "",
  role: "student",
  plan: "free",
  status: "active",
  joinedAt: "2026-03-01",
};

function AdminUsersPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const filteredUsers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return users.filter((user) => {
      const hitKeyword =
        keyword.length === 0 ||
        user.fullName.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.id.toLowerCase().includes(keyword);
      const hitStatus = statusFilter === "all" || user.status === statusFilter;
      const hitRole = roleFilter === "all" || user.role === roleFilter;

      return hitKeyword && hitStatus && hitRole;
    });
  }, [roleFilter, searchText, statusFilter, users]);

  const summary = useMemo(() => {
    const active = users.filter((item) => item.status === "active").length;
    const inactive = users.length - active;
    const proUsers = users.filter((item) => item.plan === "pro").length;

    return {
      total: users.length,
      active,
      inactive,
      proUsers,
    };
  }, [users]);

  function openCreateForm() {
    setEditingUserId("");
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  }

  function openEditForm(user) {
    setEditingUserId(user.id);
    setForm({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      plan: user.plan,
      status: user.status,
      joinedAt: user.joinedAt,
    });
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingUserId("");
    setForm(EMPTY_FORM);
  }

  function updateFormField(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function toggleStatus(userId) {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "active" ? "inactive" : "active",
            }
          : user,
      ),
    );
  }

  function handleSaveUser() {
    if (!form.fullName.trim() || !form.email.trim()) {
      return;
    }

    if (editingUserId) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUserId
            ? {
                ...user,
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                role: form.role,
                plan: form.plan,
                status: form.status,
                joinedAt: form.joinedAt,
              }
            : user,
        ),
      );
    } else {
      const nextId = `u-${String(Date.now()).slice(-6)}`;
      setUsers((prev) => [
        {
          id: nextId,
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          role: form.role,
          plan: form.plan,
          status: form.status,
          joinedAt: form.joinedAt,
        },
        ...prev,
      ]);
    }

    closeForm();
  }

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-white/10 bg-[#153251]/82 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-['Sora'] text-2xl font-semibold md:text-3xl">User Management</h2>
            <p className="mt-2 text-sm text-slate-300 md:text-base">
              CRU workflow: create, read, update users and toggle active or inactive status.
            </p>
          </div>
          <button
            className="rounded-xl bg-gradient-to-r from-[#19d2ad] to-[#0fbc98] px-4 py-2 text-sm font-bold text-[#082339] transition hover:brightness-110"
            onClick={openCreateForm}
            type="button"
          >
            + Create User
          </button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Users" value={summary.total} valueClass="text-[#e8f2ff]" />
        <SummaryCard label="Active" value={summary.active} valueClass="text-[#0ed8ab]" />
        <SummaryCard label="Inactive" value={summary.inactive} valueClass="text-[#f3d459]" />
        <SummaryCard label="Pro Plan Users" value={summary.proUsers} valueClass="text-[#8b99ff]" />
      </section>

      <article className="rounded-2xl border border-white/10 bg-[#183452]/82 p-4 md:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
          <input
            className="w-full rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#ecc741] focus:outline-none"
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search by name, email, ID..."
            type="text"
            value={searchText}
          />
          <select
            className="rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 text-sm text-slate-100 focus:border-[#ecc741] focus:outline-none"
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
          >
            <option className="bg-[#203a59] text-slate-100" value="all">
              All Status
            </option>
            <option className="bg-[#203a59] text-slate-100" value="active">
              Active
            </option>
            <option className="bg-[#203a59] text-slate-100" value="inactive">
              Inactive
            </option>
          </select>
          <select
            className="rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 text-sm text-slate-100 focus:border-[#ecc741] focus:outline-none"
            onChange={(event) => setRoleFilter(event.target.value)}
            value={roleFilter}
          >
            <option className="bg-[#203a59] text-slate-100" value="all">
              All Roles
            </option>
            <option className="bg-[#203a59] text-slate-100" value="student">
              Student
            </option>
            <option className="bg-[#203a59] text-slate-100" value="school-manager">
              School Manager
            </option>
            <option className="bg-[#203a59] text-slate-100" value="counselor">
              Counselor
            </option>
          </select>
        </div>
      </article>

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
              {filteredUsers.map((user) => (
                <tr className="border-b border-white/6 last:border-b-0" key={user.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-100">{user.fullName}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                    <p className="text-xs text-slate-500">{user.id}</p>
                  </td>
                  <td className="px-4 py-4 text-sm capitalize text-slate-300">{formatRole(user.role)}</td>
                  <td className="px-4 py-4 text-sm uppercase text-slate-200">{user.plan}</td>
                  <td className="px-4 py-4 text-sm text-slate-300">{user.joinedAt}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <EditActionButton onClick={() => openEditForm(user)} />
                      <ToggleStatusActionButton
                        isActive={user.status === "active"}
                        onClick={() => toggleStatus(user.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <section className="space-y-3 md:hidden">
        {filteredUsers.map((user) => (
          <article
            className="rounded-2xl border border-white/10 bg-[#183452]/82 p-4"
            key={user.id}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-100">{user.fullName}</p>
                <p className="text-sm text-slate-400">{user.email}</p>
                <p className="text-xs text-slate-500">{user.id}</p>
              </div>
              <StatusBadge status={user.status} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
              <p>
                Role: <span className="font-semibold">{formatRole(user.role)}</span>
              </p>
              <p>
                Plan: <span className="font-semibold uppercase">{user.plan}</span>
              </p>
              <p className="col-span-2">
                Joined: <span className="font-semibold">{user.joinedAt}</span>
              </p>
            </div>

            <div className="mt-3 flex gap-2">
              <EditActionButton fullWidth onClick={() => openEditForm(user)} />
              <ToggleStatusActionButton
                fullWidth
                isActive={user.status === "active"}
                onClick={() => toggleStatus(user.id)}
              />
            </div>
          </article>
        ))}
      </section>

      {isFormOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#020712]/75 px-3">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#173554] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-['Sora'] text-xl font-semibold">
                  {editingUserId ? "Update User" : "Create User"}
                </h3>
                <p className="mt-1 text-sm text-slate-300">
                  {editingUserId
                    ? "Update profile and account status."
                    : "Add a new account for admin management."}
                </p>
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
                label="Full Name"
                onChange={(value) => updateFormField("fullName", value)}
                type="text"
                value={form.fullName}
              />
              <FormField
                label="Email"
                onChange={(value) => updateFormField("email", value)}
                type="email"
                value={form.email}
              />
              <FormSelect
                label="Role"
                onChange={(value) => updateFormField("role", value)}
                options={[
                  { label: "Student", value: "student" },
                  { label: "School Manager", value: "school-manager" },
                  { label: "Counselor", value: "counselor" },
                ]}
                value={form.role}
              />
              <FormSelect
                label="Plan"
                onChange={(value) => updateFormField("plan", value)}
                options={[
                  { label: "Free", value: "free" },
                  { label: "Pro", value: "pro" },
                  { label: "Edu", value: "edu" },
                ]}
                value={form.plan}
              />
              <FormField
                label="Joined Date"
                onChange={(value) => updateFormField("joinedAt", value)}
                type="date"
                value={form.joinedAt}
              />
              <FormSelect
                label="Status"
                onChange={(value) => updateFormField("status", value)}
                options={[
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
                value={form.status}
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
                className="rounded-lg bg-gradient-to-r from-[#19d2ad] to-[#0fbc98] px-4 py-2 text-sm font-bold text-[#082339] transition hover:brightness-110"
                onClick={handleSaveUser}
                type="button"
              >
                {editingUserId ? "Save Changes" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SummaryCard({ label, value, valueClass }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#183452]/82 p-4 md:p-5">
      <p className="text-sm text-slate-300">{label}</p>
      <p className={`mt-2 font-['Sora'] text-3xl font-semibold ${valueClass}`}>{value}</p>
    </article>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
        status === "active"
          ? "border border-[#0ed8ab]/45 bg-[#0ed8ab]/16 text-[#0ed8ab]"
          : "border border-[#ecc741]/45 bg-[#ecc741]/16 text-[#f3d459]"
      }`}
    >
      {status}
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

function ToggleStatusActionButton({ isActive, onClick, fullWidth = false }) {
  const widthClass = fullWidth ? "flex-1" : "w-32";

  return (
    <button
      className={`${widthClass} inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition ${
        isActive
          ? "border border-[#ecc741]/45 bg-[#ecc741]/14 text-[#f3d459] hover:bg-[#ecc741]/24"
          : "border border-[#0ed8ab]/40 bg-[#0ed8ab]/14 text-[#0ed8ab] hover:bg-[#0ed8ab]/22"
      }`}
      onClick={onClick}
      type="button"
    >
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path
          d="M12 4v7"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M8 6.7a7 7 0 1 0 8 0"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
      <span>{isActive ? "Set Inactive" : "Set Active"}</span>
    </button>
  );
}

function FormField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <p className="mb-1.5 text-sm text-slate-300">{label}</p>
      <input
        className="w-full rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#ecc741] focus:outline-none"
        onChange={(event) => onChange(event.target.value)}
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
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option
            className="bg-[#203a59] text-slate-100"
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function formatRole(role) {
  return role.replace("-", " ");
}

export default AdminUsersPage;
