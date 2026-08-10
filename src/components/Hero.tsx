import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Dumbbell } from "lucide-react";

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero__bg">
        <Image
          src="/images/facade.jpg"
          alt="Tlénor Gym - Façade"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="hero__overlay" />
      <div className="hero__content">
        <h1 className="hero__title">
          <span>THE POWER</span>
          <span>TO <span className="highlight">BUILD</span></span>
          <span>YOUR BODY</span>
        </h1>
        <p className="hero__description">
          Équipement TechnoGym professionnel, coaching personnalisé et ambiance
          motivante. Rejoignez la communauté Tlénor Gym.
        </p>
        <div className="hero__buttons">
          <Link href="/abonnements" className="btn btn--primary btn--lg" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            Commencer Maintenant <ArrowRight size={18} />
          </Link>
          <a href="#about" className="btn btn--outline btn--lg" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <Dumbbell size={18} /> Découvrir la Salle
          </a>
        </div>
      </div>
      <div className="hero__scroll">
        <span>Scroll</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
}
