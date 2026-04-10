"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { lopClient } from "@/lib/lop/client";
import { lopDb, setLopDbAuthUser } from "@/lib/lop/db";
import type { LopUser, LopFacility } from "@/lib/lop/types";
import type { User } from "@supabase/supabase-js";

interface LopAuthContext {
  authUser: User | null;
  lopUser: LopUser | null;
  facilities: LopFacility[];
  activeFacilityId: string | null;
  setActiveFacilityId: (id: string | null) => void;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<LopAuthContext>({
  authUser: null,
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
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [lopUser, setLopUser] = useState<LopUser | null>(null);
  const [facilities, setFacilities] = useState<LopFacility[]>([]);
  const [activeFacilityId, setActiveFacilityId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { user },
        } = await lopClient.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        setAuthUser(user);
        // Set auth user ID for the db helper (server-side proxy)
        setLopDbAuthUser(user.id);

        // Fetch LOP user profile via server API (bypasses RLS)
        const { data: lopProfile } = await lopDb.select("lop_users", {
          filters: [{ column: "auth_user_id", op: "eq", value: user.id }],
          single: true,
        });

        if (lopProfile) {
          setLopUser(lopProfile as unknown as LopUser);

          // Fetch assigned facilities via server API
          const { data: userFacilities } = await lopDb.select(
            "lop_user_facilities",
            {
              select: "facility_id",
              filters: [
                { column: "user_id", op: "eq", value: (lopProfile as Record<string, unknown>).id },
              ],
            },
          );

          if (
            (lopProfile as Record<string, unknown>).role === "admin" ||
            (lopProfile as Record<string, unknown>).role === "accounting"
          ) {
            // Admin/Accounting get all active facilities
            const { data: allFacs } = await lopDb.select("lop_facilities", {
              filters: [{ column: "is_active", op: "eq", value: true }],
              order: { column: "name" },
            });
            if (allFacs) {
              setFacilities(allFacs as unknown as LopFacility[]);
            }
          } else if (userFacilities && (userFacilities as unknown[]).length > 0) {
            // Others get only assigned facilities
            const facIds = (userFacilities as Record<string, unknown>[]).map(
              (uf) => uf.facility_id as string,
            );
            const { data: facs } = await lopDb.select("lop_facilities", {
              filters: [{ column: "id", op: "in", value: facIds }],
              order: { column: "name" },
            });
            if (facs) {
              setFacilities(facs as unknown as LopFacility[]);
              if ((facs as unknown[]).length === 1) {
                setActiveFacilityId(
                  ((facs as unknown[])[0] as Record<string, unknown>).id as string,
                );
              }
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

    const {
      data: { subscription },
    } = lopClient.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAuthUser(null);
        setLopUser(null);
        setFacilities([]);
        setActiveFacilityId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await lopClient.auth.signOut();
    setAuthUser(null);
    setLopUser(null);
    window.location.href = "/lop/login";
  };

  return (
    <Ctx.Provider
      value={{
        authUser,
        lopUser,
        facilities,
        activeFacilityId,
        setActiveFacilityId,
        isLoading,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
