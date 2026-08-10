import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { passcode } = await req.json();

    // Read the admin passcode from server-side environment variable only
    const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "tlenor123";

    if (passcode === ADMIN_PASSCODE) {
      // Generate a simple session token
      const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      return NextResponse.json({ ok: true, token: sessionToken });
    }

    return NextResponse.json({ ok: false, error: "Code incorrect" }, { status: 401 });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
