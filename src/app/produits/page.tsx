"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import { Milk, Pill, Zap, Sparkles, Cookie, MessageSquare, Phone, Package, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getLocalProducts, fetchAndMergeProducts, subscribeProducts, ProductItem } from "@/lib/product-store";
import { trackProductClick } from "@/lib/analytics";

const categoryIcons: Record<string, React.ReactNode> = {
  "Protéines": <Milk size={28} className="text-accent" />,
  "Acides Aminés": <Pill size={28} className="text-accent" />,
  "Performance": <Zap size={28} className="text-accent" />,
  "Vitamines": <Sparkles size={28} className="text-accent" />,
  "Snacks": <Cookie size={28} className="text-accent" />,
};

export default function ProduitsPage() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [productList, setProductList] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["Tous"]);
  const { totalItems, setIsCartOpen } = useCart();

  useEffect(() => {
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

    loadData();
    const unsubscribe = subscribeProducts(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const filtered = productList.filter((p) => {
    if (activeCategory === "Tous") return true;
    return (p.category || "").trim().toLowerCase() === activeCategory.trim().toLowerCase();
  });

  return (
    <>
      {/* Floating Cart Icon Button (Style CD Project) */}
      <button
        onClick={() => setIsCartOpen(true)}
        aria-label="Voir le panier"
        style={{
          position: "fixed",
          bottom: "28px",
          right: "24px",
          width: "58px",
          height: "58px",
          borderRadius: "50%",
          backgroundColor: "var(--color-accent)",
          color: "#000",
          border: "none",
          boxShadow: "0 8px 25px rgba(245, 197, 24, 0.45)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <ShoppingBag size={24} />
        {totalItems > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "var(--color-red)",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 900,
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid var(--color-bg)",
            }}
          >
            {totalItems}
          </span>
        )}
      </button>

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
                    opacity: (product.stock_quantity ?? (product.stock ? 10 : 0)) > 0 ? 1 : 0.75,
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
                      position: "relative",
                      width: "100%",
                      overflow: "hidden",
                    }}
                  >
                    {product.image && (product.image.startsWith("http") || product.image.startsWith("data:")) ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          height: "100%",
                          width: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                        }}
                      />
                    ) : (
                      <div className="product-icon-fallback">
                        {categoryIcons[product.category] || <Package size={26} className="text-accent" />}
                      </div>
                    )}
                    <span className="product-card__category">{product.category}</span>
                    {(product.stock_quantity ?? (product.stock ? 10 : 0)) <= 0 && (
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
                          className={`btn ${(product.stock_quantity ?? (product.stock ? 10 : 0)) > 0 ? "btn--primary" : "btn--outline"} btn--sm`}
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontWeight: 700 }}
                        >
                          <ShoppingBag size={14} /> Commander
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
              <Package size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
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
