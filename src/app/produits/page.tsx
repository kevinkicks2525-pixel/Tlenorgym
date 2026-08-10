"use client";

import { useState, useEffect } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { Milk, Moon, Pill, Dna, Zap, Flame, Sparkles, Fish, Cookie, MessageSquare, Phone, Package } from "lucide-react";
import { getSupabaseProducts, isSupabaseConfigured } from "@/lib/supabase";

interface ProductUIItem {
  name: string;
  desc: string;
  price: string;
  category: string;
  stock: boolean;
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

const defaultProducts: ProductUIItem[] = [
  {
    name: "Whey Protein Isolate",
    desc: "Protéine de lactosérum isolée pour une absorption rapide et une récupération optimale après l'entraînement.",
    price: "8 500 DA",
    category: "Protéines",
    stock: true,
    icon: <Milk size={44} className="text-accent" />,
  },
  {
    name: "Caséine Micellaire",
    desc: "Protéine à digestion lente, idéale avant le coucher pour une récupération nocturne continue.",
    price: "7 800 DA",
    category: "Protéines",
    stock: true,
    icon: <Moon size={44} className="text-accent" />,
  },
  {
    name: "BCAA 2:1:1",
    desc: "Acides aminés à chaîne ramifiée pour réduire la fatigue musculaire et accélérer la récupération.",
    price: "4 500 DA",
    category: "Acides Aminés",
    stock: true,
    icon: <Pill size={44} className="text-accent" />,
  },
  {
    name: "L-Glutamine",
    desc: "Acide aminé essentiel pour le système immunitaire et la réparation des tissus musculaires.",
    price: "3 200 DA",
    category: "Acides Aminés",
    stock: true,
    icon: <Dna size={44} className="text-accent" />,
  },
  {
    name: "Créatine Monohydrate",
    desc: "Augmentez votre force et vos performances avec la créatine monohydrate pure et micronisée.",
    price: "3 800 DA",
    category: "Performance",
    stock: true,
    icon: <Zap size={44} className="text-accent" />,
  },
  {
    name: "Pre-Workout Extreme",
    desc: "Formule concentrée avec caféine et bêta-alanine pour des entraînements intenses et explosifs.",
    price: "5 200 DA",
    category: "Performance",
    stock: false,
    icon: <Flame size={44} className="text-accent" />,
  },
  {
    name: "Multivitamines Sport",
    desc: "Complexe complet de vitamines et minéraux formulé pour les sportifs actifs.",
    price: "2 800 DA",
    category: "Vitamines",
    stock: true,
    icon: <Sparkles size={44} className="text-accent" />,
  },
  {
    name: "Oméga-3 Fish Oil",
    desc: "Acides gras essentiels pour la santé cardiovasculaire et la récupération articulaire.",
    price: "3 000 DA",
    category: "Vitamines",
    stock: true,
    icon: <Fish size={44} className="text-accent" />,
  },
  {
    name: "Barres Protéinées (x12)",
    desc: "Pack de 12 barres riches en protéines, parfaites comme collation post-entraînement.",
    price: "4 200 DA",
    category: "Snacks",
    stock: true,
    icon: <Cookie size={44} className="text-accent" />,
  },
];

export default function ProduitsPage() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [productList, setProductList] = useState<ProductUIItem[]>(defaultProducts);

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
            icon: categoryIcons[item.category] || <Package size={44} className="text-accent" />,
          }));
          setProductList(mapped);
          return;
        }
      }

      // Check localStorage for admin edits
      try {
        const saved = localStorage.getItem("tlenorgym_admin_products");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) {
            const mapped: ProductUIItem[] = parsed.map((item: { name: string; desc?: string; price: string; category: string; stock?: boolean }) => ({
              name: item.name,
              desc: item.desc || "Supplément de qualité supérieure disponible à la salle.",
              price: item.price,
              category: item.category,
              stock: item.stock ?? true,
              icon: categoryIcons[item.category] || <Package size={44} className="text-accent" />,
            }));
            setProductList(mapped);
          }
        }
      } catch {
        // fallback
      }
    }
    loadData();
  }, []);

  const filtered =
    activeCategory === "Tous"
      ? productList
      : productList.filter((p) => p.category === activeCategory);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="section-label">Boutique</span>
          <h1 className="page-header__title">
            Compléments <span className="text-accent">Alimentaires</span>
          </h1>
          <p className="page-header__desc">
            Sélection de suppléments de qualité disponibles directement à la
            salle. Commandez via WhatsApp et récupérez à Tlénor Gym.
          </p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${activeCategory === cat ? "filter-btn--active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="products__grid">
            {filtered.map((product, i) => (
              <ScrollReveal key={product.name} delay={i * 80}>
                <div className="product-card" style={{ opacity: product.stock ? 1 : 0.7 }}>
                  <div
                    className="product-card__image"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "linear-gradient(135deg, var(--color-surface) 0%, var(--color-bg) 100%)",
                      padding: "2.5rem",
                      position: "relative",
                    }}
                  >
                    {product.icon}
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
                      <a
                        href={
                          product.stock
                            ? `https://wa.me/213552089293?text=Bonjour, je suis intéressé par ${product.name} à ${product.price}`
                            : `https://wa.me/213552089293?text=Bonjour, je souhaite réserver ${product.name} lors du réapprovisionnement`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn ${product.stock ? "btn--whatsapp" : "btn--outline"} btn--sm`}
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                      >
                        <MessageSquare size={14} /> {product.stock ? "Commander" : "Réserver"}
                      </a>
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
