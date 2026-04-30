import { NextResponse } from "next/server";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "1075627982134-d0d7rc5lervhic878otmcunl9l5skb5a.apps.googleusercontent.com";

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