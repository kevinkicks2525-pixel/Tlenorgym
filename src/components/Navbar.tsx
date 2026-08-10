"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Phone, X, Menu, Shield } from "lucide-react";

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
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`} id="main-nav">
      <div className="navbar__inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        {/* Brand Logo */}
        <Link href="/" className="navbar__logo" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none", flexShrink: 0 }}>
          <Image
            src="/images/logo.png"
            alt="Tlénor Gym Logo"
            width={38}
            height={38}
            className="navbar__logo-img"
            priority
          />
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "1.2rem", color: "#fff", whiteSpace: "nowrap" }}>
            TLÉNOR <span className="text-accent">GYM</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar__links" style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
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

        {/* Right CTA Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
          <a
            href="tel:0552089293"
            className="btn btn--primary btn--sm nav-phone-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", whiteSpace: "nowrap" }}
          >
            <Phone size={15} /> <span className="phone-text">Appelez-nous</span>
          </a>

          {/* Hamburger Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            className="navbar__hamburger"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "8px",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999999,
            background: "#0a0a0a",
            opacity: 1,
            display: "flex",
            flexDirection: "column",
            padding: "2rem 1.5rem",
            width: "100vw",
            height: "100vh",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "1.3rem" }}>
              TLÉNOR <span className="text-accent">GYM</span>
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "50%", padding: "8px", cursor: "pointer" }}
            >
              <X size={24} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", flex: 1 }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-heading)",
                  color: pathname === link.href ? "var(--color-accent)" : "#fff",
                  textDecoration: "none",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                marginTop: "1rem",
              }}
            >
              <Shield size={18} className="text-accent" /> Backoffice Administrateur
            </Link>
          </div>

          <div style={{ marginTop: "auto", paddingTop: "1.5rem" }}>
            <a
              href="tel:0552089293"
              className="btn btn--primary btn--lg"
              style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Phone size={18} /> Appelez-nous (0552 08 92 93)
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
