import { NextResponse, type NextRequest } from "next/server";
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
  buildDateFilteredContext,
} from "@/lib/lop/ai-context";
import { parseDateExpression } from "@/lib/lop/ai-utils";
import { requireLopAuth, getAdminClient } from "@/lib/lop/server-auth";

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

    // HIPAA: Authenticate from session cookie — not client-supplied ID
    const auth = await requireLopAuth();
    if (!auth) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Only admin can use AI
    if (auth.lopUser.role !== "admin") {
      return NextResponse.json(
        { error: "AI features require admin role" },
        { status: 403 },
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

    // Build context based on context_type
    let dataContext = "";
    const ctxType = context_type as ContextType;

    // Extract the last user message to detect date expressions
    const lastUserMsg =
      (messages ?? [])
        .filter((m: { role: string }) => m.role === "user")
        .pop()?.content ?? "";
    const dateRange = parseDateExpression(lastUserMsg);

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
      default: {
        // For general chat, provide dashboard-level context
        const dashCtx = await buildDashboardContext(facility_id);

        // If the user's message contains a date expression, also include date-filtered context
        if (dateRange) {
          const dateCtx = await buildDateFilteredContext(
            facility_id,
            dateRange.from,
            dateRange.to,
          );
          dataContext = `${dateCtx}\n\n${dashCtx}`;
        } else {
          dataContext = dashCtx;
        }
        break;
      }
    }

    // Get the system prompt
    const systemPrompt = SYSTEM_PROMPTS[ctxType] || SYSTEM_PROMPTS.general;

    // HIPAA: De-identify PHI before sending to OpenAI.
    // Replace real names with coded identifiers. Keep case statuses, financials,
    // and operational data intact since they're needed for analysis.
    const deidentifiedContext = deidentifyPhi(dataContext);

    // Combine system prompt with data context
    const fullSystemPrompt = `${systemPrompt}\n\n--- DATA CONTEXT ---\n${deidentifiedContext}`;

    // HIPAA: Audit log the AI query (fire-and-forget)
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const adminDb = getAdminClient();
    void adminDb.from("lop_audit_log").insert({
      user_id: auth.lopUser.id,
      action: `ai_query:${ctxType}`,
      entity_type: context_id ? "patient" : "dashboard",
      entity_id: context_id ?? null,
      ip_address: ip,
      new_values: { context_type: ctxType, message_count: (messages ?? []).length },
    });

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

/**
 * HIPAA: De-identify Protected Health Information before sending to OpenAI.
 *
 * Strategy: Replace patient names with coded identifiers (Patient-001, etc.)
 * while preserving operational data (statuses, financials, dates) that the AI
 * needs for analysis. Phone numbers and emails are masked.
 *
 * Note: For full HIPAA compliance, you should also obtain a BAA from OpenAI
 * (or use Azure OpenAI which offers HIPAA BAAs). This de-identification is
 * an additional safety layer.
 */
function deidentifyPhi(context: string): string {
  let result = context;

  // Build a map of real names → coded identifiers
  const nameMap = new Map<string, string>();
  let counter = 1;

  // Match "NAME: FirstName LastName" patterns (patient context)
  const namePattern = /NAME:\s*([A-Z][a-zA-Z'-]+)\s+([A-Z][a-zA-Z'-]+)/g;
  let match;
  while ((match = namePattern.exec(context)) !== null) {
    const fullName = `${match[1]} ${match[2]}`;
    if (!nameMap.has(fullName)) {
      nameMap.set(fullName, `Patient-${String(counter).padStart(3, "0")}`);
      counter++;
    }
  }

  // Match "- FirstName LastName |" patterns (dashboard lists)
  const listPattern = /- ([A-Z][a-zA-Z'-]+) ([A-Z][a-zA-Z'-]+) \|/g;
  while ((match = listPattern.exec(context)) !== null) {
    const fullName = `${match[1]} ${match[2]}`;
    if (!nameMap.has(fullName)) {
      nameMap.set(fullName, `Patient-${String(counter).padStart(3, "0")}`);
      counter++;
    }
  }

  // Match "- FirstName LastName (" patterns (alert lists)
  const alertPattern = /- ([A-Z][a-zA-Z'-]+) ([A-Z][a-zA-Z'-]+) \(/g;
  while ((match = alertPattern.exec(context)) !== null) {
    const fullName = `${match[1]} ${match[2]}`;
    if (!nameMap.has(fullName)) {
      nameMap.set(fullName, `Patient-${String(counter).padStart(3, "0")}`);
      counter++;
    }
  }

  // Replace all name occurrences (longest first to avoid partial matches)
  const sortedNames = [...nameMap.entries()].sort(
    (a, b) => b[0].length - a[0].length,
  );
  for (const [realName, coded] of sortedNames) {
    result = result.replaceAll(realName, coded);
    // Also replace individual first/last names if they appear solo
    const [first, last] = realName.split(" ");
    // Only replace if clearly in a patient context line
    result = result.replace(
      new RegExp(`Dear ${first}`, "g"),
      `Dear ${coded}`,
    );
    // Replace in "Patient" field of tables
    result = result.replace(
      new RegExp(`<td[^>]*>${first} ${last}</td>`, "g"),
      `<td>${coded}</td>`,
    );
  }

  // Mask phone numbers: (xxx) xxx-xxxx or xxx-xxx-xxxx → ***-***-XXXX (keep last 4)
  result = result.replace(
    /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    (m) => `***-***-${m.slice(-4)}`,
  );

  // Mask email addresses: keep domain, mask local part
  result = result.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    (m) => {
      const [, domain] = m.split("@");
      // Don't mask organizational emails (firm contacts, facility emails)
      if (["getfocushealth.com", "focusyourfinance.com", "erofwhiterock.com", "erofirving.com", "eroflufkin.com"].some(d => domain.includes(d))) {
        return m;
      }
      return `***@${domain}`;
    },
  );

  // Mask street addresses (line1) — replace house number and street
  result = result.replace(
    /ADDRESS:\s*.+/g,
    (m) => {
      if (m.includes("N/A")) return m;
      return "ADDRESS: [REDACTED]";
    },
  );

  // Mask DOB — keep year for age calculation, mask month/day
  result = result.replace(
    /DOB:\s*(\d{4})-\d{2}-\d{2}/g,
    "DOB: $1-XX-XX",
  );

  return result;
}
