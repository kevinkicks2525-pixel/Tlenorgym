import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const passcode = body?.passcode;

    const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE;

    if (!ADMIN_PASSCODE) {
      console.warn("⚠️ ADMIN_PASSCODE is not set in environment variables.");
      return NextResponse.json(
        { ok: false, error: "Configuration serveur manquante (ADMIN_PASSCODE)" },
        { status: 500 }
      );
    }

    if (passcode && passcode.toString().trim() === ADMIN_PASSCODE.trim()) {
      // Generate unique session token
      const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      return NextResponse.json({ ok: true, token: sessionToken });
    }

    return NextResponse.json({ ok: false, error: "Code incorrect" }, { status: 401 });
  } catch (err) {
    console.error("Admin Auth Error:", err);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
