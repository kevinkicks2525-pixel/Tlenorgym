"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Phone, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

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
  const { totalItems, setIsCartOpen } = useCart();

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

        <div className="navbar__cta" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={() => setIsCartOpen(true)}
            className="btn btn--outline btn--sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", position: "relative" }}
            title="Voir le panier"
          >
            <ShoppingBag size={18} />
            <span style={{ display: "none" }}>Panier</span>
            {totalItems > 0 && (
              <span style={{ background: "var(--color-accent)", color: "#000", fontSize: "0.75rem", fontWeight: 900, borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {totalItems}
              </span>
            )}
          </button>
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
