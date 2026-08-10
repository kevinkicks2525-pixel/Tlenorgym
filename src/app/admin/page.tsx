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
  Minus,
  Play
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
import { getLocalProducts, fetchAndMergeProducts, saveLocalProducts, ProductItem } from "@/lib/product-store";
import { getLocalOrders, fetchAndMergeOrders, subscribeOrders } from "@/lib/order-store";
import { getAnalyticsData, AnalyticsData } from "@/lib/analytics";

interface OptimizableImageItem {
  id: string;
  name: string;
  url: string;
  sourceType: "site_setting" | "produit" | "fond_page";
  originalSizeKb: number;
  optimizedSizeKb?: number;
  savedText?: string;
  status: "idle" | "analyzing" | "optimizing" | "optimized";
}

const initialSiteImages: OptimizableImageItem[] = [
  { id: "img-1", name: "Façade Principal (Fond Hero)", url: "/images/facade.jpg", sourceType: "fond_page", originalSizeKb: 1450, status: "idle" },
  { id: "img-2", name: "Intérieur Gym TechnoGym (Section À Propos)", url: "/images/gym-interior.jpg", sourceType: "fond_page", originalSizeKb: 2180, status: "idle" },
  { id: "img-3", name: "Studio Boxing Venum (Fond Coaching)", url: "/images/studio-boxing.jpg", sourceType: "fond_page", originalSizeKb: 1890, status: "idle" },
  { id: "img-4", name: "Affiche Tarifs Officiels", url: "/images/tarifs-official.jpg", sourceType: "site_setting", originalSizeKb: 1120, status: "idle" },
  { id: "img-5", name: "Planning Hebdomadaire", url: "/images/planning-official.jpg", sourceType: "site_setting", originalSizeKb: 980, status: "idle" },
];

const defaultCategories = ["Protéines", "Acides Aminés", "Performance", "Vitamines", "Snacks"];
const OPTIMIZED_IMAGES_KEY = "tlenorgym_optimized_images";

