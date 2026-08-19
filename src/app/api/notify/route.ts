import { NextRequest, NextResponse } from "next/server";

function escapeHtml(text: unknown): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Simple in-memory rate limiter (per IP, max 10 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

// Periodically clean up stale entries (prevent memory leak)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { ok: false, error: "Trop de requêtes. Réessayez dans une minute." },
        { status: 429 }
      );
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn("Telegram Bot credentials missing from server env.");
      return NextResponse.json({ ok: false, error: "Telegram not configured" }, { status: 200 });
    }

    const body = await req.json();
    const { order } = body;
    if (!order) {
      return NextResponse.json({ ok: false, error: "Missing order data" }, { status: 400 });
    }

    // Validate required fields
    if (!order.customer_name || !order.phone || !order.product_name) {
      return NextResponse.json({ ok: false, error: "Champs requis manquants" }, { status: 400 });
    }

    const deliveryModeText = order.delivery_type === "home" ? "À Domicile" : "Bureau Yalidine / Stopdesk";

    const messageText = `
<b>NOUVELLE COMMANDE - TLÉNOR GYM</b>

<b>Client:</b> ${escapeHtml(order.customer_name)}
<b>Téléphone:</b> <code>${escapeHtml(order.phone)}</code>
<b>Wilaya:</b> ${escapeHtml(order.wilaya_name)}
<b>Commune / Bureau:</b> ${escapeHtml(order.commune_name)}
<b>Mode:</b> ${escapeHtml(deliveryModeText)}
<b>Adresse:</b> ${escapeHtml(order.address || "N/A")}

<b>Produit(s):</b> ${escapeHtml(order.product_name)}
<b>Prix Articles:</b> ${escapeHtml(order.product_price)}
<b>Frais Livraison:</b> ${order.delivery_cost || 0} DA
<b>TOTAL À ENCAISSER:</b> <b>${escapeHtml(order.total_amount ? order.total_amount.toLocaleString() : order.product_price)} DA</b>

<b>Date:</b> ${escapeHtml(new Date().toLocaleString("fr-FR"))}
    `.trim();

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: messageText,
        parse_mode: "HTML",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Telegram API Error:", errText);
      return NextResponse.json({ ok: false, error: "Telegram API error" }, { status: 200 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram notification exception:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
