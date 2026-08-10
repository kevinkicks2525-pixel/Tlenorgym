"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BarChart3, 
  Package, 
  CreditCard, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  Users, 
  Lock, 
  Zap, 
  X,
  Check,
  ArrowLeft,
  Database
} from "lucide-react";
import { 
  getSupabaseProducts, 
  addSupabaseProduct, 
  updateSupabaseProduct, 
  deleteSupabaseProduct, 
  isSupabaseConfigured 
} from "@/lib/supabase";

export interface ProductItem {
  id: number | string;
  name: string;
  category: string;
  price: string;
  stock: boolean;
  desc?: string;
  image?: string;
}

const initialProducts: ProductItem[] = [
  { id: 1, name: "Whey Protein Isolate", category: "Protéines", price: "8 500 DA", stock: true, desc: "Protéine de lactosérum isolée pour récupération rapide", image: "🥛" },
  { id: 2, name: "Caséine Micellaire", category: "Protéines", price: "7 800 DA", stock: true, desc: "Protéine à digestion lente", image: "🌙" },
  { id: 3, name: "BCAA 2:1:1", category: "Acides Aminés", price: "4 500 DA", stock: true, desc: "Acides aminés à chaîne ramifiée", image: "💊" },
  { id: 4, name: "L-Glutamine", category: "Acides Aminés", price: "3 200 DA", stock: true, desc: "Réparation musculaire & immunité", image: "🧬" },
  { id: 5, name: "Créatine Monohydrate", category: "Performance", price: "3 800 DA", stock: true, desc: "Créatine pure micronisée", image: "⚡" },
  { id: 6, name: "Pre-Workout Extreme", category: "Performance", price: "5 200 DA", stock: false, desc: "Caféine & bêta-alanine concentrée", image: "🔥" },
  { id: 7, name: "Multivitamines Sport", category: "Vitamines", price: "2 800 DA", stock: true, desc: "Complexe vitamines complet", image: "💎" },
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passError, setPassError] = useState(false);
  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "plans" | "media">("analytics");

  // Dynamic Product State with LocalStorage & Supabase Sync
  const [productsList, setProductsList] = useState<ProductItem[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form states for New Product
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCat, setNewProdCat] = useState("Protéines");
  const [newProdDesc, setNewProdDesc] = useState("");

  // Load from Supabase if configured, or localStorage
  useEffect(() => {
    async function loadData() {
      if (isSupabaseConfigured) {
        const supaData = await getSupabaseProducts();
        if (supaData && supaData.length > 0) {
          const mapped: ProductItem[] = supaData.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            price: item.price,
            stock: item.stock ?? true,
            desc: item.description || "",
            image: item.image_url || "📦",
          }));
          setProductsList(mapped);
          return;
        }
      }

      // Fallback to localStorage
      try {
        const saved = localStorage.getItem("tlenorgym_admin_products");
        if (saved) {
          setProductsList(JSON.parse(saved));
        }
      } catch {
        // fallback
      }
    }
    loadData();
  }, []);

  const saveProducts = (newList: ProductItem[]) => {
    setProductsList(newList);
    try {
      localStorage.setItem("tlenorgym_admin_products", JSON.stringify(newList));
    } catch {
      // fallback
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "1234" || passcode === "admin") {
      setIsAuthenticated(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    const formattedPrice = newProdPrice.includes("DA") ? newProdPrice : `${newProdPrice} DA`;

    const newItem: ProductItem = {
      id: Date.now(),
      name: newProdName,
      price: formattedPrice,
      category: newProdCat,
      desc: newProdDesc || "Supplément nutritionnel haute qualité",
      stock: true,
      image: "📦",
    };

    saveProducts([...productsList, newItem]);

    if (isSupabaseConfigured) {
      await addSupabaseProduct({
        name: newProdName,
        category: newProdCat,
        price: formattedPrice,
        desc: newProdDesc,
        stock: true,
      });
    }

    setNewProdName("");
    setNewProdPrice("");
    setNewProdDesc("");
  };

  const toggleStock = async (id: number | string) => {
    const target = productsList.find((p) => p.id === id);
    if (!target) return;
    const newStock = !target.stock;

    const updated = productsList.map((p) => (p.id === id ? { ...p, stock: newStock } : p));
    saveProducts(updated);

    if (isSupabaseConfigured) {
      await updateSupabaseProduct(id, { stock: newStock });
    }
  };

  const deleteProduct = async (id: number | string) => {
    if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      const updated = productsList.filter((p) => p.id !== id);
      saveProducts(updated);

      if (isSupabaseConfigured) {
        await deleteSupabaseProduct(id);
      }
    }
  };

  const handleSaveEditedProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updated = productsList.map((p) => (p.id === editingProduct.id ? editingProduct : p));
    saveProducts(updated);

    if (isSupabaseConfigured) {
      await updateSupabaseProduct(editingProduct.id, {
        name: editingProduct.name,
        category: editingProduct.category,
        price: editingProduct.price,
        description: editingProduct.desc,
      });
    }

    setEditingProduct(null);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)", padding: "1rem" }}>
        <form onSubmit={handleLogin} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2.5rem", maxWidth: "420px", width: "100%", textAlign: "center" }}>
          <div style={{ width: "60px", height: "60px", background: "var(--color-accent-dim)", color: "var(--color-accent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <Lock size={28} />
          </div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", marginBottom: "0.5rem" }}>
            Administration <span className="text-accent">Tlénor Gym</span>
          </h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Entrez votre code d&apos;accès sécurisé pour accéder au backoffice.
          </p>

          <input
            type="password"
            placeholder="Code PIN (par défaut : 1234)"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "var(--color-bg)",
              border: passError ? "1px solid var(--color-red)" : "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              color: "#fff",
              textAlign: "center",
              fontSize: "1.2rem",
              letterSpacing: "0.2em",
              marginBottom: "1rem",
            }}
          />

          {passError && (
            <p style={{ color: "var(--color-red)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Code PIN incorrect. Veuillez réessayer.
            </p>
          )}

          <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }}>
            Connexion au Backoffice
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "40px", paddingBottom: "60px" }}>
      <div className="container">
        {/* Isolated Backoffice Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/" className="btn btn--ghost btn--sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <ArrowLeft size={16} /> Site Public
            </Link>
            <div>
              <span className="section-label" style={{ margin: 0 }}>Espace Administrateur</span>
              <h1 className="page-header__title" style={{ fontSize: "2rem", margin: 0 }}>
                Backoffice <span className="text-accent">Tlénor Gym</span>
              </h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.8rem", padding: "6px 12px", borderRadius: "20px", background: isSupabaseConfigured ? "rgba(37, 211, 102, 0.15)" : "var(--color-surface)", color: isSupabaseConfigured ? "#25d366" : "var(--color-text-muted)", border: "1px solid var(--color-border)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <Database size={14} /> {isSupabaseConfigured ? "Supabase Connecté" : "Stockage Local Active"}
            </span>
            <button onClick={() => setIsAuthenticated(false)} className="btn btn--outline btn--sm">
              Déconnexion
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "0.5rem", marginBottom: "2rem" }}>
          <button
            className={`btn btn--sm ${activeTab === "analytics" ? "btn--primary" : "btn--ghost"}`}
            onClick={() => setActiveTab("analytics")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <BarChart3 size={16} /> Vue d&apos;Ensemble & Analytics
          </button>
          <button
            className={`btn btn--sm ${activeTab === "products" ? "btn--primary" : "btn--ghost"}`}
            onClick={() => setActiveTab("products")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Package size={16} /> Catalogue Produits ({productsList.length})
          </button>
          <button
            className={`btn btn--sm ${activeTab === "plans" ? "btn--primary" : "btn--ghost"}`}
            onClick={() => setActiveTab("plans")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <CreditCard size={16} /> Tarifs & Abonnements
          </button>
          <button
            className={`btn btn--sm ${activeTab === "media" ? "btn--primary" : "btn--ghost"}`}
            onClick={() => setActiveTab("media")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <ImageIcon size={16} /> Galerie & Photos
          </button>
        </div>

        {/* Tab 1: Analytics */}
        {activeTab === "analytics" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
                  <span>Visites du Site</span>
                  <TrendingUp size={20} className="text-accent" />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 700 }}>2 480</div>
                <div style={{ fontSize: "0.8rem", color: "#25d366", marginTop: "0.25rem" }}>+18% ce mois-ci</div>
              </div>

              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
                  <span>Membres Actifs</span>
                  <Users size={20} className="text-accent" />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 700 }}>310</div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>Abonnés enregistrés</div>
              </div>

              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
                  <span>Produits en Stock</span>
                  <Package size={20} className="text-accent" />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 700 }}>{productsList.filter((p) => p.stock).length} / {productsList.length}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>Disponibles en salle</div>
              </div>

              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
                  <span>Base de Données</span>
                  <Database size={20} className="text-accent" />
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: isSupabaseConfigured ? "#25d366" : "var(--color-text-muted)" }}>
                  {isSupabaseConfigured ? "Supabase Cloud" : "Mode Démo / Local"}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                  {isSupabaseConfigured ? "Synchro automatique API" : "Prêt à être connecté"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products Management (Full CRUD) */}
        {activeTab === "products" && (
          <div>
            {/* Add Product Form */}
            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "1.75rem", marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Plus size={18} className="text-accent" /> Ajouter un Nouveau Produit
              </h3>
              <form onSubmit={handleAddProduct} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", alignItems: "end" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.3rem" }}>Nom du produit</label>
                  <input
                    type="text"
                    placeholder="Ex: BCAA 4:1:1 Extreme"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    style={{ width: "100%", padding: "10px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.3rem" }}>Prix (DA)</label>
                  <input
                    type="text"
                    placeholder="Ex: 4800 DA"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    style={{ width: "100%", padding: "10px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.3rem" }}>Catégorie</label>
                  <select
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value)}
                    style={{ width: "100%", padding: "10px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff" }}
                  >
                    <option value="Protéines">Protéines</option>
                    <option value="Acides Aminés">Acides Aminés</option>
                    <option value="Performance">Performance</option>
                    <option value="Vitamines">Vitamines</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.3rem" }}>Description</label>
                  <input
                    type="text"
                    placeholder="Ex: Pot de 500g"
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    style={{ width: "100%", padding: "10px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff" }}
                  />
                </div>
                <button type="submit" className="btn btn--primary" style={{ justifyContent: "center" }}>
                  <Plus size={16} /> Ajouter au catalogue
                </button>
              </form>
            </div>

            {/* Products Table */}
            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid var(--color-border)" }}>
                    <th style={{ padding: "1rem" }}>Produit</th>
                    <th style={{ padding: "1rem" }}>Catégorie</th>
                    <th style={{ padding: "1rem" }}>Description</th>
                    <th style={{ padding: "1rem" }}>Prix</th>
                    <th style={{ padding: "1rem" }}>Stock</th>
                    <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productsList.map((prod) => (
                    <tr key={prod.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td style={{ padding: "1rem", fontWeight: 600 }}>{prod.name}</td>
                      <td style={{ padding: "1rem", color: "var(--color-text-secondary)" }}>{prod.category}</td>
                      <td style={{ padding: "1rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>{prod.desc}</td>
                      <td style={{ padding: "1rem", color: "var(--color-accent)", fontWeight: 700 }}>{prod.price}</td>
                      <td style={{ padding: "1rem" }}>
                        <button
                          onClick={() => toggleStock(prod.id)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            background: prod.stock ? "rgba(37, 211, 102, 0.15)" : "rgba(230, 57, 70, 0.15)",
                            color: prod.stock ? "#25d366" : "#ff6b6b",
                            border: prod.stock ? "1px solid rgba(37, 211, 102, 0.3)" : "1px solid rgba(230, 57, 70, 0.3)",
                            cursor: "pointer",
                          }}
                        >
                          {prod.stock ? "En Stock" : "Rupture"}
                        </button>
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => setEditingProduct(prod)}
                            style={{ color: "var(--color-accent)", background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                            title="Modifier ce produit"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => deleteProduct(prod.id)}
                            style={{ color: "#ff6b6b", background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                            title="Supprimer ce produit"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Plans */}
        {activeTab === "plans" && (
          <div>
            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem", marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "var(--font-heading)", marginBottom: "1rem" }}>Tarifs Officiels Configurés</h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                Ces tarifs proviennent directement de la fiche officielle de la salle Tlénor Gym Draria.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                <div style={{ padding: "1.25rem", background: "var(--color-bg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                  <h4 style={{ color: "var(--color-accent)", marginBottom: "0.75rem" }}>Cardio Musculation</h4>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                    <li>• 08 Séances : <strong>5 000 DA</strong></li>
                    <li>• 12 Séances : <strong>6 000 DA</strong></li>
                    <li>• 16 Séances : <strong>7 000 DA</strong></li>
                    <li>• Illimité : <strong>8 000 DA</strong></li>
                    <li>• Séance Libre (1h30) : <strong>1 000 DA</strong></li>
                  </ul>
                </div>

                <div style={{ padding: "1.25rem", background: "var(--color-bg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                  <h4 style={{ color: "var(--color-accent)", marginBottom: "0.75rem" }}>Musculation Seule</h4>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                    <li>• 08 Séances : <strong>3 000 DA</strong></li>
                    <li>• 12 Séances : <strong>4 000 DA</strong></li>
                    <li>• 16 Séances : <strong>5 000 DA</strong></li>
                    <li>• Illimité : <strong>6 000 DA</strong></li>
                  </ul>
                </div>

                <div style={{ padding: "1.25rem", background: "var(--color-bg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                  <h4 style={{ color: "var(--color-accent)", marginBottom: "0.75rem" }}>Promotions Actives</h4>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                    <li>• 3 Mois : <strong>2 000 DA remise</strong></li>
                    <li>• 6 Mois : <strong>1 Mois Offert</strong></li>
                    <li>• 12 Mois : <strong>4 Mois Offerts</strong></li>
                    <li>• Étudiant : <strong>1 000 DA remise</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Media */}
        {activeTab === "media" && (
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Zap size={20} className="text-accent" /> Photos Optimisées du Site
            </h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Toutes les photos sont optimisées et réduites pour un chargement rapide sur GitHub et Vercel.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              <div style={{ padding: "1rem", background: "var(--color-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                <div style={{ fontWeight: 700, color: "var(--color-text)", marginBottom: "0.25rem" }}>logo.png</div>
                <div style={{ fontSize: "0.8rem", color: "#25d366" }}>Logo officiel (314 KB)</div>
              </div>
              <div style={{ padding: "1rem", background: "var(--color-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                <div style={{ fontWeight: 700, color: "var(--color-text)", marginBottom: "0.25rem" }}>tarifs-official.jpg</div>
                <div style={{ fontSize: "0.8rem", color: "#25d366" }}>Fiche tarifs (216 KB)</div>
              </div>
              <div style={{ padding: "1rem", background: "var(--color-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                <div style={{ fontWeight: 700, color: "var(--color-text)", marginBottom: "0.25rem" }}>planning-official.jpg</div>
                <div style={{ fontSize: "0.8rem", color: "#25d366" }}>Fiche planning (298 KB)</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setEditingProduct(null)}
        >
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)",
              padding: "2rem",
              maxWidth: "500px",
              width: "100%",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEditingProduct(null)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "#fff", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Edit3 size={20} className="text-accent" /> Modifier le Produit
            </h3>

            <form onSubmit={handleSaveEditedProduct} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.3rem" }}>Nom du Produit</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.3rem" }}>Prix (DA)</label>
                <input
                  type="text"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.3rem" }}>Catégorie</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff" }}
                >
                  <option value="Protéines">Protéines</option>
                  <option value="Acides Aminés">Acides Aminés</option>
                  <option value="Performance">Performance</option>
                  <option value="Vitamines">Vitamines</option>
                  <option value="Snacks">Snacks</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.3rem" }}>Description / Poids</label>
                <input
                  type="text"
                  value={editingProduct.desc || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, desc: e.target.value })}
                  style={{ width: "100%", padding: "10px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff" }}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="submit" className="btn btn--primary" style={{ flex: 1, justifyContent: "center" }}>
                  <Check size={16} /> Enregistrer les modifications
                </button>
                <button type="button" onClick={() => setEditingProduct(null)} className="btn btn--ghost" style={{ justifyContent: "center" }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
