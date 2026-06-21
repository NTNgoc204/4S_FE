import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsersRequest,
  fetchRolesRequest,
  updateUserRequest,
  toggleUserStatusRequest,
} from "../../../feature/admin/adminSlice";
import {
  formatDateForBE,
  formatDateForInput,
} from "../../../util/dateHelper";
import UserSummaryCards from "./components/UserSummaryCards";
import UserFilters from "./components/UserFilters";
import UserTable from "./components/UserTable";
import UserEditModal from "./components/UserEditModal";

export default function AdminUsersPage() {
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

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsersRequest());
    }
    if (roles.length === 0) {
      dispatch(fetchRolesRequest());
    }
  }, [dispatch, users.length, roles.length]);

  const summary = useMemo(() => {
    const active = users.filter((u) => u.isActive).length;
    return { total: users.length, active, inactive: users.length - active };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    const filtered = users.filter((u) => {
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

    const ROLE_PRIORITY = {
      admin: 1,
      school_manager: 2,
      school_assistant: 3,
      counselor: 4,
      student: 100,
    };

    return [...filtered].sort((a, b) => {
      const roleA = (a.roleName ?? "").toLowerCase().replace(/-/g, "_");
      const roleB = (b.roleName ?? "").toLowerCase().replace(/-/g, "_");
      const prioA = ROLE_PRIORITY[roleA] ?? 50;
      const prioB = ROLE_PRIORITY[roleB] ?? 50;
      if (prioA !== prioB) {
        return prioA - prioB;
      }

      // Nếu cùng là student, sắp xếp theo Plan (Pro/Premium/Edu... lên trên Free/không gói)
      if (roleA === "student") {
        const planA = (a.planName ?? "").toLowerCase().trim();
        const planB = (b.planName ?? "").toLowerCase().trim();

        const PLAN_PRIORITY = {
          pro: 1,
          premium: 2,
          edu: 3,
          standard: 4,
          free: 10,
        };

        const pPrioA = PLAN_PRIORITY[planA] ?? 99;
        const pPrioB = PLAN_PRIORITY[planB] ?? 99;

        if (pPrioA !== pPrioB) {
          return pPrioA - pPrioB;
        }
      }

      return (a.username ?? "").localeCompare(b.username ?? "");
    });
  }, [users, searchText, statusFilter, roleFilter]);

  function handleToggleStatus(user) {
    if (toggleStatusLoading === user.userId) return;
    dispatch(
      toggleUserStatusRequest({
        userId: user.userId,
        isActive: !user.isActive,
      }),
    );
  }

  function openEditForm(user) {
    const currentRole = roles.find(
      (r) => (r.name ?? "").toLowerCase() === (user.roleName ?? "").toLowerCase()
    );
    setEditingUser(user);
    setForm({
      username: user.username ?? "",
      address: user.address ?? "",
      phoneNumber: user.phoneNumber ?? "",
      gender: user.gender ?? "Other",
      dob: formatDateForInput(user.dob),
      roleId: currentRole ? currentRole.id : "",
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

  function handleSaveUser() {
    if (!editingUser) return;

    const patch = {
      username: form.username.trim() || undefined,
      address: form.address.trim() || undefined,
      phoneNumber: form.phoneNumber.trim() || undefined,
      gender: form.gender || editingUser.gender || "Other",
      dob: formatDateForBE(form.dob) || formatDateForBE(editingUser.dob) || "2000-01-01T00:00:00.000Z",
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

  return (
    <section className="space-y-6">
      <UserSummaryCards summary={summary} />
      
      <UserFilters
        roles={roles}
        roleFilter={roleFilter}
        searchText={searchText}
        setRoleFilter={setRoleFilter}
        setSearchText={setSearchText}
        setStatusFilter={setStatusFilter}
        statusFilter={statusFilter}
      />

      <UserTable
        currentUserId={currentUserId}
        filteredUsers={filteredUsers}
        handleToggleStatus={handleToggleStatus}
        openEditForm={openEditForm}
        toggleStatusLoading={toggleStatusLoading}
        usersLoading={usersLoading}
      />

      <UserEditModal
        closeForm={closeForm}
        editingUser={editingUser}
        form={form}
        handleSaveUser={handleSaveUser}
        isFormOpen={isFormOpen}
        roles={roles}
        updateFormField={updateFormField}
        updateUserLoading={updateUserLoading}
      />
    </section>
  );
}
