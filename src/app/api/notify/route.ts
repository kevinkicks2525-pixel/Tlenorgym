import { NextRequest, NextResponse } from "next/server";

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

    const deliveryModeText = order.delivery_type === "home" ? "🏠 À Domicile" : "🏢 Bureau Yalidine / Stopdesk";

    const messageText = `
🛍 **NOUVELLE COMMANDE TLÉNOR GYM**

👤 **Client:** ${order.customer_name}
📞 **Téléphone:** \`${order.phone}\`
📍 **Wilaya:** ${order.wilaya_name}
🌆 **Commune / Bureau:** ${order.commune_name}
🚚 **Livraison:** ${deliveryModeText}
🏠 **Adresse:** ${order.address || "N/A"}

📦 **Produit(s):** ${order.product_name}
💵 **Prix Articles:** ${order.product_price}
🚚 **Frais Livraison:** ${order.delivery_cost || 0} DA
💰 **TOTAL À ENCAISSER:** *${order.total_amount ? order.total_amount.toLocaleString() : order.product_price} DA*

🗓 **Date:** ${new Date().toLocaleString("fr-FR")}
    `.trim();

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: messageText,
        parse_mode: "Markdown",
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
