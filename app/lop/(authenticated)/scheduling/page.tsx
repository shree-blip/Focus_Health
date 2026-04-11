"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { lopDb } from "@/lib/lop/db";
import { CASE_STATUS_LABELS, CASE_STATUS_COLORS } from "@/lib/lop/types";
import type { LopCaseStatus } from "@/lib/lop/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission } from "@/lib/lop/permissions";
import {
  Calendar,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Users,
  UserCheck,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function getWeekRange(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay(); // 0=Sun
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((day + 6) % 7)); // Monday
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(mon);
    dd.setDate(mon.getDate() + i);
    days.push(dd.toISOString().split("T")[0]);
  }
  return { start: days[0], end: days[6], days };
}

const SHORT_DAY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function SchedulingPage() {
  const { lopUser, activeFacilityId, facilities } = useLopAuth();
  const [patients, setPatients] = useState<Record<string, unknown>[]>([]);
  const [weekPatients, setWeekPatients] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekLoading, setWeekLoading] = useState(true);
  const [markingArrived, setMarkingArrived] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const week = useMemo(() => getWeekRange(selectedDate), [selectedDate]);

  /* ---- Load day data ---- */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const dayStart = `${selectedDate}T00:00:00`;
      const dayEnd = `${selectedDate}T23:59:59`;

      const filters: { column: string; op: "eq" | "gte" | "lte"; value: unknown }[] = [
        { column: "expected_arrival", op: "gte", value: dayStart },
        { column: "expected_arrival", op: "lte", value: dayEnd },
      ];
      if (activeFacilityId) {
        filters.push({ column: "facility_id", op: "eq", value: activeFacilityId });
      }
      try {
        const { data } = await lopDb.select("lop_patients", {
          select: "*, lop_facilities(name), lop_law_firms(name)",
          filters,
          order: { column: "expected_arrival", ascending: true },
        });
        setPatients((data as Record<string, unknown>[]) ?? []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [selectedDate, activeFacilityId]);

  /* ---- Load week data ---- */
  useEffect(() => {
    const load = async () => {
      setWeekLoading(true);
      const filters: { column: string; op: "eq" | "gte" | "lte"; value: unknown }[] = [
        { column: "expected_arrival", op: "gte", value: `${week.start}T00:00:00` },
        { column: "expected_arrival", op: "lte", value: `${week.end}T23:59:59` },
      ];
      if (activeFacilityId) {
        filters.push({ column: "facility_id", op: "eq", value: activeFacilityId });
      }
      try {
        const { data } = await lopDb.select("lop_patients", {
          select: "id, expected_arrival, case_status",
          filters,
        });
        setWeekPatients((data as Record<string, unknown>[]) ?? []);
      } catch (err) {
        console.error(err);
      }
      setWeekLoading(false);
    };
    load();
  }, [week.start, week.end, activeFacilityId]);

  /* ---- Week stats ---- */
  const weekStats = useMemo(() => {
    const dayMap: Record<string, { scheduled: number; arrived: number; total: number }> = {};
    for (const d of week.days) {
      dayMap[d] = { scheduled: 0, arrived: 0, total: 0 };
    }
    let weekTotal = 0;
    let weekArrived = 0;
    for (const p of weekPatients) {
      if (!p.expected_arrival) continue;
      const dateKey = (p.expected_arrival as string).split("T")[0];
      if (!dayMap[dateKey]) continue;
      dayMap[dateKey].total++;
      weekTotal++;
      if (p.case_status === "arrived" || p.case_status === "intake_complete" || p.case_status === "in_progress" || p.case_status === "paid" || p.case_status === "partial_paid") {
        dayMap[dateKey].arrived++;
        weekArrived++;
      } else {
        dayMap[dateKey].scheduled++;
      }
    }
    return { dayMap, weekTotal, weekArrived };
  }, [weekPatients, week.days]);

  const changeDate = (days: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const changeWeek = useCallback((dir: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + dir * 7);
    setSelectedDate(d.toISOString().split("T")[0]);
  }, [selectedDate]);

  const today = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === today;

  // Group by 30-minute time slots
  const timeSlots = useMemo(() => {
    const slots: Record<string, Record<string, unknown>[]> = {};
    for (const p of patients) {
      if (!p.expected_arrival) continue;
      const arrival = new Date(p.expected_arrival as string);
      const hour = arrival.getHours();
      const halfHour = arrival.getMinutes() < 30 ? "00" : "30";
      const slotKey = `${hour.toString().padStart(2, "0")}:${halfHour}`;
      if (!slots[slotKey]) slots[slotKey] = [];
      slots[slotKey].push(p);
    }
    return Object.entries(slots).sort(([a], [b]) => a.localeCompare(b));
  }, [patients]);

  const arrivedCount = patients.filter(
    (p) => p.case_status === "arrived" || p.case_status === "intake_complete" || p.case_status === "in_progress" || p.case_status === "paid" || p.case_status === "partial_paid"
  ).length;
  const scheduledCount = patients.length - arrivedCount;

  const canEdit = hasPermission(lopUser, "patient:update");

  const handleMarkArrived = async (
    e: React.MouseEvent,
    patientId: string,
    facilityId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setMarkingArrived(patientId);
    try {
      await lopDb.update(
        "lop_patients",
        { case_status: "arrived" },
        { id: patientId },
      );
      await lopDb.insert("lop_audit_log", {
        user_id: lopUser?.id,
        action: "status_changed",
        entity_type: "patient",
        entity_id: patientId,
        facility_id: facilityId,
        old_values: { case_status: "scheduled" },
        new_values: { case_status: "arrived" },
      });
      setPatients((prev) =>
        prev.map((p) =>
          p.id === patientId ? { ...p, case_status: "arrived" } : p
        )
      );
      // Update week patients too
      setWeekPatients((prev) =>
        prev.map((p) =>
          p.id === patientId ? { ...p, case_status: "arrived" } : p
        )
      );
      toast.success("Patient marked as arrived.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    } finally {
      setMarkingArrived(null);
    }
  };

  const maxDayCount = Math.max(1, ...Object.values(weekStats.dayMap).map((d) => d.total));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Scheduling</h1>
          <p className="text-sm text-slate-500">
            Expected LOP arrivals{" "}
            {activeFacilityId
              ? `at ${facilities.find((f) => f.id === activeFacilityId)?.name}`
              : "across all facilities"}
          </p>
        </div>
        <Link href="/lop/patients/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Schedule Patient
          </Button>
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          Scheduling is for internal planning only. Emergency patients may change timing
          and treatment order. If a high-priority patient arrives (e.g., chest pain),
          scheduled LOP patients may be checked in later.
        </p>
      </div>

      {/* ==================== Weekly Overview ==================== */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base text-blue-900">
                Weekly Overview
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-blue-600 hover:bg-blue-100"
                onClick={() => changeWeek(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium text-blue-700 min-w-[160px] text-center">
                {new Date(week.start + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {" – "}
                {new Date(week.end + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-blue-600 hover:bg-blue-100"
                onClick={() => changeWeek(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {weekLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
              <span className="text-sm text-slate-400">Loading week data…</span>
            </div>
          ) : (
            <>
              {/* Week KPIs */}
              <div className="flex items-center gap-6 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900 leading-tight">{weekStats.weekTotal}</p>
                    <p className="text-[11px] text-slate-500">Total Scheduled</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <UserCheck className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900 leading-tight">{weekStats.weekArrived}</p>
                    <p className="text-[11px] text-slate-500">Arrived / Seen</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900 leading-tight">
                      {weekStats.weekTotal > 0 ? Math.round((weekStats.weekArrived / weekStats.weekTotal) * 100) : 0}%
                    </p>
                    <p className="text-[11px] text-slate-500">Show-up Rate</p>
                  </div>
                </div>
              </div>

              {/* Day-by-day bar chart */}
              <div className="grid grid-cols-7 gap-1.5">
                {week.days.map((d, i) => {
                  const stats = weekStats.dayMap[d] ?? { total: 0, arrived: 0, scheduled: 0 };
                  const isSelected = d === selectedDate;
                  const isToday2 = d === today;
                  const barHeight = maxDayCount > 0 ? Math.max(4, (stats.total / maxDayCount) * 64) : 4;
                  const arrivedPct = stats.total > 0 ? (stats.arrived / stats.total) * 100 : 0;

                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDate(d)}
                      className={`flex flex-col items-center pt-2 pb-1.5 rounded-lg transition-all cursor-pointer
                        ${isSelected
                          ? "bg-blue-50 ring-2 ring-blue-400 shadow-sm"
                          : "hover:bg-slate-50"
                        }
                        ${isToday2 && !isSelected ? "bg-amber-50/50" : ""}
                      `}
                    >
                      <span className={`text-[10px] font-semibold uppercase tracking-wide mb-1
                        ${isSelected ? "text-blue-700" : isToday2 ? "text-amber-600" : "text-slate-400"}
                      `}>
                        {SHORT_DAY[i]}
                      </span>
                      <span className={`text-xs mb-2 font-medium
                        ${isSelected ? "text-blue-900" : "text-slate-600"}
                      `}>
                        {new Date(d + "T12:00:00").getDate()}
                      </span>

                      {/* Mini bar */}
                      <div className="relative w-5 flex flex-col-reverse" style={{ height: 68 }}>
                        {stats.total > 0 ? (
                          <div
                            className="w-full rounded-sm overflow-hidden transition-all duration-300"
                            style={{ height: barHeight }}
                          >
                            <div
                              className="bg-green-400 w-full transition-all duration-300"
                              style={{ height: `${arrivedPct}%` }}
                            />
                            <div
                              className="bg-blue-300 w-full transition-all duration-300"
                              style={{ height: `${100 - arrivedPct}%` }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-1 rounded-sm bg-slate-200" />
                        )}
                      </div>

                      <span className={`text-xs font-bold mt-1
                        ${stats.total === 0
                          ? "text-slate-300"
                          : isSelected
                          ? "text-blue-700"
                          : "text-slate-700"}
                      `}>
                        {stats.total}
                      </span>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {stats.arrived > 0 && (
                          <span className="text-[9px] text-green-600 font-medium">
                            {stats.arrived}✓
                          </span>
                        )}
                        {stats.scheduled > 0 && (
                          <span className="text-[9px] text-blue-500 font-medium">
                            {stats.scheduled}◦
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-green-400 inline-block" /> Arrived / Seen</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-blue-300 inline-block" /> Awaiting</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ==================== Date Navigation ==================== */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-slate-400" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
              {!isToday && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedDate(new Date().toISOString().split("T")[0])
                  }
                >
                  Today
                </Button>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => changeDate(1)}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="text-center mt-2">
            <p className="text-sm text-slate-500">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            {/* Day stats pills */}
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                <Users className="h-3 w-3" />
                {patients.length} total
              </span>
              {arrivedCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                  <UserCheck className="h-3 w-3" />
                  {arrivedCount} arrived
                </span>
              )}
              {scheduledCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                  <Clock className="h-3 w-3" />
                  {scheduledCount} awaiting
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ==================== Timeline ==================== */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading schedule…</p>
        </div>
      ) : patients.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No LOP patients scheduled for this date.</p>
            <Link href="/lop/patients/new">
              <Button variant="outline" className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Schedule a Patient
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {timeSlots.map(([time, slotPatients]) => {
            const slotEnd = (() => {
              const [h, m] = time.split(":").map(Number);
              const end = new Date(2000, 0, 1, h, m + 30);
              return `${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`;
            })();

            return (
              <Card key={time} className="overflow-hidden">
                <CardHeader className="py-3 bg-slate-50/80 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm font-semibold text-slate-900">
                        {time} – {slotEnd}
                      </CardTitle>
                    </div>
                    <span className="text-xs font-medium text-slate-500 bg-white border rounded-full px-2.5 py-0.5">
                      {slotPatients.length} patient{slotPatients.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {slotPatients.map((p) => {
                      const status = p.case_status as LopCaseStatus;
                      const isArrived = status !== "scheduled";

                      return (
                        <Link
                          key={p.id as string}
                          href={`/lop/patients/${p.id}`}
                          className={`
                            flex items-center justify-between px-4 py-3 transition-all group
                            ${isArrived
                              ? "bg-green-50/40 hover:bg-green-50"
                              : "bg-white hover:bg-blue-50/50"
                            }
                          `}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`
                              h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors
                              ${isArrived
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700 group-hover:bg-blue-200"
                              }
                            `}>
                              {(p.first_name as string)?.[0]}{(p.last_name as string)?.[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-slate-900 group-hover:text-slate-900 truncate">
                                {p.first_name as string} {p.last_name as string}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 group-hover:text-slate-600 flex-wrap">
                                <span>
                                  {new Date(p.expected_arrival as string).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                </span>
                                {p.arrival_window_min && (
                                  <>
                                    <span className="text-slate-300">·</span>
                                    <span>{p.arrival_window_min as number}min window</span>
                                  </>
                                )}
                                <span className="text-slate-300">·</span>
                                <span className="font-medium text-slate-600">
                                  {(p.lop_facilities as Record<string, unknown>)?.name as string ?? ""}
                                </span>
                                {(p.lop_law_firms as Record<string, unknown>)?.name && (
                                  <>
                                    <span className="text-slate-300">·</span>
                                    <span>{(p.lop_law_firms as Record<string, unknown>)?.name as string}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            {canEdit && status === "scheduled" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-green-700 border-green-300 bg-white hover:bg-green-50 hover:text-green-800 hover:border-green-400 shadow-sm"
                                disabled={markingArrived === (p.id as string)}
                                onClick={(e) =>
                                  handleMarkArrived(
                                    e,
                                    p.id as string,
                                    p.facility_id as string
                                  )
                                }
                              >
                                {markingArrived === (p.id as string) ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                                {markingArrived === (p.id as string)
                                  ? "Updating…"
                                  : "Mark Arrived"}
                              </Button>
                            )}
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                                CASE_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {CASE_STATUS_LABELS[status] ?? status}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
