import { NextResponse } from "next/server";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "540299638751-0ghd0f3b4m5lefmr28mree3flcuem5m3.apps.googleusercontent.com";

export async function GET() {
  return NextResponse.json(
    { clientId: GOOGLE_CLIENT_ID },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}