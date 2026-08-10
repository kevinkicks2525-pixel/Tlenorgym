"use client";

import { useState, useMemo } from "react";
import { X, CheckCircle2, ShoppingBag, Truck, MapPin, Phone, User, Package, Building } from "lucide-react";
import { wilayas, getDeliveryCost } from "@/data/delivery-data";
import communesData from "@/data/communes.json";
import { createSupabaseOrder, isSupabaseConfigured, OrderItemData } from "@/lib/supabase";
import { saveNewOrder } from "@/lib/order-store";

interface CheckoutModalProps {
  product: {
    name: string;
    price: string;
    image?: string;
  };
  onClose: () => void;
}

export default function CheckoutModal({ product, onClose }: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedWilayaCode, setSelectedWilayaCode] = useState("16"); // Default Alger
  const [selectedCommune, setSelectedCommune] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<"home" | "office">("home");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Get Wilaya Object
  const currentWilaya = useMemo(() => {
    return wilayas.find((w) => w.code === selectedWilayaCode) || wilayas[15]; // 16 Alger
  }, [selectedWilayaCode]);

  // Filter Communes for selected Wilaya
  const availableCommunes = useMemo(() => {
    const rawCommunes = (communesData as unknown as Record<string, Array<{ name: string }>>)[selectedWilayaCode] || [];
    return rawCommunes.map((c) => (typeof c === "string" ? c : c.name));
  }, [selectedWilayaCode]);

  // Numerical Product Price
  const numericProductPrice = useMemo(() => {
    const cleaned = product.price.replace(/[^0-9]/g, "");
    return parseInt(cleaned, 10) || 0;
  }, [product.price]);

  // Shipping Cost
  const shippingCost = useMemo(() => {
    return getDeliveryCost(selectedWilayaCode, deliveryType);
  }, [selectedWilayaCode, deliveryType]);

  // Total Price
  const totalPrice = numericProductPrice + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
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

    const newOrder: OrderItemData = {
      id: Date.now(),
      customer_name: customerName,
      phone: phone,
      wilaya_code: selectedWilayaCode,
      wilaya_name: `${currentWilaya.code} - ${currentWilaya.nameFr}`,
      commune_name: selectedCommune,
      address: address || (deliveryType === "home" ? selectedCommune : "Bureau Yalidine / Stopdesk"),
      delivery_type: deliveryType,
      product_name: product.name,
      product_price: product.price,
      delivery_cost: shippingCost,
      total_amount: totalPrice,
      status: "Nouvelle",
      created_at: new Date().toISOString(),
    };

    // Save locally
    await saveNewOrder(newOrder);
    setIsSubmitting(false);
    setIsSuccess(true);
  };

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
          maxWidth: "540px",
          width: "100%",
          padding: "2rem",
          position: "relative",
          boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
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
          }}
        >
          <X size={20} />
        </button>

        {isSuccess ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <div
              style={{
                width: "70px",
                height: "70px",
                background: "rgba(37, 211, 102, 0.15)",
                color: "#25d366",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <CheckCircle2 size={40} />
            </div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", marginBottom: "0.75rem" }}>
              Commande Confirmée !
            </h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              Merci <strong>{customerName}</strong>. Votre commande pour <strong>{product.name}</strong> a bien été enregistrée.
              Notre équipe vous contactera par téléphone au <strong>{phone}</strong> pour valider la livraison.
            </p>

            <div
              style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                marginBottom: "1.5rem",
                textAlign: "left",
                fontSize: "0.85rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Wilaya & Commune :</span>
                <strong>{currentWilaya.nameFr} - {selectedCommune}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Type de livraison :</span>
                <strong>{deliveryType === "home" ? "À domicile" : "Bureau Stopdesk"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--color-border)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Montant Total à payer :</span>
                <strong style={{ color: "var(--color-accent)", fontSize: "1.1rem" }}>{totalPrice.toLocaleString()} DA</strong>
              </div>
            </div>

            <button onClick={onClose} className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }}>
              Fermer la fenêtre
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ background: "var(--color-accent-dim)", color: "var(--color-accent)", padding: "10px", borderRadius: "12px" }}>
                <ShoppingBag size={24} />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Formulaire de Commande</span>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.35rem", margin: 0 }}>
                  Acheter <span className="text-accent">{product.name}</span>
                </h3>
              </div>
            </div>

            {/* Product Summary Mini Card */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1rem",
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                marginBottom: "1.25rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {product.image && (product.image.startsWith("http") || product.image.startsWith("data:")) ? (
                  <img src={product.image} alt={product.name} style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "8px" }} />
                ) : (
                  <Package size={28} className="text-accent" />
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{product.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Prix article : {product.price}</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--color-accent)" }}>
                {product.price}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {errorMsg && (
                <div style={{ background: "rgba(230, 57, 70, 0.15)", border: "1px solid var(--color-red)", color: "var(--color-red)", padding: "8px 12px", borderRadius: "var(--radius-md)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  {errorMsg}
                </div>
              )}

              {/* Nom & Téléphone */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>
                    Nom et Prénom *
                  </label>
                  <input
                    type="text"
                    placeholder="Votre nom complet"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px 12px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>
                    Numéro Téléphone *
                  </label>
                  <input
                    type="tel"
                    placeholder="05 / 06 / 07 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px 12px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: "0.9rem" }}
                  />
                </div>
              </div>

              {/* Wilaya & Commune */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>
                    Wilaya *
                  </label>
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
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>
                    Commune *
                  </label>
                  <select
                    value={selectedCommune}
                    onChange={(e) => setSelectedCommune(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px 12px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: "0.9rem" }}
                  >
                    <option value="">Sélectionnez la commune...</option>
                    {availableCommunes.map((c, idx) => (
                      <option key={idx} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mode de Livraison */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>
                  Mode de Livraison
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "10px 12px",
                      background: deliveryType === "home" ? "var(--color-accent-dim)" : "var(--color-bg)",
                      border: deliveryType === "home" ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryType === "home"}
                      onChange={() => setDeliveryType("home")}
                    />
                    <Truck size={16} className="text-accent" /> À Domicile
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "10px 12px",
                      background: deliveryType === "office" ? "var(--color-accent-dim)" : "var(--color-bg)",
                      border: deliveryType === "office" ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryType === "office"}
                      onChange={() => setDeliveryType("office")}
                    />
                    <Building size={16} className="text-accent" /> Bureau Stopdesk
                  </label>
                </div>
              </div>

              {/* Adresse */}
              {deliveryType === "home" && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>
                    Adresse de Livraison
                  </label>
                  <input
                    type="text"
                    placeholder="Quartier, Rue, N° de maison..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: "0.9rem" }}
                  />
                </div>
              )}

              {/* Price Calculation Box */}
              <div
                style={{
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>
                  <span>Sous-total produit :</span>
                  <span>{numericProductPrice.toLocaleString()} DA</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>
                  <span>Frais de livraison ({currentWilaya.nameFr}) :</span>
                  <span>{shippingCost.toLocaleString()} DA</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--color-border)", paddingTop: "0.6rem", marginTop: "0.6rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "1rem" }}>TOTAL À PAYER :</span>
                  <strong style={{ fontSize: "1.2rem", color: "var(--color-accent)" }}>{totalPrice.toLocaleString()} DA</strong>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn--primary btn--lg"
                style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                {isSubmitting ? "Traitement de la commande..." : "Confirmer la Commande"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
