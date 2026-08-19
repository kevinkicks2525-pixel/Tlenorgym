"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Phone, X, Menu } from "lucide-react";

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

  return (
    <nav
      className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}
      id="main-nav"
    >
      <div
        className="navbar__inner"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* Brand Logo */}
        <Link
          href="/"
          className="navbar__logo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <Image
            src="/images/logo.png"
            alt="Tlénor Gym Logo"
            width={38}
            height={38}
            className="navbar__logo-img"
            priority
          />
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 900,
              fontSize: "1.2rem",
              color: "#fff",
              whiteSpace: "nowrap",
            }}
          >
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

      {/* Mobile Top-Down Dropdown Menu (Style CD Project) */}
      {mobileOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            background: "#0a0a0a",
            borderBottom: "2px solid var(--color-accent)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.95)",
            padding: "1.5rem 1.25rem 2rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            zIndex: 999999,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-heading)",
                  color: pathname === link.href ? "var(--color-accent)" : "#ffffff",
                  textDecoration: "none",
                  padding: "0.6rem 0.5rem",
                  borderRadius: "6px",
                  background: pathname === link.href ? "rgba(245, 197, 24, 0.08)" : "transparent",
                  display: "block",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div style={{ paddingTop: "0.75rem", borderTop: "1px solid var(--color-border)" }}>
            <a
              href="tel:0552089293"
              className="btn btn--primary btn--md"
              style={{
                width: "100%",
                justifyContent: "center",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: 700,
              }}
            >
              <Phone size={16} /> Appelez-nous (0552 08 92 93)
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
