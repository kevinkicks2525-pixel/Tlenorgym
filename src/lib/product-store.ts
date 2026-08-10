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
  let supaItems: ProductItem[] = [];

  if (isSupabaseConfigured) {
    try {
      const supaData = await getSupabaseProducts();
      if (supaData && supaData.length > 0) {
        supaItems = supaData.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category || "Protéines",
          price: item.price,
          stock: (item.stock_quantity ?? (item.stock ? 10 : 0)) > 0,
          stock_quantity: item.stock_quantity ?? (item.stock ? 10 : 0),
          desc: item.description || "Supplément officiel disponible à Tlénor Gym.",
          image: item.image_url || "",
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch products error:", err);
    }
  }

  const localItems = getLocalProducts();

  // If Supabase is configured, auto-push any local items missing from Supabase so mobile devices receive them
  if (isSupabaseConfigured) {
    const supaNameSet = new Set(supaItems.map((p) => p.name.trim().toLowerCase()));
    for (const localProd of localItems) {
      if (localProd.name && !supaNameSet.has(localProd.name.trim().toLowerCase())) {
        try {
          const inserted = await addSupabaseProduct({
            name: localProd.name,
            category: localProd.category || "Protéines",
            price: localProd.price,
            desc: localProd.desc,
            stock: (localProd.stock_quantity ?? 10) > 0,
            stock_quantity: localProd.stock_quantity ?? 10,
            image: localProd.image,
          });
          if (inserted && inserted.id) {
            const newSupaItem: ProductItem = {
              id: inserted.id,
              name: inserted.name,
              category: inserted.category || "Protéines",
              price: inserted.price,
              stock: (inserted.stock_quantity ?? (inserted.stock ? 10 : 0)) > 0,
              stock_quantity: inserted.stock_quantity ?? (inserted.stock ? 10 : 0),
              desc: inserted.description || "Supplément officiel disponible à Tlénor Gym.",
              image: inserted.image_url || "",
            };
            supaItems.push(newSupaItem);
            supaNameSet.add(inserted.name.trim().toLowerCase());
          }
        } catch (err) {
          console.warn("Auto-sync product to Supabase warning:", err);
        }
      }
    }
  }

  // Merge unique products by normalized name (Supabase as primary truth)
  const productMap = new Map<string, ProductItem>();
  
  supaItems.forEach((prod) => {
    productMap.set(prod.name.trim().toLowerCase(), prod);
  });

  localItems.forEach((prod) => {
    if (!productMap.has(prod.name.trim().toLowerCase())) {
      productMap.set(prod.name.trim().toLowerCase(), prod);
    }
  });

  const merged = Array.from(productMap.values());

  if (merged.length === 0) {
    return defaultProductsList;
  }

  // Update local cache
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {
      // fallback
    }
  }

  return merged;
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
