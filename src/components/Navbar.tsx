"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/produits", label: "Produits" },
  { href: "/coaching", label: "Coaching" },
  { href: "/abonnements", label: "Abonnements" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`} id="main-nav">
      <div className="navbar__inner">
        <Link href="/" className="navbar__logo">
          <Image
            src="/images/logo.png"
            alt="Tlénor Gym Logo"
            width={44}
            height={44}
            className="navbar__logo-img"
            priority
          />
          <span>
            TLÉNOR <span className="text-accent">GYM</span>
          </span>
        </Link>

        <div className="navbar__links">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`navbar__link ${pathname === link.href ? "navbar__link--active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar__cta">
          <a href="tel:0552089293" className="btn btn--primary btn--sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <Phone size={16} /> Appelez-nous
          </a>
        </div>

        <button
          className={`navbar__hamburger ${mobileOpen ? "navbar__hamburger--open" : ""}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
          id="mobile-menu-toggle"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`navbar__mobile ${mobileOpen ? "navbar__mobile--open" : ""}`}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="navbar__mobile-link"
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <a href="tel:0552089293" className="btn btn--primary btn--lg" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          <Phone size={18} /> Appelez-nous
        </a>
      </div>
    </nav>
  );
}
