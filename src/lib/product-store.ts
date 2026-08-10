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

export const defaultProductsList: ProductItem[] = [
  {
    id: "default-1",
    name: "Whey Protein Isolate 2kg",
    category: "Protéines",
    price: "12 500 DA",
    stock: true,
    stock_quantity: 15,
    desc: "Isolat de petit-lait pur ultra-filtré, 27g de protéines par dose, sans sucre.",
    image: "",
  },
  {
    id: "default-2",
    name: "BCAA 2:1:1 + Électrolytes",
    category: "Acides Aminés",
    price: "5 500 DA",
    stock: true,
    stock_quantity: 20,
    desc: "Acides aminés ramifiés pour optimiser la récupération et réduire la fatigue.",
    image: "",
  },
  {
    id: "default-3",
    name: "Pre-Workout Explosive Energy",
    category: "Performance",
    price: "6 800 DA",
    stock: true,
    stock_quantity: 12,
    desc: "Booster d'entraînement haute intensité avec créatine, bêta-alanine et caféine.",
    image: "",
  },
];

export function getLocalProducts(): ProductItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return [];
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

  // Merge unique products by normalized name
  const productMap = new Map<string, ProductItem>();
  
  // Load local items first
  localItems.forEach((prod) => {
    productMap.set(prod.name.trim().toLowerCase(), prod);
  });

  // Supabase items override or complement
  supaItems.forEach((prod) => {
    productMap.set(prod.name.trim().toLowerCase(), prod);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
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

  return () => {
    window.removeEventListener(EVENT_NAME, handleUpdate);
    window.removeEventListener("storage", handleUpdate);
  };
}
