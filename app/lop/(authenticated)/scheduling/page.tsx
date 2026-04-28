"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lopDb } from "@/lib/lop/db";
import { useLopDbChange } from "@/hooks/lop/useLopDbChange";
import { hasPermission } from "@/lib/lop/permissions";
import {
  CASE_STATUS_LABELS,
  CASE_STATUS_COLORS,
} from "@/lib/lop/types";
import type { LopCaseStatus, LopPatient } from "@/lib/lop/types";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Info,
  Loader2,
  MapPin,
  PhoneCall,
  Plus,
  ShieldAlert,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

type SchedulePatient = Pick<
  LopPatient,
  | "id"
  | "facility_id"
  | "first_name"
  | "last_name"
  | "phone"
  | "expected_arrival"
  | "arrival_window_min"
  | "case_status"
  | "intake_notes"
> & {
  lop_facilities?: { name?: string | null } | null;
  lop_law_firms?: { name?: string | null } | null;
};

type WeekPatient = Pick<LopPatient, "id" | "expected_arrival" | "case_status">;

const ATTENDED_STATUSES: LopCaseStatus[] = [
  "arrived",
  "intake_complete",
  "in_progress",
  "paid",
  "partial_paid",
];

const ATTENDED_STATUS_SET = new Set<LopCaseStatus>(ATTENDED_STATUSES);
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MINI_CALENDAR_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const AVATAR_TONES = [
  "bg-[#0B3B91] text-white",
  "bg-indigo-100 text-indigo-700",
  "bg-cyan-100 text-cyan-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
];

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateTimeFilter(date: Date) {
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  const seconds = `${date.getSeconds()}`.padStart(2, "0");

  return `${formatDateInput(date)}T${hours}:${minutes}:${seconds}`;
}

function parseDateOnly(dateString: string) {
  return new Date(`${dateString}T12:00:00`);
}

function shiftDate(dateString: string, days: number) {
  const next = parseDateOnly(dateString);
  next.setDate(next.getDate() + days);
  return formatDateInput(next);
}

function shiftMonth(dateString: string, months: number) {
  const current = parseDateOnly(dateString);
  const day = current.getDate();
  current.setDate(1);
  current.setMonth(current.getMonth() + months);
  const maxDay = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
  current.setDate(Math.min(day, maxDay));
  return formatDateInput(current);
}

function getWeekRange(dateString: string) {
  const current = parseDateOnly(dateString);
  const day = current.getDay();
  const monday = new Date(current);
  monday.setDate(current.getDate() - ((day + 6) % 7));

  const days: string[] = [];
  for (let index = 0; index < 7; index += 1) {
    const next = new Date(monday);
    next.setDate(monday.getDate() + index);
    days.push(formatDateInput(next));
  }

  return {
    start: days[0],
    end: days[6],
    days,
  };
}

