import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminPlansRequest,
  updateAdminPlanRequest,
} from "../../feature/admin/adminSlice";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0 VND";
  return `${n.toLocaleString("vi-VN")} VND`;
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminPricingPage
// ─────────────────────────────────────────────────────────────────────────────
function AdminPricingPage() {
  const dispatch = useDispatch();
  const { adminPlans, adminPlansLoading, updatePlanLoading } = useSelector(
    (state) => state.admin,
  );

  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", price: 0 });
  const [dirty, setDirty] = useState(false);

  // ── Fetch on mount ──────────────────────────────────────
  useEffect(() => {
    dispatch(fetchAdminPlansRequest());
  }, [dispatch]);

  // ── Auto-select first plan once loaded ──────────────────
  useEffect(() => {
    if (adminPlans.length > 0 && selectedPlanId === null) {
      setSelectedPlanId(adminPlans[0].id);
    }
  }, [adminPlans, selectedPlanId]);

  // ── Sync form when selected plan changes ─────────────────
  const selectedPlan = useMemo(
    () => adminPlans.find((p) => p.id === selectedPlanId) ?? null,
    [adminPlans, selectedPlanId],
  );

  useEffect(() => {
    if (selectedPlan) {
      setForm({
        name: selectedPlan.name ?? "",
        description: selectedPlan.description ?? "",
        price: selectedPlan.price ?? 0,
      });
      setDirty(false);
    }
  }, [selectedPlan]);

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function handleSelectPlan(id) {
    if (dirty) {
      const ok = window.confirm("You have unsaved changes. Discard them?");
      if (!ok) return;
    }
    setSelectedPlanId(id);
  }

  // ── Save via Redux ──────────────────────────────────────
  function handleSave() {
    if (!selectedPlan) return;
    dispatch(
      updateAdminPlanRequest({
        id: selectedPlan.id,
        patch: {
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
        },
        onSuccess: () => setDirty(false),
      }),
    );
  }

  // ── Render ──────────────────────────────────────────────
  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="rounded-2xl border border-white/10 bg-[#153251]/82 p-5 md:p-6">
        <h2 className="font-['Sora'] text-2xl font-semibold md:text-3xl">
          Pricing Management
        </h2>
        <p className="mt-2 text-sm text-slate-300 md:text-base">
          Edit plan name, description, and price.
        </p>
      </header>

      {adminPlansLoading ? (
        <SkeletonLoader />
      ) : (
        <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          {/* Plan list */}
          <article className="rounded-2xl border border-white/10 bg-[#183452]/82 p-4 md:p-5">
            <h3 className="mb-4 font-['Sora'] text-lg font-semibold">Plans</h3>
            <div className="space-y-3">
              {adminPlans.map((plan) => {
                const selected = plan.id === selectedPlanId;
                return (
                  <button
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selected
                        ? "border-[#0ed8ab]/45 bg-[#0ed8ab]/14"
                        : "border-white/10 bg-[#10253e]/72 hover:bg-[#10253e]"
                    }`}
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan.id)}
                    type="button"
                  >
                    <p className="font-semibold text-slate-100">{plan.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                      {plan.description || "—"}
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#0ed8ab]">
                      {formatPrice(plan.price)}
                    </p>
                  </button>
                );
              })}

              {adminPlans.length === 0 && (
                <p className="text-sm text-slate-400">No plans found.</p>
              )}
            </div>
          </article>

          {/* Edit panel */}
          {selectedPlan ? (
            <article className="rounded-2xl border border-white/10 bg-[#183452]/82 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-['Sora'] text-xl font-semibold">Edit Plan</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    Changes are saved to the database when you click Save.
                  </p>
                </div>
                {dirty && (
                  <span className="rounded-full border border-[#ecc741]/45 bg-[#ecc741]/14 px-2.5 py-1 text-xs font-semibold text-[#f3d459]">
                    Unsaved changes
                  </span>
                )}
              </div>

              <div className="mt-5 space-y-4">
                {/* Name */}
                <div>
                  <label
                    className="mb-1.5 block text-sm text-slate-300"
                    htmlFor="plan-name"
                  >
                    Plan Name
                  </label>
                  <input
                    className="w-full rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#ecc741] focus:outline-none"
                    id="plan-name"
                    onChange={(e) => updateForm("name", e.target.value)}
                    type="text"
                    value={form.name}
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    className="mb-1.5 block text-sm text-slate-300"
                    htmlFor="plan-description"
                  >
                    Description
                  </label>
                  <textarea
                    className="w-full resize-none rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#ecc741] focus:outline-none"
                    id="plan-description"
                    onChange={(e) => updateForm("description", e.target.value)}
                    rows={3}
                    value={form.description}
                  />
                </div>

                {/* Price */}
                <div>
                  <label
                    className="mb-1.5 block text-sm text-slate-300"
                    htmlFor="plan-price"
                  >
                    Price (VND)
                  </label>
                  <input
                    className="w-full rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#ecc741] focus:outline-none"
                    id="plan-price"
                    min="0"
                    onChange={(e) => updateForm("price", e.target.value)}
                    type="number"
                    value={form.price}
                  />
                  <p className="mt-1.5 text-xs text-slate-400">
                    Preview: {formatPrice(form.price)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  className="rounded-xl bg-gradient-to-r from-[#19d2ad] to-[#0fbc98] px-6 py-2.5 text-sm font-bold text-[#082339] transition hover:brightness-110 disabled:opacity-50"
                  disabled={updatePlanLoading || !dirty}
                  onClick={handleSave}
                  type="button"
                >
                  {updatePlanLoading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </article>
          ) : null}
        </section>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────
function SkeletonLoader() {
  return (
    <div className="grid animate-pulse gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-3 rounded-2xl border border-white/10 bg-[#183452]/82 p-5">
        {[...Array(3)].map((_, i) => (
          <div className="h-20 rounded-xl bg-white/8" key={i} />
        ))}
      </div>
      <div className="space-y-4 rounded-2xl border border-white/10 bg-[#183452]/82 p-5">
        <div className="h-6 w-40 rounded bg-white/8" />
        <div className="h-10 rounded-xl bg-white/8" />
        <div className="h-20 rounded-xl bg-white/8" />
        <div className="h-10 rounded-xl bg-white/8" />
      </div>
    </div>
  );
}

export default AdminPricingPage;
