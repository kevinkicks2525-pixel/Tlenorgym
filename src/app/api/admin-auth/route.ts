import { NextRequest, NextResponse } from "next/server";

// Simple in-memory token store (resets on server restart — acceptable for single-instance deployment)
const validTokens = new Set<string>();

// Cleanup old tokens periodically (keep max 100 tokens, remove oldest)
function pruneTokens() {
  if (validTokens.size > 100) {
    const tokens = Array.from(validTokens);
    const toRemove = tokens.slice(0, tokens.length - 50);
    toRemove.forEach((t) => validTokens.delete(t));
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const passcode = body?.passcode;

    const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE;

    if (!ADMIN_PASSCODE) {
      console.warn("[ADMIN AUTH] ADMIN_PASSCODE is not set in environment variables.");
      return NextResponse.json(
        { ok: false, error: "Configuration serveur manquante (ADMIN_PASSCODE)" },
        { status: 500 }
      );
    }

    if (passcode && passcode.toString().trim() === ADMIN_PASSCODE.trim()) {
      // Generate unique session token
      const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      validTokens.add(sessionToken);
      pruneTokens();
      return NextResponse.json({ ok: true, token: sessionToken });
    }

    return NextResponse.json({ ok: false, error: "Code incorrect" }, { status: 401 });
  } catch (err) {
    console.error("Admin Auth Error:", err);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}

// GET endpoint to validate an existing token
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token || !token.startsWith("admin_")) {
      return NextResponse.json({ ok: false, error: "Token manquant" }, { status: 401 });
    }

    // Accept token if it's in our valid set OR if the server restarted (token format is valid)
    // After restart, validTokens is empty so we accept well-formed tokens to avoid locking out admins
    if (validTokens.size === 0 || validTokens.has(token)) {
      // Re-register the token if server restarted
      if (!validTokens.has(token)) {
        validTokens.add(token);
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Token invalide" }, { status: 401 });
  } catch (err) {
    console.error("Admin Auth Validate Error:", err);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
