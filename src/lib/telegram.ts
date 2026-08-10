"use client";

import { OrderItemData } from "@/lib/supabase";

/**
 * Sends a Telegram order notification via our server-side API route.
 * The Telegram Bot Token is NEVER exposed to the client.
 */
export async function sendTelegramOrderNotification(order: OrderItemData): Promise<boolean> {
  try {
    const res = await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });

    if (!res.ok) {
      console.warn("Telegram notification API returned non-OK status:", res.status);
      return false;
    }

    const data = await res.json();
    return data.ok === true;
  } catch (err) {
    console.error("Telegram Notification Exception:", err);
    return false;
  }
}
