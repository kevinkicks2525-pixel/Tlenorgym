import ScrollReveal from "./ScrollReveal";
import { MapPin, Smartphone, Phone, Clock, ExternalLink } from "lucide-react";

const InstagramIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function ContactSection() {
  const mapUrl = "https://maps.app.goo.gl/nDvmtvg9Pu5adGTd6";

  return (
    <section className="section" id="contact" style={{ background: "var(--color-bg-alt)" }}>
      <div className="container">
        <ScrollReveal>
          <div style={{ textAlign: "center", marginBottom: "var(--space-3xl)" }}>
            <span className="section-label">Contact</span>
            <h2 className="section-title">
              Venez nous <span className="text-accent">rencontrer</span>
            </h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Passez nous voir à Draria ou contactez-nous pour toute question.
            </p>
          </div>
        </ScrollReveal>

        <div className="contact__grid">
          <ScrollReveal variant="left">
            <div className="contact__info">
              <a 
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact__item contact__item--link"
              >
                <div className="contact__item-icon">
                  <MapPin size={22} className="text-accent" />
                </div>
                <div className="contact__item-text">
                  <h4>Adresse</h4>
                  <p style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                    Les 2 Oliviers, Draria, Alger <ExternalLink size={14} style={{ opacity: 0.7 }} />
                  </p>
                </div>
              </a>

              <div className="contact__item">
                <div className="contact__item-icon">
                  <Smartphone size={22} className="text-accent" />
                </div>
                <div className="contact__item-text">
                  <h4>Mobile</h4>
                  <a href="tel:0552089293">0552 08 92 93</a>
                </div>
              </div>

              <div className="contact__item">
                <div className="contact__item-icon">
                  <Phone size={22} className="text-accent" />
                </div>
                <div className="contact__item-text">
                  <h4>Téléphone Fixe</h4>
                  <a href="tel:023337842">023 33 78 42</a>
                </div>
              </div>

              <div className="contact__item">
                <div className="contact__item-icon">
                  <InstagramIcon size={22} />
                </div>
                <div className="contact__item-text">
                  <h4>Réseaux Sociaux</h4>
                  <a
                    href="https://www.instagram.com/tlenor_gym/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @tlenor_gym sur Instagram
                  </a>
                </div>
              </div>

              <div className="contact__item">
                <div className="contact__item-icon">
                  <Clock size={22} className="text-accent" />
                </div>
                <div className="contact__item-text">
                  <h4>Horaires d&apos;ouverture</h4>
                  <p>Lun - Ven : 7h - 22h</p>
                  <p>Samedi : 8h - 20h</p>
                  <p>Dimanche : 9h - 18h</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="right">
            <div className="contact__map-wrapper" style={{ position: "relative", height: "100%", minHeight: "380px", borderRadius: "var(--radius-xl)", overflow: "hidden", border: "1px solid var(--color-border)" }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3198.8145100000003!2d3.0059909!3d36.7066093!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128faf2c94380eb9%3A0xb214878a8ca3eb70!2sTlenorgym%20draria!5e0!3m2!1sfr!2sdz!4v1700000000000!5m2!1sfr!2sdz"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Tlénor Gym - Localisation Google Maps"
                style={{ width: "100%", height: "100%", border: 0, minHeight: "380px" }}
              />
              <a 
                href={mapUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn--primary btn--sm" 
                style={{ 
                  position: "absolute", 
                  bottom: "16px", 
                  right: "16px", 
                  zIndex: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
                }}
              >
                <MapPin size={16} /> Ouvrir dans Google Maps <ExternalLink size={14} />
              </a>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
