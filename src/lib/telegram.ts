"use client";

import { OrderItemData } from "@/lib/supabase";

const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "8744147731:AAErP3_7Nx4GEyP0LTzOa-LUzct3lMQ5Txs";
const TELEGRAM_CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || "8716946287";

export async function sendTelegramOrderNotification(order: OrderItemData): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram Bot credentials missing.");
    return false;
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

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: messageText,
        parse_mode: "Markdown",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Telegram API Error:", errText);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Telegram Notification Exception:", err);
    return false;
  }
}
