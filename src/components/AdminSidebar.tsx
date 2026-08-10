"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  BarChart3, 
  ShoppingBag, 
  Package, 
  FolderTree, 
  Sliders, 
  Image as ImageIcon, 
  ArrowLeft,
  LogOut,
  ChevronRight,
  Sparkles,
  Layers,
  Activity
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: "analytics" | "orders" | "products" | "categories" | "stock" | "optimize";
  setActiveTab: (tab: "analytics" | "orders" | "products" | "categories" | "stock" | "optimize") => void;
  onLogout: () => void;
  ordersCount: number;
  newOrdersCount: number;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  onLogout,
  ordersCount,
  newOrdersCount,
}: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const groups = [
    {
      title: "PRINCIPAL",
      items: [
        {
          id: "analytics",
          label: "Tableau de Bord & Analytics",
          icon: <BarChart3 size={18} />,
        },
        {
          id: "orders",
          label: "Commandes & Livraisons",
          icon: <ShoppingBag size={18} />,
          badge: newOrdersCount > 0 ? `${newOrdersCount} nouvelle${newOrdersCount > 1 ? "s" : ""}` : undefined,
        },
      ],
    },
    {
      title: "BOUTIQUE & STOCKS",
      items: [
        {
          id: "products",
          label: "Catalogue Produits",
          icon: <Package size={18} />,
        },
        {
          id: "categories",
          label: "Catégories",
          icon: <FolderTree size={18} />,
        },
        {
          id: "stock",
          label: "Gestion des Stocks",
          icon: <Sliders size={18} />,
        },
      ],
    },
    {
      title: "OUTILS & PERFORMANCE",
      items: [
        {
          id: "optimize",
          label: "Optimisation Images (Auto-WebP)",
          icon: <ImageIcon size={18} />,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Sidebar Toggle Header */}
      <div
        style={{
          display: "none",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem",
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          position: "sticky",
          top: 0,
          zIndex: 999,
        }}
        className="admin-mobile-header"
      >
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem" }}>
          Backoffice <span className="text-accent">Tlénor Gym</span>
        </span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="btn btn--outline btn--sm"
          style={{ padding: "6px 12px" }}
        >
          Menu Admin
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        style={{
          width: "280px",
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          position: "sticky",
          top: 0,
          flexShrink: 0,
          zIndex: 100,
        }}
        className={`admin-sidebar ${mobileOpen ? "admin-sidebar--open" : ""}`}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: "1.75rem 1.5rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "1.25rem" }}>
              TLÉNOR <span className="text-accent">GYM</span>
            </span>
            <span style={{ fontSize: "0.65rem", background: "var(--color-accent-dim)", color: "var(--color-accent)", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
              ADMIN PRO
            </span>
          </div>

          <Link
            href="/"
            className="btn btn--ghost btn--sm"
            style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem", fontSize: "0.8rem", color: "var(--color-text-secondary)" }}
          >
            <ArrowLeft size={14} /> Aller au Site Public
          </Link>
        </div>

        {/* Navigation Groups */}
        <div style={{ flex: 1, padding: "1.5rem 1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          {groups.map((group, idx) => (
            <div key={idx}>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.12em",
                  paddingLeft: "0.75rem",
                  marginBottom: "0.5rem",
                  display: "block",
                }}
              >
                {group.title}
              </span>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setMobileOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: "var(--radius-md)",
                        background: isActive ? "var(--color-accent)" : "transparent",
                        color: isActive ? "#0a0a0a" : "var(--color-text-secondary)",
                        fontWeight: isActive ? 700 : 500,
                        fontSize: "0.88rem",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {item.icon}
                        <span>{item.label}</span>
                      </div>

                      {item.badge ? (
                        <span
                          style={{
                            background: isActive ? "#0a0a0a" : "var(--color-red)",
                            color: "#fff",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: "10px",
                          }}
                        >
                          {item.badge}
                        </span>
                      ) : (
                        isActive && <ChevronRight size={14} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Logout */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-bg)",
          }}
        >
          <button
            onClick={onLogout}
            className="btn btn--outline btn--sm"
            style={{ width: "100%", justifyContent: "center", gap: "0.5rem", color: "var(--color-red)", borderColor: "rgba(230, 57, 70, 0.3)" }}
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
