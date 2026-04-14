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
  LopConfig,
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
  ArrowRight,
  Building2,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit3,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sliders,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Tab = "users" | "facilities" | "config" | "audit";

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

  const canManageConfig = hasPermission(lopUser, "config:manage");

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "users", label: "Users", icon: Users },
    { key: "facilities", label: "Facilities", icon: Building2 },
    ...(canManageConfig
      ? [{ key: "config" as Tab, label: "Configuration", icon: Sliders }]
      : []),
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

          <span className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <Clock className="h-3.5 w-3.5 text-[#0B3B91]" />
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>
        </div>
      </header>

      {/* ── Title + Tabs ── */}
      <section className="px-1 lg:px-0">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[#0B3B91] md:text-3xl">
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
        {tab === "config" && canManageConfig && <ConfigTab />}
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
      {/* ── Add button ── */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {facilities.length} facilit{facilities.length === 1 ? "y" : "ies"} configured
        </p>
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
/*  CONFIG TAB                                                         */
/* ================================================================== */

interface ConfigRow {
  key: string;
  value: unknown;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

const KNOWN_CONFIGS: { key: string; label: string; description: string; type: "json" | "text" | "number" | "boolean" }[] = [
  {
    key: "mandatory_intake_fields",
    label: "Mandatory Intake Fields",
    description: "JSON array of field names required during patient intake (e.g. [\"first_name\",\"last_name\",\"facility_id\",\"law_firm_id\"])",
    type: "json",
  },
  {
    key: "auto_remind_days",
    label: "Auto-Remind Interval (Days)",
    description: "Number of days between automatic LOP reminder emails",
    type: "number",
  },
  {
    key: "default_arrival_window",
    label: "Default Arrival Window (Minutes)",
    description: "Default scheduling window in minutes when creating a patient",
    type: "number",
  },
];

function ConfigTab() {
  const { lopUser } = useLopAuth();
  const [configs, setConfigs] = useState<ConfigRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [form, setForm] = useState({ key: "", value: "", description: "" });

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await lopDb.select("lop_config", {
        order: { column: "key" },
      });
      setConfigs((data as ConfigRow[]) ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const openDialog = (config?: ConfigRow) => {
    if (config) {
      setEditingKey(config.key);
      setForm({
        key: config.key,
        value: typeof config.value === "string" ? config.value : JSON.stringify(config.value, null, 2),
        description: config.description ?? "",
      });
    } else {
      setEditingKey(null);
      setForm({ key: "", value: "", description: "" });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.key.trim()) {
      toast.error("Config key is required.");
      return;
    }

    setSaving(form.key);
    try {
      // Try to parse value as JSON, fall back to string
      let parsedValue: unknown = form.value;
      try {
        parsedValue = JSON.parse(form.value);
      } catch {
        // Keep as string
      }

      const payload = {
        key: form.key.trim(),
        value: parsedValue,
        description: form.description.trim() || null,
        updated_by: lopUser?.id,
        updated_at: new Date().toISOString(),
      };

      await lopDb.upsert("lop_config", payload);

      await lopDb.insert("lop_audit_log", {
        user_id: lopUser?.id,
        action: editingKey ? "config_updated" : "config_created",
        entity_type: "config",
        entity_id: form.key.trim(),
        old_values: editingKey
          ? { value: configs.find((c) => c.key === editingKey)?.value }
          : null,
        new_values: { value: parsedValue },
      });

      toast.success(`Config "${form.key}" saved.`);
      setDialogOpen(false);
      await loadConfigs();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save config.");
    } finally {
      setSaving(null);
    }
  };

  // Merge known configs with saved configs for display
  const displayConfigs = useMemo(() => {
    const savedMap = new Map(configs.map((c) => [c.key, c]));
    const items: (ConfigRow & { knownLabel?: string; knownType?: string })[] = [];

    // Known configs first
    for (const known of KNOWN_CONFIGS) {
      const saved = savedMap.get(known.key);
      items.push({
        key: known.key,
        value: saved?.value ?? null,
        description: saved?.description ?? known.description,
        updated_at: saved?.updated_at ?? "",
        updated_by: saved?.updated_by ?? null,
        knownLabel: known.label,
        knownType: known.type,
      });
      savedMap.delete(known.key);
    }
    // Unknown (custom) configs
    for (const [, c] of savedMap) {
      items.push(c);
    }
    return items;
  }, [configs]);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">
            System Configuration
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Key-value settings that control system behavior
          </p>
        </div>
        <Button
          type="button"
          onClick={() => openDialog()}
          className="h-10 rounded-full bg-gradient-to-r from-[#D72638] to-[#ff4d5e] px-4 text-sm text-white shadow-[0_16px_35px_rgba(215,38,56,0.2)] hover:scale-[1.01] hover:from-[#c91f31] hover:to-[#ff4355]"
        >
          <Plus className="h-4 w-4" />
          Add Config
        </Button>
      </div>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-[30px] border border-white/80 bg-white shadow-sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0B3B91]" />
          <span className="text-sm text-slate-500">Loading config…</span>
        </div>
      ) : (
        <div className="space-y-4">
          {displayConfigs.map((cfg) => {
            const valueStr =
              cfg.value === null || cfg.value === undefined
                ? "—"
                : typeof cfg.value === "string"
                  ? cfg.value
                  : JSON.stringify(cfg.value, null, 2);
            const isSet = cfg.value !== null && cfg.value !== undefined;

            return (
              <div
                key={cfg.key}
                className={cn(
                  "overflow-hidden rounded-[24px] border shadow-sm transition-all hover:-translate-y-0.5",
                  isSet
                    ? "border-white/70 bg-white/85"
                    : "border-amber-200 bg-amber-50/50",
                )}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-base font-bold text-slate-900">
                          {(cfg as { knownLabel?: string }).knownLabel ?? cfg.key}
                        </h3>
                        {!isSet && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            NOT SET
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 font-mono text-xs text-slate-400">
                        {cfg.key}
                      </p>
                      {cfg.description && (
                        <p className="mt-2 text-xs text-slate-500">
                          {cfg.description}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100"
                      onClick={() =>
                        openDialog({
                          key: cfg.key,
                          value: cfg.value,
                          description: cfg.description,
                          updated_at: cfg.updated_at,
                          updated_by: cfg.updated_by,
                        })
                      }
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>

                  {isSet && (
                    <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3">
                      <pre className="whitespace-pre-wrap break-all font-mono text-xs text-slate-700">
                        {valueStr}
                      </pre>
                    </div>
                  )}

                  {cfg.updated_at && (
                    <p className="mt-2 text-[10px] text-slate-400">
                      Last updated: {formatDate(cfg.updated_at)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Config Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl rounded-[28px] border-white/80 bg-white/95 p-0">
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle className="font-heading text-2xl font-bold text-[#0B3B91]">
              {editingKey ? "Edit Configuration" : "Add Configuration"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 px-6 py-6">
            <div>
              <Label>Key *</Label>
              <Input
                value={form.key}
                onChange={(e) =>
                  setForm((p) => ({ ...p, key: e.target.value }))
                }
                disabled={!!editingKey}
                placeholder="e.g. mandatory_intake_fields"
                className="mt-2 rounded-2xl font-mono text-sm"
              />
            </div>
            <div>
              <Label>Value *</Label>
              <textarea
                value={form.value}
                onChange={(e) =>
                  setForm((p) => ({ ...p, value: e.target.value }))
                }
                rows={5}
                placeholder='e.g. ["first_name","last_name","facility_id"]'
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B3B91]/20"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                JSON arrays/objects are auto-parsed. Plain text stored as string.
              </p>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="What this config controls"
                className="mt-2 rounded-2xl"
              />
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
                disabled={!!saving}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-1 h-4 w-4" />
                Save Config
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

const ACTION_COLORS: Record<string, string> = {
  patient_created: "bg-emerald-50 text-emerald-700",
  patient_updated: "bg-blue-50 text-blue-700",
  status_changed: "bg-amber-50 text-amber-700",
  user_created: "bg-emerald-50 text-emerald-700",
  user_updated: "bg-blue-50 text-blue-700",
  facility_created: "bg-emerald-50 text-emerald-700",
  facility_updated: "bg-blue-50 text-blue-700",
  config_created: "bg-emerald-50 text-emerald-700",
  config_updated: "bg-indigo-50 text-indigo-700",
  document_uploaded: "bg-cyan-50 text-cyan-700",
  reminder_sent: "bg-violet-50 text-violet-700",
  ai_query: "bg-purple-50 text-purple-700",
};

const ACTION_LABELS: Record<string, string> = {
  patient_created: "Patient Created",
  patient_updated: "Patient Updated",
  status_changed: "Status Changed",
  user_created: "User Created",
  user_updated: "User Updated",
  facility_created: "Facility Created",
  facility_updated: "Facility Updated",
  config_created: "Config Created",
  config_updated: "Config Updated",
  document_uploaded: "Document Uploaded",
  reminder_sent: "Reminder Sent",
};

type AuditLogWithUser = LopAuditLog & {
  lop_users?: { full_name: string } | null;
};

function AuditTab() {
  const [logs, setLogs] = useState<AuditLogWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string>("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await lopDb.select("lop_audit_log", {
          select: "*, lop_users(full_name)",
          order: { column: "created_at", ascending: false },
          limit: 200,
        });
        setLogs((data as AuditLogWithUser[]) ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const actionTypes = useMemo(() => {
    const set = new Set(logs.map((l) => l.action.startsWith("phi_read:") ? "phi_read" : l.action));
    return Array.from(set).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    if (filterAction === "all") return logs;
    if (filterAction === "phi_read") return logs.filter((l) => l.action.startsWith("phi_read:"));
    return logs.filter((l) => l.action === filterAction);
  }, [logs, filterAction]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">
            Audit Log
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length} of {logs.length} entries &middot; Last 200 actions
          </p>
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="h-10 w-[200px] rounded-2xl border-slate-200 text-sm">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actionTypes.map((a) => (
              <SelectItem key={a} value={a}>
                {ACTION_LABELS[a] ?? a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-[30px] border border-white/80 bg-white shadow-sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0B3B91]" />
          <span className="text-sm text-slate-500">Loading audit log…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[30px] border border-white/80 bg-white px-6 py-16 text-center shadow-sm">
          <Clock className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-4 font-heading text-2xl font-bold text-slate-900">
            No audit entries
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {filterAction !== "all" ? "Try removing the filter." : "Actions will appear here once users start using the system."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((log) => {
            const isExpanded = expandedId === log.id;
            const hasChanges =
              (log.old_values && Object.keys(log.old_values).length > 0) ||
              (log.new_values && Object.keys(log.new_values).length > 0);
            const actionColor =
              ACTION_COLORS[log.action] ??
              (log.action.startsWith("phi_read:")
                ? "bg-slate-100 text-slate-600"
                : "bg-blue-50 text-blue-700");
            const actionLabel =
              ACTION_LABELS[log.action] ??
              (log.action.startsWith("phi_read:")
                ? `PHI Read: ${log.action.replace("phi_read:lop_", "")}`
                : log.action);
            const userName = log.lop_users?.full_name ?? null;

            return (
              <div
                key={log.id}
                className="overflow-hidden rounded-[20px] border border-white/70 bg-white/85 shadow-sm transition-all"
              >
                {/* ── Row Header ── */}
                <button
                  type="button"
                  onClick={() => hasChanges && toggleExpand(log.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-5 py-4 text-left transition-colors",
                    hasChanges ? "cursor-pointer hover:bg-slate-50/50" : "cursor-default",
                  )}
                >
                  {hasChanges ? (
                    isExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    )
                  ) : (
                    <div className="h-4 w-4 shrink-0" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
                          actionColor,
                        )}
                      >
                        {actionLabel}
                      </span>
                      <span className="text-xs text-slate-400">
                        {log.entity_type}
                        {log.entity_id && (
                          <span className="ml-1 font-mono text-slate-300">
                            #{log.entity_id.slice(0, 8)}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span>{formatDate(log.created_at)}</span>
                      {userName && (
                        <span className="font-semibold text-slate-500">
                          {userName}
                        </span>
                      )}
                      {!userName && log.user_id && (
                        <span className="font-mono">
                          {log.user_id.slice(0, 8)}
                        </span>
                      )}
                      {log.ip_address && (
                        <span className="font-mono">{log.ip_address}</span>
                      )}
                    </div>
                  </div>
                </button>

                {/* ── Expanded Change Details ── */}
                {isExpanded && hasChanges && (
                  <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Old Values */}
                      {log.old_values && Object.keys(log.old_values).length > 0 && (
                        <div>
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-rose-500">
                            Previous Values
                          </p>
                          <div className="space-y-1.5">
                            {Object.entries(log.old_values).map(([key, val]) => (
                              <div
                                key={key}
                                className="rounded-xl bg-rose-50 px-3 py-2"
                              >
                                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                                  {key.replace(/_/g, " ")}
                                </span>
                                <p className="mt-0.5 break-all font-mono text-xs text-rose-700">
                                  {typeof val === "object"
                                    ? JSON.stringify(val)
                                    : String(val ?? "null")}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* New Values */}
                      {log.new_values && Object.keys(log.new_values).length > 0 && (
                        <div>
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-600">
                            New Values
                          </p>
                          <div className="space-y-1.5">
                            {Object.entries(log.new_values).map(([key, val]) => (
                              <div
                                key={key}
                                className="rounded-xl bg-emerald-50 px-3 py-2"
                              >
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                                  {key.replace(/_/g, " ")}
                                </span>
                                <p className="mt-0.5 break-all font-mono text-xs text-emerald-700">
                                  {typeof val === "object"
                                    ? JSON.stringify(val)
                                    : String(val ?? "null")}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Side-by-side diff for matching keys */}
                    {log.old_values && log.new_values && (() => {
                      const changedKeys = Object.keys(log.new_values).filter(
                        (k) =>
                          k in (log.old_values as Record<string, unknown>) &&
                          JSON.stringify((log.old_values as Record<string, unknown>)[k]) !==
                            JSON.stringify((log.new_values as Record<string, unknown>)[k]),
                      );
                      if (changedKeys.length === 0) return null;
                      return (
                        <div className="mt-4 border-t border-slate-200 pt-4">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                            Field Changes
                          </p>
                          <div className="space-y-2">
                            {changedKeys.map((k) => (
                              <div
                                key={k}
                                className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs"
                              >
                                <span className="min-w-[100px] font-semibold text-slate-600">
                                  {k.replace(/_/g, " ")}
                                </span>
                                <span className="rounded bg-rose-50 px-2 py-0.5 font-mono text-rose-600 line-through">
                                  {String((log.old_values as Record<string, unknown>)[k] ?? "null")}
                                </span>
                                <ArrowRight className="h-3 w-3 shrink-0 text-slate-400" />
                                <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-emerald-700">
                                  {String((log.new_values as Record<string, unknown>)[k] ?? "null")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