function formatWeekRange(start: string, end: string) {
  const startDate = parseDateOnly(start);
  const endDate = parseDateOnly(end);

  return `${startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} – ${endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

function formatLongDate(dateString: string) {
  return parseDateOnly(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatMediumDate(dateString: string) {
  return parseDateOnly(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMonthTitle(dateString: string) {
  return parseDateOnly(dateString).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateTimeString: string | null | undefined) {
  if (!dateTimeString) return "—";

  return new Date(dateTimeString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatSlotRange(slot: string) {
  const [hours, minutes] = slot.split(":").map(Number);
  const start = new Date(2026, 0, 1, hours, minutes);
  const end = new Date(2026, 0, 1, hours, minutes + 30);

  const formatter = (value: Date) =>
    value.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

  return `${formatter(start)} – ${formatter(end)}`;
}

function getPatientReference(patientId: string) {
  return `LOP-${patientId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "PT";
}

function getAvatarTone(patientId: string) {
  const seed = patientId
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return AVATAR_TONES[seed % AVATAR_TONES.length];
}

function buildMonthCalendar(dateString: string) {
  const current = parseDateOnly(dateString);
  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const weeks: Array<Array<number | null>> = [];
  let currentWeek: Array<number | null> = [];

  for (let index = 0; index < firstDay; index += 1) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return { month, year, weeks };
}

function getHalfHourSlot(dateTimeString: string) {
  const date = new Date(dateTimeString);
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = date.getMinutes() < 30 ? "00" : "30";
  return `${hours}:${minutes}`;
}

function isScheduledPastDue(patient: SchedulePatient, now: Date) {
  if (patient.case_status !== "scheduled" || !patient.expected_arrival) return false;
  return new Date(patient.expected_arrival).getTime() < now.getTime();
}

function getScheduleStatusClasses(status: LopCaseStatus) {
  switch (status) {
    case "scheduled":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-100";
    case "arrived":
    case "intake_complete":
    case "in_progress":
    case "paid":
    case "partial_paid":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
    case "no_show":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-100";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  }
}

export default function SchedulingPage() {
  const { lopUser, activeFacilityId, facilities } = useLopAuth();
  const [patients, setPatients] = useState<SchedulePatient[]>([]);
  const [weekPatients, setWeekPatients] = useState<WeekPatient[]>([]);
  const [overduePatients, setOverduePatients] = useState<SchedulePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekLoading, setWeekLoading] = useState(true);
  const [markingArrived, setMarkingArrived] = useState<string | null>(null);
  const [markingNoShow, setMarkingNoShow] = useState<string | null>(null);
  const [returningScheduled, setReturningScheduled] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => formatDateInput(new Date()));

  const now = new Date();
  const today = formatDateInput(now);
  const nowFilter = formatDateTimeFilter(now);
  const week = useMemo(() => getWeekRange(selectedDate), [selectedDate]);

  const loadDaySchedule = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!silent) setLoading(true);

      const filters: Array<{
        column: string;
        op: "eq" | "gte" | "lte";
        value: unknown;
      }> = [
        { column: "expected_arrival", op: "gte", value: `${selectedDate}T00:00:00` },
        { column: "expected_arrival", op: "lte", value: `${selectedDate}T23:59:59` },
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

        setPatients((data as SchedulePatient[]) ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [selectedDate, activeFacilityId],
  );

  const loadWeekSchedule = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!silent) setWeekLoading(true);

      const filters: Array<{
        column: string;
        op: "eq" | "gte" | "lte";
        value: unknown;
      }> = [
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

        setWeekPatients((data as WeekPatient[]) ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        if (!silent) setWeekLoading(false);
      }
    },
    [week.start, week.end, activeFacilityId],
  );

  const loadOverduePatients = useCallback(async () => {
    const filters: Array<{
      column: string;
      op: "eq" | "lt";
      value: unknown;
    }> = [
      { column: "case_status", op: "eq", value: "scheduled" },
      { column: "expected_arrival", op: "lt", value: nowFilter },
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

      setOverduePatients((data as SchedulePatient[]) ?? []);
    } catch (error) {
      console.error(error);
    }
  }, [activeFacilityId, nowFilter]);

  useEffect(() => {
    loadDaySchedule();
  }, [loadDaySchedule]);

  useEffect(() => {
    loadWeekSchedule();
  }, [loadWeekSchedule]);

  useEffect(() => {
    loadOverduePatients();
  }, [loadOverduePatients, patients]);

  useLopDbChange(["lop_patients", "lop_facilities", "lop_law_firms"], () => {
    loadDaySchedule({ silent: true });
    loadWeekSchedule({ silent: true });
    loadOverduePatients();
  });

  const weekStats = useMemo(() => {
    const dayMap: Record<
      string,
      { total: number; scheduled: number; arrived: number; noShow: number }
    > = {};

    for (const day of week.days) {
      dayMap[day] = { total: 0, scheduled: 0, arrived: 0, noShow: 0 };
    }

    let weekTotal = 0;
    let weekArrived = 0;
    let weekNoShow = 0;

    for (const patient of weekPatients) {
      if (!patient.expected_arrival) continue;

      const dateKey = patient.expected_arrival.split("T")[0];
      if (!dayMap[dateKey]) continue;

      dayMap[dateKey].total += 1;
      weekTotal += 1;

      if (patient.case_status === "no_show") {
        dayMap[dateKey].noShow += 1;
        weekNoShow += 1;
      } else if (ATTENDED_STATUS_SET.has(patient.case_status)) {
        dayMap[dateKey].arrived += 1;
        weekArrived += 1;
      } else {
        dayMap[dateKey].scheduled += 1;
      }
    }

    return { dayMap, weekTotal, weekArrived, weekNoShow };
  }, [week.days, weekPatients]);

  const groupedSlots = useMemo(() => {
    const grouped = new Map<string, SchedulePatient[]>();

    for (const patient of patients) {
      if (!patient.expected_arrival) continue;
      const slot = getHalfHourSlot(patient.expected_arrival);
      const existing = grouped.get(slot) ?? [];
      existing.push(patient);
      grouped.set(slot, existing);
    }

    return Array.from(grouped.entries()).sort(([left], [right]) =>
      left.localeCompare(right)
    );
  }, [patients]);

  const attendedCount = patients.filter((patient) =>
    ATTENDED_STATUS_SET.has(patient.case_status)
  ).length;
  const noShowCount = patients.filter((patient) => patient.case_status === "no_show").length;
  const awaitingCount = patients.filter((patient) => patient.case_status === "scheduled").length;
  const isToday = selectedDate === today;

  const facilityLoad = useMemo(() => {
    const counts = new Map<string, { id: string; name: string; count: number }>();

    for (const patient of patients) {
      const facilityId = patient.facility_id;
      const facilityName = patient.lop_facilities?.name ?? "Unassigned Facility";
      const existing = counts.get(facilityId) ?? {
        id: facilityId,
        name: facilityName,
        count: 0,
      };
      existing.count += 1;
      counts.set(facilityId, existing);
    }

    for (const facility of facilities) {
      if (!counts.has(facility.id)) {
        counts.set(facility.id, {
          id: facility.id,
          name: facility.name,
          count: 0,
        });
      }
    }

    return Array.from(counts.values()).sort((left, right) => right.count - left.count);
  }, [facilities, patients]);

  const displayedFacilityLoad = activeFacilityId
    ? facilityLoad.filter((facility) => facility.id === activeFacilityId)
    : facilityLoad.slice(0, 3);

  const miniCalendar = useMemo(() => buildMonthCalendar(selectedDate), [selectedDate]);
  const selectedDayNumber = parseDateOnly(selectedDate).getDate();
  const todayDate = new Date();
  const isCurrentMonth =
    miniCalendar.month === todayDate.getMonth() &&
    miniCalendar.year === todayDate.getFullYear();

  const scopeFacilityLabel = activeFacilityId
    ? facilities.find((facility) => facility.id === activeFacilityId)?.name ?? "Assigned Facility"
    : "All Facilities";

  const canSchedule =
    hasPermission(lopUser, "schedule:create") ||
    hasPermission(lopUser, "patient:create");
  const canUpdateSchedule =
    hasPermission(lopUser, "schedule:update") ||
    hasPermission(lopUser, "patient:update");
  const canUseAi = hasPermission(lopUser, "ai:use");

  const syncPatientStatus = (patientId: string, nextStatus: LopCaseStatus) => {
    setPatients((current) =>
      current.map((patient) =>
        patient.id === patientId ? { ...patient, case_status: nextStatus } : patient
      )
    );
    setWeekPatients((current) =>
      current.map((patient) =>
        patient.id === patientId ? { ...patient, case_status: nextStatus } : patient
      )
    );
  };

  const handleMarkArrived = async (
    event: React.MouseEvent,
    patient: SchedulePatient
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setMarkingArrived(patient.id);

    try {
      await lopDb.update(
        "lop_patients",
        { case_status: "arrived" },
        { id: patient.id }
      );

      await lopDb.insert("lop_audit_log", {
        user_id: lopUser?.id,
        action: "status_changed",
        entity_type: "patient",
        entity_id: patient.id,
        facility_id: patient.facility_id,
        old_values: { case_status: patient.case_status },
        new_values: { case_status: "arrived" },
      });

      syncPatientStatus(patient.id, "arrived");
      setOverduePatients((current) =>
        current.filter((entry) => entry.id !== patient.id)
      );
      toast.success("Patient marked as arrived.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update patient status.");
    } finally {
      setMarkingArrived(null);
    }
  };

  const handleMarkNoShow = async (
    event: React.MouseEvent,
    patient: SchedulePatient
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setMarkingNoShow(patient.id);

    try {
      await lopDb.update(
        "lop_patients",
        { case_status: "no_show" },
        { id: patient.id }
      );

      await lopDb.insert("lop_audit_log", {
        user_id: lopUser?.id,
        action: "status_changed",
        entity_type: "patient",
        entity_id: patient.id,
        facility_id: patient.facility_id,
        old_values: { case_status: patient.case_status },
        new_values: { case_status: "no_show" },
      });

      syncPatientStatus(patient.id, "no_show");
      setOverduePatients((current) =>
        current.filter((entry) => entry.id !== patient.id)
      );
      toast.success("Patient marked as no-show.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update patient status.");
    } finally {
      setMarkingNoShow(null);
    }
  };

  const handleReturnToScheduled = async (
    event: React.MouseEvent,
    patient: SchedulePatient
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setReturningScheduled(patient.id);

    try {
      await lopDb.update(
        "lop_patients",
        { case_status: "scheduled" },
        { id: patient.id }
      );

      await lopDb.insert("lop_audit_log", {
        user_id: lopUser?.id,
        action: "status_changed",
        entity_type: "patient",
        entity_id: patient.id,
        facility_id: patient.facility_id,
        old_values: { case_status: patient.case_status },
        new_values: { case_status: "scheduled" },
      });

      syncPatientStatus(patient.id, "scheduled");

      if (
        patient.expected_arrival &&
        new Date(patient.expected_arrival).getTime() < now.getTime()
      ) {
        setOverduePatients((current) => {
          const withoutPatient = current.filter((entry) => entry.id !== patient.id);
          return [
            ...withoutPatient,
            { ...patient, case_status: "scheduled" as LopCaseStatus },
          ].sort(
            (left, right) =>
              new Date(left.expected_arrival ?? "").getTime() -
              new Date(right.expected_arrival ?? "").getTime()
          );
        });
      }

      toast.success("Patient returned to scheduled.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update patient status.");
    } finally {
      setReturningScheduled(null);
    }
  };

  const openAiAssistant = () => {
    window.dispatchEvent(new CustomEvent("open-ai-chat"));
  };

  return (
    <div className="pb-8 lg:pb-12">
      <header className="mb-6 rounded-[30px] border border-white/70 bg-white/70 px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:sticky lg:top-0 lg:z-20 lg:mb-8 lg:px-8 lg:py-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-3">
            <div>
              <p className="font-heading text-lg font-semibold text-[#0B3B91]">
                Scheduling
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#0B3B91]/5 px-3 py-1.5 text-xs font-semibold text-[#0B3B91]">
                  <Building2 className="h-3.5 w-3.5" />
                  Facility Selection
                </span>
                <span className="text-sm text-slate-500">{scopeFacilityLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
              <Calendar className="h-3.5 w-3.5 text-[#0B3B91]" />
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <Users className="h-3 w-3" />
              {patients.length} today
            </span>
          </div>
        </div>
      </header>

      <section className="px-1 lg:px-0">
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[#0B3B91] md:text-3xl">
              Scheduling
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500 md:text-base">
              Expected LOP arrivals {activeFacilityId ? `for ${scopeFacilityLabel}` : "across all facilities"}.
            </p>
          </div>

          {canSchedule && (
            <Button
              asChild
              className="h-12 rounded-2xl bg-gradient-to-r from-[#D72638] to-[#ff4d5e] px-6 text-white shadow-[0_18px_38px_rgba(215,38,56,0.22)] transition-transform hover:scale-[1.02] hover:from-[#c91f31] hover:to-[#ff4355]"
            >
              <Link href="/lop/patients/new">
                <Plus className="h-4 w-4" />
                Schedule Patient
              </Link>
            </Button>
          )}
        </div>

        <div className="mb-8 rounded-[26px] border border-blue-100 bg-blue-50/70 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0B3B91] shadow-sm">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-[#0B3B91]">
                Scheduling is for internal planning only
              </h2>
              <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-600">
                Emergency patients may change timing and treatment order. This view is a
                live planning baseline for resource allocation, check-in readiness, and
                facility awareness. Higher-acuity arrivals always take precedence over
                pre-scheduled LOP visits.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          <div className="space-y-8 xl:col-span-8">
            <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.05)] md:p-8">
              <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-[#0B3B91]">
                    Weekly Overview
                  </h2>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
                    {formatWeekRange(week.start, week.end)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-2xl border border-slate-200 bg-slate-50 text-[#0B3B91] hover:bg-slate-100"
                    onClick={() => setSelectedDate(shiftDate(selectedDate, -7))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-100 px-5 py-3 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                        Total Scheduled
                      </p>
                      <p className="mt-2 font-heading text-2xl font-black text-[#0B3B91]">
                        {weekStats.weekTotal}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 px-5 py-3 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                        Arrived / Seen
                      </p>
                      <p className="mt-2 font-heading text-2xl font-black text-[#0B3B91]">
                        {weekStats.weekArrived}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-blue-50 px-5 py-3 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-500">
                        Show-Up Rate
                      </p>
                      <p className="mt-2 font-heading text-2xl font-black text-blue-700">
                        {weekStats.weekTotal > 0
                          ? Math.round((weekStats.weekArrived / weekStats.weekTotal) * 100)
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-2xl border border-slate-200 bg-slate-50 text-[#0B3B91] hover:bg-slate-100"
                    onClick={() => setSelectedDate(shiftDate(selectedDate, 7))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {weekLoading ? (
                <div className="flex min-h-[190px] items-center justify-center">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin text-[#0B3B91]" />
                    Loading weekly schedule...
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
                  {week.days.map((day, index) => {
                    const stats = weekStats.dayMap[day] ?? {
                      total: 0,
                      scheduled: 0,
                      arrived: 0,
                      noShow: 0,
                    };
                    const active = day === selectedDate;

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "group rounded-[24px] p-4 text-center transition-all",
                          active
                            ? "scale-[1.03] bg-gradient-to-br from-[#0B3B91] to-[#2563EB] text-white shadow-[0_18px_40px_rgba(37,99,235,0.2)]"
                            : "bg-slate-100 hover:bg-blue-50"
                        )}
                      >
                        <p
                          className={cn(
                            "text-xs font-bold uppercase tracking-[0.22em]",
                            active ? "text-white/80" : "text-slate-400 group-hover:text-[#0B3B91]"
                          )}
                        >
                          {WEEKDAY_LABELS[index]}
                        </p>
                        <p className="my-3 font-heading text-3xl font-black">
                          {parseDateOnly(day).getDate()}
                        </p>
                        <div
                          className={cn(
                            "mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold",
                            active
                              ? "bg-white text-[#0B3B91]"
                              : "bg-white text-[#0B3B91] group-hover:bg-[#0B3B91] group-hover:text-white"
                          )}
                        >
                          {stats.total}
                        </div>
                        <div
                          className={cn(
                            "mt-3 text-[11px] font-medium",
                            active ? "text-white/80" : "text-slate-500"
                          )}
                        >
                          {stats.arrived} arrived
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {overduePatients.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <ShieldAlert className="h-5 w-5 text-[#D72638]" />
                  <h2 className="font-heading text-2xl font-bold text-slate-900">
                    Overdue – Patients Not Yet Arrived ({overduePatients.length})
                  </h2>
                </div>

                <div className="space-y-4">
                  {overduePatients.map((patient) => {
                    const overdueHours = Math.max(
                      1,
                      Math.round(
                        (now.getTime() -
                          new Date(patient.expected_arrival ?? nowFilter).getTime()) /
                          (1000 * 60 * 60)
                      )
                    );

                    return (
                      <div
                        key={patient.id}
                        className="rounded-[28px] border-l-[10px] border-[#D72638] bg-rose-50/70 p-6"
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-rose-100 text-[#D72638]">
                              <AlertTriangle className="h-7 w-7" />
                            </div>
                            <div>
                              <h3 className="font-heading text-2xl font-bold text-slate-900">
                                {patient.first_name} {patient.last_name}
                              </h3>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-[#D72638]">
                                  {overdueHours} hour{overdueHours === 1 ? "" : "s"} overdue
                                </span>
                                <span>Scheduled for {formatTime(patient.expected_arrival)}</span>
                                <span className="text-slate-300">•</span>
                                <span>{formatMediumDate((patient.expected_arrival ?? nowFilter).split("T")[0])}</span>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                                <div className="inline-flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-slate-400" />
                                  {patient.lop_facilities?.name ?? "Unassigned Facility"}
                                </div>
                                <div className="inline-flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-slate-400" />
                                  {patient.lop_law_firms?.name ?? "No Law Firm"}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <Button
                              asChild
                              variant="outline"
                              className="rounded-2xl border-rose-200 bg-white text-slate-700 hover:bg-rose-50"
                            >
                              <Link href={`/lop/patients/${patient.id}`}>Details</Link>
                            </Button>
                            {patient.phone && (
                              <Button
                                type="button"
                                variant="outline"
                                className="rounded-2xl border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
                                onClick={() => window.open(`tel:${patient.phone}`, "_self")}
                              >
                                <PhoneCall className="h-4 w-4" />
                                Call
                              </Button>
                            )}
                            {canUpdateSchedule && (
                              <Button
                                type="button"
                                className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm hover:from-emerald-600 hover:to-emerald-700"
                                disabled={markingArrived === patient.id}
                                onClick={(event) => handleMarkArrived(event, patient)}
                              >
                                {markingArrived === patient.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <UserCheck className="h-4 w-4" />
                                )}
                                Mark Arrived
                              </Button>
                            )}
                            {canUpdateSchedule && (
                              <Button
                                type="button"
                                className="rounded-2xl bg-[#D72638] text-white hover:bg-[#c21f31]"
                                disabled={markingNoShow === patient.id}
                                onClick={(event) => handleMarkNoShow(event, patient)}
                              >
                                {markingNoShow === patient.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                Mark No-Show
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="space-y-6">
              <div className="flex flex-col gap-4 border-b-2 border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-[#0B3B91] px-4 py-2 text-center text-white">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">
                      {parseDateOnly(selectedDate).toLocaleDateString("en-US", {
                        month: "long",
                      })}
                    </p>
                    <p className="font-heading text-2xl font-black">
                      {parseDateOnly(selectedDate).getDate()}
                    </p>
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-[#0B3B91]">
                      {formatLongDate(selectedDate)}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {patients.length} total, {awaitingCount} awaiting
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-2xl border border-slate-200 bg-white text-[#0B3B91] hover:bg-slate-50"
                    onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="h-11 w-[190px] rounded-2xl border-slate-200 bg-white shadow-none"
                  />
                  {!isToday && (
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-2xl border-slate-200 bg-white"
                      onClick={() => setSelectedDate(today)}
                    >
                      Today
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-2xl border border-slate-200 bg-white text-[#0B3B91] hover:bg-slate-50"
                    onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-[260px] items-center justify-center rounded-[30px] border border-white/80 bg-white">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin text-[#0B3B91]" />
                    Loading schedule...
                  </div>
                </div>
              ) : patients.length === 0 ? (
                <div className="rounded-[30px] border border-white/80 bg-white px-6 py-16 text-center shadow-sm">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-heading text-2xl font-bold text-slate-900">
                    No patients scheduled for this date
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
                    Select another day, review the weekly overview above, or create a new
                    scheduled patient record.
                  </p>
                  {canSchedule && (
                    <Button
                      asChild
                      variant="outline"
                      className="mt-6 rounded-2xl border-slate-200 bg-white"
                    >
                      <Link href="/lop/patients/new">
                        <Plus className="h-4 w-4" />
                        Schedule Patient
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedSlots.map(([slot, slotPatients]) => (
                    <div key={slot} className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-blue-50 px-4 py-1.5 text-sm font-black uppercase tracking-[0.18em] text-blue-700">
                          {formatSlotRange(slot)}
                        </div>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>

                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {slotPatients.map((patient) => {
                          const status = patient.case_status;
                          const canMarkNoShow = isScheduledPastDue(patient, now);

                          return (
                            <div
                              key={patient.id}
                              className={cn(
                                "rounded-[30px] border bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                                status === "no_show"
                                  ? "border-rose-200 bg-rose-50/40"
                                  : ATTENDED_STATUS_SET.has(status)
                                  ? "border-emerald-200 bg-emerald-50/30"
                                  : "border-white/80"
                              )}
                            >
                              <div className="mb-6 flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div
                                    className={cn(
                                      "flex h-12 w-12 items-center justify-center rounded-full text-lg font-black",
                                      getAvatarTone(patient.id)
                                    )}
                                  >
                                    {getInitials(patient.first_name, patient.last_name)}
                                  </div>
                                  <div>
                                    <h3 className="font-heading text-xl font-bold text-[#0B3B91]">
                                      {patient.first_name} {patient.last_name}
                                    </h3>
                                    <p className="text-xs font-medium text-slate-400">
                                      Ref #{getPatientReference(patient.id)}
                                    </p>
                                  </div>
                                </div>

                                <span
                                  className={cn(
                                    "rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]",
                                    getScheduleStatusClasses(status)
                                  )}
                                >
                                  {CASE_STATUS_LABELS[status] ?? status}
                                </span>
                              </div>

                              <div className="mb-6 space-y-3 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-slate-400" />
                                  Arrives at {formatTime(patient.expected_arrival)}
                                  {patient.arrival_window_min ? ` • ${patient.arrival_window_min} min window` : ""}
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-slate-400" />
                                  Facility: {patient.lop_facilities?.name ?? "Unassigned Facility"}
                                </div>
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-slate-400" />
                                  Law Firm: {patient.lop_law_firms?.name ?? "No Law Firm"}
                                </div>
                                {patient.phone && (
                                  <div className="flex items-center gap-2">
                                    <PhoneCall className="h-4 w-4 text-slate-400" />
                                    {patient.phone}
                                  </div>
                                )}
                              </div>

                              {patient.intake_notes && (
                                <div className="mb-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-500">
                                  {patient.intake_notes}
                                </div>
                              )}

                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <Button
                                  asChild
                                  variant="outline"
                                  className="rounded-2xl border-slate-200 bg-slate-50 text-[#0B3B91] hover:bg-blue-50"
                                >
                                  <Link href={`/lop/patients/${patient.id}`}>Details</Link>
                                </Button>

                                {canUpdateSchedule && status === "scheduled" && (
                                  <Button
                                    type="button"
                                    className="rounded-2xl bg-gradient-to-r from-[#D72638] to-[#ff4d5e] text-white hover:from-[#c91f31] hover:to-[#ff4355]"
                                    disabled={markingArrived === patient.id}
                                    onClick={(event) => handleMarkArrived(event, patient)}
                                  >
                                    {markingArrived === patient.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4" />
                                    )}
                                    Mark Arrived
                                  </Button>
                                )}

                                {canUpdateSchedule && status === "no_show" && (
                                  <Button
                                    type="button"
                                    className="rounded-2xl bg-white text-[#0B3B91] ring-1 ring-slate-200 hover:bg-slate-50"
                                    disabled={returningScheduled === patient.id}
                                    onClick={(event) => handleReturnToScheduled(event, patient)}
                                  >
                                    {returningScheduled === patient.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Calendar className="h-4 w-4" />
                                    )}
                                    Return to Scheduled
                                  </Button>
                                )}
                              </div>

                              {canUpdateSchedule && status === "scheduled" && canMarkNoShow && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="mt-3 w-full rounded-2xl border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                                  disabled={markingNoShow === patient.id}
                                  onClick={(event) => handleMarkNoShow(event, patient)}
                                >
                                  {markingNoShow === patient.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                  Mark No-Show
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-8 xl:col-span-4">
            <section className="relative overflow-hidden rounded-[30px] bg-[#0B3B91] p-8 text-white shadow-[0_24px_60px_rgba(11,59,145,0.24)]">
              <div className="relative z-10">
                <h2 className="font-heading text-2xl font-bold">Facility Load Status</h2>
                <p className="mt-2 text-sm text-white/70">
                  Share of the currently selected day&apos;s schedule.
                </p>

                <div className="mt-8 space-y-6">
                  {displayedFacilityLoad.map((facility, index) => {
                    const share = patients.length
                      ? Math.round((facility.count / patients.length) * 100)
                      : 0;

                    return (
                      <div key={facility.id}>
                        <div className="mb-2 flex items-center justify-between text-sm font-bold">
                          <span>{facility.name}</span>
                          <span>{share}% of day volume</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/15">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              index === 0 ? "bg-[#ff5c70]" : "bg-white/60"
                            )}
                            style={{
                              width: `${facility.count === 0 ? 0 : Math.max(8, share)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {displayedFacilityLoad.length === 0 && (
                    <p className="text-sm text-white/70">No facility load to display yet.</p>
                  )}
                </div>
              </div>

              <div className="absolute -bottom-12 -right-10 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
            </section>

            <section className="grid grid-cols-2 gap-4">
              <div className="rounded-[26px] border border-white/80 bg-white p-6 shadow-sm">
                <FileText className="mb-4 h-6 w-6 text-[#0B3B91]" />
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  LOP Claims
                </p>
                <p className="mt-2 font-heading text-3xl font-black text-[#0B3B91]">
                  {weekStats.weekTotal}
                </p>
              </div>
              <div className="rounded-[26px] border border-white/80 bg-white p-6 shadow-sm">
                <AlertTriangle className="mb-4 h-6 w-6 text-[#D72638]" />
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Urgent
                </p>
                <p className="mt-2 font-heading text-3xl font-black text-[#0B3B91]">
                  {overduePatients.length}
                </p>
              </div>
            </section>

            <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold text-[#0B3B91]">
                  {formatMonthTitle(selectedDate)}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl text-slate-500 hover:bg-slate-50"
                    onClick={() => setSelectedDate(shiftMonth(selectedDate, -1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl text-slate-500 hover:bg-slate-50"
                    onClick={() => setSelectedDate(shiftMonth(selectedDate, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-y-3 text-center">
                {MINI_CALENDAR_LABELS.map((label) => (
                  <div
                    key={label}
                    className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400"
                  >
                    {label}
                  </div>
                ))}

                {miniCalendar.weeks.flat().map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="py-2" />;
                  }

                  const dateString = formatDateInput(
                    new Date(miniCalendar.year, miniCalendar.month, day)
                  );
                  const active = day === selectedDayNumber;
                  const todayActive =
                    isCurrentMonth && day === todayDate.getDate() && !active;

                  return (
                    <button
                      key={dateString}
                      type="button"
                      onClick={() => setSelectedDate(dateString)}
                      className={cn(
                        "mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all",
                        active
                          ? "bg-[#0B3B91] text-white ring-4 ring-[#0B3B91]/15"
                          : todayActive
                          ? "bg-blue-50 text-[#0B3B91]"
                          : "text-slate-500 hover:bg-slate-50 hover:text-[#0B3B91]"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-xl font-bold text-[#0B3B91]">
                Daily Snapshot
              </h2>
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Users className="h-4 w-4 text-slate-400" />
                    Total scheduled
                  </div>
                  <span className="font-heading text-xl font-bold text-[#0B3B91]">
                    {patients.length}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <UserCheck className="h-4 w-4" />
                    Arrived / Seen
                  </div>
                  <span className="font-heading text-xl font-bold text-emerald-700">
                    {attendedCount}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-blue-700">
                    <Clock className="h-4 w-4" />
                    Awaiting
                  </div>
                  <span className="font-heading text-xl font-bold text-blue-700">
                    {awaitingCount}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-rose-50 px-4 py-3">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-rose-700">
                    <XCircle className="h-4 w-4" />
                    No-Show
                  </div>
                  <span className="font-heading text-xl font-bold text-rose-700">
                    {noShowCount}
                  </span>
                </div>
              </div>

              {canUseAi && (
                <button
                  type="button"
                  onClick={openAiAssistant}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#D72638] transition-colors hover:text-[#b71d2d]"
                >
                  Ask AI about today&apos;s risks
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
