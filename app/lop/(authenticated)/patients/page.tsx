"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { lopClient } from "@/lib/lop/client";
import { hasPermission } from "@/lib/lop/permissions";
import {
  CASE_STATUS_LABELS,
  CASE_STATUS_COLORS,
  DOC_STATUS_LABELS,
} from "@/lib/lop/types";
import type { LopCaseStatus, LopDocumentStatus } from "@/lib/lop/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Download } from "lucide-react";

export default function PatientsListPage() {
  const { lopUser, activeFacilityId, facilities } = useLopAuth();
  const [patients, setPatients] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [facilityFilter, setFacilityFilter] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = lopClient
        .from("lop_patients")
        .select("*, lop_facilities(name, slug), lop_law_firms(name)")
        .order("created_at", { ascending: false });

      if (activeFacilityId) {
        query = query.eq("facility_id", activeFacilityId);
      }

      const { data } = await query;
      setPatients((data as Record<string, unknown>[]) ?? []);
      setLoading(false);
    };
    load();
  }, [activeFacilityId]);

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      // Text search
      if (search) {
        const term = search.toLowerCase();
        const name = `${p.first_name} ${p.last_name}`.toLowerCase();
        const firm = ((p.lop_law_firms as Record<string, unknown>)?.name as string ?? "").toLowerCase();
        if (!name.includes(term) && !firm.includes(term)) return false;
      }
      // Status filter
      if (statusFilter !== "all" && p.case_status !== statusFilter) return false;
      // Facility filter
      if (facilityFilter !== "all" && p.facility_id !== facilityFilter) return false;
      return true;
    });
  }, [patients, search, statusFilter, facilityFilter]);

  const canCreate = hasPermission(lopUser, "patient:create");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500">{filtered.length} records</p>
        </div>
        {canCreate && (
          <Link href="/lop/patients/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Patient
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by patient name or law firm…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(CASE_STATUS_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!activeFacilityId && facilities.length > 1 && (
              <Select value={facilityFilter} onValueChange={setFacilityFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Facilities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Facilities</SelectItem>
                  {facilities.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-slate-400 animate-pulse">
              Loading patients…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              {patients.length === 0
                ? "No patients yet. Create the first LOP record."
                : "No patients match your filters."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left bg-slate-50">
                    <th className="px-4 py-3 font-medium text-slate-500">Patient</th>
                    <th className="px-4 py-3 font-medium text-slate-500">Facility</th>
                    <th className="px-4 py-3 font-medium text-slate-500">Law Firm</th>
                    <th className="px-4 py-3 font-medium text-slate-500">Accident Date</th>
                    <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                    <th className="px-4 py-3 font-medium text-slate-500">LOP Letter</th>
                    <th className="px-4 py-3 font-medium text-slate-500">Billed</th>
                    <th className="px-4 py-3 font-medium text-slate-500">Collected</th>
                    <th className="px-4 py-3 font-medium text-slate-500">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((p) => {
                    const status = p.case_status as LopCaseStatus;
                    const lopStatus = p.lop_letter_status as LopDocumentStatus;
                    return (
                      <tr key={p.id as string} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <Link
                            href={`/lop/patients/${p.id}`}
                            className="font-medium text-slate-900 hover:text-blue-600"
                          >
                            {p.first_name as string} {p.last_name as string}
                          </Link>
                          {p.phone && (
                            <p className="text-xs text-slate-400">{p.phone as string}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {(p.lop_facilities as Record<string, unknown>)?.name as string ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {(p.lop_law_firms as Record<string, unknown>)?.name as string ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {p.date_of_accident
                            ? new Date(p.date_of_accident as string).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              CASE_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {CASE_STATUS_LABELS[status] ?? status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          {DOC_STATUS_LABELS[lopStatus] ?? lopStatus}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {p.bill_charges
                            ? `$${Number(p.bill_charges).toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {p.amount_collected
                            ? `$${Number(p.amount_collected).toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {new Date(p.created_at as string).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
