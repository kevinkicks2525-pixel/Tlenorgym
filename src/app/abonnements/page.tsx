"use client";

import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { Check, Sparkles, FileText, Tag, Eye, X, MessageSquare, Phone, ArrowRight, ShieldCheck } from "lucide-react";

const cardioMuscuPlans = [
  {
    name: "08 Séances",
    price: "5 000",
    unit: "DA / Mois",
    subtext: "625 DA / séance",
    features: ["Accès Cardio & Musculation", "8 Séances par mois", "Vestiaires & Douches"],
    featured: false,
  },
  {
    name: "12 Séances",
    price: "6 000",
    unit: "DA / Mois",
    subtext: "500 DA / séance",
    features: ["Accès Cardio & Musculation", "12 Séances par mois", "Vestiaires & Douches"],
    featured: false,
  },
  {
    name: "16 Séances",
    price: "7 000",
    unit: "DA / Mois",
    subtext: "437 DA / séance",
    features: ["Accès Cardio & Musculation", "16 Séances par mois", "Vestiaires & Douches"],
    featured: false,
  },
  {
    name: "Illimité",
    price: "8 000",
    unit: "DA / Mois",
    subtext: "307 DA / séance",
    features: ["Accès illimité Cardio & Musculation", "Toutes les machines TechnoGym", "Vestiaires & Douches"],
    featured: true,
    badge: "Populaire",
  },
];

const muscuPlans = [
  {
    name: "Muscu 08 Séances",
    price: "3 000",
    unit: "DA / Mois",
    features: ["Plateau Musculation", "8 Séances par mois", "Vestiaires & Douches"],
  },
  {
    name: "Muscu 12 Séances",
    price: "4 000",
    unit: "DA / Mois",
    features: ["Plateau Musculation", "12 Séances par mois", "Vestiaires & Douches"],
  },
  {
    name: "Muscu 16 Séances",
    price: "5 000",
    unit: "DA / Mois",
    features: ["Plateau Musculation", "16 Séances par mois", "Vestiaires & Douches"],
  },
  {
    name: "Muscu Illimité",
    price: "6 000",
    unit: "DA / Mois",
    features: ["Plateau Musculation illimité", "Accès à toutes les machines", "Vestiaires & Douches"],
  },
];

const promoDiscounts = [
  { text: "03 Mois Payé", benefit: "2 000 DA de remise" },
  { text: "06 Mois Payé", benefit: "01 Mois Offert" },
  { text: "12 Mois Payé", benefit: "04 Mois Offerts" },
  { text: "Tarif Étudiant", benefit: "Remise de 1 000 DA" },
];

const dossierItems = [
  "01 Photo d'identité",
  "Photocopie de la pièce d'identité",
  "Certificat Médical de bonne santé",
  "2 000 DA de frais d'inscription annuel",
  "Certificat de scolarité pour les étudiants",
];

const faqs = [
  {
    q: "Puis-je essayer avant de m'abonner ?",
    a: "Oui ! La séance libre est disponible à 1 000 DA (1h30). Vous pouvez aussi nous contacter sur WhatsApp.",
  },
  {
    q: "Quelles sont les réductions pour les engagements plus longs ?",
    a: "Profitez de 2 000 DA de remise pour 3 mois, 1 mois offert pour 6 mois, et 4 mois offerts pour 1 an d'engagement !",
  },
  {
    q: "Quels sont les documents requis pour l'inscription ?",
    a: "Il vous faut 1 photo, la photocopie de pièce d'identité, un certificat médical et 2 000 DA de frais annuels.",
  },
  {
    q: "Existe-t-il un tarif étudiant ?",
    a: "Oui ! Sur présentation de votre certificat de scolarité, vous bénéficiez d'une remise immédiate de 1 000 DA.",
  },
  {
    q: "Quels sont les horaires d'ouverture ?",
    a: "Du Lundi au Vendredi : 7h à 22h. Samedi : 8h à 20h. Dimanche : 9h à 18h.",
  },
];

