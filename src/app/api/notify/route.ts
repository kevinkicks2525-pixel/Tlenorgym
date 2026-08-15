import { NextRequest, NextResponse } from "next/server";

function escapeHtml(text: unknown): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn("Telegram Bot credentials missing from server env.");
      return NextResponse.json({ ok: false, error: "Telegram not configured" }, { status: 200 });
    }

    const { order } = body;
    if (!order) {
      return NextResponse.json({ ok: false, error: "Missing order data" }, { status: 400 });
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
