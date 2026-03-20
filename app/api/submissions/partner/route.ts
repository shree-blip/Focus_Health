import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, marketInterest, cashToInvest, partnerType, additionalInfo } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Return submission data with an ID for client-side storage
    const submission = {
      id: `partner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "partner" as const,
      name,
      email,
      phone: phone || "",
      marketInterest: marketInterest || "",
      cashToInvest: cashToInvest || "",
      partnerType: partnerType || "",
      additionalInfo: additionalInfo || "",
      createdAt: new Date().toISOString(),
    };

    // Optionally forward to Supabase Edge Function (best-effort)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (supabaseUrl && supabaseKey) {
        await fetch(`${supabaseUrl}/functions/v1/send-investor-request`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ name, firm: marketInterest, email, phone }),
        });
      }
    } catch {
      // Silently ignore edge function errors — data is still saved client-side
    }

    return NextResponse.json({ success: true, submission });
  } catch {
    return NextResponse.json({ error: "Failed to process submission" }, { status: 500 });
  }
}
