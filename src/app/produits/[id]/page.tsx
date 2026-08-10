"use client";

import { useState, useEffect, useMemo, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Truck, 
  Building, 
  CheckCircle2, 
  Package, 
  Phone, 
  Plus, 
  Minus, 
  ShieldCheck, 
  X
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getLocalProducts, fetchAndMergeProducts, ProductItem } from "@/lib/product-store";
import { wilayas, getDeliveryCost } from "@/data/delivery-data";
import communesData from "@/data/communes.json";
import bureauxData from "@/data/bureaux.json";
import { saveNewOrder } from "@/lib/order-store";
import { OrderItemData } from "@/lib/supabase";
import { trackProductClick } from "@/lib/analytics";

interface YalidineBureau {
  code?: string;
  name: string;
  commune: string;
  address?: string;
}

export default function DedicatedProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = decodeURIComponent(resolvedParams.id);

  const { addToCart } = useCart();
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State for Direct Checkout
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedWilayaCode, setSelectedWilayaCode] = useState("16"); // Default 16 Alger
  const [selectedCommune, setSelectedCommune] = useState("");
  const [selectedBureau, setSelectedBureau] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<"home" | "office">("home");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load product data
  useEffect(() => {
    async function loadProduct() {
      const local = getLocalProducts();
      let found = local.find((p) => String(p.id) === productId || p.name.toLowerCase() === productId.toLowerCase());

      if (!found) {
        const merged = await fetchAndMergeProducts();
        found = merged.find((p) => String(p.id) === productId || p.name.toLowerCase() === productId.toLowerCase());
      }

      if (found) {
        setProduct(found);
        trackProductClick(found.name);
      }
      setLoading(false);
    }
    loadProduct();
  }, [productId]);

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

  const numericProductPrice = useMemo(() => {
    if (!product) return 0;
    const cleaned = product.price.replace(/[^0-9]/g, "");
    return parseInt(cleaned, 10) || 0;
  }, [product]);

  const shippingCost = useMemo(() => {
    return getDeliveryCost(selectedWilayaCode, deliveryType);
  }, [selectedWilayaCode, deliveryType]);

  const totalProductCost = numericProductPrice * quantity;
  const grandTotalCost = totalProductCost + shippingCost;

  const handleDirectOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!customerName.trim() || !phone.trim()) {
      setErrorMsg("Veuillez renseigner votre nom et votre numéro de téléphone.");
      return;
    }

    if (deliveryType === "home" && !selectedCommune) {
      setErrorMsg("Veuillez choisir votre commune dans la liste.");
      return;
    }

    if (deliveryType === "office" && !selectedBureau) {
      setErrorMsg("Veuillez choisir votre bureau Yalidine dans la liste.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

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
      product_name: `${quantity}x ${product.name}`,
      product_price: `${totalProductCost.toLocaleString()} DA`,
      delivery_cost: shippingCost,
      total_amount: grandTotalCost,
      status: "Nouvelle",
      created_at: new Date().toISOString(),
    };

    // Instant Save, Telegram Notification & Broadcast
    await saveNewOrder(newOrder);

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "1.1rem" }}>Chargement du produit...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--color-bg)", padding: "2rem" }}>
        <Package size={64} style={{ opacity: 0.3, marginBottom: "1rem" }} />
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", marginBottom: "0.5rem" }}>Produit introuvable</h2>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>Ce produit n&apos;existe plus ou a été retiré du catalogue.</p>
        <Link href="/produits" className="btn btn--primary">
          <ArrowLeft size={16} /> Retour à la boutique
        </Link>
      </div>
    );
  }

  const isAvailable = product.stock_quantity > 0;

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", paddingTop: "40px", paddingBottom: "80px" }}>
      {/* Full Modal Merci Overlay (Plein écran avec fermeture) */}
      {isSuccess && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(0, 0, 0, 0.88)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)",
              padding: "2.5rem",
              maxWidth: "520px",
              width: "100%",
              textAlign: "center",
              position: "relative",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
            }}
          >
            <button
              onClick={() => setIsSuccess(false)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "#fff", cursor: "pointer" }}
            >
              <X size={22} />
            </button>

            <div style={{ width: "70px", height: "70px", background: "#25d366", color: "#000", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <CheckCircle2 size={42} />
            </div>

            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.85rem", marginBottom: "0.5rem" }}>
              Merci pour votre commande !
            </h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              Votre commande de <strong style={{ color: "#fff" }}>{quantity}x {product.name}</strong> a été enregistrée et transmise instantanément. Notre équipe vous appellera au <strong style={{ color: "var(--color-accent)" }}>{phone}</strong> pour l&apos;expédition.
            </p>

            <div style={{ background: "var(--color-bg)", padding: "1.25rem", borderRadius: "var(--radius-md)", textAlign: "left", marginBottom: "1.75rem", fontSize: "0.9rem" }}>
              <div style={{ marginBottom: "0.5rem" }}><strong>Client :</strong> {customerName}</div>
              <div style={{ marginBottom: "0.5rem" }}><strong>Wilaya :</strong> {currentWilaya.code} - {currentWilaya.nameFr}</div>
              <div style={{ marginBottom: "0.5rem" }}>
                <strong>Mode :</strong> {deliveryType === "home" ? `À domicile (${selectedCommune})` : `Bureau Yalidine (${selectedBureau})`}
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#25d366", marginTop: "0.75rem", borderTop: "1px solid var(--color-border)", paddingTop: "0.5rem" }}>
                Total à payer : {grandTotalCost.toLocaleString()} DA
              </div>
            </div>

            <button
              onClick={() => setIsSuccess(false)}
              className="btn btn--primary btn--lg"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Fermer et continuer
            </button>
          </div>
        </div>
      )}

      <div className="container">
        {/* Breadcrumb Header */}
        <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
          <Link href="/" style={{ color: "var(--color-text-secondary)" }}>Accueil</Link>
          <span>/</span>
          <Link href="/produits" style={{ color: "var(--color-text-secondary)" }}>Produits</Link>
          <span>/</span>
          <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>{product.name}</span>
        </div>

        {/* Main Product Layout (Style CD Project) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "3rem", alignItems: "start" }}>
          
          {/* Left Column: Visual Gallery */}
          <div>
            <div
              style={{
                background: "linear-gradient(135deg, var(--color-surface) 0%, var(--color-bg-alt) 100%)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "380px",
                width: "100%",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
            >
              {product.image && (product.image.startsWith("http") || product.image.startsWith("data:")) ? (
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    height: "100%",
                    width: "100%",
                    objectFit: "cover",
                    borderRadius: "var(--radius-lg)",
                  }}
                />
              ) : (
                <Package size={120} className="text-accent" style={{ opacity: 0.8 }} />
              )}

              <span
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  background: "var(--color-accent-dim)",
                  color: "var(--color-accent)",
                  border: "1px solid var(--color-accent)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: "12px",
                }}
              >
                {product.category}
              </span>
            </div>

            {/* Reassurance Badges */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.5rem" }}>
              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <ShieldCheck size={24} className="text-accent" />
                <div>
                  <strong style={{ display: "block", fontSize: "0.85rem" }}>100% Authentique</strong>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Produit certifié origine</span>
                </div>
              </div>

              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Truck size={24} className="text-accent" />
                <div>
                  <strong style={{ display: "block", fontSize: "0.85rem" }}>Livraison 58 Wilayas</strong>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>Expédition rapide Yalidine</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Express Checkout Form */}
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>
              Tlénor Gym Official
            </span>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.25rem", marginTop: "0.25rem", marginBottom: "0.75rem" }}>
              {product.name}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
              <span style={{ fontSize: "2rem", fontWeight: 900, color: "var(--color-accent)" }}>
                {product.price}
              </span>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  background: isAvailable ? "rgba(37, 211, 102, 0.15)" : "rgba(230, 57, 70, 0.15)",
                  color: isAvailable ? "#25d366" : "var(--color-red)",
                }}
              >
                {isAvailable ? `✓ En Stock (${product.stock_quantity} disponible${product.stock_quantity > 1 ? "s" : ""})` : "Rupture de Stock"}
              </span>
            </div>

            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "1.75rem" }}>
              {product.desc || "Complément alimentaire sélectionné par les coachs de Tlénor Gym pour vous accompagner dans vos objectifs physiques."}
            </p>

            {/* Quantity Selector */}
            {isAvailable && (
              <div style={{ marginBottom: "1.75rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
                  Quantité à commander :
                </label>
                <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", background: "var(--color-bg)" }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ background: "none", border: "none", color: "#fff", padding: "10px 16px", cursor: "pointer" }}
                  >
                    <Minus size={16} />
                  </button>
                  <span style={{ fontSize: "1.1rem", fontWeight: 800, padding: "0 16px" }}>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    style={{ background: "none", border: "none", color: "#fff", padding: "10px 16px", cursor: "pointer" }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Button Add to Cart */}
            <div style={{ marginBottom: "2rem" }}>
              <button
                type="button"
                onClick={() => addToCart(product, quantity)}
                disabled={!isAvailable}
                className="btn btn--outline btn--lg"
                style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <ShoppingBag size={18} /> Ajouter au Panier
              </button>
            </div>

            {/* Express Checkout Form (Embedded Style CD Project) */}
            <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1.75rem" }}>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                Formulaire de Commande Directe
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "1.25rem" }}>
                Remplissez vos coordonnées ci-dessous pour valider l&apos;expédition rapide.
              </p>

              <form onSubmit={handleDirectOrder}>
                {errorMsg && (
                  <div style={{ background: "rgba(230, 57, 70, 0.15)", border: "1px solid var(--color-red)", color: "var(--color-red)", padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>Nom et Prénom *</label>
                  <input
                    type="text"
                    placeholder="Votre nom complet"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    style={{ width: "100%", padding: "12px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: "0.95rem" }}
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>Numéro de Téléphone *</label>
                  <input
                    type="tel"
                    placeholder="05 / 06 / 07 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{ width: "100%", padding: "12px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: "0.95rem" }}
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>Mode de Livraison</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "12px", background: deliveryType === "home" ? "var(--color-accent-dim)" : "var(--color-bg)", border: deliveryType === "home" ? "1px solid var(--color-accent)" : "1px solid var(--color-border)", borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: "0.85rem" }}>
                      <input type="radio" name="delivery-prod" checked={deliveryType === "home"} onChange={() => setDeliveryType("home")} />
                      <Truck size={16} className="text-accent" /> Domicile
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "12px", background: deliveryType === "office" ? "var(--color-accent-dim)" : "var(--color-bg)", border: deliveryType === "office" ? "1px solid var(--color-accent)" : "1px solid var(--color-border)", borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: "0.85rem" }}>
                      <input type="radio" name="delivery-prod" checked={deliveryType === "office"} onChange={() => setDeliveryType("office")} />
                      <Building size={16} className="text-accent" /> Bureau Yalidine
                    </label>
                  </div>
                </div>

                {/* Wilaya Selection */}
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>Wilaya *</label>
                  <select
                    value={selectedWilayaCode}
                    onChange={(e) => {
                      setSelectedWilayaCode(e.target.value);
                      setSelectedCommune("");
                      setSelectedBureau("");
                    }}
                    style={{ width: "100%", padding: "12px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: "0.9rem" }}
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
                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>Bureau Yalidine / Stopdesk *</label>
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
                      style={{ width: "100%", padding: "12px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: "0.9rem" }}
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
                      <label style={{ display: "block", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>Commune *</label>
                      <select
                        value={selectedCommune}
                        onChange={(e) => setSelectedCommune(e.target.value)}
                        required
                        style={{ width: "100%", padding: "12px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: "0.9rem" }}
                      >
                        <option value="">Sélectionnez votre commune...</option>
                        {availableCommunes.map((c, idx) => (
                          <option key={idx} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.3rem" }}>Adresse complète de livraison</label>
                      <input
                        type="text"
                        placeholder="Quartier, rue, numéro..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        style={{ width: "100%", padding: "12px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: "0.9rem" }}
                      />
                    </div>
                  </>
                )}

                {/* Summary Box */}
                <div style={{ background: "var(--color-bg)", padding: "1rem", borderRadius: "var(--radius-md)", margin: "1.25rem 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>
                    <span>Produit ({quantity}x) :</span>
                    <span>{totalProductCost.toLocaleString()} DA</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.4rem" }}>
                    <span>Frais de livraison ({currentWilaya.nameFr}) :</span>
                    <span>{shippingCost.toLocaleString()} DA</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 800, marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--color-border)" }}>
                    <span>Total à payer :</span>
                    <span style={{ color: "#25d366" }}>{grandTotalCost.toLocaleString()} DA</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !isAvailable}
                  className="btn btn--primary btn--lg"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {isSubmitting ? "Validation..." : "Commander Maintenant"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
