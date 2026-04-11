import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import {
  DASHBOARD_BRIEFING_PROMPT,
  PATIENT_SUMMARY_PROMPT,
  REPORTS_ANALYSIS_PROMPT,
  GENERAL_CHAT_PROMPT,
} from "@/lib/lop/ai-prompts";
import {
  buildDashboardContext,
  buildPatientContext,
  buildReportsContext,
} from "@/lib/lop/ai-context";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

type ContextType = "general" | "dashboard_briefing" | "patient_summary" | "reports_analysis";

const SYSTEM_PROMPTS: Record<ContextType, string> = {
  general: GENERAL_CHAT_PROMPT,
  dashboard_briefing: DASHBOARD_BRIEFING_PROMPT,
  patient_summary: PATIENT_SUMMARY_PROMPT,
  reports_analysis: REPORTS_ANALYSIS_PROMPT,
};

export async function POST(request: NextRequest) {
  try {
    // Validate API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const {
      messages,
      context_type = "general" as ContextType,
      context_id,
      facility_id,
      report_data,
    } = body;

    // Get auth user ID from header (same pattern as /api/lop/db)
    const authUserId =
      body.auth_user_id ||
      request.headers.get("x-lop-user-id");

    if (!authUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const admin = getAdmin();

    // Verify auth user exists
    const { data: authUser, error: authError } =
      await admin.auth.admin.getUserById(authUserId);
    if (authError || !authUser?.user) {
      return NextResponse.json({ error: "Invalid user" }, { status: 401 });
    }

    // Verify user has lop_users record and is admin
    const { data: lopUser } = await admin
      .from("lop_users")
      .select("id, role, is_active")
      .eq("auth_user_id", authUserId)
      .single();

    if (!lopUser || !lopUser.is_active) {
      return NextResponse.json(
        { error: "LOP user not found or inactive" },
        { status: 403 },
      );
    }

    // Only admin can use AI
    if (lopUser.role !== "admin") {
      return NextResponse.json(
        { error: "AI features require admin role" },
        { status: 403 },
      );
    }

    // Build context based on context_type
    let dataContext = "";
    const ctxType = context_type as ContextType;

    switch (ctxType) {
      case "dashboard_briefing":
        dataContext = await buildDashboardContext(facility_id);
        break;
      case "patient_summary":
        if (!context_id) {
          return NextResponse.json(
            { error: "context_id (patient ID) is required for patient_summary" },
            { status: 400 },
          );
        }
        dataContext = await buildPatientContext(context_id);
        break;
      case "reports_analysis":
        if (report_data) {
          dataContext = buildReportsContext(report_data);
        } else {
          dataContext = await buildDashboardContext(facility_id);
        }
        break;
      case "general":
      default:
        // For general chat, provide dashboard-level context
        dataContext = await buildDashboardContext(facility_id);
        break;
    }

    // Get the system prompt
    const systemPrompt = SYSTEM_PROMPTS[ctxType] || SYSTEM_PROMPTS.general;

    // Combine system prompt with data context
    const fullSystemPrompt = `${systemPrompt}\n\n--- DATA CONTEXT ---\n${dataContext}`;

    // Stream the response
    const result = streamText({
      model: openai("gpt-4o"),
      system: fullSystemPrompt,
      messages: messages ?? [],
      maxTokens: 2000,
      temperature: 0.3,
    });

    return result.toDataStreamResponse();
  } catch (err) {
    console.error("AI chat error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
