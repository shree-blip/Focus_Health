"use client";

import { useEffect, useState } from "react";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { lopDb } from "@/lib/lop/db";
import { ROLE_LABELS } from "@/lib/lop/types";
import type { LopUser, LopUserRole, LopFacility } from "@/lib/lop/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Users,
  Building2,
  Settings2,
  Edit,
  Loader2,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

export default function LopSettingsPage() {
  const { lopUser } = useLopAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">
          Manage users, facilities, and system configuration
        </p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="facilities" className="gap-2">
            <Building2 className="h-4 w-4" />
            Facilities
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Shield className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <UsersTab />
        </TabsContent>
        <TabsContent value="facilities" className="mt-4">
          <FacilitiesTab />
        </TabsContent>
        <TabsContent value="config" className="mt-4">
          <ConfigTab />
        </TabsContent>
        <TabsContent value="audit" className="mt-4">
          <AuditTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ————— Users Tab —————
function UsersTab() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  const [allFacilities, setAllFacilities] = useState<LopFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const [form, setForm] = useState({
    email: "",
    full_name: "",
    role: "front_desk" as LopUserRole,
    is_active: true,
    facility_ids: [] as string[],
  });

  const loadUsers = async () => {
    const [usersRes, facsRes] = await Promise.all([
      lopDb.select("lop_users", {
        select: "*, lop_user_facilities(facility_id, lop_facilities(name))",
        order: { column: "full_name" },
      }),
      lopDb.select("lop_facilities", { order: { column: "name" } }),
    ]);
    setUsers(usersRes.data ?? []);
    setAllFacilities(((facsRes.data ?? []) as unknown) as LopFacility[]);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openDialog = (user?: any) => {
    if (user) {
      setEditingUser(user);
      const userFacs = user.lop_user_facilities ?? [];
      setForm({
        email: user.email as string,
        full_name: user.full_name as string,
        role: user.role as LopUserRole,
        is_active: user.is_active as boolean,
        facility_ids: userFacs.map((uf) => uf.facility_id as string),
      });
    } else {
      setEditingUser(null);
      setForm({
        email: "",
        full_name: "",
        role: "front_desk",
        is_active: true,
        facility_ids: [],
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.email || !form.full_name) {
      toast.error("Email and name required.");
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        // Update user
        await lopDb.update(
          "lop_users",
          {
            full_name: form.full_name,
            role: form.role,
            is_active: form.is_active,
          },
          { id: editingUser.id },
        );

        // Update facility assignments
        await lopDb.remove("lop_user_facilities", { user_id: editingUser.id });

        if (form.facility_ids.length > 0) {
          await lopDb.insert(
            "lop_user_facilities",
            form.facility_ids.map((fid) => ({
              user_id: editingUser.id as string,
              facility_id: fid,
            })),
          );
        }

        toast.success("User updated.");
      } else {
        // For new users, we create a placeholder profile
        // The auth_user_id will be linked when they first sign in via Google
        const { data } = await lopDb.insert(
          "lop_users",
          {
            auth_user_id: crypto.randomUUID(), // placeholder
            email: form.email.trim().toLowerCase(),
            full_name: form.full_name.trim(),
            role: form.role,
            is_active: form.is_active,
          },
          { select: "id", single: true },
        );

        if (!data) throw new Error("Insert failed");

        if (form.facility_ids.length > 0) {
          await lopDb.insert(
            "lop_user_facilities",
            form.facility_ids.map((fid) => ({
              user_id: (data as Record<string, unknown>).id as string,
              facility_id: fid,
            })),
          );
        }

        toast.success("User added. They'll be linked on first Google sign-in.");
      }

      setDialogOpen(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{users.length} users</p>
        <Button onClick={() => openDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 animate-pulse">
          Loading users…
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left">
                  <th className="px-4 py-3 font-medium text-slate-500">Name</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Email</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Role</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Facilities</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => {
                  const userFacs = u.lop_user_facilities ?? [];
                  return (
                    <tr key={u.id as string} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {u.full_name as string}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{u.email as string}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {ROLE_LABELS[u.role as LopUserRole] ?? u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {userFacs.length > 0
                          ? userFacs
                              .map(
                                (uf) =>
                                  uf.lop_facilities?.name ?? ""
                              )
                              .join(", ")
                          : "None"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            u.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(u)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                disabled={!!editingUser}
              />
            </div>
            <div>
              <Label>Full Name *</Label>
              <Input
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, role: v as LopUserRole }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Assigned Facilities</Label>
              <div className="space-y-2">
                {allFacilities.map((fac) => (
                  <label key={fac.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={form.facility_ids.includes(fac.id)}
                      onCheckedChange={(checked) => {
                        setForm((f) => ({
                          ...f,
                          facility_ids: checked
                            ? [...f.facility_ids, fac.id]
                            : f.facility_ids.filter((id) => id !== fac.id),
                        }));
                      }}
                    />
                    <span className="text-sm">{fac.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, is_active: checked }))
                }
              />
              <Label>Active</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingUser ? "Update" : "Add"} User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ————— Facilities Tab —————
function FacilitiesTab() {
  const [facilities, setFacilities] = useState<LopFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    type: "er" as string,
    address: "",
    is_active: true,
  });

  const loadFacilities = async () => {
    const { data } = await lopDb.select("lop_facilities", {
      order: { column: "name" },
    });
    setFacilities(((data ?? []) as unknown) as LopFacility[]);
    setLoading(false);
  };

  useEffect(() => {
    loadFacilities();
  }, []);

  const handleAddFacility = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Name and slug are required.");
      return;
    }
    setSaving(true);
    try {
      await lopDb.insert("lop_facilities", {
        name: form.name.trim(),
        slug: form.slug.trim(),
        type: form.type,
        address: form.address || null,
        is_active: form.is_active,
      });
      toast.success("Facility added.");
      setDialogOpen(false);
      setForm({ name: "", slug: "", type: "er", address: "", is_active: true });
      loadFacilities();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add facility.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{facilities.length} facilities</p>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Facility
        </Button>
      </div>
      {loading ? (
        <div className="py-12 text-center text-slate-400 animate-pulse">
          Loading…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {facilities.map((f) => (
            <Card key={f.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  {f.name}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      f.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {f.is_active ? "Active" : "Inactive"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 space-y-1">
                <p>Type: {f.type}</p>
                <p>Slug: {f.slug}</p>
                {f.address && <p>{f.address}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Facility Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Facility</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Facility Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                  }))
                }
                placeholder="e.g. er-of-dallas"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="er">ER</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, is_active: checked }))
                }
              />
              <Label>Active</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddFacility} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Add Facility
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ————— Config Tab —————
function ConfigTab() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const loadConfigs = async () => {
    const { data } = await lopDb.select("lop_config", {
      order: { column: "key" },
    });
    setConfigs(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const handleSave = async (key: string) => {
    try {
      let parsedValue: unknown;
      try {
        parsedValue = JSON.parse(editValue);
      } catch {
        parsedValue = editValue;
      }

      await lopDb.update("lop_config", { value: parsedValue }, { key });

      toast.success(`Config "${key}" updated.`);
      setEditKey(null);
      loadConfigs();
    } catch (err) {
      toast.error("Failed to update config.");
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="py-12 text-center text-slate-400 animate-pulse">
          Loading…
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left">
                  <th className="px-4 py-3 font-medium text-slate-500">Key</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Value</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Description</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {configs.map((c) => (
                  <tr key={c.key as string} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">
                      {c.key as string}
                    </td>
                    <td className="px-4 py-3">
                      {editKey === c.key ? (
                        <div className="flex gap-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8 text-xs"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSave(c.key as string)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditKey(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                          {JSON.stringify(c.value)}
                        </code>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {c.description as string}
                    </td>
                    <td className="px-4 py-3">
                      {editKey !== c.key && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditKey(c.key as string);
                            setEditValue(JSON.stringify(c.value));
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ————— Audit Log Tab —————
function AuditTab() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await lopDb.select("lop_audit_log", {
        select: "*, lop_users(full_name)",
        order: { column: "created_at", ascending: false },
        limit: 100,
      });
      setLogs(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="py-12 text-center text-slate-400 animate-pulse">
          Loading…
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            No audit records yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left">
                  <th className="px-4 py-3 font-medium text-slate-500">Time</th>
                  <th className="px-4 py-3 font-medium text-slate-500">User</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Action</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Entity</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Changes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((l) => (
                  <tr key={l.id as string} className="hover:bg-slate-50 align-top">
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(l.created_at as string).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {l.lop_users?.full_name ?? "System"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                        {l.action as string}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {l.entity_type as string}
                      {l.entity_id ? ` \u00B7 ${(l.entity_id as string).slice(0, 8)}\u2026` : ""}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-xs">
                      {l.old_values && (
                        <div>
                          <span className="text-red-500 font-medium">Old: </span>
                          <code className="bg-red-50 px-1 rounded">
                            {JSON.stringify(l.old_values)}
                          </code>
                        </div>
                      )}
                      {l.new_values && (
                        <div className="mt-0.5">
                          <span className="text-green-600 font-medium">New: </span>
                          <code className="bg-green-50 px-1 rounded">
                            {JSON.stringify(l.new_values)}
                          </code>
                        </div>
                      )}
                      {!l.old_values && !l.new_values && (
                        <span className="text-slate-300">&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
