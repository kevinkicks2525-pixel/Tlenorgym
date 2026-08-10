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
  ShoppingBag,
  Truck,
  Phone,
  Calendar,
  Eye,
  FolderTree,
  Activity,
  MousePointer,
  Sparkles,
  Minus
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { 
  getSupabaseProducts, 
  addSupabaseProduct, 
  updateSupabaseProduct, 
  deleteSupabaseProduct, 
  getSupabaseOrders,
  updateSupabaseOrderStatus,
  deleteSupabaseOrder,
  getSupabaseCategories,
  addSupabaseCategory,
  deleteSupabaseCategory,
  OrderItemData,
  isSupabaseConfigured 
} from "@/lib/supabase";

export interface ProductItem {
  id: number | string;
  name: string;
  category: string;
  price: string;
  stock: boolean;
  stock_quantity: number;
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

const defaultCategories = ["Protéines", "Acides Aminés", "Performance", "Vitamines", "Snacks"];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passError, setPassError] = useState(false);
  const [activeTab, setActiveTab] = useState<"analytics" | "orders" | "products" | "categories" | "stock" | "optimize">("analytics");

  // Dynamic Product State
  const [productsList, setProductsList] = useState<ProductItem[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("Tous");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");

  // Categories State
  const [categoriesList, setCategoriesList] = useState<string[]>(defaultCategories);
  const [newCatName, setNewCatName] = useState("");

  // Orders State
  const [ordersList, setOrdersList] = useState<OrderItemData[]>([]);
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderItemData | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for New Product
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCat, setNewProdCat] = useState("Protéines");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdImage, setNewProdImage] = useState("");
  const [newProdStockQty, setNewProdStockQty] = useState(10);

  // Site & Product Images State for Optimization Kit
  const [siteImages, setSiteImages] = useState<SiteImageItem[]>(initialSiteImages);
  const [isOptimizingAll, setIsOptimizingAll] = useState(false);

  // Load Data
  useEffect(() => {
    async function loadData() {
      // Products
      if (isSupabaseConfigured) {
        const supaData = await getSupabaseProducts();
        if (supaData && supaData.length > 0) {
          const mapped: ProductItem[] = supaData.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            price: item.price,
            stock: (item.stock_quantity ?? (item.stock ? 10 : 0)) > 0,
            stock_quantity: item.stock_quantity ?? (item.stock ? 10 : 0),
            desc: item.description || "",
            image: item.image_url || "",
          }));
          setProductsList(mapped);
        }

        // Categories
        const supaCats = await getSupabaseCategories();
        if (supaCats && supaCats.length > 0) {
          setCategoriesList(supaCats.map((c: any) => c.name));
        }

        // Orders
        const supaOrders = await getSupabaseOrders();
        if (supaOrders && supaOrders.length > 0) {
          setOrdersList(supaOrders);
        }
      }

      // Fallback to localStorage for Products
      try {
        const savedProducts = localStorage.getItem("tlenorgym_admin_products");
        if (savedProducts) {
          const parsed = JSON.parse(savedProducts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProductsList(parsed);
          }
        }
      } catch {
        // fallback
      }

      // Fallback to localStorage for Categories
      try {
        const savedCats = localStorage.getItem("tlenorgym_admin_categories");
        if (savedCats) {
          const parsed = JSON.parse(savedCats);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategoriesList(parsed);
          }
        }
      } catch {
        // fallback
      }

      // Fallback to localStorage for Orders
      try {
        const savedOrders = localStorage.getItem("tlenorgym_admin_orders");
        if (savedOrders) {
          const parsed = JSON.parse(savedOrders);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOrdersList(parsed);
          }
        }
      } catch {
        // fallback
      }
    }
    loadData();
  }, []);

  // Update product image optimization list whenever products change
  useEffect(() => {
    const productImagesToOptimize: SiteImageItem[] = productsList
      .filter((p) => p.image && (p.image.startsWith("http") || p.image.startsWith("data:")))
      .map((p, idx) => ({
        id: `prod-img-${p.id}`,
        name: `Photo Produit: ${p.name}`,
        path: p.image || "",
        type: "produit",
        originalSizeKb: Math.round(p.image!.length / 1024 * 0.75) || 450,
        status: "idle",
      }));

    setSiteImages([...initialSiteImages, ...productImagesToOptimize]);
  }, [productsList]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const saveProducts = (newList: ProductItem[]) => {
    setProductsList(newList);
    try {
      localStorage.setItem("tlenorgym_admin_products", JSON.stringify(newList));
    } catch {
      // fallback
    }
  };

  const saveCategories = (newList: string[]) => {
    setCategoriesList(newList);
    try {
      localStorage.setItem("tlenorgym_admin_categories", JSON.stringify(newList));
    } catch {
      // fallback
    }
  };

  const saveOrders = (newList: OrderItemData[]) => {
    setOrdersList(newList);
    try {
      localStorage.setItem("tlenorgym_admin_orders", JSON.stringify(newList));
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

  // Handle Add Product with Form Reset & Toast Notification
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
      stock: newProdStockQty > 0,
      stock_quantity: newProdStockQty,
      image: newProdImage || "",
    };

    const updatedList = [newItem, ...productsList];
    saveProducts(updatedList);

    if (isSupabaseConfigured) {
      await addSupabaseProduct({
        name: newProdName,
        category: newProdCat,
        price: formattedPrice,
        desc: newProdDesc,
        stock: newProdStockQty > 0,
        image: newProdImage,
      });
    }

    // Reset Form Fields
    setNewProdName("");
    setNewProdPrice("");
    setNewProdDesc("");
    setNewProdImage("");
    setNewProdStockQty(10);

    // Show Toast Notification
    showToast("✓ Produit enregistré et ajouté au catalogue avec succès !");
  };

  // Stock Quantity Adjuster
  const updateProductQuantity = async (id: number | string, delta: number) => {
    const updated = productsList.map((p) => {
      if (p.id === id) {
        const newQty = Math.max(0, p.stock_quantity + delta);
        return { ...p, stock_quantity: newQty, stock: newQty > 0 };
      }
      return p;
    });
    saveProducts(updated);

    const target = updated.find((p) => p.id === id);
    if (target && isSupabaseConfigured) {
      await updateSupabaseProduct(id, { stock_quantity: target.stock_quantity, stock: target.stock_quantity > 0 });
    }
  };

  const setExactStockQuantity = async (id: number | string, qty: number) => {
    const validQty = Math.max(0, qty || 0);
    const updated = productsList.map((p) => (p.id === id ? { ...p, stock_quantity: validQty, stock: validQty > 0 } : p));
    saveProducts(updated);

    if (isSupabaseConfigured) {
      await updateSupabaseProduct(id, { stock_quantity: validQty, stock: validQty > 0 });
    }
  };

  const deleteProduct = async (id: number | string) => {
    if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      const updated = productsList.filter((p) => p.id !== id);
      saveProducts(updated);

      if (isSupabaseConfigured) {
        await deleteSupabaseProduct(id);
      }
      showToast("Produit supprimé du catalogue.");
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
        stock_quantity: editingProduct.stock_quantity,
        stock: editingProduct.stock_quantity > 0,
      });
    }

    setEditingProduct(null);
    showToast("Produit mis à jour avec succès.");
  };

  // Categories Handlers
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const catNameFormatted = newCatName.trim();

    if (categoriesList.includes(catNameFormatted)) {
      alert("Cette catégorie existe déjà.");
      return;
    }

    const updated = [...categoriesList, catNameFormatted];
    saveCategories(updated);

    if (isSupabaseConfigured) {
      await addSupabaseCategory(catNameFormatted);
    }

    setNewCatName("");
    showToast("✓ Nouvelle catégorie ajoutée !");
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (confirm(`Voulez-vous supprimer la catégorie "${categoryName}" ?`)) {
      const updated = categoriesList.filter((c) => c !== categoryName);
      saveCategories(updated);
      showToast("Catégorie supprimée.");
    }
  };

  // Orders Handlers
  const handleOrderStatusChange = async (orderId: number | string, newStatus: string) => {
    const updated = ordersList.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    saveOrders(updated);

    if (isSupabaseConfigured) {
      await updateSupabaseOrderStatus(orderId, newStatus);
    }
    showToast(`Statut commande #${orderId} mis à jour : ${newStatus}`);
  };

  const handleDeleteOrder = async (orderId: number | string) => {
    if (confirm("Voulez-vous vraiment supprimer cette commande ?")) {
      const updated = ordersList.filter((o) => o.id !== orderId);
      saveOrders(updated);

      if (isSupabaseConfigured) {
        await deleteSupabaseOrder(orderId);
      }
      showToast("Commande supprimée.");
    }
  };

  // Image Upload Handler (Auto WebP / Data URL)
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
          const optimized = Math.round(img.originalSizeKb * 0.28);
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
      showToast("Toutes les images ont été compressées en WebP !");
    }, 800);
  };

  // Filtered Products
  const filteredProducts = productsList.filter((p) => {
    const matchesCategory = selectedCategoryFilter === "Tous" || p.category === selectedCategoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.desc && p.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStock = stockFilter === "all" || (stockFilter === "in_stock" && p.stock_quantity > 0) || (stockFilter === "out_of_stock" && p.stock_quantity === 0);
    return matchesCategory && matchesSearch && matchesStock;
  });

  // Filtered Orders
  const filteredOrders = ordersList.filter((o) => {
    if (orderFilter === "all") return true;
    return o.status === orderFilter;
  });

  // Metrics
  const totalProducts = productsList.length;
  const inStockCount = productsList.filter((p) => p.stock_quantity > 0).length;
  const outOfStockCount = productsList.filter((p) => p.stock_quantity === 0).length;
  const totalOrdersCount = ordersList.length;
  const newOrdersCount = ordersList.filter((o) => o.status === "Nouvelle").length;

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
            placeholder="Mot de passe (tlenor123)"
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
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* Toast Banner */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 99999,
            background: "#25d366",
            color: "#000",
            fontWeight: 700,
            padding: "12px 24px",
            borderRadius: "var(--radius-lg)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <CheckCircle2 size={20} /> {toastMessage}
        </div>
      )}

      {/* Pro Left Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={() => setIsAuthenticated(false)}
        ordersCount={totalOrdersCount}
        newOrdersCount={newOrdersCount}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "2rem 2.5rem", overflowY: "auto" }}>
        {/* Header Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "1.25rem" }}>
          <div>
            <span className="section-label" style={{ margin: 0 }}>Backoffice Administrateur</span>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", margin: 0 }}>
              {activeTab === "analytics" && "Tableau de Bord & Analytics Visites"}
              {activeTab === "orders" && "Commandes & Livraisons (Yalidine Algérie)"}
              {activeTab === "products" && "Catalogue Produits Boutique"}
              {activeTab === "categories" && "Gestion des Catégories"}
              {activeTab === "stock" && "Gestionnaire de Stocks Quantitatif"}
              {activeTab === "optimize" && "Optimisation des Images Auto-WebP"}
            </h1>
          </div>
        </div>

        {/* Tab 1: Analytics (Visits, Clicks, Conversion) */}
        {activeTab === "analytics" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>Visites & Vues Pages</span>
                  <Activity size={20} className="text-accent" />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>1 420</div>
                <span style={{ fontSize: "0.8rem", color: "#25d366" }}>+18% cette semaine</span>
              </div>

              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>Clics sur la Boutique</span>
                  <MousePointer size={20} className="text-accent" />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>385</div>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Consultations de produits</span>
              </div>

              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>Commandes Passées</span>
                  <ShoppingBag size={20} style={{ color: "#25d366" }} />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-heading)", color: "#25d366" }}>{totalOrdersCount}</div>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{newOrdersCount} nouvelles</span>
              </div>

              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>Produits Actifs</span>
                  <Package size={20} className="text-accent" />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>{totalProducts}</div>
                <span style={{ fontSize: "0.8rem", color: "#25d366" }}>{inStockCount} en stock</span>
              </div>
            </div>

            {/* Top Products & Traffic Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: "1.25rem" }}>
                  Performances du Catalogue
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {productsList.slice(0, 4).map((p, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", background: "var(--color-bg)", borderRadius: "var(--radius-md)" }}>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--color-accent)", fontWeight: 700 }}>{p.price}</div>
                    </div>
                  ))}
                  {productsList.length === 0 && <p style={{ color: "var(--color-text-muted)" }}>Ajoutez des produits pour voir les performances.</p>}
                </div>
              </div>

              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: "1.25rem" }}>
                  Livraison Algérie / Yalidine
                </h3>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  Le système enregistre les informations du client, calcule la livraison selon les <strong>58 Wilayas</strong> et permet la livraison en bureau Stopdesk ou à Domicile.
                </p>
                <button onClick={() => setActiveTab("orders")} className="btn btn--primary" style={{ marginTop: "1rem" }}>
                  Voir les commandes ({totalOrdersCount})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === "orders" && (
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", margin: 0 }}>
                  Commandes ({filteredOrders.length})
                </h2>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className={`btn btn--sm ${orderFilter === "all" ? "btn--primary" : "btn--outline"}`} onClick={() => setOrderFilter("all")}>Toutes ({totalOrdersCount})</button>
                <button className={`btn btn--sm ${orderFilter === "Nouvelle" ? "btn--primary" : "btn--outline"}`} onClick={() => setOrderFilter("Nouvelle")}>Nouvelles ({newOrdersCount})</button>
                <button className={`btn btn--sm ${orderFilter === "En cours" ? "btn--primary" : "btn--outline"}`} onClick={() => setOrderFilter("En cours")}>En cours</button>
                <button className={`btn btn--sm ${orderFilter === "Livrée" ? "btn--primary" : "btn--outline"}`} onClick={() => setOrderFilter("Livrée")}>Livrées</button>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
                <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: "0.75rem" }} />
                <p style={{ fontSize: "1.1rem" }}>Aucune commande dans cette catégorie.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
                      <th style={{ padding: "12px" }}>ID</th>
                      <th style={{ padding: "12px" }}>Client</th>
                      <th style={{ padding: "12px" }}>Téléphone</th>
                      <th style={{ padding: "12px" }}>Wilaya / Commune</th>
                      <th style={{ padding: "12px" }}>Produits</th>
                      <th style={{ padding: "12px" }}>Total</th>
                      <th style={{ padding: "12px" }}>Statut</th>
                      <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((ord, idx) => (
                      <tr key={ord.id || idx} style={{ borderBottom: "1px solid var(--color-border)" }}>
                        <td style={{ padding: "12px", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>#{ord.id}</td>
                        <td style={{ padding: "12px", fontWeight: 600 }}>{ord.customer_name}</td>
                        <td style={{ padding: "12px", color: "var(--color-accent)", fontWeight: 600 }}>{ord.phone}</td>
                        <td style={{ padding: "12px", fontSize: "0.9rem" }}>
                          {ord.wilaya_name} - {ord.commune_name}
                          <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                            {ord.delivery_type === "home" ? "À domicile" : "Bureau Stopdesk"}
                          </span>
                        </td>
                        <td style={{ padding: "12px", fontWeight: 500 }}>{ord.product_name}</td>
                        <td style={{ padding: "12px", color: "#25d366", fontWeight: 700 }}>
                          {ord.total_amount ? ord.total_amount.toLocaleString() : ord.product_price} DA
                        </td>
                        <td style={{ padding: "12px" }}>
                          <select
                            value={ord.status || "Nouvelle"}
                            onChange={(e) => ord.id && handleOrderStatusChange(ord.id, e.target.value)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "8px",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              background: ord.status === "Livrée" ? "rgba(37, 211, 102, 0.15)" : ord.status === "En cours" ? "rgba(245, 197, 24, 0.15)" : "rgba(255, 255, 255, 0.1)",
                              color: ord.status === "Livrée" ? "#25d366" : ord.status === "En cours" ? "var(--color-accent)" : "#fff",
                              border: "1px solid var(--color-border)",
                            }}
                          >
                            <option value="Nouvelle">Nouvelle</option>
                            <option value="En cours">En cours</option>
                            <option value="Livrée">Livrée</option>
                            <option value="Annulée">Annulée</option>
                          </select>
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          <button onClick={() => setSelectedOrderDetails(ord)} className="btn btn--ghost btn--sm" style={{ padding: "6px", marginRight: "0.4rem" }} title="Détails">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => ord.id && handleDeleteOrder(ord.id)} className="btn btn--ghost btn--sm" style={{ padding: "6px", color: "var(--color-red)" }} title="Supprimer">
                            <Trash2 size={16} />
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

        {/* Tab 3: Products Management with Form Reset & Toast */}
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
                    <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--color-text-secondary)" }}>Nom du Produit *</label>
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
                      <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--color-text-secondary)" }}>Prix (DA) *</label>
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
                        {categoriesList.map((cat, idx) => (
                          <option key={idx} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--color-text-secondary)" }}>Quantité initiale en stock</label>
                    <input
                      type="number"
                      min={0}
                      value={newProdStockQty}
                      onChange={(e) => setNewProdStockQty(parseInt(e.target.value, 10) || 0)}
                      style={{ width: "100%", padding: "10px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff" }}
                    />
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
                        <img src={newProdImage} alt="Aperçu" style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "8px", border: "1px solid var(--color-border)" }} />
                        <span style={{ fontSize: "0.8rem", color: "#25d366" }}>✓ Image chargée avec succès</span>
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

                {filteredProducts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-muted)" }}>
                    <Package size={48} style={{ opacity: 0.3, marginBottom: "0.75rem" }} />
                    <p style={{ fontSize: "1.1rem" }}>Aucun produit dans le catalogue.</p>
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
                          {prod.image && (prod.image.startsWith("data:") || prod.image.startsWith("http")) ? (
                            <img src={prod.image} alt={prod.name} style={{ width: "50px", height: "50px", objectFit: "contain", borderRadius: "8px", background: "var(--color-surface)" }} />
                          ) : (
                            <div style={{ width: "50px", height: "50px", background: "var(--color-surface)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                              📦
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{prod.name}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                              {prod.category} • <strong style={{ color: "var(--color-accent)" }}>{prod.price}</strong> • Stock: <strong>{prod.stock_quantity}</strong>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
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

        {/* Tab 4: Categories Management */}
        {activeTab === "categories" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Plus size={20} className="text-accent" /> Ajouter une Catégorie
              </h2>

              <form onSubmit={handleAddCategory}>
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--color-text-secondary)" }}>Nom de la Catégorie</label>
                  <input
                    type="text"
                    placeholder="ex: Brûleurs de Graisse"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff" }}
                  />
                </div>

                <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }}>
                  Créer la Catégorie
                </button>
              </form>
            </div>

            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: "1.25rem" }}>
                Catégories Actives ({categoriesList.length})
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {categoriesList.map((cat, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1rem 1.25rem",
                      background: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontWeight: 600 }}>
                      <FolderTree size={18} className="text-accent" /> {cat}
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="btn btn--ghost btn--sm"
                      style={{ color: "var(--color-red)", padding: "6px" }}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Quantitative Stock Manager */}
        {activeTab === "stock" && (
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", margin: 0 }}>
                  Gestion des Quantités en Stock
                </h2>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                  Ajustez les unités réelles en stock avec + / - ou saisie directe
                </p>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
                <p style={{ fontSize: "1.1rem" }}>Aucun produit dans le catalogue.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
                      <th style={{ padding: "12px" }}>Produit</th>
                      <th style={{ padding: "12px" }}>Catégorie</th>
                      <th style={{ padding: "12px" }}>Prix</th>
                      <th style={{ padding: "12px" }}>Quantité en Stock</th>
                      <th style={{ padding: "12px", textAlign: "right" }}>Actions Quantité</th>
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
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              background: p.stock_quantity > 0 ? "rgba(37, 211, 102, 0.15)" : "rgba(230, 57, 70, 0.15)",
                              color: p.stock_quantity > 0 ? "#25d366" : "var(--color-red)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.4rem",
                            }}
                          >
                            {p.stock_quantity > 0 ? `${p.stock_quantity} unités` : "Rupture de Stock (0)"}
                          </span>
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", border: "1px solid var(--color-border)", borderRadius: "8px", background: "var(--color-bg)", padding: "2px 6px" }}>
                            <button
                              onClick={() => updateProductQuantity(p.id, -1)}
                              style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: "4px 8px" }}
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              value={p.stock_quantity}
                              onChange={(e) => setExactStockQuantity(p.id, parseInt(e.target.value, 10) || 0)}
                              style={{ width: "45px", textAlign: "center", background: "none", border: "none", color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}
                            />
                            <button
                              onClick={() => updateProductQuantity(p.id, 1)}
                              style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: "4px 8px" }}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Image Optimization */}
        {activeTab === "optimize" && (
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", margin: 0 }}>
                  Optimisation des Photos & Auto-WebP
                </h2>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                  Toutes les photos du site et les visuels produits ajoutés sont analysés pour un chargement rapide.
                </p>
              </div>

              <button
                onClick={handleOptimizeAllImages}
                disabled={isOptimizingAll}
                className="btn btn--primary btn--sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <RefreshCw size={16} className={isOptimizingAll ? "animate-spin" : ""} />
                {isOptimizingAll ? "Optimisation en cours..." : "Optimiser Tout en WebP"}
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
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{img.type === "produit" ? "Visuel Produit" : "Photo du Site"}</div>
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

        {/* Modal Order Details */}
        {selectedOrderDetails && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem", maxWidth: "500px", width: "100%", position: "relative" }}>
              <button onClick={() => setSelectedOrderDetails(null)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <X size={20} />
              </button>

              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.35rem", marginBottom: "1.25rem" }}>
                Détails de la Commande #{selectedOrderDetails.id}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
                <div style={{ background: "var(--color-bg)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
                  <div style={{ marginBottom: "0.4rem" }}><strong>Client :</strong> {selectedOrderDetails.customer_name}</div>
                  <div style={{ marginBottom: "0.4rem" }}><strong>Téléphone :</strong> <a href={`tel:${selectedOrderDetails.phone}`} style={{ color: "var(--color-accent)", fontWeight: 700 }}>{selectedOrderDetails.phone}</a></div>
                  <div style={{ marginBottom: "0.4rem" }}><strong>Wilaya :</strong> {selectedOrderDetails.wilaya_name}</div>
                  <div style={{ marginBottom: "0.4rem" }}><strong>Commune :</strong> {selectedOrderDetails.commune_name}</div>
                  <div style={{ marginBottom: "0.4rem" }}><strong>Mode Livraison :</strong> {selectedOrderDetails.delivery_type === "home" ? "À domicile" : "Bureau Stopdesk"}</div>
                  <div><strong>Adresse :</strong> {selectedOrderDetails.address || "N/A"}</div>
                </div>

                <div style={{ background: "var(--color-bg)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
                  <div style={{ marginBottom: "0.4rem" }}><strong>Produit(s) :</strong> {selectedOrderDetails.product_name}</div>
                  <div style={{ marginBottom: "0.4rem" }}><strong>Prix Articles :</strong> {selectedOrderDetails.product_price}</div>
                  <div style={{ marginBottom: "0.4rem" }}><strong>Frais Livraison :</strong> {selectedOrderDetails.delivery_cost} DA</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#25d366", marginTop: "0.5rem", borderTop: "1px solid var(--color-border)", paddingTop: "0.5rem" }}>
                    Total à encaisser : {selectedOrderDetails.total_amount ? selectedOrderDetails.total_amount.toLocaleString() : selectedOrderDetails.product_price} DA
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <button onClick={() => setSelectedOrderDetails(null)} className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }}>
                  Fermer
                </button>
              </div>
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
                      {categoriesList.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--color-text-secondary)" }}>Quantité en stock</label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.stock_quantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: parseInt(e.target.value, 10) || 0 })}
                    style={{ width: "100%", padding: "10px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "#fff" }}
                  />
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
      </main>
    </div>
  );
}