export default function AbonnementsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="section-label">Tarifs Officiels</span>
          <h1 className="page-header__title">
            Nos <span className="text-accent">Abonnements</span>
          </h1>
          <p className="page-header__desc">
            Formules Cardio & Musculation adaptées à votre rythme et vos objectifs.
            Équipements TechnoGym professionnels à Draria.
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <button
              onClick={() => setModalOpen(true)}
              className="btn btn--primary btn--sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Eye size={16} /> Voir la Grille des Tarifs Officielle (Photo)
            </button>
          </div>
        </div>
      </div>

      {/* Promo Banner */}
      <section style={{ paddingBottom: "var(--space-xl)" }}>
        <div className="container">
          <ScrollReveal>
            <div
              style={{
                background: "linear-gradient(135deg, rgba(245, 197, 24, 0.12), rgba(10, 10, 10, 0.8))",
                border: "1px solid rgba(245, 197, 24, 0.3)",
                borderRadius: "var(--radius-xl)",
                padding: "var(--space-xl) var(--space-2xl)",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "var(--fs-lg)",
                  fontWeight: "var(--fw-bold)",
                  marginBottom: "var(--space-xs)",
                  color: "var(--color-accent)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Sparkles size={20} /> Séance Libre disponible à 1 000 DA (1h30)
              </p>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--fs-sm)", maxWidth: "700px", margin: "0 auto" }}>
                Testez nos installations et nos équipements TechnoGym sans engagement avant de choisir votre formule.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Cardio Musculation Section */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ marginBottom: "var(--space-2xl)" }}>
              <span className="section-label">Formules Combinées</span>
              <h2 className="section-title">
                Cardio <span className="text-accent">Musculation</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="pricing__grid">
            {cardioMuscuPlans.map((plan, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className={`pricing-card ${plan.featured ? "pricing-card--featured" : ""}`}>
                  {plan.badge && <span className="pricing-card__badge">{plan.badge}</span>}
                  <h3 className="pricing-card__name">{plan.name}</h3>
                  <p className="pricing-card__desc">{plan.subtext}</p>
                  <div className="pricing-card__price">
                    {plan.price} <span>{plan.unit}</span>
                  </div>
                  <div className="pricing-card__features">
                    {plan.features.map((f, j) => (
                      <div key={j} className="pricing-card__feature">
                        {f}
                      </div>
                    ))}
                  </div>
                  <a
                    href={`https://wa.me/213552089293?text=Bonjour, je souhaite m'inscrire à la formule Cardio Musculation ${plan.name} à ${plan.price} DA`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn ${plan.featured ? "btn--primary" : "btn--outline"}`}
                    style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                  >
                    S&apos;inscrire <ArrowRight size={16} />
                  </a>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Musculation Seule Section */}
      <section className="section" style={{ background: "var(--color-bg-alt)" }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ marginBottom: "var(--space-2xl)" }}>
              <span className="section-label">Musculation</span>
              <h2 className="section-title">
                Plateau <span className="text-accent">Musculation</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="pricing__grid">
            {muscuPlans.map((plan, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="pricing-card">
                  <h3 className="pricing-card__name">{plan.name}</h3>
                  <p className="pricing-card__desc">Musculation seule</p>
                  <div className="pricing-card__price">
                    {plan.price} <span>{plan.unit}</span>
                  </div>
                  <div className="pricing-card__features">
                    {plan.features.map((f, j) => (
                      <div key={j} className="pricing-card__feature">
                        {f}
                      </div>
                    ))}
                  </div>
                  <a
                    href={`https://wa.me/213552089293?text=Bonjour, je souhaite m'inscrire à la formule ${plan.name} à ${plan.price} DA`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--outline"
                    style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                  >
                    S&apos;inscrire <ArrowRight size={16} />
                  </a>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Promotions & Dossier Section */}
      <section className="section">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-2xl)" }}>
            {/* Reductions */}
            <ScrollReveal variant="left">
              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "var(--space-2xl)" }}>
                <span className="section-label" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                  <Tag size={16} /> Offres & Remises
                </span>
                <h3 className="section-title" style={{ fontSize: "var(--fs-2xl)" }}>
                  Promotions <span className="text-accent">Spéciales</span>
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
                  {promoDiscounts.map((promo, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                      <span style={{ fontWeight: 600, color: "var(--color-text)" }}>{promo.text}</span>
                      <span style={{ fontWeight: 700, color: "var(--color-accent)", background: "var(--color-accent-dim)", padding: "4px 10px", borderRadius: "12px", fontSize: "0.85rem" }}>
                        {promo.benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Dossier */}
            <ScrollReveal variant="right">
              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "var(--space-2xl)" }}>
                <span className="section-label" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                  <FileText size={16} /> Inscription
                </span>
                <h3 className="section-title" style={{ fontSize: "var(--fs-2xl)" }}>
                  Dossier <span className="text-accent">d&apos;Inscription</span>
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "1.5rem" }}>
                  {dossierItems.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "var(--fs-sm)", color: "var(--color-text-secondary)" }}>
                      <ShieldCheck size={18} className="text-accent" style={{ flexShrink: 0 }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ background: "var(--color-bg-alt)" }}>
        <div className="container container--narrow">
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: "var(--space-3xl)" }}>
              <span className="section-label">FAQ</span>
              <h2 className="section-title">
                Questions <span className="text-accent">Fréquentes</span>
              </h2>
            </div>
          </ScrollReveal>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-xl)",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "var(--fs-md)",
                      fontWeight: "var(--fw-semibold)",
                      marginBottom: "var(--space-sm)",
                    }}
                  >
                    {faq.q}
                  </h3>
                  <p
                    style={{
                      fontSize: "var(--fs-sm)",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.7,
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section section">
        <div className="container">
          <ScrollReveal>
            <h2 className="cta-section__title">
              Prêt à <span className="text-accent">commencer</span> ?
            </h2>
            <p className="cta-section__desc">
              Inscrivez-vous maintenant et commencez votre transformation dès
              aujourd&apos;hui.
            </p>
            <div style={{ display: "flex", gap: "var(--space-md)", justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="https://wa.me/213552089293?text=Bonjour, je souhaite m'inscrire à Tlénor Gym"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--whatsapp btn--lg"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <MessageSquare size={18} /> S&apos;inscrire via WhatsApp
              </a>
              <a href="tel:0552089293" className="btn btn--outline btn--lg" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <Phone size={18} /> 0552 08 92 93
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Official Tarif Flyer Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.9)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
          onClick={() => setModalOpen(false)}
        >
          <div style={{ position: "relative", maxWidth: "700px", width: "100%", maxHeight: "90vh", borderRadius: "16px", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                zIndex: 10,
                background: "rgba(0,0,0,0.7)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>
            <img
              src="/images/tarifs-official.jpg"
              alt="Grille Tarifaire Officielle Tlénor Gym"
              style={{ width: "100%", height: "auto", maxHeight: "85vh", objectFit: "contain", borderRadius: "16px" }}
            />
          </div>
        </div>
      )}
    </>
  );
}
