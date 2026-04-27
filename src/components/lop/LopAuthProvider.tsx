"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { lopDb } from "@/lib/lop/db";
import type { LopUser, LopFacility } from "@/lib/lop/types";

interface LopAuthContext {
  lopUser: LopUser | null;
  facilities: LopFacility[];
  activeFacilityId: string | null;
  setActiveFacilityId: (id: string | null) => void;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<LopAuthContext>({
  lopUser: null,
  facilities: [],
  activeFacilityId: null,
  setActiveFacilityId: () => {},
  isLoading: true,
  signOut: async () => {},
});

export function useLopAuth() {
  return useContext(Ctx);
}

export function LopAuthProvider({ children }: { children: ReactNode }) {
  const [lopUser, setLopUser] = useState<LopUser | null>(null);
  const [facilities, setFacilities] = useState<LopFacility[]>([]);
  const [activeFacilityId, setActiveFacilityId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch session from server cookie
        const sessionRes = await fetch("/api/lop/auth/session", { credentials: "same-origin" });
        if (!sessionRes.ok) { setIsLoading(false); return; }
        const { user } = await sessionRes.json();
        if (!user) { setIsLoading(false); return; }

        setLopUser(user as LopUser);

        // Fetch assigned facilities
        const { data: userFacilities } = await lopDb.select("lop_user_facilities", {
          select: "facility_id",
          filters: [{ column: "user_id", op: "eq", value: user.id }],
        });

        if (user.role === "admin" || user.role === "accounting") {
          const { data: allFacs } = await lopDb.select("lop_facilities", {
            filters: [{ column: "is_active", op: "eq", value: true }],
            order: { column: "name" },
          });
          if (allFacs) setFacilities(allFacs as unknown as LopFacility[]);
        } else if (userFacilities && (userFacilities as unknown[]).length > 0) {
          const facIds = (userFacilities as Record<string, unknown>[]).map((uf) => uf.facility_id as string);
          const { data: facs } = await lopDb.select("lop_facilities", {
            filters: [{ column: "id", op: "in", value: facIds }],
            order: { column: "name" },
          });
          if (facs) {
            setFacilities(facs as unknown as LopFacility[]);
            if ((facs as unknown[]).length === 1) {
              setActiveFacilityId(((facs as unknown[])[0] as Record<string, unknown>).id as string);
            }
          }
        }
      } catch (err) {
        console.error("LOP auth init error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const signOut = async () => {
    await fetch("/api/lop/auth/logout", { method: "POST", credentials: "same-origin" });
    setLopUser(null);
    setFacilities([]);
    setActiveFacilityId(null);
    window.location.href = "/lop/login";
  };

  return (
    <Ctx.Provider value={{ lopUser, facilities, activeFacilityId, setActiveFacilityId, isLoading, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

