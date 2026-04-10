"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { lopClient } from "@/lib/lop/client";
import { isAllowedDomain } from "@/lib/lop/permissions";
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

        // 1. Try matching by auth_user_id first
        let { data: lopProfile } = await lopClient
          .from("lop_users")
          .select("*")
          .eq("auth_user_id", user.id)
          .single();

        // 2. If not found, try matching by email and link the auth_user_id
        if (!lopProfile && user.email) {
          const { data: emailMatch } = await lopClient
            .from("lop_users")
            .select("*")
            .eq("email", user.email.toLowerCase())
            .single();

          if (emailMatch) {
            // Link existing user profile to this Google auth ID
            await lopClient
              .from("lop_users")
              .update({ auth_user_id: user.id })
              .eq("id", emailMatch.id);
            lopProfile = { ...emailMatch, auth_user_id: user.id };
          }
        }

        // 3. If still not found, auto-provision if domain is allowed
        if (!lopProfile && user.email && isAllowedDomain(user.email)) {
          const { data: newProfile } = await lopClient
            .from("lop_users")
            .insert({
              auth_user_id: user.id,
              email: user.email.toLowerCase(),
              full_name:
                user.user_metadata?.full_name ??
                user.user_metadata?.name ??
                user.email.split("@")[0],
              role: "front_desk",
              is_active: true,
            })
            .select("*")
            .single();

          if (newProfile) {
            lopProfile = newProfile;
          }
        }

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
