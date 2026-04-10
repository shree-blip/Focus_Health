"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useLopAuth } from "@/components/lop/LopAuthProvider";
import { lopClient } from "@/lib/lop/supabase";
import { CASE_STATUS_LABELS, CASE_STATUS_COLORS } from "@/lib/lop/types";
import type { LopCaseStatus } from "@/lib/lop/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

export default function SchedulingPage() {
  const { lopUser, activeFacilityId, facilities } = useLopAuth();
  const [patients, setPatients] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const dayStart = `${selectedDate}T00:00:00`;
      const dayEnd = `${selectedDate}T23:59:59`;

      let query = lopClient
        .from("lop_patients")
        .select("*, lop_facilities(name), lop_law_firms(name)")
        .gte("expected_arrival", dayStart)
        .lte("expected_arrival", dayEnd)
        .order("expected_arrival", { ascending: true });

      if (activeFacilityId) {
        query = query.eq("facility_id", activeFacilityId);
      }

      const { data } = await query;
      setPatients((data as Record<string, unknown>[]) ?? []);
      setLoading(false);
    };
    load();
  }, [selectedDate, activeFacilityId]);

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  // Group by time slots
  const timeSlots = useMemo(() => {
    const slots: Record<string, Record<string, unknown>[]> = {};
    for (const p of patients) {
      if (!p.expected_arrival) continue;
      const arrival = new Date(p.expected_arrival as string);
      const hour = arrival.getHours();
      const slotKey = `${hour.toString().padStart(2, "0")}:00`;
      if (!slots[slotKey]) slots[slotKey] = [];
      slots[slotKey].push(p);
    }
    return Object.entries(slots).sort(([a], [b]) => a.localeCompare(b));
  }, [patients]);

  return (
    <div className="space-y-6">
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

      {/* Date navigation */}
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
          <p className="text-center text-sm text-slate-500 mt-2">
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {" · "}
            <span className="font-medium text-slate-900">
              {patients.length} expected arrival{patients.length !== 1 ? "s" : ""}
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Timeline */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 animate-pulse">
          Loading schedule…
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
        <div className="space-y-4">
          {timeSlots.map(([time, slotPatients]) => (
            <Card key={time}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <CardTitle className="text-base">{time}</CardTitle>
                  <span className="text-xs text-slate-400">
                    ({slotPatients.length} patient{slotPatients.length !== 1 ? "s" : ""})
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {slotPatients.map((p) => {
                    const status = p.case_status as LopCaseStatus;
                    return (
                      <Link
                        key={p.id as string}
                        href={`/lop/patients/${p.id}`}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {p.first_name as string} {p.last_name as string}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(p.lop_facilities as Record<string, unknown>)?.name as string ?? ""}{" "}
                            {(p.lop_law_firms as Record<string, unknown>)?.name
                              ? `· ${(p.lop_law_firms as Record<string, unknown>)?.name}`
                              : ""}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            CASE_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {CASE_STATUS_LABELS[status] ?? status}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
