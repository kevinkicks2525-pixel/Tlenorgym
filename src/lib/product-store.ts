"use client";

import { getSupabaseProducts, addSupabaseProduct, updateSupabaseProduct, deleteSupabaseProduct, isSupabaseConfigured } from "@/lib/supabase";

export interface ProductItem {
  id: number | string;
  name: string;
  category: string;
  price: string;
  stock: boolean;
  stock_quantity: number;
  desc?: string;
  image?: string;
}

const STORAGE_KEY = "tlenorgym_admin_products";
const EVENT_NAME = "tlenorgym_products_updated";

export const defaultProductsList: ProductItem[] = [];

export function getLocalProducts(): ProductItem[] {
  if (typeof window === "undefined") return [];
  const results: ProductItem[] = [];
  const map = new Map<string, ProductItem>();

  try {
    const saved1 = localStorage.getItem("tlenorgym_admin_products");
    if (saved1) {
      const parsed1 = JSON.parse(saved1);
      if (Array.isArray(parsed1)) {
        parsed1.forEach((p) => p.name && map.set(p.name.trim().toLowerCase(), p));
      }
    }
  } catch {
    // fallback
  }

  try {
    const saved2 = localStorage.getItem("tlenorgym_products");
    if (saved2) {
      const parsed2 = JSON.parse(saved2);
      if (Array.isArray(parsed2)) {
        parsed2.forEach((p) => p.name && map.set(p.name.trim().toLowerCase(), p));
      }
    }
  } catch {
    // fallback
  }

  return Array.from(map.values());
}

export async function fetchAndMergeProducts(): Promise<ProductItem[]> {
  if (isSupabaseConfigured) {
    try {
      const supaData = await getSupabaseProducts();
      if (supaData !== null) {
        const supaItems: ProductItem[] = supaData.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category || "Protéines",
          price: item.price,
          stock: (item.stock_quantity ?? (item.stock ? 10 : 0)) > 0,
          stock_quantity: item.stock_quantity ?? (item.stock ? 10 : 0),
          desc: item.description || "Supplément officiel disponible à Tlénor Gym.",
          image: item.image_url || "",
        }));

        // Synchronize local cache with database truth
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(supaItems));
            localStorage.setItem("tlenorgym_products", JSON.stringify(supaItems));
          } catch {
            // fallback
          }
        }

        return supaItems;
      }
    } catch (err) {
      console.warn("Supabase fetch products error:", err);
    }
  }

  // Fallback to local storage only if Supabase is offline or not configured
  const localItems = getLocalProducts();
  return localItems.length > 0 ? localItems : defaultProductsList;
}

export function saveLocalProducts(products: ProductItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("tlenorgym_admin_products", JSON.stringify(products));
    localStorage.setItem("tlenorgym_products", JSON.stringify(products));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // fallback
  }
}

export function subscribeProducts(onChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => onChange();
  window.addEventListener(EVENT_NAME, handleUpdate);
  window.addEventListener("storage", handleUpdate);
  window.addEventListener("focus", handleUpdate);

  return () => {
    window.removeEventListener(EVENT_NAME, handleUpdate);
    window.removeEventListener("storage", handleUpdate);
    window.removeEventListener("focus", handleUpdate);
  };
}
