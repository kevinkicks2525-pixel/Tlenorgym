"use client";

import { useState, useMemo } from "react";
import { X, ShoppingBag, Trash2, Plus, Minus, Truck, Building, CheckCircle2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { wilayas, getDeliveryCost } from "@/data/delivery-data";
import communesData from "@/data/communes.json";
import bureauxData from "@/data/bureaux.json";
import { createSupabaseOrder, isSupabaseConfigured, OrderItemData } from "@/lib/supabase";
import { saveNewOrder } from "@/lib/order-store";

interface YalidineBureau {
  code?: string;
  name: string;
  commune: string;
  address?: string;
}

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal, totalItems, isCartOpen, setIsCartOpen } = useCart();

  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedWilayaCode, setSelectedWilayaCode] = useState("16"); // Default Alger
  const [selectedCommune, setSelectedCommune] = useState("");
  const [selectedBureau, setSelectedBureau] = useState("");
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

  const availableBureaux = useMemo(() => {
    const rawBureaux = (bureauxData as unknown as Record<string, YalidineBureau[]>)[selectedWilayaCode] || [];
    return rawBureaux;
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

    if (deliveryType === "home" && !selectedCommune) {
      setErrorMsg("Veuillez sélectionner votre commune.");
      return;
    }

    if (deliveryType === "office" && !selectedBureau) {
      setErrorMsg("Veuillez sélectionner votre bureau Yalidine.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const itemsSummary = cart.map((item) => `${item.quantity}x ${item.name}`).join(", ");
    const communeOrBureau = deliveryType === "office" ? selectedBureau : selectedCommune;
    const fullAddress = deliveryType === "home" ? (address || selectedCommune) : `Bureau Yalidine: ${selectedBureau}`;

    const newOrder: OrderItemData = {
      id: Date.now(),
      customer_name: customerName,
      phone: phone,
      wilaya_code: selectedWilayaCode,
      wilaya_name: `${currentWilaya.code} - ${currentWilaya.nameFr}`,
      commune_name: communeOrBureau,
      address: fullAddress,
      delivery_type: deliveryType,
      product_name: itemsSummary,
      product_price: `${subtotal.toLocaleString()} DA`,
      delivery_cost: shippingCost,
      total_amount: grandTotal,
      status: "Nouvelle",
      created_at: new Date().toISOString(),
    };

    // Save locally, send Telegram & update store
    await saveNewOrder(newOrder);

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
        backdropFilter: "blur(5px)",
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          height: "100%",
          background: "var(--color-surface)",
          borderLeft: "1px solid var(--color-border)",
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
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <ShoppingBag size={22} className="text-accent" />
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", margin: 0 }}>
              {step === "cart" && `Mon Panier (${totalItems})`}
              {step === "checkout" && "Informations de Livraison"}
              {step === "success" && "Commande Confirmée"}
            </h3>
          </div>
          <button
            onClick={handleClose}
            style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", padding: "4px" }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {step === "cart" && (
            <>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-muted)" }}>
                  <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                  <p style={{ fontSize: "1.1rem" }}>Votre panier est vide</p>
                  <button onClick={handleClose} className="btn btn--outline btn--sm" style={{ marginTop: "1rem" }}>
                    Découvrir nos produits
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem",
                        background: "var(--color-bg)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      {item.image && (item.image.startsWith("http") || item.image.startsWith("data:")) ? (
                        <img src={item.image} alt={item.name} style={{ width: "55px", height: "55px", objectFit: "cover", borderRadius: "8px" }} />
                      ) : (
                        <div style={{ width: "55px", height: "55px", background: "var(--color-surface)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                          📦
                        </div>
                      )}

                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{item.name}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--color-accent)", fontWeight: 700, margin: "0.2rem 0" }}>
                          {item.price}
                        </div>

                        {/* Quantity Counter */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "#fff", borderRadius: "4px", padding: "2px 6px", cursor: "pointer" }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "#fff", borderRadius: "4px", padding: "2px 6px", cursor: "pointer" }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{ background: "none", border: "none", color: "var(--color-red)", cursor: "pointer", padding: "6px" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === "checkout" && (
            <form id="cart-checkout-form" onSubmit={handleCheckoutSubmit}>
              {errorMsg && (
                <div style={{ background: "rgba(230, 57, 70, 0.15)", border: "1px solid var(--color-red)", color: "var(--color-red)", padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: "0.85rem", marginBottom: "1rem" }}>
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

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>Mode de Livraison</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "10px", background: deliveryType === "home" ? "var(--color-accent-dim)" : "var(--color-bg)", border: deliveryType === "home" ? "1px solid var(--color-accent)" : "1px solid var(--color-border)", borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: "0.85rem" }}>
                    <input type="radio" name="delivery" checked={deliveryType === "home"} onChange={() => setDeliveryType("home")} />
                    <Truck size={16} className="text-accent" /> Domicile
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "10px", background: deliveryType === "office" ? "var(--color-accent-dim)" : "var(--color-bg)", border: deliveryType === "office" ? "1px solid var(--color-accent)" : "1px solid var(--color-border)", borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: "0.85rem" }}>
                    <input type="radio" name="delivery" checked={deliveryType === "office"} onChange={() => setDeliveryType("office")} />
                    <Building size={16} className="text-accent" /> Bureau Yalidine
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>Wilaya *</label>
                <select
                  value={selectedWilayaCode}
                  onChange={(e) => {
                    setSelectedWilayaCode(e.target.value);
                    setSelectedCommune("");
                    setSelectedBureau("");
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

              {/* Conditional Yalidine Bureaux vs Commune */}
              {deliveryType === "office" ? (
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>Bureau Yalidine / Stopdesk *</label>
                  <select
                    value={selectedBureau}
                    onChange={(e) => {
                      setSelectedBureau(e.target.value);
                      const found = availableBureaux.find((b) => b.name === e.target.value);
                      if (found) {
                        setSelectedCommune(found.commune || found.name);
                      }
                    }}
                    required
                    style={{ width: "100%", padding: "10px 12px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: "0.9rem" }}
                  >
                    <option value="">Sélectionnez un bureau Yalidine...</option>
                    {availableBureaux.map((b, idx) => (
                      <option key={idx} value={b.name}>
                        {b.name} ({b.commune})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "1rem" }}>
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
                </>
              )}
            </form>
          )}

          {step === "success" && (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div style={{ width: "64px", height: "64px", background: "rgba(37, 211, 102, 0.15)", color: "#25d366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <CheckCircle2 size={38} />
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", marginBottom: "0.5rem" }}>Merci pour votre commande !</h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Votre commande a été transmise avec succès. Notre équipe vous contactera au <strong style={{ color: "var(--color-accent)" }}>{phone}</strong> pour confirmer l&apos;expédition.
              </p>

              <div style={{ background: "var(--color-bg)", padding: "1.25rem", borderRadius: "var(--radius-md)", textAlign: "left", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                <div style={{ marginBottom: "0.4rem" }}><strong>Client :</strong> {customerName}</div>
                <div style={{ marginBottom: "0.4rem" }}><strong>Wilaya :</strong> {currentWilaya.code} - {currentWilaya.nameFr}</div>
                <div style={{ marginBottom: "0.4rem" }}>
                  <strong>Mode :</strong> {deliveryType === "home" ? `À domicile (${selectedCommune})` : `Bureau Yalidine (${selectedBureau})`}
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#25d366", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--color-border)" }}>
                  Total à payer : {grandTotal.toLocaleString()} DA
                </div>
              </div>

              <button onClick={handleClose} className="btn btn--primary btn--lg" style={{ width: "100%", justifyContent: "center" }}>
                Fermer et continuer
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
                <span>Frais de livraison ({currentWilaya.nameFr}) :</span>
                <span>{shippingCost.toLocaleString()} DA</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.25rem", fontWeight: 800, marginTop: "0.5rem", marginBottom: "1.25rem" }}>
              <span>Total :</span>
              <span style={{ color: "#25d366" }}>{grandTotal.toLocaleString()} DA</span>
            </div>

            {step === "cart" ? (
              <button onClick={() => setStep("checkout")} className="btn btn--primary btn--lg" style={{ width: "100%", justifyContent: "center" }}>
                Commander mon panier <ArrowRight size={18} />
              </button>
            ) : (
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="button" onClick={() => setStep("cart")} className="btn btn--ghost" style={{ flex: 1, justifyContent: "center" }}>
                  Retour
                </button>
                <button type="submit" form="cart-checkout-form" disabled={isSubmitting} className="btn btn--primary" style={{ flex: 2, justifyContent: "center" }}>
                  {isSubmitting ? "Validation..." : "Valider la Commande"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
