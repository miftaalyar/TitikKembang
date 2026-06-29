import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Header from "@/src/components/Header";
import StoreMap from "@/src/components/StoreMap";
import ProductCard from "@/src/components/ProductCard";
import PaidFeedsSlider from "@/src/components/PaidFeedsSlider";
import FloristDashboard from "@/src/pages/FloristDashboard";
import AdminDashboard from "@/src/pages/AdminDashboard";
import CustomerDashboard from "@/src/pages/CustomerDashboard";
import AuthModal from "@/src/components/AuthModal";
import PrivacyPolicyModal from "@/src/components/PrivacyPolicyModal";
import PromoSlider from "@/src/components/PromoSlider";
import { fetchProducts, fetchStores, seedDatabase, getUserProfile, deleteStore, deleteProduct, updateStoreProfile, fetchWebConfig } from "@/src/lib/dataService";
import { DUMMY_STORES, getDummyProductsForStore } from "@/src/data/dummyStores";
import { auth } from "@/src/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Map as MapIcon, 
  LayoutGrid, 
  Filter, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  Store,
  User as UserIcon,
  Database,
  ShieldAlert,
  Sparkles
} from "lucide-react";

const CATEGORIES = [
  "Semua",
  "Bunga Segar",
  "Buket Kawat Bulu",
  "Bunga Kering",
  "Kado Wisuda"
];

