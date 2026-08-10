"use client";

import { useState, useEffect } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { Milk, Moon, Pill, Dna, Zap, Flame, Sparkles, Fish, Cookie, MessageSquare, Phone, Package, ShoppingBag, Eye } from "lucide-react";
import { getSupabaseProducts, getSupabaseCategories, isSupabaseConfigured } from "@/lib/supabase";
import ProductDetailModal from "@/components/ProductDetailModal";
import { useCart } from "@/context/CartContext";

interface ProductUIItem {
  id?: number | string;
  name: string;
  desc: string;
  price: string;
  category: string;
  stock: boolean;
  stock_quantity?: number;
  image?: string;
  icon: React.ReactNode;
}

const defaultCategories = ["Tous", "Protéines", "Acides Aminés", "Performance", "Vitamines", "Snacks"];

const categoryIcons: Record<string, React.ReactNode> = {
  "Protéines": <Milk size={44} className="text-accent" />,
  "Acides Aminés": <Pill size={44} className="text-accent" />,
  "Performance": <Zap size={44} className="text-accent" />,
  "Vitamines": <Sparkles size={44} className="text-accent" />,
  "Snacks": <Cookie size={44} className="text-accent" />,
};

export default function ProduitsPage() {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [productList, setProductList] = useState<ProductUIItem[]>([]);
  const [selectedProductDetail, setSelectedProductDetail] = useState<ProductUIItem | null>(null);

  useEffect(() => {
    async function loadData() {
      let loadedProducts: ProductUIItem[] = [];

      // 1. Fetch Supabase Products
      if (isSupabaseConfigured) {
        const supaData = await getSupabaseProducts();
        if (supaData && supaData.length > 0) {
          loadedProducts = supaData.map((item) => ({
            id: item.id,
            name: item.name,
            desc: item.description || "Supplément de qualité supérieure disponible à Tlénor Gym.",
            price: item.price,
            category: item.category,
            stock: (item.stock_quantity ?? (item.stock ? 10 : 0)) > 0,
            stock_quantity: item.stock_quantity ?? (item.stock ? 10 : 0),
            image: item.image_url || "",
            icon: categoryIcons[item.category] || <Package size={44} className="text-accent" />,
          }));
        }

        // Fetch Supabase Categories
        const supaCats = await getSupabaseCategories();
        if (supaCats && supaCats.length > 0) {
          setCategories(["Tous", ...supaCats.map((c: any) => c.name)]);
        }
      }

      // 2. Merge from LocalStorage if available
      try {
        const savedProducts = localStorage.getItem("tlenorgym_admin_products");
        if (savedProducts) {
          const parsed = JSON.parse(savedProducts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const localMapped: ProductUIItem[] = parsed.map((item: any) => ({
              id: item.id || item.name,
              name: item.name,
              desc: item.desc || item.description || "Supplément de qualité supérieure disponible à Tlénor Gym.",
              price: item.price,
              category: item.category,
              stock: (item.stock_quantity ?? (item.stock ? 10 : 0)) > 0,
              stock_quantity: item.stock_quantity ?? (item.stock ? 10 : 0),
              image: item.image || item.image_url || "",
              icon: categoryIcons[item.category] || <Package size={44} className="text-accent" />,
            }));

            // Merge unique items by name
            const combinedMap = new Map<string, ProductUIItem>();
            [...loadedProducts, ...localMapped].forEach((prod) => {
              combinedMap.set(prod.name.toLowerCase(), prod);
            });
            loadedProducts = Array.from(combinedMap.values());
          }
        }
      } catch {
        // fallback
      }

      // Load Categories from LocalStorage if custom
      try {
        const savedCats = localStorage.getItem("tlenorgym_admin_categories");
        if (savedCats) {
          const parsed = JSON.parse(savedCats);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategories(["Tous", ...parsed]);
          }
        }
      } catch {
        // fallback
      }

      setProductList(loadedProducts);
    }
    loadData();
  }, []);

  const filtered =
    activeCategory === "Tous"
      ? productList
      : productList.filter((p) => p.category === activeCategory);

  return (
    <>
      {selectedProductDetail && (
        <ProductDetailModal
          product={selectedProductDetail}
          onClose={() => setSelectedProductDetail(null)}
        />
      )}

      <div className="page-header">
        <div className="container">
          <span className="section-label">Boutique Officielle</span>
          <h1 className="page-header__title">
            Nos <span className="text-accent">Produits & Suppléments</span>
          </h1>
          <p className="page-header__desc">
            Des compléments alimentaires 100% authentiques sélectionnés par nos
            coachs. Livraison rapide dans les 58 wilayas d&apos;Algérie.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Category Filter */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "var(--space-2xl)",
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`filter-btn ${activeCategory === cat ? "filter-btn--active" : ""}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="products__grid">
            {filtered.map((product, i) => (
              <ScrollReveal key={product.name + i} delay={i * 80}>
                <div
                  className="product-card"
                  style={{
                    opacity: product.stock ? 1 : 0.75,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onClick={() => setSelectedProductDetail(product)}
                >
                  {/* Clean Image Container */}
                  <div
                    className="product-card__image"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(135deg, var(--color-surface) 0%, var(--color-bg) 100%)",
                      padding: "1.5rem",
                      position: "relative",
                      minHeight: "220px",
                    }}
                  >
                    {product.image && (product.image.startsWith("http") || product.image.startsWith("data:")) ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          height: "170px",
                          width: "100%",
                          objectFit: "contain",
                          filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.6))",
                          transition: "transform 0.3s ease",
                        }}
                      />
                    ) : (
                      product.icon
                    )}
                    <span className="product-card__category">{product.category}</span>
                    {!product.stock && (
                      <span
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          background: "rgba(230, 57, 70, 0.9)",
                          color: "#fff",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "4px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        Rupture de Stock
                      </span>
                    )}
                  </div>

                  <div className="product-card__body" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h3 className="product-card__name">{product.name}</h3>
                      <p className="product-card__desc">{product.desc}</p>
                    </div>

                    <div className="product-card__footer" style={{ marginTop: "1rem" }}>
                      <span className="product-card__price">{product.price}</span>

                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProductDetail(product);
                          }}
                          className={`btn ${product.stock ? "btn--primary" : "btn--outline"} btn--sm`}
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                        >
                          <Eye size={14} /> Voir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "var(--space-4xl)", color: "var(--color-text-muted)" }}>
              <Package size={56} style={{ opacity: 0.3, marginBottom: "1rem" }} />
              <p style={{ fontSize: "var(--fs-xl)" }}>Aucun produit disponible dans cette catégorie.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section section">
        <div className="container">
          <h2 className="cta-section__title">
            Besoin de <span className="text-accent">conseils</span> ?
          </h2>
          <p className="cta-section__desc">
            Nos coachs peuvent vous recommander les meilleurs suppléments selon vos objectifs.
          </p>
          <div style={{ display: "flex", gap: "var(--space-md)", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="https://wa.me/213552089293?text=Bonjour, j'aimerais des conseils sur les compléments alimentaires"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--whatsapp btn--lg"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <MessageSquare size={18} /> Demander conseil
            </a>
            <a href="tel:0552089293" className="btn btn--outline btn--lg" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <Phone size={18} /> Appelez-nous
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
