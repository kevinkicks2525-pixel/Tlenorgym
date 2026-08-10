"use client";

import { useState, useMemo } from "react";
import { X, ShoppingBag, Trash2, Plus, Minus, Truck, Building, CheckCircle2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { wilayas, getDeliveryCost } from "@/data/delivery-data";
import communesData from "@/data/communes.json";
import { createSupabaseOrder, isSupabaseConfigured, OrderItemData } from "@/lib/supabase";

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal, totalItems, isCartOpen, setIsCartOpen } = useCart();

  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedWilayaCode, setSelectedWilayaCode] = useState("16"); // Default Alger
  const [selectedCommune, setSelectedCommune] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<"home" | "office">("home");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const currentWilaya = useMemo(() => {
    return wilayas.find((w) => w.code === selectedWilayaCode) || wilayas[15];
  }, [selectedWilayaCode]);

  const availableCommunes = useMemo(() => {
    const rawCommunes = (communesData as unknown as Record<string, Array<{ name: string }>>)[selectedWilayaCode] || [];
    return rawCommunes.map((c) => (typeof c === "string" ? c : c.name));
  }, [selectedWilayaCode]);

  const shippingCost = useMemo(() => {
    return cart.length > 0 ? getDeliveryCost(selectedWilayaCode, deliveryType) : 0;
  }, [selectedWilayaCode, deliveryType, cart.length]);

  const grandTotal = subtotal + shippingCost;

  if (!isCartOpen) return null;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      setErrorMsg("Veuillez remplir votre nom et numéro de téléphone.");
      return;
    }

    if (!selectedCommune) {
      setErrorMsg("Veuillez sélectionner votre commune.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const itemsSummary = cart.map((item) => `${item.quantity}x ${item.name} (${item.price})`).join(", ");

    const newOrder: OrderItemData = {
      id: Date.now(),
      customer_name: customerName,
      phone: phone,
      wilaya_code: selectedWilayaCode,
      wilaya_name: `${currentWilaya.code} - ${currentWilaya.nameFr}`,
      commune_name: selectedCommune,
      address: address || (deliveryType === "home" ? selectedCommune : "Bureau Yalidine / Stopdesk"),
      delivery_type: deliveryType,
      product_name: itemsSummary,
      product_price: `${subtotal.toLocaleString()} DA`,
      delivery_cost: shippingCost,
      total_amount: grandTotal,
      status: "Nouvelle",
      created_at: new Date().toISOString(),
    };

    // Save locally
    try {
      const saved = localStorage.getItem("tlenorgym_admin_orders");
      const existingOrders = saved ? JSON.parse(saved) : [];
      localStorage.setItem("tlenorgym_admin_orders", JSON.stringify([newOrder, ...existingOrders]));
    } catch {
      // fallback
    }

    // Save to Supabase if configured
    if (isSupabaseConfigured) {
      await createSupabaseOrder(newOrder);
    }

    setIsSubmitting(false);
    setStep("success");
    clearCart();
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setStep("cart");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: "var(--color-surface)",
          borderLeft: "1px solid var(--color-border)",
          width: "100%",
          maxWidth: "480px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          boxShadow: "-10px 0 40px rgba(0,0,0,0.8)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ background: "var(--color-accent-dim)", color: "var(--color-accent)", padding: "8px", borderRadius: "10px" }}>
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", margin: 0 }}>
                Mon Panier <span className="text-accent">({totalItems})</span>
              </h3>
              <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                {step === "cart" ? "Articles sélectionnés" : step === "checkout" ? "Informations de Livraison" : "Commande validée"}
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "none",
              color: "#fff",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {step === "cart" && (
            <>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--color-text-muted)" }}>
                  <ShoppingBag size={56} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                  <p style={{ fontSize: "1.1rem" }}>Votre panier est vide.</p>
                  <p style={{ fontSize: "0.85rem" }}>Découvrez notre catalogue et ajoutez vos compléments alimentaires.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "1rem",
                        background: "var(--color-bg)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        gap: "1rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {item.image && (item.image.startsWith("http") || item.image.startsWith("data:")) ? (
                          <img src={item.image} alt={item.name} style={{ width: "50px", height: "50px", objectFit: "contain", borderRadius: "8px" }} />
                        ) : (
                          <div style={{ width: "50px", height: "50px", background: "var(--color-surface)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            📦
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{item.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--color-accent)", fontWeight: 700 }}>{item.price}</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--color-border)", borderRadius: "8px", background: "var(--color-surface)" }}>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            style={{ background: "none", border: "none", color: "#fff", padding: "4px 8px", cursor: "pointer" }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ fontSize: "0.85rem", fontWeight: 700, padding: "0 4px" }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={{ background: "none", border: "none", color: "#fff", padding: "4px 8px", cursor: "pointer" }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{ background: "none", border: "none", color: "var(--color-red)", cursor: "pointer", padding: "4px" }}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === "checkout" && (
            <form onSubmit={handleCheckoutSubmit}>
              {errorMsg && (
                <div style={{ background: "rgba(230, 57, 70, 0.15)", border: "1px solid var(--color-red)", color: "var(--color-red)", padding: "8px 12px", borderRadius: "var(--radius-md)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  {errorMsg}
                </div>
              )}

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>Nom et Prénom *</label>
                <input
                  type="text"
                  placeholder="Votre nom complet"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px 12px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>Numéro de Téléphone *</label>
                <input
                  type="tel"
                  placeholder="05 / 06 / 07 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px 12px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>Wilaya *</label>
                  <select
                    value={selectedWilayaCode}
                    onChange={(e) => {
                      setSelectedWilayaCode(e.target.value);
                      setSelectedCommune("");
                    }}
                    style={{ width: "100%", padding: "10px 12px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: "0.9rem" }}
                  >
                    {wilayas.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} - {w.nameFr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>Commune *</label>
                  <select
                    value={selectedCommune}
                    onChange={(e) => setSelectedCommune(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px 12px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: "0.9rem" }}
                  >
                    <option value="">Sélectionnez commune...</option>
                    {availableCommunes.map((c, idx) => (
                      <option key={idx} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>Mode de Livraison</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "10px", background: deliveryType === "home" ? "var(--color-accent-dim)" : "var(--color-bg)", border: deliveryType === "home" ? "1px solid var(--color-accent)" : "1px solid var(--color-border)", borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: "0.85rem" }}>
                    <input type="radio" name="delivery" checked={deliveryType === "home"} onChange={() => setDeliveryType("home")} />
                    <Truck size={16} className="text-accent" /> Domicile
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "10px", background: deliveryType === "office" ? "var(--color-accent-dim)" : "var(--color-bg)", border: deliveryType === "office" ? "1px solid var(--color-accent)" : "1px solid var(--color-border)", borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: "0.85rem" }}>
                    <input type="radio" name="delivery" checked={deliveryType === "office"} onChange={() => setDeliveryType("office")} />
                    <Building size={16} className="text-accent" /> Stopdesk
                  </label>
                </div>
              </div>

              {deliveryType === "home" && (
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>Adresse complète</label>
                  <input
                    type="text"
                    placeholder="Quartier, rue..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: "0.9rem" }}
                  />
                </div>
              )}
            </form>
          )}

          {step === "success" && (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div style={{ width: "60px", height: "60px", background: "rgba(37, 211, 102, 0.15)", color: "#25d366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>Commande Enregistrée !</h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Merci <strong>{customerName}</strong>. Votre commande a été transmise avec succès. Notre équipe vous contactera au <strong>{phone}</strong>.
              </p>
              <button onClick={handleClose} className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }}>
                Fermer
              </button>
            </div>
          )}
        </div>

        {/* Footer Summary & Actions */}
        {cart.length > 0 && step !== "success" && (
          <div style={{ padding: "1.5rem", borderTop: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>
              <span>Sous-total articles :</span>
              <span>{subtotal.toLocaleString()} DA</span>
            </div>
            {step === "checkout" && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>
                <span>Frais livraison ({currentWilaya.nameFr}) :</span>
                <span>{shippingCost.toLocaleString()} DA</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 700, marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--color-border)" }}>
              <span>Total :</span>
              <span style={{ color: "var(--color-accent)" }}>{(step === "checkout" ? grandTotal : subtotal).toLocaleString()} DA</span>
            </div>

            {step === "cart" ? (
              <button
                onClick={() => setStep("checkout")}
                className="btn btn--primary btn--lg"
                style={{ width: "100%", marginTop: "1rem", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                Passer à la Caisse <ArrowRight size={18} />
              </button>
            ) : (
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button onClick={() => setStep("cart")} className="btn btn--ghost" style={{ flex: 1, justifyContent: "center" }}>
                  Retour
                </button>
                <button onClick={handleCheckoutSubmit} disabled={isSubmitting} className="btn btn--primary" style={{ flex: 2, justifyContent: "center" }}>
                  {isSubmitting ? "Envoi..." : "Confirmer Commande"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
