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
    desc: "Isolat de petit-lait pur ultra-filtré, 27g de protéines par dose, pauvre en sucre et graisses.",
    image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "default-2",
    name: "BCAA 2:1:1 + Électrolytes",
    category: "Acides Aminés",
    price: "5 500 DA",
    stock: true,
    stock_quantity: 20,
    desc: "Acides aminés ramifiés pour optimiser la récupération musculaire et l'hydratation.",
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "default-3",
    name: "Pre-Workout Explosive Energy",
    category: "Performance",
    price: "6 800 DA",
    stock: true,
    stock_quantity: 12,
    desc: "Booster d'entraînement ultra-puissant avec citrulline, bêta-alanine et énergie explosive.",
    image: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "default-4",
    name: "Créatine Monohydrate 300g",
    category: "Performance",
    price: "4 800 DA",
    stock: true,
    stock_quantity: 18,
    desc: "Créatine micronisée 100% pure pour augmenter la force, l'endurance et le volume musculaire.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "default-5",
    name: "Multivitamines Pro Complex",
    category: "Vitamines",
    price: "3 900 DA",
    stock: true,
    stock_quantity: 25,
    desc: "Complexe complet de vitamines, minéraux et antioxydants pour la santé globale des sportifs.",
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80",
  },
];

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

  const items = Array.from(map.values());
  return items.length > 0 ? items : defaultProductsList;
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

  return () => {
    window.removeEventListener(EVENT_NAME, handleUpdate);
    window.removeEventListener("storage", handleUpdate);
  };
}
