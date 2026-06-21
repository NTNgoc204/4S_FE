import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createRoleRequest,
  fetchRolesRequest,
  updateRoleRequest,
} from "../../../feature/admin/adminSlice";

import RoleList from "./components/RoleList";
import RoleEditForm from "./components/RoleEditForm";
import ConfirmModal from "../../../components/ConfirmModal";

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

  useEffect(() => {
    if (roles.length === 0) {
      dispatch(fetchRolesRequest());
    }
  }, [dispatch, roles.length]);

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
    const action = () => {
      setIsCreateMode(true);
      setSelectedRoleId(null);
      setForm({ name: "", description: "" });
      setDirty(false);
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

  function startEditMode(role) {
    const nextRoleId = getRoleId(role);
    const action = () => {
      setIsCreateMode(false);
      setSelectedRoleId(nextRoleId);
      setForm({
        name: getRoleName(role),
        description: getRoleDescription(role),
      });
      setDirty(false);
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

  function handleSave() {
    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      window.alert("Tên vai trò là bắt buộc.");
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
      {/* Page Header Actions Area (No title/sub description) */}
      <div className="flex justify-end">
        <button
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition cursor-pointer"
          onClick={startCreateMode}
          type="button"
        >
          Vai Trò Mới
        </button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard label="Tổng Số Vai Trò" value={summary.totalRoles} valueClass="text-slate-800" />
        <SummaryCard label="Tổng Số Người Dùng Được Gán" value={summary.totalUsers} valueClass="text-indigo-600" />
        <SummaryCard label="Chế Độ" value={isCreateMode ? "Tạo Mới" : "Chỉnh Sửa"} valueClass="text-amber-600" />
      </section>

      {rolesLoading ? (
        <SkeletonLoader />
      ) : (
        <section className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
          <RoleList
            roles={roles}
            isCreateMode={isCreateMode}
            selectedRoleId={selectedRoleId}
            startEditMode={startEditMode}
            getRoleId={getRoleId}
            getRoleName={getRoleName}
            getRoleDescription={getRoleDescription}
            getRoleUsersCount={getRoleUsersCount}
          />

          <RoleEditForm
            isCreateMode={isCreateMode}
            dirty={dirty}
            form={form}
            updateForm={updateForm}
            startCreateMode={startCreateMode}
            handleSave={handleSave}
            createRoleLoading={createRoleLoading}
            updateRoleLoading={updateRoleLoading}
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

function SummaryCard({ label, value, valueClass = "text-slate-800" }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-xs">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400 font-semibold">{label}</p>
      <p className={`mt-2 font-['Sora'] text-2xl font-extrabold ${valueClass}`}>{value}</p>
    </article>
  );
}

function SkeletonLoader() {
  return (
    <div className="grid animate-pulse gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        {[...Array(4)].map((_, i) => (
          <div className="h-20 rounded-xl bg-slate-100/70" key={i} />
        ))}
      </div>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="h-6 w-40 rounded bg-slate-100/70" />
        <div className="h-10 rounded-xl bg-slate-100/70" />
        <div className="h-28 rounded-xl bg-slate-100/70" />
        <div className="h-10 rounded-xl bg-slate-100/70" />
      </div>
    </div>
  );
}

export default AdminRolesPage;
