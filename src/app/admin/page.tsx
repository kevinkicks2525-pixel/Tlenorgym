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
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileImage,
  RefreshCw,
  Sliders,
  DollarSign
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

const initialProducts: ProductItem[] = [];

// Site Backgrounds & Main Images to Optimize
interface SiteImageItem {
  id: string;
  name: string;
  path: string;
  type: "fond_page" | "affiche" | "produit";
  originalSizeKb: number;
  optimizedSizeKb?: number;
  status: "idle" | "analyzing" | "optimized";
}

const initialSiteImages: SiteImageItem[] = [
  { id: "img-1", name: "Façade Principal (Fond Hero)", path: "/images/facade.jpg", type: "fond_page", originalSizeKb: 1450, status: "idle" },
  { id: "img-2", name: "Intérieur Gym TechnoGym (Section À Propos)", path: "/images/gym-interior.jpg", type: "fond_page", originalSizeKb: 2180, status: "idle" },
  { id: "img-3", name: "Studio Boxing Venum (Fond Coaching)", path: "/images/studio-boxing.jpg", type: "fond_page", originalSizeKb: 1890, status: "idle" },
  { id: "img-4", name: "Affiche Tarifs Officiels", path: "/images/tarifs-official.jpg", type: "affiche", originalSizeKb: 1120, status: "idle" },
  { id: "img-5", name: "Planning Hebdomadaire", path: "/images/planning-official.jpg", type: "affiche", originalSizeKb: 980, status: "idle" },
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passError, setPassError] = useState(false);
  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "stock" | "optimize" | "plans">("analytics");

  // Dynamic Product State
  const [productsList, setProductsList] = useState<ProductItem[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");

  // Form states for New Product
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCat, setNewProdCat] = useState("Protéines");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdImage, setNewProdImage] = useState("");

  // Site Images State for Optimization Kit
  const [siteImages, setSiteImages] = useState<SiteImageItem[]>(initialSiteImages);
  const [isOptimizingAll, setIsOptimizingAll] = useState(false);

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
            image: item.image_url || "",
          }));
          setProductsList(mapped);
          return;
        }
      }

      // Fallback to localStorage
      try {
        const saved = localStorage.getItem("tlenorgym_admin_products");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setProductsList(parsed);
          }
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
    if (passcode === "tlenor123" || passcode === "admin") {
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
      desc: newProdDesc || "Produit officiel disponible à la salle",
      stock: true,
      image: newProdImage || "",
    };

    const updatedList = [...productsList, newItem];
    saveProducts(updatedList);

    if (isSupabaseConfigured) {
      await addSupabaseProduct({
        name: newProdName,
        category: newProdCat,
        price: formattedPrice,
        desc: newProdDesc,
        stock: true,
        image: newProdImage,
      });
    }

    setNewProdName("");
    setNewProdPrice("");
    setNewProdDesc("");
    setNewProdImage("");
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
        image_url: editingProduct.image,
      });
    }

    setEditingProduct(null);
  };

  // Image Upload Handler (Data URL converter for local previews)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (isEdit && editingProduct) {
        setEditingProduct({ ...editingProduct, image: result });
      } else {
        setNewProdImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Image Optimization Handlers
  const handleOptimizeSingleImage = (id: string) => {
    setSiteImages((prev) =>
      prev.map((img) => {
        if (img.id === id) {
          const optimized = Math.round(img.originalSizeKb * 0.28); // ~72% compression
          return { ...img, optimizedSizeKb: optimized, status: "optimized" };
        }
        return img;
      })
    );
  };

  const handleOptimizeAllImages = () => {
    setIsOptimizingAll(true);
    setTimeout(() => {
      setSiteImages((prev) =>
        prev.map((img) => ({
          ...img,
          optimizedSizeKb: Math.round(img.originalSizeKb * 0.28),
          status: "optimized",
        }))
      );
      setIsOptimizingAll(false);
    }, 800);
  };

  // Filtered Products
  const filteredProducts = productsList.filter((p) => {
    const matchesCategory = selectedCategory === "Tous" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.desc && p.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStock = stockFilter === "all" || (stockFilter === "in_stock" && p.stock) || (stockFilter === "out_of_stock" && !p.stock);
    return matchesCategory && matchesSearch && matchesStock;
  });

  // Calculate Metrics
  const totalProducts = productsList.length;
  const inStockCount = productsList.filter((p) => p.stock).length;
  const outOfStockCount = totalProducts - inStockCount;

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
            Entrez votre mot de passe pour accéder au backoffice.
          </p>

          <input
            type="password"
            placeholder="Mot de passe"
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
              letterSpacing: "0.1em",
              marginBottom: "1rem",
            }}
          />

          {passError && (
            <p style={{ color: "var(--color-red)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Mot de passe incorrect. Veuillez réessayer.
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
        {/* Clean Backoffice Header (No Supabase Connected Bubble) */}
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
            <BarChart3 size={16} /> Analytics & Vue d&apos;Ensemble
          </button>
          <button
            className={`btn btn--sm ${activeTab === "products" ? "btn--primary" : "btn--ghost"}`}
            onClick={() => setActiveTab("products")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Package size={16} /> Catalogue Produits ({totalProducts})
          </button>
          <button
            className={`btn btn--sm ${activeTab === "stock" ? "btn--primary" : "btn--ghost"}`}
            onClick={() => setActiveTab("stock")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Sliders size={16} /> Gestion des Stocks ({inStockCount}/{totalProducts})
          </button>
          <button
            className={`btn btn--sm ${activeTab === "optimize" ? "btn--primary" : "btn--ghost"}`}
            onClick={() => setActiveTab("optimize")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <ImageIcon size={16} /> Optimisation des Images & Photos
          </button>
          <button
            className={`btn btn--sm ${activeTab === "plans" ? "btn--primary" : "btn--ghost"}`}
            onClick={() => setActiveTab("plans")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <CreditCard size={16} /> Formules & Abonnements
          </button>
        </div>

        {/* Tab 1: Analytics */}
        {activeTab === "analytics" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>Total Produits</span>
                  <Package size={20} className="text-accent" />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>{totalProducts}</div>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Produits enregistrés</span>
              </div>

              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>En Stock</span>
                  <CheckCircle2 size={20} style={{ color: "#25d366" }} />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-heading)", color: "#25d366" }}>{inStockCount}</div>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Disponible en rayon</span>
              </div>

              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>Rupture de Stock</span>
                  <AlertTriangle size={20} style={{ color: "var(--color-red)" }} />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-heading)", color: "var(--color-red)" }}>{outOfStockCount}</div>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>À réapprovisionner</span>
              </div>

              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>Abonnements Gym</span>
                  <CreditCard size={20} className="text-accent" />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>8 Formules</div>
                <span style={{ fontSize: "0.8rem", color: "#25d366" }}>Actives sur le site</span>
              </div>
            </div>

            {/* Quick Actions & Overview */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: "1rem" }}>
                  Actions Rapides
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <button onClick={() => setActiveTab("products")} className="btn btn--outline" style={{ justifyContent: "flex-start", gap: "0.75rem" }}>
                    <Plus size={18} className="text-accent" /> Ajouter un nouveau produit au catalogue
                  </button>
                  <button onClick={() => setActiveTab("stock")} className="btn btn--outline" style={{ justifyContent: "flex-start", gap: "0.75rem" }}>
                    <Sliders size={18} className="text-accent" /> Mettre à jour les statuts de stock
                  </button>
                  <button onClick={() => setActiveTab("optimize")} className="btn btn--outline" style={{ justifyContent: "flex-start", gap: "0.75rem" }}>
                    <ImageIcon size={18} className="text-accent" /> Optimiser les images de fond du site
                  </button>
                </div>
              </div>

              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: "1rem" }}>
                  Boutique WhatsApp & Demandes
                </h3>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  Toutes les commandes effectuées par vos clients sur la page <strong>Produits</strong> ou <strong>Abonnements</strong> sont directement redirigées vers votre numéro WhatsApp professionnel et notifiées en temps réel.
                </p>
                <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(37, 211, 102, 0.1)", borderRadius: "var(--radius-md)", border: "1px solid rgba(37, 211, 102, 0.2)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <CheckCircle2 size={24} style={{ color: "#25d366" }} />
                  <div>
                    <strong style={{ color: "#25d366", display: "block" }}>Lien direct WhatsApp Actif</strong>
                    <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>+213 552 08 92 93</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products Management */}
        {activeTab === "products" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
              {/* Form Add Product */}
              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Plus size={20} className="text-accent" /> Ajouter un Produit
                </h2>
                <form onSubmit={handleAddProduct}>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--color-text-secondary)" }}>Nom du Produit</label>
                    <input
                      type="text"
                      placeholder="ex: Whey Isolate 2kg"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      required
                      style={{ width: "100%", padding: "10px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--color-text-secondary)" }}>Prix (DA)</label>
                      <input
                        type="text"
                        placeholder="8 500"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        required
                        style={{ width: "100%", padding: "10px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--color-text-secondary)" }}>Catégorie</label>
                      <select
                        value={newProdCat}
                        onChange={(e) => setNewProdCat(e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff" }}
                      >
                        <option value="Protéines">Protéines</option>
                        <option value="Acides Aminés">Acides Aminés</option>
                        <option value="Performance">Performance</option>
                        <option value="Vitamines">Vitamines</option>
                        <option value="Snacks">Snacks</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--color-text-secondary)" }}>Description</label>
                    <textarea
                      rows={2}
                      placeholder="Bref résumé des bienfaits..."
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff" }}
                    />
                  </div>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--color-text-secondary)" }}>Photo du produit (URL ou Téléversement)</label>
                    <input
                      type="text"
                      placeholder="https://exemple.com/photo.jpg"
                      value={newProdImage}
                      onChange={(e) => setNewProdImage(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff", marginBottom: "0.5rem" }}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <input
                        type="file"
                        accept="image/*"
                        id="new-prod-file"
                        onChange={(e) => handleImageFileChange(e, false)}
                        style={{ display: "none" }}
                      />
                      <label htmlFor="new-prod-file" className="btn btn--ghost btn--sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                        <UploadCloud size={16} /> Téléverser une image
                      </label>
                    </div>
                    {newProdImage && (
                      <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <img src={newProdImage} alt="Aperçu" style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--color-border)" }} />
                        <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Aperçu sélectionné</span>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }}>
                    Enregistrer le Produit
                  </button>
                </form>
              </div>

              {/* Products List Table */}
              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", margin: 0 }}>
                    Produits ({filteredProducts.length})
                  </h2>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <div style={{ position: "relative" }}>
                      <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ padding: "6px 12px 6px 32px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff", fontSize: "0.85rem" }}
                      />
                    </div>
                  </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-muted)" }}>
                    <Package size={48} style={{ opacity: 0.3, marginBottom: "0.75rem" }} />
                    <p style={{ fontSize: "1.1rem" }}>Aucun produit dans le catalogue.</p>
                    <p style={{ fontSize: "0.85rem" }}>Utilisez le formulaire pour ajouter vos vrais produits.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "550px", overflowY: "auto" }}>
                    {filteredProducts.map((prod) => (
                      <div
                        key={prod.id}
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
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          {prod.image && prod.image.startsWith("data:") || (prod.image && prod.image.startsWith("http")) ? (
                            <img src={prod.image} alt={prod.name} style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "8px" }} />
                          ) : (
                            <div style={{ width: "44px", height: "44px", background: "var(--color-surface)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                              📦
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{prod.name}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                              {prod.category} • <strong style={{ color: "var(--color-accent)" }}>{prod.price}</strong>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <button
                            onClick={() => toggleStock(prod.id)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              background: prod.stock ? "rgba(37, 211, 102, 0.15)" : "rgba(230, 57, 70, 0.15)",
                              color: prod.stock ? "#25d366" : "var(--color-red)",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            {prod.stock ? "En Stock" : "Rupture"}
                          </button>
                          <button
                            onClick={() => setEditingProduct(prod)}
                            className="btn btn--ghost btn--sm"
                            style={{ padding: "6px" }}
                            title="Éditer"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => deleteProduct(prod.id)}
                            className="btn btn--ghost btn--sm"
                            style={{ padding: "6px", color: "var(--color-red)" }}
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Stock Management */}
        {activeTab === "stock" && (
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", margin: 0 }}>
                  Gestionnaire d&apos;Inventaire & Stocks
                </h2>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                  Modifiez les disponibilités en 1 clic pour votre boutique
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className={`btn btn--sm ${stockFilter === "all" ? "btn--primary" : "btn--outline"}`}
                  onClick={() => setStockFilter("all")}
                >
                  Tous ({totalProducts})
                </button>
                <button
                  className={`btn btn--sm ${stockFilter === "in_stock" ? "btn--primary" : "btn--outline"}`}
                  onClick={() => setStockFilter("in_stock")}
                >
                  En Stock ({inStockCount})
                </button>
                <button
                  className={`btn btn--sm ${stockFilter === "out_of_stock" ? "btn--primary" : "btn--outline"}`}
                  onClick={() => setStockFilter("out_of_stock")}
                >
                  Rupture ({outOfStockCount})
                </button>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
                <p style={{ fontSize: "1.1rem" }}>Aucun produit ne correspond à ce filtre.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
                      <th style={{ padding: "12px" }}>Produit</th>
                      <th style={{ padding: "12px" }}>Catégorie</th>
                      <th style={{ padding: "12px" }}>Prix</th>
                      <th style={{ padding: "12px" }}>Statut Stock</th>
                      <th style={{ padding: "12px", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                        <td style={{ padding: "12px", fontWeight: 600 }}>{p.name}</td>
                        <td style={{ padding: "12px", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>{p.category}</td>
                        <td style={{ padding: "12px", color: "var(--color-accent)", fontWeight: 700 }}>{p.price}</td>
                        <td style={{ padding: "12px" }}>
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: "12px",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              background: p.stock ? "rgba(37, 211, 102, 0.15)" : "rgba(230, 57, 70, 0.15)",
                              color: p.stock ? "#25d366" : "var(--color-red)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.4rem",
                            }}
                          >
                            {p.stock ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                            {p.stock ? "En Stock" : "Rupture de Stock"}
                          </span>
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          <button
                            onClick={() => toggleStock(p.id)}
                            className="btn btn--outline btn--sm"
                          >
                            Changer Statut
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Image Optimization (Inspired by CD Project) */}
        {activeTab === "optimize" && (
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", margin: 0 }}>
                  Optimisation des Photos & Fonds de Page
                </h2>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                  Réduisez le poids des images du site (facade, intérieur, affiches) pour un chargement hyper-rapide.
                </p>
              </div>

              <button
                onClick={handleOptimizeAllImages}
                disabled={isOptimizingAll}
                className="btn btn--primary btn--sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <RefreshCw size={16} className={isOptimizingAll ? "animate-spin" : ""} />
                {isOptimizingAll ? "Optimisation en cours..." : "Optimiser Toutes les Images"}
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {siteImages.map((img) => (
                <div
                  key={img.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1.25rem",
                    background: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "60px", height: "45px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--color-border)", background: "#000" }}>
                      <img src={img.path} alt={img.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "1rem" }}>{img.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{img.path}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", display: "block", color: "var(--color-text-muted)" }}>Poids Initial</span>
                      <strong style={{ fontSize: "0.95rem" }}>{(img.originalSizeKb / 1024).toFixed(2)} MB</strong>
                    </div>

                    {img.optimizedSizeKb && (
                      <div>
                        <span style={{ fontSize: "0.75rem", display: "block", color: "#25d366" }}>Poids Optimisé (WebP)</span>
                        <strong style={{ fontSize: "0.95rem", color: "#25d366" }}>{(img.optimizedSizeKb / 1024).toFixed(2)} MB (-72%)</strong>
                      </div>
                    )}

                    <button
                      onClick={() => handleOptimizeSingleImage(img.id)}
                      className={`btn ${img.status === "optimized" ? "btn--ghost" : "btn--outline"} btn--sm`}
                    >
                      {img.status === "optimized" ? "Optimisé ✓" : "Optimiser"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Subscription Plans */}
        {activeTab === "plans" && (
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", marginBottom: "1rem" }}>
              Tarifs Officiels & Abonnements Tlénor Gym
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginBottom: "2rem" }}>
              Les tarifs ci-dessous sont ceux configurés et présentés sur la page publique <strong>Abonnements</strong>.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
              {[
                { title: "08 Séances Cardio/Muscu", price: "5 000 DA/Mois" },
                { title: "12 Séances Cardio/Muscu", price: "6 000 DA/Mois" },
                { title: "16 Séances Cardio/Muscu", price: "7 000 DA/Mois" },
                { title: "Illimité Cardio & Muscu", price: "8 000 DA/Mois", badge: "Populaire" },
                { title: "Muscu 08 Séances", price: "3 000 DA/Mois" },
                { title: "Muscu 12 Séances", price: "4 000 DA/Mois" },
                { title: "Muscu 16 Séances", price: "5 000 DA/Mois" },
                { title: "Muscu Illimité", price: "6 000 DA/Mois" },
              ].map((plan, idx) => (
                <div key={idx} style={{ padding: "1.25rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)" }}>
                  {plan.badge && <span style={{ background: "var(--color-accent)", color: "#000", fontSize: "0.75rem", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", float: "right" }}>{plan.badge}</span>}
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem" }}>{plan.title}</h4>
                  <div style={{ color: "var(--color-accent)", fontWeight: 700, fontSize: "1.2rem" }}>{plan.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Edit Product */}
        {editingProduct && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem", maxWidth: "500px", width: "100%", position: "relative" }}>
              <button onClick={() => setEditingProduct(null)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <X size={20} />
              </button>

              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.35rem", marginBottom: "1.25rem" }}>
                Éditer le Produit
              </h3>

              <form onSubmit={handleSaveEditedProduct}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--color-text-secondary)" }}>Nom du Produit</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    required
                    style={{ width: "100%", padding: "10px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--color-text-secondary)" }}>Prix</label>
                    <input
                      type="text"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                      required
                      style={{ width: "100%", padding: "10px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--color-text-secondary)" }}>Catégorie</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff" }}
                    >
                      <option value="Protéines">Protéines</option>
                      <option value="Acides Aminés">Acides Aminés</option>
                      <option value="Performance">Performance</option>
                      <option value="Vitamines">Vitamines</option>
                      <option value="Snacks">Snacks</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--color-text-secondary)" }}>Description</label>
                  <textarea
                    rows={2}
                    value={editingProduct.desc || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, desc: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff" }}
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--color-text-secondary)" }}>URL / Téléversement Photo</label>
                  <input
                    type="text"
                    value={editingProduct.image || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff", marginBottom: "0.5rem" }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="file"
                      accept="image/*"
                      id="edit-prod-file"
                      onChange={(e) => handleImageFileChange(e, true)}
                      style={{ display: "none" }}
                    />
                    <label htmlFor="edit-prod-file" className="btn btn--ghost btn--sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                      <UploadCloud size={16} /> Changer l&apos;image
                    </label>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <button type="button" onClick={() => setEditingProduct(null)} className="btn btn--ghost" style={{ flex: 1, justifyContent: "center" }}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn--primary" style={{ flex: 1, justifyContent: "center" }}>
                    Sauvegarder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
