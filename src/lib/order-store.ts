"use client";

import { createSupabaseOrder, getSupabaseOrders, isSupabaseConfigured, OrderItemData } from "@/lib/supabase";
import { sendTelegramOrderNotification } from "@/lib/telegram";

const ORDERS_STORAGE_KEY = "tlenorgym_admin_orders";
const ORDERS_EVENT_NAME = "tlenorgym_orders_updated";

export function getLocalOrders(): OrderItemData[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return [];
}

export async function fetchAndMergeOrders(): Promise<OrderItemData[]> {
  if (isSupabaseConfigured) {
    try {
      const fetched = await getSupabaseOrders();
      if (fetched !== null) {
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(fetched));
          } catch {
            // fallback
          }
        }
        return fetched;
      }
    } catch (err) {
      console.warn("Supabase fetch orders error:", err);
    }
  }

  return getLocalOrders();
}

export async function saveNewOrder(order: OrderItemData): Promise<OrderItemData> {
  const newOrder: OrderItemData = {
    ...order,
    id: order.id || Date.now(),
    status: order.status || "Nouvelle",
    created_at: order.created_at || new Date().toISOString(),
  };

  // 1. Instant local save & broadcast
  if (typeof window !== "undefined") {
    try {
      const existing = getLocalOrders();
      const updated = [newOrder, ...existing];
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(ORDERS_EVENT_NAME));
    } catch {
      // fallback
    }
  }

  // 2. Asynchronous background Supabase save (non-blocking)
  if (isSupabaseConfigured) {
    createSupabaseOrder(newOrder).catch((err) => {
      console.warn("Background Supabase order creation warning:", err);
    });
  }

  // 3. Send Telegram Bot Notification
  sendTelegramOrderNotification(newOrder).catch((err) => {
    console.warn("Telegram notification send warning:", err);
  });

  return newOrder;
}

export function subscribeOrders(onChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => onChange();
  window.addEventListener(ORDERS_EVENT_NAME, handleUpdate);
  window.addEventListener("storage", handleUpdate);
  window.addEventListener("focus", handleUpdate);

  return () => {
    window.removeEventListener(ORDERS_EVENT_NAME, handleUpdate);
    window.removeEventListener("storage", handleUpdate);
    window.removeEventListener("focus", handleUpdate);
  };
}
