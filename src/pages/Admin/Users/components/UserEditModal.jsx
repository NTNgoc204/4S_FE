import React from "react";

function FormField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <input
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none shadow-xs transition-all"
        onChange={(e) => onChange(e.target.value)}
        type={type}
        value={value}
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options, disabled = false }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <select
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none shadow-xs transition-all disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
        onChange={(e) => onChange(e.target.value)}
        value={value}
        disabled={disabled}
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

export default function UserEditModal({
  isFormOpen,
  closeForm,
  editingUser,
  form,
  updateFormField,
  roles,
  updateUserLoading,
  handleSaveUser,
}) {
  if (!isFormOpen) return null;

  const isAdminAccount = editingUser?.roleName?.toLowerCase() === "admin";

  const filteredRoles = isAdminAccount
    ? roles
    : roles.filter((r) => (r.name ?? "").toLowerCase() !== "admin");

  return (
    <div className="fixed inset-0 z-45 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs px-3">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-['Sora'] text-xl font-bold text-slate-850">Edit User</h3>
            <p className="mt-1 text-sm text-slate-400">{editingUser?.email}</p>
          </div>
          <button
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-505 transition hover:bg-slate-50 hover:border-slate-350 hover:text-slate-800 shadow-xs cursor-pointer"
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
            options={filteredRoles.map((r) => ({ label: r.name, value: r.id }))}
            value={form.roleId}
            disabled={isAdminAccount}
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-505 transition hover:bg-slate-50 hover:border-slate-300 shadow-xs cursor-pointer"
            onClick={closeForm}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50 shadow-sm cursor-pointer"
            disabled={updateUserLoading}
            onClick={handleSaveUser}
            type="button"
          >
            {updateUserLoading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
