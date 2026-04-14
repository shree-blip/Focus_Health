"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { lopDb } from "@/lib/lop/db";
import { hasPermission } from "@/lib/lop/permissions";
import type {
  LopUser,
  LopUserRole,
  LopFacility,
  LopAuditLog,
  LopUserFacility,
} from "@/lib/lop/types";
import { ROLE_LABELS } from "@/lib/lop/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Building2,
  Clock,
  Edit3,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Tab = "users" | "facilities" | "audit";

type UserRow = LopUser & {
  lop_user_facilities?: { facility_id: string }[];
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const roleOptions: { value: LopUserRole; label: string }[] = [
  { value: "front_desk", label: "Front Desk" },
  { value: "scheduler", label: "Scheduler" },
  { value: "medical_records", label: "Medical Records" },
  { value: "accounting", label: "Accounting" },
  { value: "admin", label: "Admin" },
];

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";
}

const avatarColors = [
  "bg-[#0B3B91] text-white",
  "bg-indigo-100 text-indigo-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
];

function avatarColor(id: string) {
  const seed = id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return avatarColors[seed % avatarColors.length];
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const { lopUser } = useLopAuth();
  const canManageUsers = hasPermission(lopUser, "users:manage");
  const canManageFacilities = hasPermission(lopUser, "facilities:manage");
  const canReadAudit = hasPermission(lopUser, "audit:read");

  const [tab, setTab] = useState<Tab>("users");

  /* ---- reject non-admins ---- */
  if (!canManageUsers && !canManageFacilities) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-[28px] border border-white/70 bg-white/85 px-8 py-12 text-center shadow-lg">
          <Shield className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-4 font-heading text-2xl font-bold text-slate-900">
            Admin Only
          </h2>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Settings are restricted to administrators. If you need access,
            contact your system admin.
          </p>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "users", label: "Users", icon: Users },
    { key: "facilities", label: "Facilities", icon: Building2 },
    ...(canReadAudit
      ? [{ key: "audit" as Tab, label: "Audit Log", icon: Clock }]
      : []),
  ];

  return (
    <div className="pb-8 lg:pb-12">
      {/* ── Header ── */}
      <header className="mb-6 rounded-[30px] border border-white/70 bg-white/70 px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:sticky lg:top-0 lg:z-20 lg:mb-8 lg:px-8 lg:py-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="font-heading text-lg font-semibold text-[#0B3B91]">
              LOP Dashboard
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#0B3B91]/5 px-3 py-1.5 text-xs font-semibold text-[#0B3B91]">
                <Settings className="h-3.5 w-3.5" />
                System Settings
              </span>
              <span className="text-sm text-slate-500">
                Manage users, facilities &amp; configuration
              </span>
            </div>
          </div>

          {lopUser && (
            <div className="flex items-center gap-3 rounded-full border border-white/80 bg-white/90 px-3 py-2 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B3B91] text-sm font-bold text-white">
                {getInitials(lopUser.full_name)}
              </div>
              <div className="hidden min-w-0 text-right sm:block">
                <p className="truncate text-sm font-bold text-[#0B3B91]">
                  {lopUser.full_name}
                </p>
                <p className="truncate text-[11px] text-slate-400">
                  {ROLE_LABELS[lopUser.role]}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Title + Tabs ── */}
      <section className="px-1 lg:px-0">
        <div className="mb-6">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-[#0B3B91] md:text-5xl">
            Settings
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 md:text-base">
            User accounts, facility configuration &amp; audit history
          </p>
        </div>

        <div className="mb-8 rounded-[28px] border border-white/70 bg-white/85 p-2 shadow-[0_20px_45px_rgba(15,23,42,0.05)]">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all",
                    active
                      ? "bg-white text-[#0B3B91] shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-700",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {tab === "users" && <UsersTab />}
        {tab === "facilities" && <FacilitiesTab />}
        {tab === "audit" && canReadAudit && <AuditTab />}
      </section>
    </div>
  );
}

/* ================================================================== */
/*  USERS TAB                                                          */
/* ================================================================== */

function UsersTab() {
  const { lopUser, facilities } = useLopAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    role: "front_desk" as LopUserRole,
    is_active: true,
    facility_ids: [] as string[],
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await lopDb.select("lop_users", {
        select: "*, lop_user_facilities(facility_id)",
        order: { column: "full_name" },
      });
      setUsers((data as UserRow[]) ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        ROLE_LABELS[u.role].toLowerCase().includes(q),
    );
  }, [users, search]);

  const openDialog = (user?: UserRow) => {
    if (user) {
      setEditingUser(user);
      setForm({
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        facility_ids:
          user.lop_user_facilities?.map((uf) => uf.facility_id) ?? [],
      });
    } else {
      setEditingUser(null);
      setForm({
        full_name: "",
        email: "",
        role: "front_desk",
        is_active: true,
        facility_ids: [],
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        /* ---- update user ---- */
        await lopDb.update(
          "lop_users",
          {
            full_name: form.full_name.trim(),
            email: form.email.trim(),
            role: form.role,
            is_active: form.is_active,
          },
          { id: editingUser.id },
        );

        /* ---- sync facility assignments ---- */
        await lopDb.remove("lop_user_facilities", {
          user_id: editingUser.id,
        });
        if (form.facility_ids.length > 0) {
          await lopDb.insert(
            "lop_user_facilities",
            form.facility_ids.map((fid) => ({
              user_id: editingUser.id,
              facility_id: fid,
            })),
          );
        }

        await lopDb.insert("lop_audit_log", {
          user_id: lopUser?.id,
          action: "user_updated",
          entity_type: "user",
          entity_id: editingUser.id,
          old_values: {
            full_name: editingUser.full_name,
            role: editingUser.role,
            is_active: editingUser.is_active,
          },
          new_values: {
            full_name: form.full_name.trim(),
            role: form.role,
            is_active: form.is_active,
            facility_ids: form.facility_ids,
          },
        });

        toast.success("User updated.");
      } else {
        /* ---- create user ---- */
        const { data } = await lopDb.insert(
          "lop_users",
          {
            full_name: form.full_name.trim(),
            email: form.email.trim(),
            role: form.role,
            is_active: form.is_active,
          },
          { select: "id", single: true },
        );

        const newId = (data as { id?: string } | null)?.id;

        if (newId && form.facility_ids.length > 0) {
          await lopDb.insert(
            "lop_user_facilities",
            form.facility_ids.map((fid) => ({
              user_id: newId,
              facility_id: fid,
            })),
          );
        }

        await lopDb.insert("lop_audit_log", {
          user_id: lopUser?.id,
          action: "user_created",
          entity_type: "user",
          entity_id: newId,
          new_values: {
            full_name: form.full_name.trim(),
            email: form.email.trim(),
            role: form.role,
          },
        });

        toast.success("User created.");
      }

      setDialogOpen(false);
      await loadUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  const toggleFacility = (facilityId: string) => {
    setForm((prev) => ({
      ...prev,
      facility_ids: prev.facility_ids.includes(facilityId)
        ? prev.facility_ids.filter((id) => id !== facilityId)
        : [...prev.facility_ids, facilityId],
    }));
  };

  const summary = useMemo(() => {
    const active = users.filter((u) => u.is_active).length;
    const admins = users.filter((u) => u.role === "admin").length;
    return { total: users.length, active, admins };
  }, [users]);

  return (
    <>
      {/* ── Metrics ── */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-[26px] border border-white/80 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Total Users
          </p>
          <p className="mt-3 font-heading text-3xl font-black text-[#0B3B91]">
            {summary.total}
          </p>
        </div>
        <div className="rounded-[26px] border border-white/80 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Active
          </p>
          <p className="mt-3 font-heading text-3xl font-black text-emerald-600">
            {summary.active}
          </p>
        </div>
        <div className="rounded-[26px] border border-white/80 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Admins
          </p>
          <p className="mt-3 font-heading text-3xl font-black text-[#0B3B91]">
            {summary.admins}
          </p>
        </div>
      </div>

      {/* ── Search + Add ── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-full border-white/80 bg-slate-100/90 pl-11 pr-4 text-sm shadow-none focus-visible:ring-[#0B3B91]/20"
          />
        </div>
        <Button
          type="button"
          onClick={() => openDialog()}
          className="h-11 rounded-full bg-gradient-to-r from-[#D72638] to-[#ff4d5e] px-5 text-white shadow-[0_16px_35px_rgba(215,38,56,0.2)] hover:scale-[1.01] hover:from-[#c91f31] hover:to-[#ff4355]"
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* ── User List ── */}
      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-[30px] border border-white/80 bg-white shadow-sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0B3B91]" />
          <span className="text-sm text-slate-500">Loading users…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[30px] border border-white/80 bg-white px-6 py-16 text-center shadow-sm">
          <UserCog className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-4 font-heading text-2xl font-bold text-slate-900">
            {users.length === 0 ? "No users yet" : "No users match"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {users.length === 0
              ? "Create the first user account to get started."
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filtered.map((user) => {
            const facilityNames = (user.lop_user_facilities ?? [])
              .map((uf) => facilities.find((f) => f.id === uf.facility_id)?.name)
              .filter(Boolean);

            return (
              <div
                key={user.id}
                className={cn(
                  "overflow-hidden rounded-[28px] shadow-[0_20px_45px_rgba(9,20,40,0.05)] transition-all duration-300 hover:-translate-y-0.5",
                  user.is_active
                    ? "border border-white/70 bg-white/85 backdrop-blur-xl"
                    : "border border-slate-200 bg-slate-100/85",
                )}
              >
                <div
                  className={cn(
                    "h-1.5",
                    user.is_active
                      ? "bg-gradient-to-r from-[#0B3B91] to-[#2563EB]"
                      : "bg-slate-300",
                  )}
                />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex h-14 w-14 items-center justify-center rounded-[18px] text-sm font-bold",
                          avatarColor(user.id),
                        )}
                      >
                        {getInitials(user.full_name)}
                      </div>
                      <div>
                        <h3
                          className={cn(
                            "font-heading text-xl font-bold",
                            user.is_active ? "text-slate-900" : "text-slate-500",
                          )}
                        >
                          {user.full_name}
                        </h3>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              user.is_active ? "bg-emerald-500" : "bg-slate-400",
                            )}
                          />
                          <span
                            className={cn(
                              "text-xs font-semibold uppercase tracking-wider",
                              user.is_active
                                ? "text-emerald-600"
                                : "text-slate-400",
                            )}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-2xl text-slate-500 hover:bg-white"
                      onClick={() => openDialog(user)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                    <div className="flex items-center gap-3">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-sm text-slate-600">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          user.role === "admin"
                            ? "bg-[#0B3B91]/10 text-[#0B3B91]"
                            : "bg-slate-100 text-slate-600",
                        )}
                      >
                        {ROLE_LABELS[user.role]}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="mt-0.5 h-3.5 w-3.5 text-slate-400" />
                      <div className="flex flex-wrap gap-1.5">
                        {facilityNames.length > 0 ? (
                          facilityNames.map((name) => (
                            <span
                              key={name}
                              className="rounded-xl bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                            >
                              {name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">
                            No facilities assigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── User Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl rounded-[28px] border-white/80 bg-white/95 p-0">
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle className="font-heading text-2xl font-bold text-[#0B3B91]">
              {editingUser ? "Edit User" : "Add User"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 px-6 py-6">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={form.full_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, full_name: e.target.value }))
                }
                className="mt-2 rounded-2xl"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                className="mt-2 rounded-2xl"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, role: v as LopUserRole }))
                }
              >
                <SelectTrigger className="mt-2 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Facility Access</Label>
              <p className="mb-2 text-xs text-slate-400">
                Select which facilities this user can access
              </p>
              <div className="space-y-2 rounded-2xl bg-slate-50 p-3">
                {facilities.map((f) => {
                  const checked = form.facility_ids.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleFacility(f.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all",
                        checked
                          ? "bg-white font-semibold text-[#0B3B91] shadow-sm ring-1 ring-slate-200"
                          : "text-slate-600 hover:bg-white/60",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-md border text-xs",
                          checked
                            ? "border-[#0B3B91] bg-[#0B3B91] text-white"
                            : "border-slate-300 bg-white",
                        )}
                      >
                        {checked && "✓"}
                      </div>
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {f.name}
                    </button>
                  );
                })}
                {facilities.length === 0 && (
                  <p className="py-2 text-center text-xs text-slate-400">
                    No facilities available
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) =>
                  setForm((p) => ({ ...p, is_active: v }))
                }
              />
              <Label>Active account</Label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-2xl bg-gradient-to-r from-[#0B3B91] to-[#2563EB] text-white hover:from-[#09337c] hover:to-[#1f57d6]"
                onClick={handleSave}
                disabled={saving}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingUser ? "Update" : "Create"} User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ================================================================== */
/*  FACILITIES TAB                                                     */
/* ================================================================== */

function FacilitiesTab() {
  const { lopUser } = useLopAuth();
  const [facilities, setFacilities] = useState<LopFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<LopFacility | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    type: "ER",
    address: "",
    phone: "",
    director_email: "",
    front_desk_email: "",
    is_active: true,
  });

  const loadFacilities = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await lopDb.select("lop_facilities", {
        order: { column: "name" },
      });
      setFacilities((data as LopFacility[]) ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  const openDialog = (facility?: LopFacility) => {
    if (facility) {
      setEditingFacility(facility);
      setForm({
        name: facility.name,
        slug: facility.slug,
        type: facility.type ?? "ER",
        address: facility.address ?? "",
        phone: facility.phone ?? "",
        director_email: facility.director_email ?? "",
        front_desk_email: facility.front_desk_email ?? "",
        is_active: facility.is_active,
      });
    } else {
      setEditingFacility(null);
      setForm({
        name: "",
        slug: "",
        type: "ER",
        address: "",
        phone: "",
        director_email: "",
        front_desk_email: "",
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Facility name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug:
          form.slug.trim() ||
          form.name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        type: form.type || "ER",
        address: form.address || null,
        phone: form.phone || null,
        director_email: form.director_email || null,
        front_desk_email: form.front_desk_email || null,
        is_active: form.is_active,
      };

      if (editingFacility) {
        await lopDb.update("lop_facilities", payload, {
          id: editingFacility.id,
        });

        await lopDb.insert("lop_audit_log", {
          user_id: lopUser?.id,
          action: "facility_updated",
          entity_type: "facility",
          entity_id: editingFacility.id,
          old_values: {
            name: editingFacility.name,
            is_active: editingFacility.is_active,
          },
          new_values: {
            name: payload.name,
            is_active: payload.is_active,
          },
        });

        toast.success("Facility updated.");
      } else {
        const { data } = await lopDb.insert("lop_facilities", payload, {
          select: "id",
          single: true,
        });

        await lopDb.insert("lop_audit_log", {
          user_id: lopUser?.id,
          action: "facility_created",
          entity_type: "facility",
          entity_id: (data as { id?: string } | null)?.id,
          new_values: { name: payload.name },
        });

        toast.success("Facility created.");
      }

      setDialogOpen(false);
      await loadFacilities();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save facility.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* ── Metrics ── */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-[26px] border border-white/80 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Total Facilities
          </p>
          <p className="mt-3 font-heading text-3xl font-black text-[#0B3B91]">
            {facilities.length}
          </p>
        </div>
        <div className="rounded-[26px] border border-white/80 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Active
          </p>
          <p className="mt-3 font-heading text-3xl font-black text-emerald-600">
            {facilities.filter((f) => f.is_active).length}
          </p>
        </div>
      </div>

      {/* ── Add button ── */}
      <div className="mb-6 flex justify-end">
        <Button
          type="button"
          onClick={() => openDialog()}
          className="h-11 rounded-full bg-gradient-to-r from-[#D72638] to-[#ff4d5e] px-5 text-white shadow-[0_16px_35px_rgba(215,38,56,0.2)] hover:scale-[1.01] hover:from-[#c91f31] hover:to-[#ff4355]"
        >
          <Plus className="h-4 w-4" />
          Add Facility
        </Button>
      </div>

      {/* ── Facility List ── */}
      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-[30px] border border-white/80 bg-white shadow-sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0B3B91]" />
          <span className="text-sm text-slate-500">Loading facilities…</span>
        </div>
      ) : facilities.length === 0 ? (
        <div className="rounded-[30px] border border-white/80 bg-white px-6 py-16 text-center shadow-sm">
          <Building2 className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-4 font-heading text-2xl font-bold text-slate-900">
            No facilities yet
          </h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {facilities.map((facility) => (
            <div
              key={facility.id}
              className={cn(
                "overflow-hidden rounded-[28px] shadow-[0_20px_45px_rgba(9,20,40,0.05)] transition-all duration-300 hover:-translate-y-0.5",
                facility.is_active
                  ? "border border-white/70 bg-white/85 backdrop-blur-xl"
                  : "border border-slate-200 bg-slate-100/85",
              )}
            >
              <div
                className={cn(
                  "h-1.5",
                  facility.is_active
                    ? "bg-gradient-to-r from-[#0B3B91] to-[#2563EB]"
                    : "bg-slate-300",
                )}
              />
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-[18px]",
                        facility.is_active
                          ? "bg-slate-100 text-[#0B3B91]"
                          : "bg-slate-200 text-slate-400",
                      )}
                    >
                      <Building2 className="h-7 w-7" />
                    </div>
                    <div>
                      <h3
                        className={cn(
                          "font-heading text-xl font-bold",
                          facility.is_active
                            ? "text-slate-900"
                            : "text-slate-500",
                        )}
                      >
                        {facility.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            facility.is_active
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-400",
                          )}
                        >
                          {facility.is_active ? "Active" : "Inactive"}
                        </span>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                          {facility.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-2xl text-slate-500 hover:bg-white"
                    onClick={() => openDialog(facility)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                  {facility.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-sm text-slate-600">
                        {facility.address}
                      </span>
                    </div>
                  )}
                  {facility.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-sm text-slate-600">
                        {facility.phone}
                      </span>
                    </div>
                  )}
                  {facility.director_email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-sm text-slate-600">
                        Director: {facility.director_email}
                      </span>
                    </div>
                  )}
                  {facility.front_desk_email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-sm text-slate-600">
                        Front Desk: {facility.front_desk_email}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Facility Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl rounded-[28px] border-white/80 bg-white/95 p-0">
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle className="font-heading text-2xl font-bold text-[#0B3B91]">
              {editingFacility ? "Edit Facility" : "Add Facility"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 px-6 py-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="mt-2 rounded-2xl"
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, slug: e.target.value }))
                  }
                  placeholder="auto-generated"
                  className="mt-2 rounded-2xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}
                >
                  <SelectTrigger className="mt-2 rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ER">ER</SelectItem>
                    <SelectItem value="Wellness">Wellness Clinic</SelectItem>
                    <SelectItem value="Urgent Care">Urgent Care</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="mt-2 rounded-2xl"
                />
              </div>
            </div>

            <div>
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                className="mt-2 rounded-2xl"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Director Email</Label>
                <Input
                  type="email"
                  value={form.director_email}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      director_email: e.target.value,
                    }))
                  }
                  className="mt-2 rounded-2xl"
                />
              </div>
              <div>
                <Label>Front Desk Email</Label>
                <Input
                  type="email"
                  value={form.front_desk_email}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      front_desk_email: e.target.value,
                    }))
                  }
                  className="mt-2 rounded-2xl"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) =>
                  setForm((p) => ({ ...p, is_active: v }))
                }
              />
              <Label>Active facility</Label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-2xl bg-gradient-to-r from-[#0B3B91] to-[#2563EB] text-white hover:from-[#09337c] hover:to-[#1f57d6]"
                onClick={handleSave}
                disabled={saving}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingFacility ? "Update" : "Create"} Facility
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ================================================================== */
/*  AUDIT LOG TAB                                                      */
/* ================================================================== */

function AuditTab() {
  const [logs, setLogs] = useState<LopAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await lopDb.select("lop_audit_log", {
          order: { column: "created_at", ascending: false },
          limit: 100,
        });
        setLogs((data as LopAuditLog[]) ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-slate-900">
          Recent Audit Entries
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Last 100 actions across the LOP system
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-[30px] border border-white/80 bg-white shadow-sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0B3B91]" />
          <span className="text-sm text-slate-500">Loading audit log…</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-[30px] border border-white/80 bg-white px-6 py-16 text-center shadow-sm">
          <Clock className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-4 font-heading text-2xl font-bold text-slate-900">
            No audit entries yet
          </h2>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/85 shadow-[0_20px_45px_rgba(15,23,42,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Timestamp
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Action
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Entity
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    User
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-50 transition-colors hover:bg-slate-50/50"
                  >
                    <td className="whitespace-nowrap px-5 py-3 text-xs text-slate-500">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600">
                      {log.entity_type}
                      {log.entity_id && (
                        <span className="ml-1 text-slate-400">
                          #{log.entity_id.slice(0, 8)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {log.user_id?.slice(0, 8) ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-400">
                      {log.ip_address ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
