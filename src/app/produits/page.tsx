"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import { Milk, Moon, Pill, Dna, Zap, Flame, Sparkles, Fish, Cookie, MessageSquare, Phone, Package, Eye } from "lucide-react";
import ProductDetailModal from "@/components/ProductDetailModal";
import { useCart } from "@/context/CartContext";
import { getLocalProducts, fetchAndMergeProducts, subscribeProducts, ProductItem } from "@/lib/product-store";
import { trackProductClick } from "@/lib/analytics";

const categoryIcons: Record<string, React.ReactNode> = {
  "Protéines": <Milk size={44} className="text-accent" />,
  "Acides Aminés": <Pill size={44} className="text-accent" />,
  "Performance": <Zap size={44} className="text-accent" />,
  "Vitamines": <Sparkles size={44} className="text-accent" />,
  "Snacks": <Cookie size={44} className="text-accent" />,
};

export default function ProduitsPage() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [productList, setProductList] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["Tous"]);
  const [selectedProductDetail, setSelectedProductDetail] = useState<ProductItem | null>(null);

  const loadData = async () => {
    const local = getLocalProducts();
    if (local.length > 0) {
      setProductList(local);
      updateCategoryTabs(local);
    }

    const merged = await fetchAndMergeProducts();
    setProductList(merged);
    updateCategoryTabs(merged);
  };

  const updateCategoryTabs = (products: ProductItem[]) => {
    const catSet = new Set<string>();
    products.forEach((p) => {
      if (p.category) catSet.add(p.category.trim());
    });

    // Check custom admin categories in localStorage
    try {
      const savedCats = localStorage.getItem("tlenorgym_admin_categories");
      if (savedCats) {
        const parsed = JSON.parse(savedCats);
        if (Array.isArray(parsed)) {
          parsed.forEach((c: string) => catSet.add(c.trim()));
        }
      }
    } catch {
      // fallback
    }

    setCategories(["Tous", ...Array.from(catSet)]);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeProducts(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const handleSelectProduct = (product: ProductItem) => {
    trackProductClick(product.name);
    setSelectedProductDetail(product);
  };

  const filtered = productList.filter((p) => {
    if (activeCategory === "Tous") return true;
    return (p.category || "").trim().toLowerCase() === activeCategory.trim().toLowerCase();
  });

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
          {/* Category Filter Tabs */}
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
                className={`filter-btn ${activeCategory.toLowerCase() === cat.toLowerCase() ? "filter-btn--active" : ""}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="products__grid">
            {filtered.map((product, i) => (
              <ScrollReveal key={`${product.id || product.name}-${i}`} delay={i * 80}>
                <Link
                  href={`/produits/${encodeURIComponent(product.id || product.name)}`}
                  className="product-card"
                  style={{
                    opacity: product.stock_quantity > 0 ? 1 : 0.75,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    textDecoration: "none",
                  }}
                  onClick={() => trackProductClick(product.name)}
                >
                  {/* Image Container */}
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
                      categoryIcons[product.category] || <Package size={52} className="text-accent" />
                    )}
                    <span className="product-card__category">{product.category}</span>
                    {product.stock_quantity <= 0 && (
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
                        <span
                          className={`btn ${product.stock_quantity > 0 ? "btn--primary" : "btn--outline"} btn--sm`}
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                        >
                          <Eye size={14} /> Voir Produit
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
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
