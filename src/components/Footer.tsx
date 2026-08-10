import Link from "next/link";
import { MapPin, Smartphone, Phone } from "lucide-react";

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

export default function Footer() {
  const mapUrl = "https://maps.app.goo.gl/nDvmtvg9Pu5adGTd6";

  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div>
            <div className="navbar__logo" style={{ marginBottom: "0" }}>
              <span style={{ fontSize: "1.5rem" }}>
                TLÉNOR <span className="text-accent">GYM</span>
              </span>
            </div>
            <p className="footer__brand-desc">
              The Power To Build Your Body. Salle de sport premium à Draria,
              équipée de machines TechnoGym professionnelles. Rejoignez-nous
              pour transformer votre physique.
            </p>
            <div className="contact__socials" style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
              <a
                href="https://www.instagram.com/tlenor_gym/"
                target="_blank"
                rel="noopener noreferrer"
                className="contact__social-link"
                aria-label="Instagram"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href="https://www.facebook.com/tlenorgym"
                target="_blank"
                rel="noopener noreferrer"
                className="contact__social-link"
                aria-label="Facebook"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                <FacebookIcon size={18} />
              </a>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact__social-link"
                aria-label="Google Maps"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                <MapPin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer__col-title">Navigation</h4>
            <div className="footer__links">
              <Link href="/" className="footer__link">Accueil</Link>
              <Link href="/produits" className="footer__link">Produits</Link>
              <Link href="/coaching" className="footer__link">Coaching</Link>
              <Link href="/abonnements" className="footer__link">Abonnements</Link>
            </div>
          </div>

          {/* Horaires */}
          <div>
            <h4 className="footer__col-title">Horaires</h4>
            <div className="footer__links">
              <span className="footer__link">Lun - Ven : 7h - 22h</span>
              <span className="footer__link">Samedi : 8h - 20h</span>
              <span className="footer__link">Dimanche : 9h - 18h</span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer__col-title">Contact</h4>
            <div className="footer__links">
              <a href="tel:0552089293" className="footer__link" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <Smartphone size={16} className="text-accent" /> 0552 08 92 93
              </a>
              <a href="tel:023337842" className="footer__link" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <Phone size={16} className="text-accent" /> 023 33 78 42
              </a>
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="footer__link" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <MapPin size={16} className="text-accent" /> Les 2 Oliviers, Draria
              </a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Tlénor Gym. Tous droits réservés.</span>
          <span>The Power To Build Your Body</span>
        </div>
      </div>
    </footer>
  );
}
