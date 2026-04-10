"use client";

import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Client-side Supabase client re-exported as an `any`-typed instance
 * so LOP table queries compile before the generated types are updated.
 * This file is safe to import from client components only.
 */
export const lopClient = supabase as ReturnType<typeof createClient<any>>;