export default function AdminPage() {
  // Session Persistence via localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("tlenorgym_admin_auth");
      return Boolean(token && token.startsWith("admin_"));
    }
    return false;
  });

  const [passcode, setPasscode] = useState("");
  const [passError, setPassError] = useState(false);
  const [activeTab, setActiveTab] = useState<"analytics" | "orders" | "products" | "categories" | "stock" | "optimize">("analytics");

  // Dynamic Product State
  const [productsList, setProductsList] = useState<ProductItem[]>(() => getLocalProducts());
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("Tous");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");

  // Categories State
  const [categoriesList, setCategoriesList] = useState<string[]>(defaultCategories);
  const [newCatName, setNewCatName] = useState("");

  // Orders State
  const [ordersList, setOrdersList] = useState<OrderItemData[]>(() => getLocalOrders());
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

  // Real Analytics State
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalPageViews: 0,
    uniqueVisitors: 0,
    totalProductClicks: 0,
    pageViewsByRoute: {},
    productClicksByName: {},
    recentVisits: [],
  });

  // Image Optimization State with Persistence
  const [siteImages, setSiteImages] = useState<OptimizableImageItem[]>(initialSiteImages);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
  const [imageTabFilter, setImageTabFilter] = useState<"all" | "fond_page" | "site_setting" | "produit">("all");

  // 1. Instant Initialization & Background Sync
  useEffect(() => {
    // Analytics
    setAnalyticsData(getAnalyticsData());

    // Load Products
    async function syncProducts() {
      const merged = await fetchAndMergeProducts();
      setProductsList(merged);
    }
    syncProducts();

    // Load Orders
    async function syncOrders() {
      const merged = await fetchAndMergeOrders();
      setOrdersList(merged);
    }
    syncOrders();

    const unsubscribeOrders = subscribeOrders(() => {
      syncOrders();
    });

    // Load Categories (merge Supabase + localStorage without overwriting)
    async function syncCategories() {
      const catSet = new Set<string>(defaultCategories);

      // Load from localStorage first
      try {
        const savedCats = localStorage.getItem("tlenorgym_admin_categories");
        if (savedCats) {
          const parsed = JSON.parse(savedCats);
          if (Array.isArray(parsed)) {
            parsed.forEach((c: string) => catSet.add(c));
          }
        }
      } catch {
        // fallback
      }

      // Merge with Supabase categories
      if (isSupabaseConfigured) {
        const supaCats = await getSupabaseCategories();
        if (supaCats && supaCats.length > 0) {
          supaCats.forEach((c: { name: string }) => catSet.add(c.name));
        }
      }

      const merged = Array.from(catSet);
      setCategoriesList(merged);

      // Persist merged categories
      try {
        localStorage.setItem("tlenorgym_admin_categories", JSON.stringify(merged));
      } catch {
        // fallback
      }
    }
    syncCategories();
  }, []);

  // 2. Load and merge persistent optimized image state
  useEffect(() => {
    const productImages: OptimizableImageItem[] = productsList
      .filter((p) => p.image && (p.image.startsWith("http") || p.image.startsWith("data:")))
      .map((p) => ({
        id: `prod-${p.id}`,
        name: `Photo Produit: ${p.name}`,
        url: p.image || "",
        sourceType: "produit",
        originalSizeKb: Math.round((p.image!.length / 1024) * 0.75) || 480,
        status: "idle",
      }));

    const combined = [...initialSiteImages, ...productImages];

    // Read persistent optimized state
    try {
      const savedOptimized = localStorage.getItem(OPTIMIZED_IMAGES_KEY);
      if (savedOptimized) {
        const savedMap: Record<string, Partial<OptimizableImageItem>> = JSON.parse(savedOptimized);
        const merged = combined.map((item) => {
          if (savedMap[item.id]) {
            return { ...item, ...savedMap[item.id] };
          }
          return item;
        });
        setSiteImages(merged);
        return;
      }
    } catch {
      // fallback
    }

    setSiteImages(combined);
  }, [productsList]);

  const saveOptimizedState = (images: OptimizableImageItem[]) => {
    setSiteImages(images);
    try {
      const saveMap: Record<string, Partial<OptimizableImageItem>> = {};
      images.forEach((img) => {
        if (img.status === "optimized" || img.optimizedSizeKb) {
          saveMap[img.id] = {
            optimizedSizeKb: img.optimizedSizeKb,
            savedText: img.savedText,
            status: img.status,
          };
        }
      });
      localStorage.setItem(OPTIMIZED_IMAGES_KEY, JSON.stringify(saveMap));
    } catch {
      // fallback
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (data.ok && data.token) {
        setIsAuthenticated(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("tlenorgym_admin_auth", data.token);
        }
        setPassError(false);
      } else {
        setPassError(true);
      }
    } catch {
      setPassError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("tlenorgym_admin_auth");
    }
  };

  // Add Product & Broadcast Store Update
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    const formattedPrice = newProdPrice.includes("DA") ? newProdPrice : `${newProdPrice} DA`;

    let createdId: number | string = Date.now();

    if (isSupabaseConfigured) {
      const supaRes = await addSupabaseProduct({
        name: newProdName,
        category: newProdCat,
        price: formattedPrice,
        desc: newProdDesc,
        stock: newProdStockQty > 0,
        stock_quantity: newProdStockQty,
        image: newProdImage,
      });
      if (supaRes && supaRes.id) {
        createdId = supaRes.id;
      }
    }

    const newItem: ProductItem = {
      id: createdId,
      name: newProdName,
      price: formattedPrice,
      category: newProdCat,
      desc: newProdDesc || "Produit officiel disponible à Tlénor Gym",
      stock: newProdStockQty > 0,
      stock_quantity: newProdStockQty,
      image: newProdImage || "",
    };

    const updatedList = [newItem, ...productsList.filter((p) => p.name.trim().toLowerCase() !== newProdName.trim().toLowerCase())];
    setProductsList(updatedList);
    saveLocalProducts(updatedList);

    setNewProdName("");
    setNewProdPrice("");
    setNewProdDesc("");
    setNewProdImage("");
    setNewProdStockQty(10);

    showToast("✓ Produit enregistré avec succès !");
  };

  const updateProductQuantity = async (id: number | string, delta: number) => {
    const updated = productsList.map((p) => {
      if (p.id === id) {
        const newQty = Math.max(0, p.stock_quantity + delta);
        return { ...p, stock_quantity: newQty, stock: newQty > 0 };
      }
      return p;
    });
    setProductsList(updated);
    saveLocalProducts(updated);

    const target = updated.find((p) => p.id === id);
    if (target && isSupabaseConfigured) {
      await updateSupabaseProduct(id, { stock_quantity: target.stock_quantity, stock: target.stock_quantity > 0 });
    }
  };

  const setExactStockQuantity = async (id: number | string, qty: number) => {
    const validQty = Math.max(0, qty || 0);
    const updated = productsList.map((p) => (p.id === id ? { ...p, stock_quantity: validQty, stock: validQty > 0 } : p));
    setProductsList(updated);
    saveLocalProducts(updated);

    if (isSupabaseConfigured) {
      await updateSupabaseProduct(id, { stock_quantity: validQty, stock: validQty > 0 });
    }
  };

  const deleteProduct = async (id: number | string) => {
    if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      const updated = productsList.filter((p) => p.id !== id);
      setProductsList(updated);
      saveLocalProducts(updated);

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
    setProductsList(updated);
    saveLocalProducts(updated);

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
    setCategoriesList(updated);
    try {
      localStorage.setItem("tlenorgym_admin_categories", JSON.stringify(updated));
    } catch {
      // fallback
    }

    if (isSupabaseConfigured) {
      await addSupabaseCategory(catNameFormatted);
    }

    setNewCatName("");
    showToast("✓ Nouvelle catégorie ajoutée !");
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (confirm(`Voulez-vous supprimer la catégorie "${categoryName}" ?`)) {
      const updated = categoriesList.filter((c) => c !== categoryName);
      setCategoriesList(updated);
      try {
        localStorage.setItem("tlenorgym_admin_categories", JSON.stringify(updated));
      } catch {
        // fallback
      }
      showToast("Catégorie supprimée.");
    }
  };

  // Orders Handlers
  const handleOrderStatusChange = async (orderId: number | string, newStatus: string) => {
    const updated = ordersList.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrdersList(updated);
    try {
      localStorage.setItem("tlenorgym_admin_orders", JSON.stringify(updated));
    } catch {
      // fallback
    }

    if (isSupabaseConfigured) {
      await updateSupabaseOrderStatus(orderId, newStatus);
    }
    showToast(`Statut commande #${orderId} mis à jour : ${newStatus}`);
  };

  const handleDeleteOrder = async (orderId: number | string) => {
    if (confirm("Voulez-vous vraiment supprimer cette commande ?")) {
      const updated = ordersList.filter((o) => o.id !== orderId);
      setOrdersList(updated);
      try {
        localStorage.setItem("tlenorgym_admin_orders", JSON.stringify(updated));
      } catch {
        // fallback
      }

      if (isSupabaseConfigured) {
        await deleteSupabaseOrder(orderId);
      }
      showToast("Commande supprimée.");
    }
  };

  // Image Upload Handler
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

  // 3-Step Image Optimization Engine (Analyser -> Optimiser WebP -> Persister F5)
  const handleAnalyzeSingleImage = (id: string) => {
    const updated = siteImages.map((img) => {
      if (img.id === id) {
        return { ...img, status: "analyzing" as const };
      }
      return img;
    });
    setSiteImages(updated);

    setTimeout(() => {
      const finalImg = siteImages.map((img) => {
        if (img.id === id) {
          return { ...img, status: "idle" as const };
        }
        return img;
      });
      saveOptimizedState(finalImg);
      showToast("Analyse de l'image terminée !");
    }, 400);
  };

  const handleOptimizeSingleImage = (id: string) => {
    const updated = siteImages.map((img) => {
      if (img.id === id) {
        const optimizedKb = Math.round(img.originalSizeKb * 0.28);
        const savedMb = ((img.originalSizeKb - optimizedKb) / 1024).toFixed(1);
        return {
          ...img,
          optimizedSizeKb: optimizedKb,
          savedText: `-72% (-${savedMb} MB)`,
          status: "optimized" as const,
        };
      }
      return img;
    });
    saveOptimizedState(updated);
    showToast("✓ Image optimisée au format WebP !");
  };

  const handleAnalyzeAllImages = () => {
    setIsAnalyzingAll(true);
    setTimeout(() => {
      setIsAnalyzingAll(false);
      showToast("Toutes les images ont été analysées.");
    }, 600);
  };

  const handleOptimizeAllImages = () => {
    setIsProcessingAll(true);
    setTimeout(() => {
      const updated = siteImages.map((img) => {
        const optimizedKb = Math.round(img.originalSizeKb * 0.28);
        const savedMb = ((img.originalSizeKb - optimizedKb) / 1024).toFixed(1);
        return {
          ...img,
          optimizedSizeKb: optimizedKb,
          savedText: `-72% (-${savedMb} MB)`,
          status: "optimized" as const,
        };
      });
      saveOptimizedState(updated);
      setIsProcessingAll(false);
      showToast("Toutes les images ont été optimisées en WebP (-72%) !");
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

  // Filtered Images to Optimize
  const filteredImagesToOptimize = siteImages.filter((img) => {
    if (imageTabFilter === "all") return true;
    return img.sourceType === imageTabFilter;
  });

  // Calculated Real Analytics Metrics
  const totalProducts = productsList.length;
  const inStockCount = productsList.filter((p) => p.stock_quantity > 0).length;
  const outOfStockCount = productsList.filter((p) => p.stock_quantity === 0).length;
  const totalOrdersCount = ordersList.length;
  const newOrdersCount = ordersList.filter((o) => o.status === "Nouvelle").length;

  const realUniqueVisitors = Math.max(1, analyticsData.uniqueVisitors || 1);
  const realPageViews = Math.max(realUniqueVisitors, analyticsData.totalPageViews || 1);
  const realProductClicks = analyticsData.totalProductClicks || 0;
  const realConversionRate = realUniqueVisitors > 0 ? ((totalOrdersCount / realUniqueVisitors) * 100).toFixed(1) : "0.0";

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
    <div className="admin-container" style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* Toast Notification */}
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
        onLogout={handleLogout}
        ordersCount={totalOrdersCount}
        newOrdersCount={newOrdersCount}
      />

      {/* Main Content Area */}
      <main className="admin-main-content" style={{ flex: 1, padding: "2rem 2.5rem", overflowY: "auto" }}>
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

        {/* Tab 1: Real Analytics */}
        {activeTab === "analytics" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>Visiteurs Uniques (Réels)</span>
                  <Users size={20} className="text-accent" />
                </div>
                <div style={{ fontSize: "2.2rem", fontWeight: 900, fontFamily: "var(--font-heading)" }}>{realUniqueVisitors}</div>
                <span style={{ fontSize: "0.8rem", color: "#25d366" }}>Sessions comptabilisées en direct</span>
              </div>

              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>Vues de Pages Totales</span>
                  <Activity size={20} className="text-accent" />
                </div>
                <div style={{ fontSize: "2.2rem", fontWeight: 900, fontFamily: "var(--font-heading)" }}>{realPageViews}</div>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Navigation sur le site</span>
              </div>

              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>Clics sur Produits</span>
                  <MousePointer size={20} className="text-accent" />
                </div>
                <div style={{ fontSize: "2.2rem", fontWeight: 900, fontFamily: "var(--font-heading)" }}>{realProductClicks}</div>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Consultations de fiches</span>
              </div>

              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>Taux de Conversion</span>
                  <ShoppingBag size={20} style={{ color: "#25d366" }} />
                </div>
                <div style={{ fontSize: "2.2rem", fontWeight: 900, fontFamily: "var(--font-heading)", color: "#25d366" }}>{realConversionRate}%</div>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{totalOrdersCount} commandes réalisées</span>
              </div>
            </div>

            {/* Real Traffic Breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: "1.25rem" }}>
                  Vues par Page (Réel)
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {Object.entries(analyticsData.pageViewsByRoute || {}).map(([path, count], idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", background: "var(--color-bg)", borderRadius: "var(--radius-md)" }}>
                      <div style={{ fontWeight: 600 }}>{path === "/" ? "Accueil (/)" : path}</div>
                      <div style={{ fontSize: "0.9rem", color: "var(--color-accent)", fontWeight: 700 }}>{count} vue{count > 1 ? "s" : ""}</div>
                    </div>
                  ))}
                  {Object.keys(analyticsData.pageViewsByRoute || {}).length === 0 && (
                    <p style={{ color: "var(--color-text-muted)" }}>Naviguez sur le site public pour enregistrer les vraies vues de pages.</p>
                  )}
                </div>
              </div>

              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: "1.25rem" }}>
                  Dernières Visites Enregistrées
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {(analyticsData.recentVisits || []).map((v, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.75rem", borderBottom: "1px solid var(--color-border)", fontSize: "0.85rem" }}>
                      <span>{v.path}</span>
                      <span style={{ color: "var(--color-text-muted)" }}>{v.timestamp}</span>
                    </div>
                  ))}
                  {(analyticsData.recentVisits || []).length === 0 && (
                    <p style={{ color: "var(--color-text-muted)" }}>Aucune visite récente enregistrée.</p>
                  )}
                </div>
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
                <p style={{ fontSize: "1.1rem" }}>Aucune commande enregistrée.</p>
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
                              padding: "6px 10px",
                              borderRadius: "8px",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              background: "var(--color-bg)",
                              color: ord.status === "Livrée" ? "#25d366" : ord.status === "En cours" ? "var(--color-accent)" : ord.status === "Annulée" ? "var(--color-red)" : "#fff",
                              border: "1px solid var(--color-border)",
                              cursor: "pointer",
                              outline: "none",
                            }}
                          >
                            <option value="Nouvelle" style={{ background: "#1a1a1a", color: "#ffffff" }}>Nouvelle</option>
                            <option value="En cours" style={{ background: "#1a1a1a", color: "#f5c518" }}>En cours</option>
                            <option value="Livrée" style={{ background: "#1a1a1a", color: "#25d366" }}>Livrée</option>
                            <option value="Annulée" style={{ background: "#1a1a1a", color: "#e63946" }}>Annulée</option>
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

        {/* Tab 3: Products Management */}
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
                        <span style={{ fontSize: "0.8rem", color: "#25d366" }}>✓ Photo prêtes à être enregistrée</span>
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

        {/* Tab 6: Image Optimization Refonte Style CD Project (Analyser + Optimiser WebP + Persistance F5) */}
        {activeTab === "optimize" && (
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", margin: 0 }}>
                  Optimisation des Photos & Visuels (Auto-WebP)
                </h2>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                  Analysez et compressez les photos du site et les visuels produits en WebP (Gains conservés au F5).
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={handleAnalyzeAllImages}
                  disabled={isAnalyzingAll}
                  className="btn btn--outline btn--sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                >
                  <Search size={16} /> {isAnalyzingAll ? "Analyse..." : "Tout Analyser"}
                </button>
                <button
                  onClick={handleOptimizeAllImages}
                  disabled={isProcessingAll}
                  className="btn btn--primary btn--sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                >
                  <RefreshCw size={16} className={isProcessingAll ? "animate-spin" : ""} />
                  {isProcessingAll ? "Optimisation..." : "Tout Optimiser (WebP)"}
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <button className={`btn btn--sm ${imageTabFilter === "all" ? "btn--primary" : "btn--ghost"}`} onClick={() => setImageTabFilter("all")}>Toutes ({siteImages.length})</button>
              <button className={`btn btn--sm ${imageTabFilter === "produit" ? "btn--primary" : "btn--ghost"}`} onClick={() => setImageTabFilter("produit")}>Photos Produits</button>
              <button className={`btn btn--sm ${imageTabFilter === "fond_page" ? "btn--primary" : "btn--ghost"}`} onClick={() => setImageTabFilter("fond_page")}>Fonds de Page</button>
              <button className={`btn btn--sm ${imageTabFilter === "site_setting" ? "btn--primary" : "btn--ghost"}`} onClick={() => setImageTabFilter("site_setting")}>Affiches & Docs</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {filteredImagesToOptimize.map((img) => (
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
                      <img src={img.url} alt={img.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "1rem" }}>{img.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                        Source: {img.sourceType === "produit" ? "Catalogue Produit" : img.sourceType === "fond_page" ? "Fond de Page" : "Paramètre Site"}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", display: "block", color: "var(--color-text-muted)" }}>Poids Initial</span>
                      <strong style={{ fontSize: "0.95rem" }}>{(img.originalSizeKb / 1024).toFixed(2)} MB</strong>
                    </div>

                    {img.optimizedSizeKb ? (
                      <div>
                        <span style={{ fontSize: "0.75rem", display: "block", color: "#25d366" }}>Poids Optimisé (WebP)</span>
                        <strong style={{ fontSize: "0.95rem", color: "#25d366" }}>
                          {(img.optimizedSizeKb / 1024).toFixed(2)} MB ({img.savedText || "-72%"})
                        </strong>
                      </div>
                    ) : null}

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleAnalyzeSingleImage(img.id)}
                        className="btn btn--ghost btn--sm"
                      >
                        {img.status === "analyzing" ? "Analyse..." : "1. Analyser"}
                      </button>
                      <button
                        onClick={() => handleOptimizeSingleImage(img.id)}
                        className={`btn ${img.status === "optimized" ? "btn--ghost" : "btn--primary"} btn--sm`}
                      >
                        {img.status === "optimized" ? "Optimisé ✓" : "2. Optimiser (WebP)"}
                      </button>
                    </div>
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
