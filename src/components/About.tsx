"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="about__stat-number">
      {count}
      {suffix}
    </span>
  );
}

export default function About() {
  return (
    <section className="about section" id="about">
      <div className="container">
        <div className="about__grid">
          <div className="about__image-wrapper">
            <Image
              src="/images/gym-interior.jpg"
              alt="Intérieur Tlénor Gym"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
            />
            <div className="about__image-accent" />
          </div>

          <div className="about__content">
            <span className="section-label">À Propos</span>
            <h2 className="section-title">
              Plus qu&apos;une salle,{" "}
              <span className="text-accent">un mode de vie</span>
            </h2>
            <p className="section-subtitle">
              Tlénor Gym est une salle de sport premium située au cœur de
              Draria. Équipée exclusivement de machines TechnoGym de dernière
              génération, notre salle offre un environnement professionnel
              pour atteindre vos objectifs.
            </p>
            <p className="section-subtitle">
              Que vous soyez débutant ou athlète confirmé, nos coachs
              certifiés vous accompagnent avec des programmes sur mesure.
              Musculation, cardio et boxe tout est réuni sous un même toit.
            </p>
            <blockquote className="about__quote">
              &ldquo;If You Have A Body, You&apos;re An Athlete&rdquo;
            </blockquote>

            <div className="about__stats">
              <div className="about__stat">
                <AnimatedNumber target={8000} suffix="+" />
                <div className="about__stat-label">Followers</div>
              </div>
              <div className="about__stat">
                <AnimatedNumber target={50} suffix="+" />
                <div className="about__stat-label">Machines</div>
              </div>
              <div className="about__stat">
                <AnimatedNumber target={5} suffix="+" />
                <div className="about__stat-label">Coachs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
