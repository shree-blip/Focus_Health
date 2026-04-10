"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { lopClient } from "@/lib/lop/supabase";
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

        // Fetch LOP user profile
        const { data: lopProfile } = await lopClient
          .from("lop_users")
          .select("*")
          .eq("auth_user_id", user.id)
          .single();

        if (lopProfile) {
          setLopUser(lopProfile as unknown as LopUser);

          // Fetch assigned facilities
          const { data: userFacilities } = await lopClient
            .from("lop_user_facilities")
            .select("facility_id, lop_facilities(*)")
            .eq("user_id", lopProfile.id);

          if (userFacilities) {
            const facs = userFacilities
              .map((uf: Record<string, unknown>) => uf.lop_facilities as unknown as LopFacility)
              .filter(Boolean);
            setFacilities(facs);
            if (facs.length === 1) {
              setActiveFacilityId(facs[0].id);
            }
          }

          // Accounting/Admin get all facilities
          if (
            lopProfile.role === "admin" ||
            lopProfile.role === "accounting"
          ) {
            const { data: allFacs } = await lopClient
              .from("lop_facilities")
              .select("*")
              .eq("is_active", true)
              .order("name");
            if (allFacs) {
              setFacilities(allFacs as unknown as LopFacility[]);
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