export default function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [view, setView] = useState<"map" | "grid" | "admin" | "profile">("grid");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"customer" | "florist" | "admin">("customer");
  const [profileRole, setProfileRole] = useState<"customer" | "florist" | "admin">("customer");
  const [isShortcutOpen, setIsShortcutOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<"customer" | "florist" | "admin">("customer");
  
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Web configuration settings state
  const [webConfig, setWebConfig] = useState<any>({
    brandName: "TitikKembang",
    slogan: "Portal Buket & Kerajinan Kawat Bulu Premium Terlengkap",
    csPhone: "628212345678",
    runningText: "Selamat datang di TitikKembang! Dapatkan bervariasi produk buket bunga kawat bulu (plush wire bouquet) buatan crafter lokal terbaik dengan penawaran menarik! ✨",
    promoText: "Diskon Ongkir / Pick-up!",
    emailVisible: "support@titikkembang.com",
    isMaintenance: false
  });

  // Advanced Sorting & Filtering Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");
  const [filterReadyOnly, setFilterReadyOnly] = useState(false);
  const [promoPosition, setPromoPosition] = useState<"left" | "right">("left");

  // Compute filtered & sorted products
  const filteredProducts = products.filter(product => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = product.name?.toLowerCase().includes(q);
      const descMatch = product.description?.toLowerCase().includes(q);
      const catMatch = product.category?.toLowerCase().includes(q);
      
      const store = stores.find(s => s.id === product.storeId);
      const storeMatch = store?.name?.toLowerCase().includes(q);
      
      if (!nameMatch && !descMatch && !catMatch && !storeMatch) {
        return false;
      }
    }
    
    if (filterReadyOnly && (!product.inventory || product.inventory <= 0)) {
      return false;
    }
    
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aBoosted = stores.find(s => s.id === a.storeId)?.activeAds?.some((ad: any) => ad.type === "main_feeds" && ad.status === "active") || !!stores.find(s => s.id === a.storeId)?.isBoosted;
    const bBoosted = stores.find(s => s.id === b.storeId)?.activeAds?.some((ad: any) => ad.type === "main_feeds" && ad.status === "active") || !!stores.find(s => s.id === b.storeId)?.isBoosted;
    
    if (aBoosted && !bBoosted) return -1;
    if (!aBoosted && bBoosted) return 1;

    if (sortBy === "price-asc") {
      return a.price - b.price;
    } else if (sortBy === "price-desc") {
      return b.price - a.price;
    }
    return 0;
  });

  useEffect(() => {
    const handleOnline = () => toast.success("Anda kembali online!");
    const handleOffline = () => toast.error("Anda sedang offline. Beberapa fitur mungkin tidak berfungsi.", { duration: Infinity });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Decoupled single-mount Auth state listener to avoid profile refetch & reset race conditions when switching views
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        if (profile?.role) {
          const actualRole = currentUser.email?.toLowerCase() === "miftaalyar@gmail.com"
            ? profile.role
            : (profile.role === "admin" ? "customer" : profile.role);
          setUserRole(actualRole);
          setProfileRole(actualRole);
        } else {
          const defaultRole = currentUser.email?.toLowerCase() === "miftaalyar@gmail.com" ? "admin" : "customer";
          setUserRole(defaultRole);
          setProfileRole(defaultRole);
        }
      } else {
        setUserRole("customer");
        setProfileRole("customer");
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to forced auth-success role signals to overcome Firestore write-race conditions on registration
  useEffect(() => {
    const handleRoleUpdated = (e: any) => {
      const nextRole = e.detail;
      setUserRole(nextRole);
      setProfileRole(nextRole);
    };
    window.addEventListener("role-updated", handleRoleUpdated);
    return () => window.removeEventListener("role-updated", handleRoleUpdated);
  }, []);

  // Request Location and Notification Permissions politely
  useEffect(() => {
    const requestPermissions = async () => {
      // 1. Geolocation Permission
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("Izin lokasi diberikan:", position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            console.warn("Izin lokasi ditolak atau gagal:", error.message);
          }
        );
      }

      // 2. Notification Permission
      if ("Notification" in window) {
        try {
          const permission = await Notification.requestPermission();
          console.log("Izin notifikasi:", permission);
        } catch (err) {
          console.warn("Gagal meminta izin notifikasi:", err);
        }
      }
    };

    // Delay requesting slightly so page loads smoothly first
    const timer = setTimeout(() => {
      requestPermissions();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Listen to open-auth-shortcut events from maintenance views
  useEffect(() => {
    const handleAuthShortcut = () => {
      setAuthMode("login");
      setAuthDefaultRole("admin");
      setIsAuthOpen(true);
    };
    window.addEventListener("open-auth-shortcut", handleAuthShortcut);
    return () => window.removeEventListener("open-auth-shortcut", handleAuthShortcut);
  }, []);

  // Secure reactive view-mode fallback
  useEffect(() => {
    if (userRole !== "admin" && view === "admin") {
      setView("grid");
    }
  }, [userRole, view]);

  useEffect(() => {
    const handleSwitchRole = (e: any) => {
      if (!user) {
        setAuthMode("login");
        setIsAuthOpen(true);
        return;
      }
      setUserRole(e.detail);
    };
    window.addEventListener('switch-role', handleSwitchRole);
    return () => window.removeEventListener('switch-role', handleSwitchRole);
  }, [user]);

  useEffect(() => {
    const handleFilterShop = (e: any) => {
      setSelectedStoreId(e.detail);
      setView("grid");
    };
    window.addEventListener('filter-shop-only', handleFilterShop);
    return () => window.removeEventListener('filter-shop-only', handleFilterShop);
  }, []);

  useEffect(() => {
    async function loadWebSettings() {
      try {
        const cfg = await fetchWebConfig();
        if (cfg) setWebConfig(cfg);
      } catch (e) {
        console.warn("Offline or failed loading webSettings configuration in App.tsx:", e);
      }
    }
    loadWebSettings();
  }, [view]);

  useEffect(() => {
    async function loadStoresAndCleanup() {
      try {
        // Automatically delete store-1 and store-2 and their default products if they exist
        await Promise.all([
          deleteStore("store-1").catch(() => {}),
          deleteStore("store-2").catch(() => {}),
          deleteProduct("prod-1").catch(() => {}),
          deleteProduct("prod-2").catch(() => {})
        ]);
        
        const s = await fetchStores();
        const targetStore = s.find((st: any) => st.id === "IXrRBeWR" || st.storeId === "IXrRBeWR") as any;
        if (targetStore && (targetStore.isFeatured || (targetStore.activeAds || []).some((ad: any) => ad.type === "slide_feeds"))) {
          const updatedActiveAds = (targetStore.activeAds || []).filter((ad: any) => ad.type !== "slide_feeds");
          await updateStoreProfile("IXrRBeWR", {
            isFeatured: false,
            activeAds: updatedActiveAds,
            activeAdPkg: updatedActiveAds.length > 0 ? updatedActiveAds[updatedActiveAds.length - 1] : null
          });
          targetStore.isFeatured = false;
          targetStore.activeAds = updatedActiveAds;
          targetStore.activeAdPkg = updatedActiveAds.length > 0 ? updatedActiveAds[updatedActiveAds.length - 1] : null;
        }

        setStores([...s, ...DUMMY_STORES]);
      } catch (error) {
        console.error("Failed to load/cleanup stores:", error);
      }
    }
    loadStoresAndCleanup();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        let p: any[] = [];
        
        // Use all categories if search is active, otherwise use the selected category
        const categoryToLoad = searchQuery.trim() ? "Semua" : selectedCategory;

        if (selectedStoreId && selectedStoreId.startsWith("dummy-store-")) {
          // Dummy stores do not register products, so show no catalog items for them
          p = [];
        } else if (selectedStoreId) {
          // Real store
          p = await fetchProducts("Semua", selectedStoreId);
        } else {
          // All registered stores (global list). Do not include any dummy products.
          p = await fetchProducts("Semua");
        }

        const filtered = categoryToLoad && categoryToLoad !== "Semua"
          ? p.filter(item => item.category === categoryToLoad)
          : p;
        
        // Randomly shuffle products array for refreshing/shuffling layout on reload
        const shuffled = [...filtered];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setProducts(shuffled);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [selectedCategory, selectedStoreId, searchQuery ? true : false]);

  const handleNavigateToView = (targetView: "grid" | "map") => {
    setView(targetView);
    if (targetView === "grid") {
      setSelectedCategory("Semua");
      setSelectedStoreId(null);
    }
    setTimeout(() => {
      const section = document.getElementById("catalog-section");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);
  };

  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedDatabase();
      // Instead of reload, just trigger a data re-fetch
      const [p, s] = await Promise.all([
        fetchProducts(selectedCategory),
        fetchStores()
      ]);
      const shuffled = [...p];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setProducts(shuffled);
      setStores([...s, ...DUMMY_STORES]);
      toast.success("Database seeded successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to seed database.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <Toaster position="top-center" richColors />
      
      {/* Dynamic Running Text Announcement Banner */}
      {webConfig.runningText && (
        <div className="bg-[#1D3C29] text-white text-xs py-2.5 px-4 select-none relative z-[60] overflow-hidden border-b border-white/5">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 shrink-0 bg-white/10 text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              📢 Info
            </div>
            <div 
              className="flex-1 font-medium text-[11px] text-[#E8F2EC] overflow-hidden whitespace-nowrap"
              dangerouslySetInnerHTML={{ 
                __html: `<marquee scrollamount="4" style="vertical-align: middle; width: 100%; display: block;">${webConfig.runningText}</marquee>` 
              }}
            />
            {webConfig.promoText && (
              <div className="shrink-0 text-[10px] bg-orange-500 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md select-none">
                ✨ {webConfig.promoText}
              </div>
            )}
          </div>
        </div>
      )}

      <Header 
        user={user}
        userRole={userRole}
        profileRole={profileRole}
        webConfig={webConfig}
        onOpenAuth={(mode, role) => {
          setAuthMode(mode);
          setAuthDefaultRole(role);
          setIsAuthOpen(true);
        }}
        onSwitchRole={(role) => setUserRole(role)}
        onLogout={async () => {
          await auth.signOut();
          setUserRole("customer");
          setProfileRole("customer");
          setView("grid");
        }}
        onSwitchView={(newView) => setView(newView)}
        searchQuery={searchQuery}
        onSearchQueryChange={(query) => {
          setSearchQuery(query);
          if (query.trim()) {
            setView("grid");
          }
        }}
      />

      <main className="container mx-auto px-4 py-8">
        {webConfig.isMaintenance && userRole !== "admin" ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12 max-w-lg mx-auto bg-card rounded-3xl border border-muted/50 shadow-sm animate-fade-in my-10">
            <div className="h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100 shadow-sm mb-6 animate-bounce">
              <span className="text-3xl">🛠️</span>
            </div>
            <h2 className="text-3xl font-heading font-extrabold text-primary tracking-tight">Situs Sedang Diperbarui</h2>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed font-sans">
              Kami sedang melakukan pemeliharaan rutin untuk meningkatkan kenyamanan belanja bunga kawat bulu Anda di <strong>{webConfig.brandName || "TitikKembang"}</strong>.
            </p>
            <div className="text-xs text-amber-700 font-semibold bg-amber-55/10 border border-amber-200/50 px-4 py-3 rounded-xl mt-5 space-y-1.5 leading-relaxed text-left w-full">
              <p className="font-bold text-center">Hubungi Kontak Layanan Kami:</p>
              <div className="flex justify-between">
                <span>📱 WhatsApp CS:</span>
                <a href={`https://wa.me/${webConfig.csPhone || "628212345678"}`} target="_blank" rel="noopener noreferrer" className="font-mono font-bold underline hover:text-amber-800">
                  +{webConfig.csPhone || "628212345678"}
                </a>
              </div>
              <div className="flex justify-between">
                <span>✉️ Surel Resmi:</span>
                <span className="font-mono">{webConfig.emailVisible || "support@titikkembang.com"}</span>
              </div>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
              <Button
                variant="outline"
                className="rounded-full px-6 text-xs h-11 font-bold flex-1"
                onClick={() => {
                  window.open(`https://wa.me/${webConfig.csPhone || "628212345678"}`);
                }}
              >
                Hubungi CS via WhatsApp
              </Button>
              <Button
                className="rounded-full px-6 text-xs h-11 font-bold bg-[#1D3C29] text-white hover:bg-[#152e1f] flex-1"
                onClick={() => {
                  setAuthMode("login");
                  setAuthDefaultRole("admin");
                  setIsAuthOpen(true);
                }}
              >
                Masuk sebagai Admin
              </Button>
            </div>
          </div>
        ) : userRole === "customer" ? (
          <>
            {view !== "profile" && (
              <>
                {/* Hero Section */}
            <section className="mb-12 flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge variant="secondary" className="mb-4 px-4 py-1 text-sm font-medium">
                  <TrendingUp className="mr-2 h-3 w-3 text-emerald-600 animate-pulse" /> 
                  Local Marketplace O2O Terpercaya
                </Badge>
                <h1 className="font-heading text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight text-primary leading-tight">
                  {webConfig.brandName || "TitikKembang"}, <br />
                  <span className="text-foreground text-2xl sm:text-4xl md:text-6xl block mt-1">Ambil Sendiri di Titik Terdekat.</span>
                </h1>
                <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-sm sm:text-lg text-muted-foreground md:text-xl leading-relaxed">
                  {webConfig.slogan || "Portal Buket & Kerajinan Kawat Bulu Premium Terlengkap."}
                </p>
              <div className="mt-6 sm:mt-8 flex justify-center">
                <Button 
                  size="lg" 
                  className="h-12 sm:h-14 rounded-full px-8 sm:px-10 text-sm sm:text-lg font-extrabold bg-primary text-primary-foreground hover:bg-primary/95 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 flex items-center gap-2.5" 
                  onClick={() => handleNavigateToView("grid")}
                >
                  <MapPin className="h-5 w-5 animate-pulse" /> Cari Florist
                </Button>
              </div>
              </motion.div>
            </section>

            {/* Promo Slider Section */}
            <section className="mb-14">
              <PromoSlider 
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  setSelectedStoreId(null);
                  setTimeout(() => {
                    document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 150);
                }}
                onSwitchView={(v) => {
                  if (v === "admin") {
                    setView("admin");
                  }
                }}
              />
            </section>

            {/* Info Grid (No background / Transparent with subtle border) */}
            <section className="mb-16 grid gap-6 md:grid-cols-3">
              {[
                { icon: MapPin, title: "Discovery Lokal", desc: "Temukan pengrajin bunga tepat di jalur pulang Anda." },
                { icon: Clock, title: "Atur Waktu Pickup", desc: "Pilih jam pengambilan yang paling pas untuk jadwal Anda." },
                { icon: CheckCircle2, title: "Kualitas Terjamin", desc: "Produk tidak layu atau rusak karena handling kurir." }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  className="flex flex-col items-center rounded-3xl border border-muted/30 bg-transparent p-8 text-center hover:border-primary/25 transition-all duration-300"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/35 shadow-sm text-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </section>

            {/* View Toggle & Filters */}
            <div id="catalog-section" className="sticky top-20 z-40 mb-8 flex flex-col gap-4 rounded-3xl bg-background/80 p-4 shadow-sm backdrop-blur-md md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2 pb-1 md:pb-0">
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat && !selectedStoreId ? "default" : "ghost"}
                    className="rounded-full"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedStoreId(null);
                    }}
                  >
                    {cat}
                  </Button>
                ))}
                {selectedStoreId && (
                  <Badge variant="secondary" className="rounded-full px-4 py-1.5 flex items-center gap-2 bg-primary/10 text-primary border-primary/20">
                    <Store className="h-3 w-3" /> 
                    {stores.find(s => s.id === selectedStoreId)?.name || "Toko Dipilih"}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1 hover:bg-transparent" 
                      onClick={() => setSelectedStoreId(null)}
                    >
                      &times;
                    </Button>
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setView(view === "map" ? "grid" : "map")}
                >
                  {view === "map" ? <LayoutGrid className="mr-2 h-4 w-4" /> : <MapIcon className="mr-2 h-4 w-4" />}
                  {view === "map" ? "Lihat Katalog" : "Lihat Peta"}
                </Button>
                <Button 
                  variant={showFilterOptions ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-full"
                  onClick={() => setShowFilterOptions(!showFilterOptions)}
                >
                  <Filter className="mr-2 h-4 w-4" /> {showFilterOptions ? "Sembunyikan Filter" : "Urutkan & Filter"}
                </Button>
              </div>
            </div>

            {/* Filter Console */}
            <AnimatePresence>
              {showFilterOptions && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-8 p-6 bg-secondary/30 rounded-3xl border border-muted flex flex-wrap gap-6 items-center overflow-hidden"
                >
                  {/* Sort Option */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Urutkan Harga</span>
                    <div className="flex gap-1.5">
                      {[
                        { value: "default", label: "Default" },
                        { value: "price-asc", label: "Termurah" },
                        { value: "price-desc", label: "Termahal" }
                      ].map((opt) => (
                        <Button
                          key={opt.value}
                          size="sm"
                          variant={sortBy === opt.value ? "default" : "outline"}
                          className="rounded-full text-xs h-8 px-4 font-semibold"
                          onClick={() => setSortBy(opt.value as any)}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Stock Option */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ketersediaan Stok</span>
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant={!filterReadyOnly ? "default" : "outline"}
                        className="rounded-full text-xs h-8 px-4 font-semibold"
                        onClick={() => setFilterReadyOnly(false)}
                      >
                        Semua Produk
                      </Button>
                      <Button
                        size="sm"
                        variant={filterReadyOnly ? "default" : "outline"}
                        className="rounded-full text-xs h-8 px-4 font-semibold"
                        onClick={() => setFilterReadyOnly(true)}
                      >
                        Ready Stock Saja ⚡
                      </Button>
                    </div>
                  </div>

                  {/* Active Filter Clear Info */}
                  {(sortBy !== "default" || filterReadyOnly) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-auto rounded-full text-xs font-bold hover:bg-red-50 text-red-600 hover:text-red-700 h-8"
                      onClick={() => {
                        setSortBy("default");
                        setFilterReadyOnly(false);
                      }}
                    >
                      Batal Filter 🔄
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            </>
            )}

            {/* Content Area */}
            <div className="relative min-h-[600px]">
              {loading ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-4 animate-pulse">
                      <div className="aspect-square bg-secondary rounded-2xl" />
                      <div className="h-4 bg-secondary rounded w-3/4" />
                      <div className="h-4 bg-secondary rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                {view === "profile" ? (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    <CustomerDashboard onBackToCatalog={() => setView("grid")} />
                  </motion.div>
                ) : view === "grid" ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    {sortedProducts.length === 0 ? (
                      <div className="col-span-full flex flex-col items-center justify-center p-12 text-center bg-secondary/20 rounded-3xl border">
                        <p className="text-muted-foreground font-semibold">Tidak ada produk yang sesuai dengan pencarian atau filter Anda.</p>
                        <Button 
                          variant="link" 
                          className="mt-2 text-primary font-bold"
                          onClick={() => {
                            setSearchQuery("");
                            setSortBy("default");
                            setFilterReadyOnly(false);
                            setSelectedCategory("Semua");
                            setSelectedStoreId(null);
                          }}
                        >
                          Klik di sini untuk Reset Ulang Semua Filter & Pencarian 🔄
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full" id="staggered-masonry-catalog">
                        <PaidFeedsSlider 
                          key="paid-feeds"
                          stores={stores}
                          products={products}
                          onSelectStore={(storeId) => {
                            setSelectedStoreId(storeId);
                            setSelectedCategory("Semua");
                            setTimeout(() => {
                              document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }, 100);
                          }}
                        />
                        {sortedProducts.map((product) => {
                          const store = stores.find(s => s.id === product.storeId);
                          return (
                            <ProductCard 
                              key={product.id} 
                              product={product} 
                              store={store}
                            />
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="map"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="h-[450px] md:h-[600px] w-full"
                  >
                    <StoreMap 
                      stores={stores} 
                      onSelectStore={(id) => {
                        setSelectedStoreId(id);
                        setView("grid");
                      }} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              )}
            </div>
          </>
        ) : userRole === "florist" ? (
          <FloristDashboard />
        ) : (
          <AdminDashboard />
        )}
      </main>

      {/* Role Switcher & Dev Bypass Control Panel */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
        <AnimatePresence mode="wait">
          {!isShortcutOpen ? (
            <motion.button
              key="collapsed-shortcut"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsShortcutOpen(true)}
              className="h-12 w-12 rounded-full cursor-pointer shadow-2xl bg-primary text-primary-foreground border-2 border-background flex items-center justify-center relative group"
              title="Pintasan Mode (Demo Bypass)"
            >
              {userRole === "admin" ? (
                <ShieldAlert className="h-5 w-5 text-red-100 animate-pulse" />
              ) : userRole === "florist" ? (
                <Store className="h-5 w-5" />
              ) : (
                <UserIcon className="h-5 w-5" />
              )}
              {/* Floating Name Badge Tooltip */}
              <span className="absolute right-14 bg-background/95 backdrop-blur-md text-[11px] font-extrabold text-foreground py-1.5 px-3.5 rounded-full shadow-lg border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                Pintasan Mode ({userRole === "customer" ? "Pembeli" : userRole === "florist" ? "Penjual" : "Admin"}) ⚡
              </span>
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-amber-500 border border-background animate-bounce flex items-center justify-center text-[7px] font-black text-white">
                ⚡
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="expanded-shortcut"
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="bg-background/95 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-primary/20 flex flex-col gap-2.5 text-right w-64 transition-all relative"
            >
              <button 
                onClick={() => setIsShortcutOpen(false)}
                className="absolute -top-2.5 -left-2.5 h-7 w-7 rounded-full bg-secondary border shadow-md flex items-center justify-center hover:bg-muted text-foreground transition-all duration-150 font-bold"
                title="Sembunyikan Pintasan"
              >
                &times;
              </button>
              
              <div className="flex items-center justify-between gap-4 border-b pb-2 mb-1">
                <span className="text-[11px] font-extrabold tracking-wider text-primary uppercase">Pintasan Mode</span>
                <Badge variant="secondary" className="px-2 py-0 text-[10px] bg-primary/10 text-primary capitalize font-bold">
                  {userRole === "customer" ? "Pembeli" : userRole === "florist" ? "Penjual" : "Admin"}
                </Badge>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-1.5 flex-col">
                  <Button
                    size="sm"
                    variant={userRole === "customer" ? "default" : "outline"}
                    className="rounded-full text-xs h-9 justify-center font-bold"
                    onClick={() => {
                      setUserRole("customer");
                      setView("grid");
                      setProfileRole("customer");
                      setIsShortcutOpen(false);
                    }}
                  >
                    🔍 Mode Pembeli
                  </Button>
                  <Button
                    size="sm"
                    variant={userRole === "florist" ? "default" : "outline"}
                    className="rounded-full text-xs h-9 justify-center font-bold"
                    onClick={() => {
                      setUserRole("florist");
                      setProfileRole("florist");
                      setIsShortcutOpen(false);
                    }}
                  >
                    🏪 Mode Penjual
                  </Button>
                </div>
                
                {user?.email?.toLowerCase() === "miftaalyar@gmail.com" && (
                  <Button
                    size="sm"
                    variant={userRole === "admin" ? "default" : "outline"}
                    className={`rounded-full text-xs h-9 px-4 w-full flex items-center justify-center gap-1.5 transition-all font-bold ${
                      userRole === "admin" 
                        ? "bg-red-600 hover:bg-red-700 text-white border-transparent" 
                        : "bg-red-50 text-red-700 hover:bg-red-100/50 border-red-200/60"
                    }`}
                    onClick={() => {
                      setUserRole("admin");
                      setView("admin");
                      setProfileRole("admin");
                      setIsShortcutOpen(false);
                    }}
                  >
                    <ShieldAlert className="h-3.5 w-3.5 animate-pulse" /> Jalankan Mode Admin 🛡️
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">
            &copy; 2026 {webConfig.brandName || "TitikKembang"}. Handmade with love for local artisans.
          </p>
          {webConfig.emailVisible && (
            <p className="text-xs text-muted-foreground/70 font-mono">
              Surel Kontak: <a href={`mailto:${webConfig.emailVisible}`} className="hover:underline hover:text-primary">{webConfig.emailVisible}</a>
            </p>
          )}
          <div className="flex justify-center gap-4 text-xs font-semibold text-muted-foreground">
            <button 
              id="privacy-policy-link"
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-primary underline cursor-pointer transition-colors"
            >
              Kebijakan Privasi
            </button>
            <span>&bull;</span>
            <span className="text-muted-foreground/60 select-none">Pelayanan Terpercaya</span>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={isAuthOpen} 
        onOpenChange={setIsAuthOpen} 
        defaultMode={authMode}
        defaultRole={authDefaultRole}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onOpenChange={setIsPrivacyOpen}
      />
    </div>
  );
}


