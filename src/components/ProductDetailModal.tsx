"use client";

import { useState } from "react";
import { X, ShoppingBag, Check, Plus, Minus, Package, Sparkles, MessageSquare } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CheckoutModal from "@/components/CheckoutModal";

interface ProductDetailModalProps {
  product: {
    id?: number | string;
    name: string;
    price: string;
    category?: string;
    desc?: string;
    description?: string;
    stock?: boolean;
    stock_quantity?: number;
    image?: string;
  };
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);

  const isAvailable = product.stock_quantity !== undefined ? product.stock_quantity > 0 : product.stock ?? true;
  const stockCount = product.stock_quantity ?? (product.stock ? 10 : 0);
  const productDesc = product.desc || product.description || "Supplément nutritionnel de qualité supérieure disponible à Tlénor Gym.";

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  const handleDirectCheckout = () => {
    setShowCheckout(true);
  };

  if (showCheckout) {
    return (
      <CheckoutModal
        product={product}
        onClose={() => {
          setShowCheckout(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          maxWidth: "700px",
          width: "100%",
          padding: "2rem",
          position: "relative",
          boxShadow: "0 25px 60px rgba(0,0,0,0.9)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "rgba(255,255,255,0.05)",
            border: "none",
            color: "#fff",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", alignItems: "center" }}>
          {/* Image Left */}
          <div
            style={{
              background: "linear-gradient(135deg, var(--color-bg-alt) 0%, var(--color-bg) 100%)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "260px",
              position: "relative",
            }}
          >
            {product.image && (product.image.startsWith("http") || product.image.startsWith("data:")) ? (
              <img
                src={product.image}
                alt={product.name}
                style={{ maxHeight: "220px", maxWidth: "100%", objectFit: "contain", filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.6))" }}
              />
            ) : (
              <Package size={80} className="text-accent" style={{ opacity: 0.8 }} />
            )}
            <span style={{ position: "absolute", top: "12px", left: "12px", background: "var(--color-accent-dim)", color: "var(--color-accent)", border: "1px solid var(--color-accent)", fontSize: "0.75rem", fontWeight: 700, padding: "4px 10px", borderRadius: "12px" }}>
              {product.category || "Boutique"}
            </span>
          </div>

          {/* Info Right */}
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
              Tlénor Gym Nutrition
            </span>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", marginTop: "0.25rem", marginBottom: "0.5rem" }}>
              {product.name}
            </h2>

            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--color-accent)", marginBottom: "1rem" }}>
              {product.price}
            </div>

            {/* Stock Badge */}
            <div style={{ marginBottom: "1.25rem" }}>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  padding: "4px 12px",
                  borderRadius: "12px",
                  background: isAvailable ? "rgba(37, 211, 102, 0.15)" : "rgba(230, 57, 70, 0.15)",
                  color: isAvailable ? "#25d366" : "var(--color-red)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                {isAvailable ? `✓ En Stock (${stockCount} disponible${stockCount > 1 ? "s" : ""})` : "Rupture de Stock"}
              </span>
            </div>

            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              {productDesc}
            </p>

            {/* Quantity Selector */}
            {isAvailable && (
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>
                  Quantité
                </label>
                <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", background: "var(--color-bg)" }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ background: "none", border: "none", color: "#fff", padding: "8px 14px", cursor: "pointer" }}
                  >
                    <Minus size={16} />
                  </button>
                  <span style={{ fontSize: "1rem", fontWeight: 700, padding: "0 12px" }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(stockCount, quantity + 1))}
                    style={{ background: "none", border: "none", color: "#fff", padding: "8px 14px", cursor: "pointer" }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons (Ajouter au Panier & Commander Maintenant) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {isAvailable ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="btn btn--primary btn--lg"
                    style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <ShoppingBag size={18} /> Ajouter au Panier
                  </button>
                  <button
                    onClick={handleDirectCheckout}
                    className="btn btn--outline btn--lg"
                    style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <MessageSquare size={18} /> Commander Maintenant
                  </button>
                </>
              ) : (
                <button disabled className="btn btn--outline btn--lg" style={{ width: "100%", justifyContent: "center", opacity: 0.5 }}>
                  Produit Indisponible
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
