"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Features from "@/components/Features";
import Gallery from "@/components/Gallery";
import Planning from "@/components/Planning";
import ContactSection from "@/components/ContactSection";
import ScrollReveal from "@/components/ScrollReveal";
import Link from "next/link";
import { Milk, Pill, Zap, MessageSquare, ArrowRight, Package } from "lucide-react";
import { getSupabaseProducts, isSupabaseConfigured } from "@/lib/supabase";

import CheckoutModal from "@/components/CheckoutModal";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [selectedCheckoutProduct, setSelectedCheckoutProduct] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      if (isSupabaseConfigured) {
        const supaData = await getSupabaseProducts();
        if (supaData && supaData.length > 0) {
          setFeaturedProducts(supaData.slice(0, 3));
          return;
        }
      }
      try {
        const saved = localStorage.getItem("tlenorgym_admin_products");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFeaturedProducts(parsed.slice(0, 3));
            return;
          }
        }
      } catch {
        // fallback
      }
      setFeaturedProducts([]);
    }
    loadData();
  }, []);

  return (
    <>
      {selectedCheckoutProduct && (
        <CheckoutModal
          product={selectedCheckoutProduct}
          onClose={() => setSelectedCheckoutProduct(null)}
        />
      )}
      <Hero />
      <About />
      <Features />
      <Gallery />
      <Planning />

      {/* Products Preview */}
      <section className="section" style={{ background: "var(--color-bg-alt)" }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: "var(--space-3xl)" }}>
              <span className="section-label">Nutrition</span>
              <h2 className="section-title">
                Compléments <span className="text-accent">Alimentaires</span>
              </h2>
              <p className="section-subtitle" style={{ margin: "0 auto" }}>
                Boostez vos résultats avec notre sélection de suppléments de qualité,
                disponibles directement à la salle.
              </p>
            </div>
          </ScrollReveal>

          {featuredProducts.length > 0 ? (
            <div className="products__grid">
              {featuredProducts.map((product, i) => (
                <ScrollReveal key={i} delay={i * 120}>
                  <div className="product-card">
                    <div
                      className="product-card__image"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, var(--color-surface) 0%, var(--color-bg) 100%)",
                        padding: "2rem",
                        position: "relative",
                      }}
                    >
                      {product.image && typeof product.image === "string" && (product.image.startsWith("http") || product.image.startsWith("data:")) ? (
                        <img src={product.image} alt={product.name} style={{ maxHeight: "100px", objectFit: "contain" }} />
                      ) : (
                        <Package size={44} className="text-accent" />
                      )}
                      <span className="product-card__category">{product.category || "Produit"}</span>
                    </div>
                    <div className="product-card__body">
                      <h3 className="product-card__name">{product.name}</h3>
                      <p className="product-card__desc">{product.desc || product.description || "Disponible sur place"}</p>
                      <div className="product-card__footer">
                        <span className="product-card__price">{product.price}</span>
                        <button
                          onClick={() => setSelectedCheckoutProduct(product)}
                          className="btn btn--primary btn--sm"
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                        >
                          <MessageSquare size={14} /> Commander
                        </button>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>
              <p style={{ fontSize: "1.1rem" }}>Nos suppléments et produits de nutrition seront bientôt disponibles.</p>
            </div>
          )}

          <ScrollReveal>
            <div style={{ textAlign: "center", marginTop: "var(--space-3xl)" }}>
              <Link href="/produits" className="btn btn--outline" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                Voir la boutique produits <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Coaching Preview */}
      <section className="section">
        <div className="container">
          <div className="about__grid">
            <div className="about__content">
              <span className="section-label">Coaching</span>
              <h2 className="section-title">
                Coaching <span className="text-accent">Personnalisé</span>
              </h2>
              <p className="section-subtitle">
                Nos coachs certifiés créent des programmes sur mesure adaptés à
                vos objectifs : prise de masse, perte de poids, préparation
                physique ou remise en forme.
              </p>
              <p className="section-subtitle">
                Bénéficiez d&apos;un suivi individuel, de conseils nutritionnels
                et d&apos;une motivation constante pour transformer votre corps.
              </p>
              <div style={{ display: "flex", gap: "var(--space-md)", marginTop: "var(--space-md)", flexWrap: "wrap" }}>
                <Link href="/coaching" className="btn btn--primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                  Découvrir nos programmes <ArrowRight size={16} />
                </Link>
                <a
                  href="https://wa.me/213552089293?text=Bonjour, je suis intéressé par le coaching personnalisé"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--whatsapp"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <MessageSquare size={16} /> WhatsApp
                </a>
              </div>
            </div>

            <div className="about__image-wrapper" style={{ aspectRatio: "4/3" }}>
              <img
                src="/images/studio-boxing.jpg"
                alt="Studio de coaching Tlénor Gym"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="section" style={{ background: "var(--color-bg-alt)" }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: "var(--space-3xl)" }}>
              <span className="section-label">Abonnements</span>
              <h2 className="section-title">
                Nos Formules <span className="text-accent">Tarifaires</span>
              </h2>
              <p className="section-subtitle" style={{ margin: "0 auto" }}>
                Des formules flexibles selon vos objectifs. Équipements TechnoGym de pointe à Draria.
              </p>
            </div>
          </ScrollReveal>

          <div className="pricing__grid">
            {[
              {
                name: "Musculation Illimitée",
                price: "6 000",
                period: "DA / mois",
                desc: "Musculation accès libre",
                features: [
                  "Accès libre plateau Musculation",
                  "Toutes les machines TechnoGym",
                  "Vestiaires & Douches",
                  "Remise étudiants disponible",
                ],
                featured: false,
              },
              {
                name: "Cardio + Musculation",
                price: "8 000",
                period: "DA / mois",
                desc: "Accès illimité Cardio & Muscu",
                features: [
                  "Accès illimité Cardio & Musculation",
                  "307 DA / séance calculé",
                  "Espace Cardio TechnoGym complet",
                  "Coaching d'orientation inclus",
                  "Vestiaires & Douches",
                ],
                featured: true,
                badge: "Populaire",
              },
              {
                name: "Séance Libre",
                price: "1 000",
                period: "DA / séance",
                desc: "Session libre de 1h30",
                features: [
                  "1 séance de 1h30",
                  "Accès Cardio & Musculation",
                  "Vestiaires & Douches",
                  "Sans engagement",
                ],
                featured: false,
              },
            ].map((plan, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div
                  className={`pricing-card ${plan.featured ? "pricing-card--featured" : ""}`}
                >
                  {plan.featured && (
                    <span className="pricing-card__badge">{plan.badge}</span>
                  )}
                  <h3 className="pricing-card__name">{plan.name}</h3>
                  <p className="pricing-card__desc">{plan.desc}</p>
                  <div className="pricing-card__price">
                    {plan.price} <span>{plan.period}</span>
                  </div>
                  <div className="pricing-card__features">
                    {plan.features.map((f, j) => (
                      <div key={j} className="pricing-card__feature">
                        {f}
                      </div>
                    ))}
                  </div>
                  <a
                    href={`https://wa.me/213552089293?text=Bonjour, je suis intéressé par l'abonnement ${plan.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn ${plan.featured ? "btn--primary" : "btn--outline"}`}
                    style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                  >
                    S&apos;inscrire maintenant <ArrowRight size={16} />
                  </a>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div style={{ textAlign: "center", marginTop: "var(--space-3xl)" }}>
              <Link href="/abonnements" className="btn btn--outline" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                Voir la grille des tarifs complète <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <ContactSection />
    </>
  );
}
