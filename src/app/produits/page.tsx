"use client";

import { useState, useEffect } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { Milk, Moon, Pill, Dna, Zap, Flame, Sparkles, Fish, Cookie, MessageSquare, Phone, Package } from "lucide-react";
import { getSupabaseProducts, isSupabaseConfigured } from "@/lib/supabase";
import CheckoutModal from "@/components/CheckoutModal";

interface ProductUIItem {
  name: string;
  desc: string;
  price: string;
  category: string;
  stock: boolean;
  image?: string;
  icon: React.ReactNode;
}

const categories = ["Tous", "Protéines", "Acides Aminés", "Performance", "Vitamines", "Snacks"];

const categoryIcons: Record<string, React.ReactNode> = {
  "Protéines": <Milk size={44} className="text-accent" />,
  "Acides Aminés": <Pill size={44} className="text-accent" />,
  "Performance": <Zap size={44} className="text-accent" />,
  "Vitamines": <Sparkles size={44} className="text-accent" />,
  "Snacks": <Cookie size={44} className="text-accent" />,
};

const defaultProducts: ProductUIItem[] = [];

export default function ProduitsPage() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [productList, setProductList] = useState<ProductUIItem[]>([]);
  const [selectedCheckoutProduct, setSelectedCheckoutProduct] = useState<ProductUIItem | null>(null);

  useEffect(() => {
    async function loadData() {
      if (isSupabaseConfigured) {
        const supaData = await getSupabaseProducts();
        if (supaData && supaData.length > 0) {
          const mapped: ProductUIItem[] = supaData.map((item) => ({
            name: item.name,
            desc: item.description || "Supplément de qualité supérieure disponible à la salle.",
            price: item.price,
            category: item.category,
            stock: item.stock ?? true,
            image: item.image_url || "",
            icon: categoryIcons[item.category] || <Package size={44} className="text-accent" />,
          }));
          setProductList(mapped);
          return;
        } else if (supaData && supaData.length === 0) {
          setProductList([]);
          return;
        }
      }

      // Check localStorage for admin edits
      try {
        const saved = localStorage.getItem("tlenorgym_admin_products");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const mapped: ProductUIItem[] = parsed.map((item: { name: string; desc?: string; price: string; category: string; stock?: boolean; image?: string }) => ({
              name: item.name,
              desc: item.desc || "Supplément de qualité supérieure disponible à la salle.",
              price: item.price,
              category: item.category,
              stock: item.stock ?? true,
              image: item.image || "",
              icon: categoryIcons[item.category] || <Package size={44} className="text-accent" />,
            }));
            setProductList(mapped);
            return;
          }
        }
      } catch {
        // fallback
      }
      setProductList([]);
    }
    loadData();
  }, []);

  const filtered =
    activeCategory === "Tous"
      ? productList
      : productList.filter((p) => p.category === activeCategory);

  return (
    <>
      {selectedCheckoutProduct && (
        <CheckoutModal
          product={selectedCheckoutProduct}
          onClose={() => setSelectedCheckoutProduct(null)}
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

          <div className="products__grid">
            {filtered.map((product, i) => (
              <ScrollReveal key={product.name + i} delay={i * 80}>
                <div className="product-card" style={{ opacity: product.stock ? 1 : 0.7 }}>
                  <div
                    className="product-card__image"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "linear-gradient(135deg, var(--color-surface) 0%, var(--color-bg) 100%)",
                      padding: "1.5rem",
                      position: "relative",
                      minHeight: "180px",
                    }}
                  >
                    {product.image && (product.image.startsWith("http") || product.image.startsWith("data:")) ? (
                      <img src={product.image} alt={product.name} style={{ maxHeight: "140px", maxWidth: "100%", objectFit: "contain", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.5))" }} />
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
                  <div className="product-card__body">
                    <h3 className="product-card__name">{product.name}</h3>
                    <p className="product-card__desc">{product.desc}</p>
                    <div className="product-card__footer">
                      <span className="product-card__price">{product.price}</span>
                      <button
                        onClick={() => setSelectedCheckoutProduct(product)}
                        disabled={!product.stock}
                        className={`btn ${product.stock ? "btn--primary" : "btn--outline"} btn--sm`}
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                      >
                        <MessageSquare size={14} /> {product.stock ? "Commander" : "Indisponible"}
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "var(--space-4xl)", color: "var(--color-text-muted)" }}>
              <p style={{ fontSize: "var(--fs-xl)" }}>Aucun produit dans cette catégorie.</p>
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
            Nos coachs peuvent vous recommander les meilleurs suppléments selon
            vos objectifs.
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
