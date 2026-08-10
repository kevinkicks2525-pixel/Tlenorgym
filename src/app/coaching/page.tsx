import Image from "next/image";
import ScrollReveal from "@/components/ScrollReveal";
import type { Metadata } from "next";
import { Dumbbell, Flame, Shield, Zap, Target, Phone, ArrowRight, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Coaching Personnalisé | Tlénor Gym",
  description:
    "Programmes de coaching sur mesure : musculation, perte de poids, boxe et remise en forme. Coachs certifiés à Draria, Alger.",
};

const programs = [
  {
    icon: <Dumbbell size={32} className="text-accent" />,
    title: "Musculation & Prise de Masse",
    desc: "Programme structuré pour développer votre masse musculaire avec des exercices ciblés et une progression adaptée à votre niveau.",
  },
  {
    icon: <Flame size={32} className="text-accent" />,
    title: "Perte de Poids & Sèche",
    desc: "Combinaison de cardio HIIT et de musculation pour brûler les graisses efficacement tout en préservant votre masse musculaire.",
  },
  {
    icon: <Shield size={32} className="text-accent" />,
    title: "Boxe & Combat",
    desc: "Entraînement de boxe avec équipement Venum professionnel. Technique, cardio et défoulement dans notre studio dédié.",
  },
  {
    icon: <Zap size={32} className="text-accent" />,
    title: "Remise en Forme",
    desc: "Programme progressif pour reprendre le sport en douceur. Adapté aux débutants avec un accompagnement bienveillant.",
  },
];

const advantages = [
  {
    title: "Évaluation Initiale",
    desc: "Bilan physique complet pour définir vos objectifs et créer un programme 100% personnalisé.",
  },
  {
    title: "Suivi Régulier",
    desc: "Points de contrôle hebdomadaires pour ajuster votre programme et maintenir votre progression.",
  },
  {
    title: "Conseils Nutrition",
    desc: "Plan alimentaire adapté à vos objectifs pour maximiser les résultats de votre entraînement.",
  },
  {
    title: "Résultats Garantis",
    desc: "Des coachs expérimentés qui s'engagent sur vos résultats avec un suivi constant et motivant.",
  },
];

export default function CoachingPage() {
  return (
    <>
      {/* Hero */}
      <div className="coaching-hero">
        <div className="coaching-hero__bg">
          <Image
            src="/images/studio-boxing.jpg"
            alt="Studio de coaching Tlénor Gym"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="coaching-hero__overlay" />
        <div className="coaching-hero__content container">
          <ScrollReveal>
            <span className="section-label">Coaching</span>
            <h1
              className="section-title"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", textTransform: "uppercase" }}
            >
              Coaching <span className="text-accent">Personnalisé</span>
            </h1>
            <p className="section-subtitle" style={{ maxWidth: "600px" }}>
              Des programmes sur mesure conçus par nos coachs certifiés pour
              vous accompagner vers vos objectifs, quel que soit votre niveau.
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Programs */}
      <section className="section">
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: "var(--space-3xl)" }}>
              <span className="section-label">Programmes</span>
              <h2 className="section-title">
                Nos <span className="text-accent">Programmes</span>
              </h2>
              <p className="section-subtitle" style={{ margin: "0 auto" }}>
                Choisissez le programme qui correspond à vos objectifs.
                Chaque programme est adapté et personnalisé selon votre profil.
              </p>
            </div>
          </ScrollReveal>

          <div className="programs__grid">
            {programs.map((prog, i) => (
              <ScrollReveal key={i} delay={i * 120}>
                <div className="program-card">
                  <div className="program-card__icon">{prog.icon}</div>
                  <h3 className="program-card__title">{prog.title}</h3>
                  <p className="program-card__desc">{prog.desc}</p>
                  <a
                    href={`https://wa.me/213552089293?text=Bonjour, je suis intéressé par le programme ${prog.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--outline btn--sm"
                    style={{ alignSelf: "flex-start", marginTop: "auto", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                  >
                    En savoir plus <ArrowRight size={14} />
                  </a>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="section" style={{ background: "var(--color-bg-alt)" }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: "var(--space-3xl)" }}>
              <span className="section-label">Avantages</span>
              <h2 className="section-title">
                Pourquoi choisir notre <span className="text-accent">coaching</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="programs__grid">
            {advantages.map((adv, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="advantage-card">
                  <span className="advantage-card__number">0{i + 1}</span>
                  <div>
                    <h3 className="advantage-card__title">{adv.title}</h3>
                    <p className="advantage-card__desc">{adv.desc}</p>
                  </div>
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
              Prêt à <span className="text-accent">transformer</span> votre corps ?
            </h2>
            <p className="cta-section__desc">
              Réservez votre première séance d&apos;essai gratuite et découvrez
              notre approche personnalisée.
            </p>
            <div style={{ display: "flex", gap: "var(--space-md)", justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="https://wa.me/213552089293?text=Bonjour, je souhaite réserver une séance d'essai de coaching"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary btn--lg"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Target size={18} /> Séance d&apos;essai gratuite
              </a>
              <a href="tel:0552089293" className="btn btn--outline btn--lg" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <Phone size={18} /> 0552 08 92 93
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
