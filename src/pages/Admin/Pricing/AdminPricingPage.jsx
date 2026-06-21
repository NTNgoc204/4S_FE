import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminPlansRequest,
  updateAdminPlanRequest,
} from "../../../feature/admin/adminSlice";

import PlanList from "./components/PlanList";
import PlanEditForm from "./components/PlanEditForm";
import ConfirmModal from "../../../components/ConfirmModal";

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

  // Confirm Modal State
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: () => {},
  });

  const showConfirm = (title, message, onConfirm, type = "warning") => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: () => {
        onConfirm();
        closeConfirm();
      },
    });
  };

  const closeConfirm = () => {
    setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // ── Fetch on mount ──────────────────────────────────────
  useEffect(() => {
    if (adminPlans.length === 0) {
      dispatch(fetchAdminPlansRequest());
    }
  }, [dispatch, adminPlans.length]);

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
    const action = () => {
      setSelectedPlanId(id);
    };

    if (dirty) {
      showConfirm(
        "Thay đổi chưa lưu",
        "Bạn có thay đổi chưa lưu. Bạn có muốn hủy bỏ chúng?",
        action,
        "warning"
      );
    } else {
      action();
    }
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
      {adminPlansLoading ? (
        <SkeletonLoader />
      ) : (
        <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          {/* Plan list */}
          <PlanList
            adminPlans={adminPlans}
            selectedPlanId={selectedPlanId}
            handleSelectPlan={handleSelectPlan}
            formatPrice={formatPrice}
          />

          {/* Edit panel */}
          <PlanEditForm
            selectedPlan={selectedPlan}
            form={form}
            dirty={dirty}
            updateForm={updateForm}
            handleSave={handleSave}
            updatePlanLoading={updatePlanLoading}
            formatPrice={formatPrice}
          />
        </section>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        onConfirm={confirmConfig.onConfirm}
        onCancel={closeConfirm}
        isAdmin={true}
      />
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────
function SkeletonLoader() {
  return (
    <div className="grid animate-pulse gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        {[...Array(3)].map((_, i) => (
          <div className="h-20 rounded-xl bg-slate-100" key={i} />
        ))}
      </div>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="h-6 w-40 rounded bg-slate-100" />
        <div className="h-10 rounded-xl bg-slate-100" />
        <div className="h-20 rounded-xl bg-slate-100" />
        <div className="h-10 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

export default AdminPricingPage;
