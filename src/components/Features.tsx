import ScrollReveal from "./ScrollReveal";
import { Dumbbell, UserCheck, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: <Dumbbell size={28} className="text-accent" />,
    title: "Équipement TechnoGym",
    desc: "Machines professionnelles de dernière génération pour un entraînement optimal et sécurisé.",
  },
  {
    icon: <UserCheck size={28} className="text-accent" />,
    title: "Coaching Expert",
    desc: "Coachs certifiés disponibles pour des programmes personnalisés adaptés à vos objectifs.",
  },
  {
    icon: <Shield size={28} className="text-accent" />,
    title: "Studio de Combat",
    desc: "Espace dédié au boxing et aux arts martiaux avec équipement Venum professionnel.",
  },
  {
    icon: <Zap size={28} className="text-accent" />,
    title: "Ambiance Motivante",
    desc: "Communauté active de passionnés, musique énergisante et cadre moderne pour vous pousser.",
  },
];

export default function Features() {
  return (
    <section className="section" id="features" style={{ background: "var(--color-bg-alt)" }}>
      <div className="container">
        <ScrollReveal>
          <div style={{ textAlign: "center", marginBottom: "var(--space-3xl)" }}>
            <span className="section-label">Nos Atouts</span>
            <h2 className="section-title">
              Pourquoi choisir <span className="text-accent">Tlénor Gym</span>
            </h2>
            <p
              className="section-subtitle"
              style={{ margin: "0 auto" }}
            >
              Un équipement de classe mondiale, des coachs passionnés et un environnement qui vous pousse à donner le meilleur.
            </p>
          </div>
        </ScrollReveal>

        <div className="features__grid">
          {features.map((f, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="feature-card">
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
