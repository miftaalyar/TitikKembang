import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  MoreVertical, 
  User, 
  Smartphone,
  ChevronRight,
  Plus,
  Settings,
  MapPin,
  MapIcon,
  Store as StoreIcon,
  Save,
  Loader2,
  Pencil,
  Trash2,
  LogOut,
  Compass,
  AlertCircle,
  Palette,
  Image as ImageIcon,
  Sparkles,
  Check,
  Heart,
  Star,
  Smile,
  Zap,
  CreditCard,
  Award,
  Coins,
  TrendingUp,
  Tv,
  Calendar,
  QrCode,
  Upload,
  X,
  RefreshCw,
  Bell,
  Volume2,
  Play,
  Pause,
  Menu,
  MessageCircle
} from "lucide-react";
import { fetchOrders, updateOrderStatus, fetchProducts, getStore, updateStoreProfile, deleteProduct, fetchAdPackages, updateProduct, submitPremiumPayment, fetchStorePremiumPayments, updateUserProfile } from "@/src/lib/dataService";
import TrackingStepper from "@/src/components/TrackingStepper";
import QrisPaymentCode from "@/src/components/QrisPaymentCode";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ProductUploadModal from "@/src/components/ProductUploadModal";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { auth } from "@/src/lib/firebase";

// Aesthetic Customization Presets
const PRESET_BANNERS = [
  { id: "banner1", name: "Modern Dry Workshop", url: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80" },
  { id: "banner2", name: "Cozy Floristry Studio", url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80" },
  { id: "banner3", name: "Aesthetic Blossom Petals", url: "https://images.unsplash.com/photo-1533605634085-05e83ca08a8e?w=800&q=80" },
  { id: "banner4", name: "Crochet & Wool Table", url: "https://images.unsplash.com/photo-1452830978618-d6feae7d0ffa?w=800&q=80" },
  { id: "banner5", name: "Classic Rustic Flower Shop", url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80" }
];

const PRESET_LOGOS = [
  { id: "logo1", name: "Beautiful Rose Portrait", url: "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=400&q=80" },
  { id: "logo2", name: "Hands Crafting", url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&q=80" },
  { id: "logo3", name: "White Bouquet Bunch", url: "https://images.unsplash.com/photo-1444492442447-aa1998996ab4?w=400&q=80" },
  { id: "logo4", name: "Lavender Pot", url: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=400&q=80" }
];

const EMOJI_OPTIONS = ["🌸", "🌹", "💐", "🌿", "🎀", "🧸", "💝", "✨", "🌾", "🔮"];

const GRADIENT_PRESETS = [
  { id: "elegant-classic", name: "Classic Hub", from: "from-primary/80", to: "to-pink-500/85", classes: "from-primary to-pink-500/85" },
  { id: "romantic-rose", name: "Romantic Rose", from: "from-rose-500", to: "to-pink-650", classes: "from-rose-500 to-pink-600 bg-rose-500" },
  { id: "lavender-dream", name: "Lavender Dream", from: "from-purple-600", to: "to-indigo-500", classes: "from-purple-600 to-indigo-500" },
  { id: "sunset-glow", name: "Sunset", from: "from-amber-500", to: "to-rose-500", classes: "from-amber-500 to-rose-500" },
  { id: "emerald-fresh", name: "Emerald Garden", from: "from-emerald-600", to: "to-teal-500", classes: "from-emerald-600 to-teal-500" },
  { id: "royal-velvet", name: "Velvet Dark", from: "from-indigo-950", to: "to-purple-900", classes: "from-indigo-950 to-purple-900" },
  { id: "sweet-cotton", name: "Sweet Pastel", from: "from-pink-300", to: "to-rose-300", classes: "from-pink-300 to-rose-300" },
  { id: "transparent", name: "🚫 Tanpa Gradasi", from: "from-transparent", to: "to-transparent", classes: "from-transparent to-transparent bg-secondary" }
];

const PATTERN_PRESETS = [
  { id: "plain", name: "Simple Clean", desc: "Minimalis Putih" },
  { id: "pattern-soft", name: "Blossom Petal Glow", desc: "Kemerahan Lembut" },
  { id: "pattern-warm", name: "Vintage Craft Paper", desc: "Krem Hangat Kreatif" },
  { id: "pattern-dark", name: "Velvet Minimalist Black", desc: "Zafire Hitam Mewah" }
];


function compressAndResizeImage(file: File, maxW = 600, maxH = 600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Force maximum dimension cap to prevent massive image generation
        const actualMaxW = Math.min(maxW, 800);
        const actualMaxH = Math.min(maxH, 800);

        if (width > height) {
          if (width > actualMaxW) {
            height = Math.round((height * actualMaxW) / width);
            width = actualMaxW;
          }
        } else {
          if (height > actualMaxH) {
            width = Math.round((width * actualMaxH) / height);
            height = actualMaxH;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Use quality 0.55 by default for an excellent balance of size and visual fidelity
        let quality = 0.55;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        
        // If the resulting Base64 string length exceeds ~120KB (approx 160,000 chars),
        // we scale down the quality and/or resolution aggressively to keep it lightweight.
        if (dataUrl.length > 160000) {
          quality = 0.45;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        
        // If still over 120KB, scale down resolution by 30% more
        if (dataUrl.length > 160000) {
          const shrinkCanvas = document.createElement("canvas");
          shrinkCanvas.width = Math.round(width * 0.7);
          shrinkCanvas.height = Math.round(height * 0.7);
          const sCtx = shrinkCanvas.getContext("2d");
          if (sCtx) {
            sCtx.drawImage(canvas, 0, 0, shrinkCanvas.width, shrinkCanvas.height);
            dataUrl = shrinkCanvas.toDataURL("image/jpeg", 0.4);
          }
        }
        
        // Final fallback if somehow it is still massive: scale down to thumbnail dimensions
        if (dataUrl.length > 300000) {
          const thumbCanvas = document.createElement("canvas");
          thumbCanvas.width = 180;
          thumbCanvas.height = Math.round((height * 180) / width);
          const tCtx = thumbCanvas.getContext("2d");
          if (tCtx) {
            tCtx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
            dataUrl = thumbCanvas.toDataURL("image/jpeg", 0.35);
          }
        }

        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Format gambar rusak atau tidak didukung."));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

const parseGMapLink = (url: string) => {
  if (!url) return null;
  
  // Try to find /@lat,lng or /place/name/@lat,lng
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return {
      lat: parseFloat(atMatch[1]),
      lng: parseFloat(atMatch[2])
    };
  }

  // Try to find q=lat,lng
  const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    return {
      lat: parseFloat(qMatch[1]),
      lng: parseFloat(qMatch[2])
    };
  }
  
  // Try to find ?ll=lat,lng or &ll=lat,lng
  const llMatch = url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (llMatch) {
    return {
      lat: parseFloat(llMatch[1]),
      lng: parseFloat(llMatch[2])
    };
  }

  return null;
};

export default function FloristDashboard() {
  const [orders, setOrders] = useState<any[]>([]);

  const safeConfirm = (message: string): boolean => {
    try {
      return window.confirm(message);
    } catch (_) {
      return true;
    }
  };
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [storeExists, setStoreExists] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel: string;
    variant: "destructive" | "primary" | "warning";
    onConfirm: () => void;
  } | null>(null);

  const confirmAction = (
    title: string,
    message: string,
    onConfirm: () => void,
    actionLabel = "Ya, Lanjutkan",
    variant: "destructive" | "primary" | "warning" = "destructive"
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      actionLabel,
      variant,
      onConfirm
    });
  };

  // Paid Ads & Subscription States
  const [adPackages, setAdPackages] = useState<any[]>([]);
  const [selectedAdPkg, setSelectedAdPkg] = useState<any>(null);
  const [purchaseType, setPurchaseType] = useState<"one-time" | "subscription">("one-time");
  const [paymentMethod, setPaymentMethod] = useState<string>("qris");
  const [checkoutStep, setCheckoutStep] = useState<"idle" | "checkout" | "pay_gateway" | "processing" | "success">("idle");
  const [checkoutTimer, setCheckoutTimer] = useState<number>(300); // 5 menit hitung mundur
  const [vaNumber, setVaNumber] = useState<string>("");
  const [isCopyingVa, setIsCopyingVa] = useState<boolean>(false);
  const [adType, setAdType] = useState<"store" | "product">("store");
  const [selectedAdProductId, setSelectedAdProductId] = useState<string>("");

  // QRIS Screenshot Proof States
  const [proofImage, setProofImage] = useState<string>("");
  const [proofImageName, setProofImageName] = useState<string>("");
  const [isSubmittingProof, setIsSubmittingProof] = useState<boolean>(false);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);

  // Sidebar & Navigation states for layout
  const [activeTab, setActiveTab] = useState("active");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Seller Auto-refresh & Notification States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefreshSecs, setAutoRefreshSecs] = useState<number>(30); // Default 30 seconds
  const [isAutoRefreshActive, setIsAutoRefreshActive] = useState<boolean>(true); // Enabled by default
  const [countdown, setCountdown] = useState<number>(30);
  const [hasAudioPermission, setHasAudioPermission] = useState<boolean>(true); // Can toggle notification sound

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // First beep
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain1.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.15);
      
      // Second beep
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 (higher)
        gain2.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.2);
      }, 150);
    } catch (error) {
      console.warn("Could not play notification sound:", error);
    }
  };

  async function loadData(silent: boolean = false) {
    const user = auth.currentUser;
    if (!user) return;
    
    // Prevent background auto-refresh from running and overwriting registration form fields if store does not exist yet
    if (silent && !storeExists) {
      return;
    }
    
    if (!silent) {
      setIsRefreshing(true);
    }

    const cacheStoreKey = `cached-florist-store-${user.uid}`;
    const cachePkgsKey = `cached-florist-pkgs-${user.uid}`;
    const cachePaymentsKey = `cached-florist-payments-${user.uid}`;
    const cacheOrdersKey = `cached-florist-orders-${user.uid}`;
    const cacheProductsKey = `cached-florist-products-${user.uid}`;

    try {
      const cachedStore = localStorage.getItem(cacheStoreKey);
      const cachedPkgs = localStorage.getItem(cachePkgsKey);
      const cachedPayments = localStorage.getItem(cachePaymentsKey);
      const cachedOrders = localStorage.getItem(cacheOrdersKey);
      const cachedProducts = localStorage.getItem(cacheProductsKey);

      if (cachedStore) {
        setStoreInfo(JSON.parse(cachedStore));
        setStoreExists(true);
      }
      if (cachedPkgs) setAdPackages(JSON.parse(cachedPkgs));
      if (cachedPayments) setPendingPayments(JSON.parse(cachedPayments));
      if (cachedOrders) setOrders(JSON.parse(cachedOrders));
      if (cachedProducts) setProducts(JSON.parse(cachedProducts));
      
      if (cachedStore) {
        setLoading(false);
      }
    } catch (err) {
      console.warn("Could not load cached florist dashboard data:", err);
    }
    
    try {
      const s = await getStore(user.uid);
      const pkgs = await fetchAdPackages();
      setAdPackages(pkgs || []);
      localStorage.setItem(cachePkgsKey, JSON.stringify(pkgs || []));

      const pPayments = await fetchStorePremiumPayments(user.uid);
      setPendingPayments(pPayments || []);
      localStorage.setItem(cachePaymentsKey, JSON.stringify(pPayments || []));
      
      if (s) {
        setStoreInfo(s);
        setStoreExists(true);
        localStorage.setItem(cacheStoreKey, JSON.stringify(s));
        
        if ((s as any).isVerified) {
          const [o, p] = await Promise.all([
            fetchOrders(user.uid),
            fetchProducts(undefined, user.uid)
          ]);
          
          if (orders.length > 0 && o && o.length > orders.length) {
            const currentIds = new Set(orders.map(item => item.id));
            const newOrders = o.filter((item: any) => !currentIds.has(item.id));
            
            if (newOrders.length > 0) {
              if (hasAudioPermission) {
                playNotificationSound();
              }
              newOrders.forEach((newOrd: any) => {
                toast.success(`🔔 PESANAN BARU MASUK!`, {
                  description: `Dari ${newOrd.buyerName || "Pelanggan"} • Rp ${newOrd.totalPrice?.toLocaleString("id-ID")}`,
                  duration: 8000,
                });
              });
            }
          }
          
          setOrders(o || []);
          localStorage.setItem(cacheOrdersKey, JSON.stringify(o || []));
          setProducts(p || []);
          localStorage.setItem(cacheProductsKey, JSON.stringify(p || []));
        } else {
          setOrders([]);
          setProducts([]);
        }
      } else {
        setStoreExists(false);
        setOrders([]);
        setProducts([]);
        setStoreInfo((prev: any) => {
          // If the form has already been populated with some values by the user, preserve them!
          if (prev && (prev.name || prev.phone || prev.description || prev.location?.address || prev.verificationImage)) {
            return prev;
          }

          // Try to load any previously saved draft to avoid user typing loss
          try {
            const draftKey = `cached-florist-registration-draft-${user.uid}`;
            const draftStr = localStorage.getItem(draftKey);
            if (draftStr) {
              const draftObj = JSON.parse(draftStr);
              if (draftObj && typeof draftObj === "object") {
                return {
                  id: user.uid,
                  name: draftObj.name || "",
                  owner: draftObj.owner || user.displayName || "",
                  email: user.email || "",
                  phone: draftObj.phone || "",
                  description: draftObj.description || "",
                  location: draftObj.location || { lat: -6.2088, lng: 106.8456, address: "" },
                  operatingHours: draftObj.operatingHours || "08:00 - 20:00",
                  rating: 4.5,
                  reviewCount: 0,
                  isVerified: false,
                  verificationImage: draftObj.verificationImage || ""
                };
              }
            }
          } catch (draftErr) {
            console.warn("Failed to retrieve florist registration draft:", draftErr);
          }

          return {
            id: user.uid,
            name: "",
            description: "",
            owner: user.displayName || "",
            email: user.email || "",
            location: { lat: -6.2088, lng: 106.8456, address: "" },
            operatingHours: "08:00 - 20:00",
            rating: 4.5,
            reviewCount: 0,
            isVerified: false
          };
        });
      }
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadData();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Save registration form draft to localStorage whenever it changes (if store doesn't exist yet)
  useEffect(() => {
    const user = auth.currentUser;
    if (user && !storeExists && storeInfo) {
      const draftKey = `cached-florist-registration-draft-${user.uid}`;
      try {
        localStorage.setItem(draftKey, JSON.stringify(storeInfo));
      } catch (err) {
        console.warn("Failed to write registration draft to cache", err);
      }
    }
  }, [storeInfo, storeExists]);

  // Checkout Countdown Timer Effect
  useEffect(() => {
    let interval: any;
    if (checkoutStep === "pay_gateway" && checkoutTimer > 0) {
      interval = setInterval(() => {
        setCheckoutTimer((prev) => {
          if (prev <= 1) {
            setCheckoutStep("idle");
            toast.error("Waktu pendaftaran paket telah habis, silakan coba lagi.");
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [checkoutStep, checkoutTimer]);

  // Seller auto-refresh countdown effect
  useEffect(() => {
    let timer: any;
    if (isAutoRefreshActive && storeExists) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            loadData(true);
            return autoRefreshSecs;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAutoRefreshActive, autoRefreshSecs, orders, storeExists]);

  // Reset countdown if settings change
  useEffect(() => {
    setCountdown(autoRefreshSecs);
  }, [autoRefreshSecs, isAutoRefreshActive]);

  const handleCopyVa = (val: string) => {
    navigator.clipboard.writeText(val);
    setIsCopyingVa(true);
    toast.success("Nomor Rekening / Virtual Account berhasil disalin!");
    setTimeout(() => setIsCopyingVa(false), 2000);
  };

  const getExpiryDate = (duration: string) => {
    const days = parseInt(duration) || 30;
    const exp = new Date();
    exp.setDate(exp.getDate() + days);
    return exp.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const handleSelectPackage = (pkg: any) => {
    if (!storeInfo?.isVerified) {
      toast.error("Maaf, profil toko Anda harus diverifikasi (Verified) oleh Admin terlebih dahulu sebelum membeli paket iklan.");
      return;
    }
    if (adType === "product" && !selectedAdProductId) {
      toast.error("Silakan pilih terlebih dahulu postingan produk bunga yang ingin Anda boost di daftar produk.");
      return;
    }
    setSelectedAdPkg(pkg);
    setPurchaseType("one-time");
    setPaymentMethod("qris");
    setCheckoutStep("checkout");
  };

  const handleProceedToPayment = () => {
    if (!selectedAdPkg) return;
    
    // Generate virtual account base numbers
    let va = "";
    if (paymentMethod === "va_bca") {
      va = "80012" + Math.floor(1000000000 + Math.random() * 9000000000);
    } else if (paymentMethod === "va_mandiri") {
      va = "88019" + Math.floor(1000000000 + Math.random() * 9000000000);
    } else {
      va = "ID2026" + Math.floor(100000000 + Math.random() * 900000000);
    }
    
    setVaNumber(va);
    setCheckoutTimer(300); // 5 minutes
    setCheckoutStep("pay_gateway");
  };

  const handleSimulatePayment = async () => {
    setCheckoutStep("processing");
    
    // Simulate real gateway roundtrip response
    setTimeout(async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("Akses kedaluwarsa!");
        
        const discountedPrice = selectedAdPkg.price;
        const newAdId = "ad-" + Math.floor(100000 + Math.random() * 900000);
          
        const campaignDetail = {
          id: newAdId,
          packageId: selectedAdPkg.id,
          type: selectedAdPkg.type || (selectedAdPkg.id.includes("slide") ? "slide_feeds" : "main_feeds"),
          name: selectedAdPkg.name,
          price: discountedPrice,
          duration: selectedAdPkg.duration,
          purchaseType: "one-time",
          paymentMethod: paymentMethod,
          subscribedAt: new Date().toLocaleDateString("id-ID"),
          expiresAt: getExpiryDate(selectedAdPkg.duration),
          status: "active",
          adType: "store"
        };

        const existingAds = storeInfo?.activeAds || [];
        const updatedActiveAds = [...existingAds, campaignDetail];

        const hasSlideFeeds = updatedActiveAds.some((ad: any) => ad.type === "slide_feeds" && ad.status === "active");
        const hasMainFeeds = updatedActiveAds.some((ad: any) => ad.type === "main_feeds" && ad.status === "active");

        const premiumPayload = {
          activeAds: updatedActiveAds,
          isFeatured: hasSlideFeeds,
          isBoosted: hasMainFeeds,
          activeAdPkg: campaignDetail
        };

        // Save real-time premium info straight to firestore
        await updateStoreProfile(user.uid, premiumPayload);
        
        // Update local components state
        setStoreInfo((prev: any) => ({
          ...prev,
          ...premiumPayload
        }));
        
        toast.success("Pembayaran berhasil diverifikasi oleh Gateway!");
        setCheckoutStep("success");
      } catch (err) {
        console.error(err);
        toast.error("Terjadi kegagalan komunikasi instan dengan merchant server.");
        setCheckoutStep("checkout");
      }
    }, 2000);
  };

  const handleProofFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Format file harus berupa gambar!");
      return;
    }

    try {
      setProofImageName(file.name);
      const compressedBase64 = await compressAndResizeImage(file);
      setProofImage(compressedBase64);
      toast.success("Gambar bukti pembayaran berhasil dibaca dan dikompresi!");
    } catch (err: any) {
      toast.error(err.message || "Gagal membaca file gambar.");
    }
  };

  const handleSubmitProofOfPayment = async () => {
    if (!proofImage) {
      toast.error("Silakan unggah screenshot bukti transfer/pembayaran QRIS Anda terlebih dahulu.");
      return;
    }
    
    setIsSubmittingProof(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Sesi login Anda kedaluwarsa!");

      const payload = {
        storeId: user.uid,
        storeName: storeInfo?.name || "Toko Florist",
        packageId: selectedAdPkg.id,
        packageName: selectedAdPkg.name,
        price: selectedAdPkg.price,
        duration: selectedAdPkg.duration,
        proofImage: proofImage,
        status: "pending",
        adType: selectedAdPkg.type || (selectedAdPkg.id.includes("slide") ? "slide_feeds" : "main_feeds"),
        paymentMethod: "qris"
      };

      await submitPremiumPayment(payload);
      toast.success("Bukti pembayaran berhasil diunggah! Mohon tunggu verifikasi oleh tim Admin kami.");
      
      // Reset proof states
      setProofImage("");
      setProofImageName("");
      setCheckoutStep("success");

      // Reload
      const pPayments = await fetchStorePremiumPayments(user.uid);
      setPendingPayments(pPayments || []);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirimkan bukti pembayaran. Silakan coba kembali.");
    } finally {
      setIsSubmittingProof(false);
    }
  };

  const handleCancelAdSubscription = (adIdOrType?: string) => {
    const confirmMessage = adIdOrType 
      ? "Apakah Anda yakin ingin menonaktifkan promosi paket iklan berbayar pilihan ini?"
      : "Apakah Anda yakin ingin berhenti berlangganan / menonaktifkan semua paket iklan aktif Anda?";
      
    confirmAction(
      "Konfirmasi Penghentian Iklan",
      confirmMessage,
      async () => {
        setLoading(true);
        try {
          const user = auth.currentUser;
          if (!user) return;
          
          const existingAds = storeInfo?.activeAds || [];
          let updatedActiveAds = [...existingAds];
          let isFeatured = !!storeInfo?.isFeatured;
          let isBoosted = !!storeInfo?.isBoosted;

          if (adIdOrType === "legacy-slide") {
            isFeatured = false;
            updatedActiveAds = existingAds.filter((ad: any) => ad.id !== "legacy-slide" && ad.type !== "slide_feeds");
          } else if (adIdOrType === "legacy-main") {
            isBoosted = false;
            updatedActiveAds = existingAds.filter((ad: any) => ad.id !== "legacy-main" && ad.type !== "main_feeds");
          } else if (adIdOrType) {
            const adToCancel = existingAds.find((ad: any) => ad.id === adIdOrType);
            updatedActiveAds = existingAds.filter((ad: any) => ad.id !== adIdOrType);
            
            if (adToCancel) {
              if (adToCancel.type === "slide_feeds") {
                isFeatured = updatedActiveAds.some((ad: any) => ad.type === "slide_feeds" && ad.status === "active");
              } else if (adToCancel.type === "main_feeds") {
                isBoosted = updatedActiveAds.some((ad: any) => ad.type === "main_feeds" && ad.status === "active");
              }
            }
          } else {
            updatedActiveAds = [];
            isFeatured = false;
            isBoosted = false;
          }

          const payload = {
            activeAds: updatedActiveAds,
            isFeatured,
            isBoosted,
            activeAdPkg: updatedActiveAds.length > 0 ? updatedActiveAds[updatedActiveAds.length - 1] : null
          };

          await updateStoreProfile(user.uid, payload);
          setStoreInfo((p: any) => ({ ...p, ...payload }));
          toast.success("Promosi promosi iklan berhasil dinonaktifkan! 🍃");
        } catch (err) {
          console.error(err);
          toast.error("Gagal menonaktifkan langganan.");
        } finally {
          setLoading(false);
        }
      },
      "Ya, Hentikan Iklan",
      "destructive"
    );
  };

  const handleRegisterStore = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    if (!storeInfo?.verificationImage) {
      toast.error("Mohon unggah minimal satu foto produk hasil kriya Anda sebagai validasi pendaftaran mitra!");
      return;
    }

    setIsRegistering(true);
    try {
      const imgUrl = storeInfo.verificationImage;
      const registrationData = {
        id: user.uid,
        name: storeInfo.name || "",
        owner: storeInfo.owner || user.displayName || "",
        email: user.email || "",
        phone: storeInfo.phone || "",
        description: storeInfo.description || "",
        location: {
          address: storeInfo.location?.address || "",
          gmapLink: storeInfo.location?.gmapLink || "",
          lat: storeInfo.location?.lat ?? -6.2088,
          lng: storeInfo.location?.lng ?? 106.8456
        },
        operatingHours: storeInfo.operatingHours || "08:00 - 20:00",
        rating: 4.5,
        reviewCount: 0,
        isVerified: false,
        appliedAt: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric"
        }) + " pukul " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        portfolio: [imgUrl],
        verificationImage: imgUrl
      };

      await updateStoreProfile(user.uid, registrationData);

      // Clean up local draft cache upon successful registration
      try {
        const draftKey = `cached-florist-registration-draft-${user.uid}`;
        localStorage.removeItem(draftKey);
      } catch (cacheErr) {
        console.warn("Could not delete registration draft:", cacheErr);
      }

      try {
        await updateUserProfile(user.uid, { role: "florist" });
        window.dispatchEvent(new CustomEvent("role-updated", { detail: "florist" }));
      } catch (roleErr) {
        console.warn("Failed to update user profile role:", roleErr);
      }

      setStoreInfo(registrationData);
      setStoreExists(true);
      toast.success("Pendaftaran dikirim! Tunggu persetujuan dari Admin.");
    } catch (err) {
      console.error("Failed to register store in Firestore:", err);
      toast.error("Gagal mengirim berkas kemitraan. Mohon periksa koneksi Anda.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateOrderStatus(id, newStatus);
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      toast.success(`Status pesanan diperbarui menjadi ${newStatus}`);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memperbarui status pesanan.");
    }
  };

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setIsSaving(true);
    try {
      await updateStoreProfile(user.uid, storeInfo);
      toast.success("Profil toko berhasil diperbarui!");
    } catch (e) {
      console.error(e);
      toast.error("Gagal memperbarui profil toko.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (product: any) => {
    if (!product) return;
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      toast.success(`Produk "${product.name}" berhasil dihapus dari katalog! 🍃`);
      setProductToDelete(null);
      loadData();
    } catch (e) {
      console.error(e);
      toast.error("Gagal menghapus produk.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSwitchToBuyer = () => {
    window.dispatchEvent(new CustomEvent("switch-role", { detail: "customer" }));
  };

  const handleToggleStoreClosed = async () => {
    if (!storeInfo) return;
    const nextClosedState = !storeInfo.isClosed;
    const updatedStore = { ...storeInfo, isClosed: nextClosedState };
    
    const toastId = toast.loading(nextClosedState ? "Menutup toko Anda... 🚫" : "Membuka kembali toko Anda... 🟢");
    try {
      await updateStoreProfile(storeInfo.id, updatedStore);
      setStoreInfo(updatedStore);
      toast.success(nextClosedState 
        ? "Toko berhasil DITUTUP sementara! Pembeli tidak bisa membuat pesanan baru." 
        : "Toko berhasil DIBUKA! Pembeli sekarang dapat kembali berbelanja.", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengubah status operasional toko.", { id: toastId });
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "Pesanan Diterima": return <Badge variant="secondary" className="bg-blue-100 text-blue-700">{status}</Badge>;
      case "Sedang Dibuat": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">{status}</Badge>;
      case "Siap Diambil": return <Badge variant="secondary" className="bg-green-100 text-green-700 underline decoration-green-300 underline-offset-4">{status}</Badge>;
      case "Selesai": return <Badge variant="outline" className="opacity-50">{status}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const activeOrdersCount = orders.filter(o => o.status !== "Selesai").length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Memuat profil toko Anda...</p>
      </div>
    );
  }

  if (!storeExists) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-6">
        {/* Registration Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-2">
            <StoreIcon className="h-7 w-7" />
          </div>
          <h2 className="font-heading text-3xl font-bold tracking-tight">Kemitraan Mitra Penjual (Florist)</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto font-medium">
            Daftarkan detail toko bunga Anda untuk mulai memajang katalog produk. Akun Anda perlu diverifikasi oleh Admin sebelum Anda dapat memposting produk & bertransaksi.
          </p>
        </div>

        {/* Form Card */}
        <Card className="rounded-3xl border-none bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
            <CardTitle className="text-lg font-heading text-primary flex items-center gap-2 font-bold">
              <Pencil className="h-5 w-5" /> Formulir Informasi Toko
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleRegisterStore} className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="regStoreName">Nama Toko Bunga / Kerajinan</Label>
                  <Input 
                    id="regStoreName" 
                    value={storeInfo?.name || ""} 
                    onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })}
                    placeholder="Contoh: Amaryllis Florist"
                    className="rounded-xl h-11 bg-secondary/30"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regOwnerName">Nama Lengkap Pemilik</Label>
                  <Input 
                    id="regOwnerName" 
                    value={storeInfo?.owner || ""} 
                    onChange={(e) => setStoreInfo({ ...storeInfo, owner: e.target.value })}
                    placeholder="Contoh: Rina Sari"
                    className="rounded-xl h-11 bg-secondary/30"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="regEmail">Email Toko</Label>
                  <Input 
                    id="regEmail" 
                    type="email"
                    value={storeInfo?.email || ""} 
                    placeholder="email@example.com"
                    className="rounded-xl h-11 bg-secondary/10 text-muted-foreground cursor-not-allowed border-none shadow-none"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regPhone">No. WhatsApp Aktif (Untuk Pesanan Langsung)</Label>
                  <Input 
                    id="regPhone" 
                    value={storeInfo?.phone || ""} 
                    onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                    placeholder="Contoh: 08123456789"
                    className="rounded-xl h-11 bg-secondary/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="regDescription">Deskripsi & Keahlian Toko Bunga Anda</Label>
                <Textarea 
                  id="regDescription" 
                  value={storeInfo?.description || ""} 
                  onChange={(e) => setStoreInfo({ ...storeInfo, description: e.target.value })}
                  placeholder="Ceritakan tentang kreasi bunga Anda (contoh: Mengkhususkan diri pada buket kawat bulu & bunga hidup segar untuk wisuda)..."
                  rows={4}
                  className="rounded-xl bg-secondary/30"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regAddress">Alamat Pickup / Titik Temu Fisik</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="regAddress" 
                    className="pl-9 rounded-xl h-11 bg-secondary/30"
                    value={storeInfo?.location?.address || ""} 
                    onChange={(e) => {
                      const prevLoc = storeInfo?.location || {};
                      setStoreInfo({ 
                        ...storeInfo, 
                        location: { 
                          lat: prevLoc.lat ?? -6.2088,
                          lng: prevLoc.lng ?? 106.8456,
                          gmapLink: prevLoc.gmapLink || "",
                          address: e.target.value 
                        } 
                      });
                    }}
                    placeholder="Jl. Menteng Raya No. 15, Jakarta Pusat"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="regHours">Jam Operasional Toko</Label>
                  <Input 
                    id="regHours" 
                    value={storeInfo?.operatingHours || ""} 
                    onChange={(e) => setStoreInfo({ ...storeInfo, operatingHours: e.target.value })}
                    placeholder="Contoh: 08:00 - 20:00"
                    className="rounded-xl h-11 bg-secondary/30"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regGmapLink" className="flex items-center gap-1.5 text-foreground font-semibold">
                    <span>Link Google Maps Toko 📍</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="regGmapLink" 
                    type="text"
                    placeholder="Contoh: https://maps.app.goo.gl/... atau https://google.com/maps/place/..."
                    className="rounded-xl h-11 bg-secondary/30 text-xs sm:text-sm"
                    value={storeInfo?.location?.gmapLink || ""} 
                    onChange={(e) => {
                      const val = e.target.value;
                      const parsed = parseGMapLink(val);
                      const prevLoc = storeInfo?.location || {};
                      if (parsed) {
                        setStoreInfo({
                          ...storeInfo,
                          location: {
                            lat: parsed.lat,
                            lng: parsed.lng,
                            gmapLink: val,
                            address: prevLoc.address || ""
                          }
                        });
                      } else {
                        // Set standard Jakarta location as fallback coordinates but preserve Google Maps URL
                        const defaultLat = prevLoc.lat ?? -6.2088;
                        const defaultLng = prevLoc.lng ?? 106.8456;
                        setStoreInfo({
                          ...storeInfo,
                          location: {
                            lat: defaultLat,
                            lng: defaultLng,
                            gmapLink: val,
                            address: prevLoc.address || ""
                          }
                        });
                      }
                    }}
                    required
                  />
                  <p className="text-[10px] text-muted-foreground leading-normal font-semibold">
                    Tempel link Google Maps hasil "Bagikan/Share" lokasi toko Anda. Sistem otomatis mendeteksi koordinat titik agar pembeli mudah pickup kriya Anda.
                  </p>
                </div>
              </div>

              {/* Product Photo Validation Uploader */}
              <div className="space-y-2 border-t pt-4 border-muted/50">
                <Label htmlFor="verificationImage" className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px]">!</span>
                  Unggah Foto Produk Pertama & Bukti Kriya <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sebagai syarat wajib pendaftaran mitra, silakan unggah satu foto produk contoh buatan Anda. Foto ini menjadi perantara utama tim admin kami untuk memvalidasi kelayakkan dan kualitas kriya Anda sebelum menyetujui akun Anda.
                </p>
                <div 
                  className={`mt-2 border-2 border-dashed rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center ${
                    storeInfo?.verificationImage 
                      ? 'border-green-500/50 bg-green-50/5' 
                      : 'border-muted hover:border-primary/50 hover:bg-primary/5 bg-secondary/10'
                  }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async (e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith("image/")) {
                      const toastId = toast.loading("Sedang memproses & mereduksi sampel kriya Anda... 📸");
                      try {
                        const base64 = await compressAndResizeImage(file);
                        setStoreInfo({ ...storeInfo, verificationImage: base64 });
                        toast.success("Foto kriya produk berhasil dipasang & dikompresi! ⚡", { id: toastId });
                      } catch (err: any) {
                        toast.error("Gagal memproses gambar: " + err.message, { id: toastId });
                      }
                    }
                  }}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = async (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const toastId = toast.loading("Membaca & mengompresi foto kriya pilihan... 🌸");
                        try {
                          const base64 = await compressAndResizeImage(file);
                          setStoreInfo({ ...storeInfo, verificationImage: base64 });
                          toast.success("Foto kriya produk berhasil dipesan & dikompresi! ⚡", { id: toastId });
                        } catch (err: any) {
                          toast.error("Gagal memproses gambar: " + err.message, { id: toastId });
                        }
                      }
                    };
                    input.click();
                  }}
                >
                  {storeInfo?.verificationImage ? (
                    <div className="relative w-full max-w-xs aspect-square rounded-xl overflow-hidden group shadow` ring-1 ring-green-650/40">
                      <img 
                        src={storeInfo.verificationImage} 
                        className="w-full h-full object-cover" 
                        alt="Product verification sample" 
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white text-xs font-semibold flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                          <Upload className="h-3.5 w-3.5" /> Ganti Gambar
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStoreInfo({ ...storeInfo, verificationImage: "" });
                          toast.info("Foto validasi kriya dihapus.");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary/80">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div className="text-sm font-semibold text-foreground">
                        Tarik & lepas gambar di sini, atau <span className="text-primary hover:underline">klik untuk memilih</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Mendukung format PNG, JPG, WEBP hingga 1.2MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-muted mt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSwitchToBuyer} 
                  className="rounded-full h-12 flex-1 font-semibold text-primary border-primary/25 hover:bg-primary/5"
                >
                  <Compass className="mr-2 h-4 w-4" /> Kembali ke Mode Pembeli (Exit)
                </Button>
                <Button 
                  type="submit" 
                  disabled={isRegistering} 
                  className="rounded-full h-12 flex-1 font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95"
                >
                  {isRegistering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Kirim Pendaftaran Mitra
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (storeInfo && !storeInfo.isVerified) {
    return (
      <div className="max-w-xl mx-auto space-y-8 py-14 text-center">
        {/* Pending Card */}
        <Card className="rounded-3xl border border-yellow-100 bg-yellow-50/15 overflow-hidden shadow-2xl p-8 space-y-6">
          <div className="mx-auto h-20 w-20 rounded-full bg-yellow-100/60 flex items-center justify-center text-yellow-600 animate-pulse">
            <Clock className="h-10 w-10" />
          </div>
          
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-black text-foreground">Menunggu Verifikasi Toko ⏳</h2>
            <p className="text-yellow-800 text-[10px] font-bold uppercase tracking-wider bg-yellow-100/50 px-3 py-1.5 rounded-full inline-block border border-yellow-200/50">
              ID PENDAFTARAN: {storeInfo.id?.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="text-muted-foreground text-sm space-y-3 leading-relaxed text-left bg-secondary/35 p-5 rounded-3xl border">
            <p>
              Halo, <strong className="text-foreground">{storeInfo.owner}</strong>. Pendaftaran toko bunga Anda <strong className="text-foreground">"{storeInfo.name}"</strong> dengan email <strong className="text-foreground">{storeInfo.email}</strong> telah disimpan dengan aman dan sedang dalam antrean verifikasi Admin.
            </p>
            <p>
              <strong>Kebijakan Platform:</strong> Demi kualitas dan kepuasan pembeli, seluruh mitra florist & crafter lokal harus diverifikasi keaslian datanya sebelum diizinkan memajang produk bunga atau menerima pesanan di sistem.
            </p>
            <p className="text-yellow-800 text-xs font-semibold">
              *TIPS: Admin bertanggung jawab membantu mempromosikan produk mitra yang terverifikasi melalui paket penempatan iklan berbayar (Paid Ads) di bagian promosi atas.
            </p>
          </div>

          <div className="my-2 border-t pt-4">
            <p className="text-xs text-muted-foreground">Diajukan pada: {storeInfo.appliedAt || "Baru saja"}</p>
          </div>

          <div className="flex flex-col gap-2.5">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSwitchToBuyer} 
              className="rounded-full h-11 w-full font-semibold border-primary/20 hover:bg-primary/5 text-primary text-xs"
            >
              <Compass className="mr-1.5 h-3.5 w-3.5" /> Mode Pembeli (Exit)
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => auth.signOut()} 
              className="rounded-full h-11 w-full font-semibold text-red-600 hover:bg-red-50 text-xs"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Keluar Akun (Log Out)
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Disclaimer Banner: Direct Buyer-Seller Dealings */}
      <div className="flex items-start gap-3 rounded-2xl border border-yellow-200/60 bg-yellow-50/50 p-4 text-xs text-yellow-800">
        <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold uppercase tracking-wider text-[10px]">Portal Mitra Penjual (Florist)</p>
          <p className="mt-0.5 leading-relaxed text-muted-foreground">
            Aplikasi ini ditujukan untuk memfasilitasi Anda memajang katalog produk. **Seluruh transaksi pembayaran dan kesepakatan order langsung ke WhatsApp atau kontak Anda di luar tanggung jawab aplikasi dan Admin.**
          </p>
        </div>
      </div>

      {/* Auto-Refresh & Realtime Order Monitor Bar */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-sm text-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <Bell className={`h-4 w-4 ${isAutoRefreshActive ? "animate-pulse" : ""}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-gray-900">Monitor Pesanan Otomatis (Real-time)</span>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isAutoRefreshActive ? "bg-green-400" : "bg-amber-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isAutoRefreshActive ? "bg-green-500" : "bg-amber-500"}`}></span>
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Terakhir sinkronisasi: <strong className="text-slate-700">{lastUpdated.toLocaleTimeString("id-ID")}</strong> 
              {isAutoRefreshActive && ` • Update berikut dalam ${countdown} detik`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sound Alert Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setHasAudioPermission(!hasAudioPermission);
              toast.info(
                !hasAudioPermission 
                  ? "Suara notifikasi pesanan diaktifkan! 🔊" 
                  : "Suara notifikasi dibisukan. 🔇"
              );
            }}
            className={`rounded-full text-xs h-9 px-3 ${hasAudioPermission ? "text-green-650 bg-green-50 hover:bg-green-100" : "text-slate-500 bg-slate-100 hover:bg-slate-200"}`}
            title="Klik untuk menyalakan/mematikan suara alarm pesanan masuk"
          >
            <Volume2 className="h-3.5 w-3.5 mr-1.5" />
            {hasAudioPermission ? "Alarm: ON 🔊" : "Alarm: MUTE 🔇"}
          </Button>

          {/* Auto Refresh Toggle Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsAutoRefreshActive(!isAutoRefreshActive);
              toast.info(
                !isAutoRefreshActive 
                  ? "Pemantauan otomatis dimulai kembali 🟢" 
                  : "Pemantauan otomatis dijeda ⏸️"
              );
            }}
            className="rounded-full text-xs h-9 font-bold px-3 border-slate-200"
          >
            {isAutoRefreshActive ? (
              <>
                <Pause className="mr-1.5 h-3.5 w-3.5 text-amber-500" /> Jeda Auto-Update
              </>
            ) : (
              <>
                <Play className="mr-1.5 h-3.5 w-3.5 text-green-600" /> Mulai Auto-Update
              </>
            )}
          </Button>

          {/* Refresh interval selector */}
          {isAutoRefreshActive && (
            <div className="flex items-center gap-1 border border-slate-200 rounded-full h-9 px-2.5 bg-white text-xs text-slate-700">
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider mr-1">Interval:</span>
              {[15, 30, 60].map((sec) => (
                <button
                  type="button"
                  key={sec}
                  onClick={() => {
                    setAutoRefreshSecs(sec);
                    toast.info(`Interval pemantauan diubah ke ${sec} detik!`);
                  }}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-colors ${
                    autoRefreshSecs === sec 
                      ? "bg-rose-500 text-white" 
                      : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          )}

          {/* Manual Refresh Button */}
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => {
              loadData(false);
              toast.success("Berhasil mensinkronkan ulang data dashboard! ⚡");
            }}
            disabled={isRefreshing}
            className="rounded-full text-xs h-9 font-black px-4 bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-rose-400" : ""}`} />
            Sinkron Sekarang
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden rounded-full h-9 w-9 border-primary/20 text-primary shrink-0"
              title="Buka Menu"
            >
              <Menu size={16} />
            </Button>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold">Seller Dashboard</h2>
            {storeInfo?.isClosed ? (
              <Badge variant="destructive" className="rounded-full font-bold px-3 py-1 bg-red-600 animate-pulse text-[10px] sm:text-xs">
                🔴 TOKO TUTUP
              </Badge>
            ) : (
              <Badge className="rounded-full font-bold px-3 py-1 bg-green-600 text-white text-[10px] sm:text-xs">
                🟢 TOKO BUKA
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-0.5">Kelola pesanan langsung dan inventaris katalog bunga Anda.</p>
        </div>
        
        {/* Exit Gates & Action bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Open/Close Store Toggle Button */}
          <Button
            variant={storeInfo?.isClosed ? "default" : "outline"}
            size="sm"
            onClick={handleToggleStoreClosed}
            className={`rounded-full text-xs h-9 font-bold px-4 transition-all duration-200 shadow-sm ${
              storeInfo?.isClosed 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            }`}
          >
            {storeInfo?.isClosed ? "🔓 Buka Toko Sekarang" : "🔒 Tutup Toko Sementara"}
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSwitchToBuyer} 
            className="rounded-full text-xs h-9 font-semibold text-primary border-primary/20 hover:bg-primary/5"
          >
            <Compass className="mr-1.5 h-3.5 w-3.5" /> Mode Pembeli (Exit)
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => auth.signOut()} 
            className="rounded-full text-xs h-9 font-semibold text-red-650 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" /> Keluar Akun
          </Button>

          <Button size="sm" className="rounded-full text-xs h-9 bg-primary text-primary-foreground font-semibold" onClick={() => { setProductToEdit(null); setIsUploadOpen(true); }}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Tambah Produk
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border-none bg-primary/5 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Produk Katalog</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length} Item</div>
            <p className="text-xs text-muted-foreground">Jumlah produk aktif Anda</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-none bg-primary/5 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Aktif</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrdersCount}</div>
            <p className="text-xs text-muted-foreground">{orders.filter(o => o.status === "Pesanan Diterima").length} perlu segera dibuat</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-none bg-primary/5 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Kanal Hubungan</CardTitle>
            <MessageCircle className="h-4 w-4 text-green-600 animate-pulse fill-green-600/10" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{storeInfo?.phone || "Belum Atur WA"}</div>
            <p className="text-xs text-muted-foreground">Transaksi langsung via WhatsApp</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Backdrop for mobile sidebar drawer */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] lg:hidden transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="grid grid-cols-12 gap-6 items-start relative mt-6">
          {/* Sidebar Navigation Panel - persistent on desktop, drawer on mobile */}
          <div className={`
            col-span-12 lg:col-span-3 
            fixed inset-y-0 left-0 z-[90] w-72 bg-card p-6 border-r border-secondary/50 shadow-2xl lg:shadow-none
            lg:relative lg:inset-auto lg:z-auto lg:w-auto lg:bg-transparent lg:p-0 lg:border-none
            transform transition-transform duration-300 ease-in-out h-full lg:h-auto
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}>
            <Card className="rounded-3xl border border-secondary/50 bg-card/65 backdrop-blur-md p-4 lg:p-5 h-full lg:sticky lg:top-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-6">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between lg:justify-start gap-3 border-b border-secondary/60 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-primary text-primary-foreground rounded-xl shadow-md">
                      <StoreIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-primary leading-none">Florist Panel</h3>
                      <p className="text-[10px] text-muted-foreground mt-1">Kelola Toko & Paket</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden rounded-full h-8 w-8 text-muted-foreground hover:bg-secondary"
                  >
                    <X size={16} />
                  </Button>
                </div>

                {/* Navigation triggers list inside customized TabsList */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-3 block mb-2">Menu Navigasi</span>
                  
                  <TabsList className="flex flex-col gap-1 bg-transparent h-auto w-full p-0 border-none items-stretch">
                    <TabsTrigger 
                      value="active" 
                      onClick={() => setIsSidebarOpen(false)}
                      className="w-full justify-start rounded-xl px-4 py-2.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:bg-secondary/40 hover:text-primary transition-all text-left flex items-center gap-2 border-none"
                    >
                      <Package className="h-4 w-4" />
                      <span>Pesanan Aktif</span>
                      <span className="ml-auto bg-primary/10 text-primary group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {orders.filter(o => o.status !== "Selesai" && o.status !== "Pesanan Selesai").length}
                      </span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="history" 
                      onClick={() => setIsSidebarOpen(false)}
                      className="w-full justify-start rounded-xl px-4 py-2.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:bg-secondary/40 hover:text-primary transition-all text-left flex items-center gap-2 border-none"
                    >
                      <Clock className="h-4 w-4" />
                      <span>Riwayat Selesai</span>
                      <span className="ml-auto bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {orders.filter(o => o.status === "Selesai" || o.status === "Pesanan Selesai").length}
                      </span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="inventory" 
                      onClick={() => setIsSidebarOpen(false)}
                      className="w-full justify-start rounded-xl px-4 py-2.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:bg-secondary/40 hover:text-primary transition-all text-left flex items-center gap-2 border-none"
                    >
                      <Package className="h-4 w-4" />
                      <span>Inventaris Katalog</span>
                      <span className="ml-auto bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {products.length}
                      </span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="ads" 
                      onClick={() => setIsSidebarOpen(false)}
                      className="w-full justify-start rounded-xl px-4 py-2.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:bg-secondary/40 hover:text-primary transition-all text-left flex items-center gap-2 border-none"
                    >
                      <Zap className="h-4 w-4 text-amber-500 fill-amber-500/10" />
                      <span>Iklan & Premium</span>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="settings" 
                      onClick={() => setIsSidebarOpen(false)}
                      className="w-full justify-start rounded-xl px-4 py-2.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:bg-secondary/40 hover:text-primary transition-all text-left flex items-center gap-2 border-none"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Profil Toko</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Panel - Content Area */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            <TabsContent value="active" className="mt-0">
          <div className="grid gap-4">
            {orders.filter(o => o.status !== "Selesai").map((order) => (
              <Card key={order.id} className="overflow-hidden rounded-3xl border-none bg-card shadow-sm transition-all hover:shadow-md">
                <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    {order.items && order.items.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
                            📦 Multi-item Cart ({order.items.length} Barang)
                          </span>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="space-y-2 pl-2.5 border-l-2 border-primary/30 py-0.5">
                          {order.items.map((it: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              <span className="font-bold text-primary">{it.quantity}x</span> {it.name}
                              {it.note && it.note.trim() && (
                                <div className="text-[11px] text-muted-foreground font-semibold italic mt-1 bg-secondary/35 p-1.5 rounded-lg border border-dashed max-w-md">
                                  Custom: &ldquo;{it.note}&rdquo;
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading text-lg font-bold">{order.productName} <span className="text-xs text-muted-foreground">({order.quantity || 1}x)</span></h4>
                          <StatusBadge status={order.status} />
                        </div>
                        {order.sellerNote && order.sellerNote.trim() && (
                          <div className="text-[11px] text-muted-foreground font-semibold italic mt-1 bg-secondary/35 p-1.5 rounded-lg border border-dashed max-w-md">
                            Custom: &ldquo;{order.sellerNote}&rdquo;
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-xs font-black text-primary bg-primary/5 border border-primary/15 px-3 py-1.5 rounded-xl inline-block">
                      Tagihan: Rp {(order.totalPrice || order.price || 0).toLocaleString("id-ID")}
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1">
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" /> Pelanggan: <span className="font-bold text-foreground">{order.customerName}</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-primary">
                        <Clock className="h-3.5 w-3.5" /> Pickup: {order.pickupTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Smartphone className="h-3.5 w-3.5" /> WA: {order.customerPhone || "Kontak via Beli Langsung / WA"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {order.customerPhone && (
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => {
                          const phone = order.customerPhone;
                          let cleanPhone = phone.replace(/[^0-9]/g, "");
                          if (cleanPhone.startsWith("0")) {
                            cleanPhone = "62" + cleanPhone.slice(1);
                          }
                          const itemsString = order.items && order.items.length > 0 
                            ? order.items.map((it: any) => `- ${it.quantity}x ${it.name}`).join("\n") 
                            : `- 1x ${order.productName || "Buket Bunga"}`;
                          const textMessage = `Halo ${order.customerName},\nKami dari florist *${order.storeName || "Mitra TitikKembang"}* ingin mengonfirmasi pesanan Anda:\n\n${itemsString}\n💰 Total: Rp ${(order.totalPrice || order.price || 0).toLocaleString("id-ID")}\n📅 Jadwal Pickup: *${order.pickupTime}*\n\nStatus saat ini: *${order.status}*.\nMohon infokan jika ada kustomisasi tambahan ya Kak! Terima kasih 😊`;
                          window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMessage)}`, "_blank");
                        }}
                        className="rounded-full h-10 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer bg-white"
                        title="Hubungi pelanggan via WhatsApp dengan pesan template pemesanan"
                      >
                        <Smartphone className="h-4 w-4 text-green-500 fill-green-500/10" /> Chat WA
                      </Button>
                    )}
                    {order.status === "Pesanan Diterima" && (
                      <Button onClick={() => handleUpdateStatus(order.id, "Sedang Dibuat")} className="rounded-full h-10 text-xs font-bold">
                        Mulai Buat <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                    {order.status === "Sedang Dibuat" && (
                      <Button className="bg-green-600 hover:bg-green-700 rounded-full h-10 text-xs font-bold" onClick={() => handleUpdateStatus(order.id, "Siap Diambil")}>
                        Siap Diambil <CheckCircle className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                    {order.status === "Siap Diambil" && (
                      <Button variant="outline" className="border-green-600 text-green-600 rounded-full h-10 text-xs font-bold" onClick={() => handleUpdateStatus(order.id, "Selesai")}>
                        Konfirmasi Selesai
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
                <div className="bg-slate-50/70 border-t border-muted/30 px-6 py-4">
                  <TrackingStepper status={order.status} />
                </div>
              </Card>
            ))}
            {orders.filter(o => o.status !== "Selesai").length === 0 && (
              <div className="py-12 text-center text-muted-foreground bg-secondary/20 rounded-3xl">
                Tidak ada pesanan aktif saat ini.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="grid gap-4">
            {orders.filter(o => o.status === "Selesai").map((order) => (
              <Card key={order.id} className="opacity-75 overflow-hidden rounded-3xl border border-muted/50 bg-card/65 shadow-xs">
                <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    {order.items && order.items.length > 0 ? (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Multi-item Cart Selesai • {order.items.length} Bunga</p>
                        <div className="space-y-1 pl-2 border-l-2">
                          {order.items.map((it: any, idx: number) => (
                            <div key={idx} className="text-xs font-medium">
                              {it.quantity}x {it.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{order.productName} ({order.quantity || 1}x)</h4>
                      </div>
                    )}
                    <span className="text-[10px] text-muted-foreground block font-bold">
                      Selesai pick-up pada jadwal: {order.pickupTime} • Pembeli: {order.customerName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.customerPhone && (
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => {
                          const phone = order.customerPhone;
                          let cleanPhone = phone.replace(/[^0-9]/g, "");
                          if (cleanPhone.startsWith("0")) {
                            cleanPhone = "62" + cleanPhone.slice(1);
                          }
                          const textMessage = `Halo Kak ${order.customerName},\nTerima kasih banyak telah memesan bouquet di toko kami *${order.storeName || "Mitra TitikKembang"}*!\n\nSemoga baki kawat bulu kreasi kami menyenangkan hati Kakak. Jika berkenan, mohon berikan ulasan ya Kak. Kami tunggu pesanan berikutnya! 😊💐`;
                          window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMessage)}`, "_blank");
                        }}
                        className="rounded-full h-8 text-green-600 hover:bg-green-50 hover:text-green-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        title="Kirim ucapan terima kasih via WhatsApp"
                      >
                        <Smartphone className="h-3.5 w-3.5 text-green-500 fill-green-500/10" /> Say Thanks
                      </Button>
                    )}
                    <Badge variant="outline" className="text-green-650 bg-green-50 border-green-200/50 rounded-full font-bold px-3 py-1 self-start md:self-auto uppercase tracking-wide text-[10px]">
                      Selesai
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {orders.filter(o => o.status === "Selesai").length === 0 && (
              <div className="py-12 text-center text-muted-foreground bg-secondary/20 rounded-3xl">
                Belum ada riwayat pesanan.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden rounded-3xl border-none bg-card shadow-sm flex flex-col justify-between">
                <div>
                  <div className="aspect-square relative group">
                    <img src={product?.images?.[0] || ""} alt="" className="h-full w-full object-cover" />
                    <Badge className="absolute top-3 right-3 bg-primary/95 text-primary-foreground font-semibold">
                      {product.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold truncate text-base">{product.name}</h4>
                      <Badge variant="secondary" className="shrink-0 text-xs">Stok: {product.inventory}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                      {product.description}
                    </p>
                    <p className="mt-2 text-sm text-primary font-bold">
                      Rp {product.price.toLocaleString("id-ID")}
                    </p>
                  </CardContent>
                </div>
                <div className="p-4 pt-0 flex gap-2 border-t mt-auto pt-4 border-muted/50">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 rounded-full text-xs h-9 font-medium"
                    onClick={() => {
                      setProductToEdit(product);
                      setIsUploadOpen(true);
                    }}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 rounded-full text-xs h-9 font-medium hover:bg-red-50 hover:text-red-750 text-muted-foreground"
                    onClick={() => setProductToDelete(product)}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Hapus
                  </Button>
                </div>
              </Card>
            ))}
            {products.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground bg-secondary/20 rounded-3xl">
                Belum ada produk di katalog Anda.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ads" className="mt-6 space-y-6">
          {checkoutStep === "idle" && (
            <div className="space-y-6">
              {/* Cover Banner Dashboard Promosi */}
              <div className="p-6 md:p-8 bg-gradient-to-br from-amber-500/10 via-pink-550/5 to-transparent rounded-3xl border border-amber-500/20 relative overflow-hidden">
                <div className="absolute right-0 top-0 h-48 w-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="space-y-2 relative z-10 max-w-2xl">
                  <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border-none">
                    ⭐ TitikKembang Premium Ads
                  </Badge>
                  <h3 className="text-xl md:text-2xl font-black font-heading text-foreground tracking-tight">
                    Dashboard Promosi Berbayar TitikKembang
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Kelola dan tingkatkan jangkauan kriya bunga terestetik Anda. Jual lebih banyak dengan mengaktifkan paket booster berbayar premium. Toko Anda dapat mengaktifkan beberapa paket promosi sekaligus!
                  </p>
                </div>
              </div>

              {/* Status Pemantauan Booster Aktif */}
              {(() => {
                const activeSlideAds = (storeInfo?.activeAds || []).filter((ad: any) => ad.type === "slide_feeds" && ad.status === "active");
                const hasSlide = activeSlideAds.length > 0 || !!storeInfo?.isFeatured;
                
                const activeMainAds = (storeInfo?.activeAds || []).filter((ad: any) => ad.type === "main_feeds" && ad.status === "active");
                const hasMain = activeMainAds.length > 0 || !!storeInfo?.isBoosted;

                if (!hasSlide && !hasMain) return null;

                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-black uppercase tracking-wider text-foreground">
                      Status Kampanye Aktif Toko Anda
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      {hasSlide && (
                        <Card className="rounded-3xl border border-amber-400 bg-amber-50/5 overflow-hidden p-6 relative transition-all">
                          <div className="absolute -right-12 -top-12 h-24 w-24 bg-amber-500/10 rounded-full blur-xl animate-pulse" />
                          <div className="flex justify-between items-start">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700">Slide Feeds Campaign</span>
                              </div>
                              <h4 className="text-lg font-bold text-foreground">Sponsor Slide Feeds</h4>
                            </div>
                            <Badge className="bg-green-100 hover:bg-green-100 text-green-700 border-none font-bold rounded-lg text-[10px] px-2.5 py-0.5">
                              AKTIF ({activeSlideAds.length || 1} Paket)
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                            Katalog kriya bunga toko Anda akan ditampilkan bergiliran di slider promosi / mitra sponsor partner teratas pada halaman depan pembeli.
                          </p>
                          <div className="mt-4 pt-4 border-t border-muted/50 space-y-2">
                            <div className="text-[10px] text-muted-foreground space-y-1 font-semibold">
                              <p>🟢 Status: <span className="text-green-600 font-extrabold">Aktif Berputar</span></p>
                              <p>📅 Mulai: <span className="text-foreground">{activeSlideAds[activeSlideAds.length-1]?.subscribedAt || "Hari ini"}</span></p>
                              <p>⏳ Berakhir: <span className="text-primary font-bold">{activeSlideAds[activeSlideAds.length-1]?.expiresAt || "30 Hari mendatang"}</span></p>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelAdSubscription(activeSlideAds[activeSlideAds.length-1]?.id || "legacy-slide")}
                              className="w-full rounded-full text-[10px] font-bold h-8 mt-2 text-white"
                            >
                              Hentikan Kampanye Slide Feeds
                            </Button>
                          </div>
                        </Card>
                      )}

                      {hasMain && (
                        <Card className="rounded-3xl border border-sky-400 bg-sky-50/5 overflow-hidden p-6 relative transition-all">
                          <div className="absolute -right-12 -top-12 h-24 w-24 bg-sky-500/10 rounded-full blur-xl animate-pulse" />
                          <div className="flex justify-between items-start">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-700">Main Feeds Booster</span>
                              </div>
                              <h4 className="text-lg font-bold text-foreground">Sponsor Main Feeds</h4>
                            </div>
                            <Badge className="bg-sky-100 hover:bg-sky-100 text-sky-700 border-none font-bold rounded-lg text-[10px] px-2.5 py-0.5">
                              AKTIF ({activeMainAds.length || 1} Paket)
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                            Katalog produk/kriya kreasi Anda akan dimunculkan paling teratas (baris pertama) di antara seluruh florist lain pada feed katalog utama pembeli.
                          </p>
                          <div className="mt-4 pt-4 border-t border-muted/50 space-y-2">
                            <div className="text-[10px] text-muted-foreground space-y-1 font-semibold">
                              <p>🟢 Status: <span className="text-sky-600 font-extrabold">Sponsor Teratas Utama</span></p>
                              <p>📅 Mulai: <span className="text-foreground">{activeMainAds[activeMainAds.length-1]?.subscribedAt || "Hari ini"}</span></p>
                              <p>⏳ Berakhir: <span className="text-primary font-bold">{activeMainAds[activeMainAds.length-1]?.expiresAt || "30 Hari mendatang"}</span></p>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelAdSubscription(activeMainAds[activeMainAds.length-1]?.id || "legacy-main")}
                              className="w-full rounded-full text-[10px] font-bold h-8 mt-2 text-white"
                            >
                              Hentikan Kampanye Main Feeds
                            </Button>
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Status Pengajuan Promosi (QRIS) */}
              {pendingPayments.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-base font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                    Status Pengajuan Promosi (QRIS)
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {pendingPayments.map((payment) => (
                      <Card key={payment.id} className={`rounded-3xl border overflow-hidden p-5 space-y-3 relative ${
                        payment.status === "rejected" 
                          ? "border-red-300 bg-red-500/5" 
                          : payment.status === "approved"
                            ? "border-green-300 bg-green-500/5"
                            : "border-amber-300 bg-amber-500/5"
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                              payment.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : payment.status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}>
                              {payment.status === "rejected" 
                                ? "Ditolak Admin" 
                                : payment.status === "approved" 
                                  ? "Disetujui Admin" 
                                  : "Menunggu Verifikasi Admin"}
                            </span>
                            <h4 className="text-sm font-black text-foreground mt-2">{payment.packageName}</h4>
                          </div>
                          <span className="text-sm font-extrabold text-neutral-850">
                            Rp {payment.price?.toLocaleString("id-ID")}
                          </span>
                        </div>
                        
                        <div className="text-[11px] text-muted-foreground space-y-1 bg-background/50 p-3 rounded-2xl border">
                          <p>📅 Diajukan: <span className="text-foreground">{payment.createdAt ? new Date(payment.createdAt.seconds * 1000).toLocaleString("id-ID") : "Baru saja"}</span></p>
                          <p>⏳ Durasi Paket: <span className="text-foreground font-semibold">{payment.duration}</span></p>
                          <p>🔗 Target: <span className="text-foreground font-semibold uppercase">{payment.adType}</span></p>
                          {payment.status === "rejected" && (
                            <p className="text-red-650 font-bold mt-1">❌ Alasan Penolakan: {payment.rejectReason || "-"}</p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Paket Pembelian Baru */}
              <div className="space-y-4">
                <h3 className="text-base font-black uppercase tracking-wider text-foreground">
                  Pilihan Paket Promosi Berbayar TitikKembang
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {adPackages.map((pkg) => (
                    <Card key={pkg.id} className="rounded-3xl border border-muted bg-card overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-primary/20 transition-all duration-300">
                      <div className="p-6 space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-primary font-bold uppercase tracking-wider bg-primary/5 px-2.5 py-0.5 rounded-full inline-block">Masa Aktif: {pkg.duration}</span>
                          <h4 className="text-lg font-black text-foreground">{pkg.name}</h4>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-rose-650 font-heading">Rp {(pkg.price || 0).toLocaleString("id-ID")}</span>
                          <span className="text-xs text-muted-foreground">/ siklus</span>
                        </div>
                        {pkg.description && (
                          <p className="text-xs text-muted-foreground italic leading-relaxed">"{pkg.description}"</p>
                        )}
                        <ul className="space-y-2 pt-3 border-t">
                          {pkg.benefits?.map((bf: string, bIdx: number) => (
                            <li key={bIdx} className="text-xs text-muted-foreground flex items-center gap-2 font-semibold">
                              <Check className="h-4 w-4 text-green-600 shrink-0" /> {bf}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-6 bg-secondary/15 border-t">
                        <Button
                          onClick={() => {
                            const t = pkg.type || (pkg.id?.includes("slide") || pkg.name?.toLowerCase().includes("slide") ? "slide_feeds" : "main_feeds");
                            setSelectedAdPkg({ ...pkg, type: t });
                            setAdType("store");
                            setCheckoutStep("checkout");
                          }}
                          className="w-full rounded-full font-bold h-10 text-xs bg-primary text-primary-foreground hover:bg-primary/95"
                        >
                          Beli / Aktifkan {pkg.name}
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {adPackages.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground bg-secondary/10 border border-dashed rounded-3xl p-8">
                      <p className="font-bold text-foreground mb-1">Saat Ini Belum Ada Paket Promosi Berbayar</p>
                      <p className="text-xs text-muted-foreground">Hubungi admin untuk mendaftarkan dan mengaktifkan paket iklan baru.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Riwayat Pembelian & Multi Dashboard Table */}
              <div className="space-y-4">
                <h3 className="text-base font-black uppercase tracking-wider text-foreground">
                  Riwayat Pembelian Paket Booster ({storeInfo?.activeAds?.length || 0})
                </h3>
                <Card className="rounded-3xl border overflow-hidden bg-card">
                  {!storeInfo?.activeAds || storeInfo.activeAds.length === 0 ? (
                    <div className="p-10 text-center text-muted-foreground space-y-1">
                      <p className="text-sm font-bold">Belum Ada Paket Booster Terdaftar</p>
                      <p className="text-xs">Silakan berlangganan salah satu paket booster di atas untuk memulai promosi berbayar Anda.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-secondary/40 border-b text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                            <th className="p-4">Paket Booster</th>
                            <th className="p-4">Tipe Kampanye</th>
                            <th className="p-4">Pembayaran</th>
                            <th className="p-4">Aktif Mulai</th>
                            <th className="p-4">Berakhir Pada</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y font-semibold">
                          {storeInfo.activeAds.map((ad: any) => (
                            <tr key={ad.id} className="hover:bg-secondary/10">
                              <td className="p-4 font-bold text-foreground">{ad.name}</td>
                              <td className="p-4">
                                <Badge className={ad.type === "slide_feeds" ? "bg-amber-100 text-amber-800 border-none rounded" : "bg-sky-100 text-sky-800 border-none rounded"}>
                                  {ad.type === "slide_feeds" ? "Slide Feeds" : "Main Feeds"}
                                </Badge>
                              </td>
                              <td className="p-4 font-bold text-rose-600">Rp {ad.price?.toLocaleString("id-ID")}</td>
                              <td className="p-4 text-muted-foreground">{ad.subscribedAt}</td>
                              <td className="p-4 text-primary font-bold">{ad.expiresAt}</td>
                              <td className="p-4">
                                <Badge className={ad.status === "active" ? "bg-green-100 text-green-700 border-none rounded" : "bg-neutral-100 text-neutral-600 border-none rounded"}>
                                  {ad.status === "active" ? "Aktif" : "Selesai"}
                                </Badge>
                              </td>
                              <td className="p-4 text-right">
                                {ad.status === "active" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCancelAdSubscription(ad.id)}
                                    className="text-red-650 hover:text-red-700 hover:bg-red-50 text-[10px] font-bold rounded-full h-7 px-2.5"
                                  >
                                    Hentikan
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* Interactive Billing Customization Sheet/View */}
          {checkoutStep === "checkout" && selectedAdPkg && (
            <Card className="rounded-3xl border-none bg-card shadow-sm overflow-hidden">
              <CardHeader className="bg-primary/5 p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold font-heading text-primary">Konfirmasi Pemesanan Iklan</h3>
                    <p className="text-xs text-muted-foreground">Tinjau paket iklan pilihan Anda dan konfirmasi detail pembayaran.</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setCheckoutStep("idle")} 
                    className="rounded-full text-xs font-bold hover:bg-neutral-100"
                  >
                    Kembali
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Package choice & Billing Type switcher */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Switcher Option: One-time vs subscription */}
                    <div className="bg-secondary/40 p-5 rounded-2xl border space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Siklus Hubungan Kontrak</Label>
                      <h4 className="text-sm font-extrabold text-foreground">Sekali Bayar (One-Time Payment)</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                        Paket kampanye booster ini bersifat sekali bayar. Promosi akan aktif selama <span className="text-primary font-bold">{selectedAdPkg.duration}</span> penuh dan mati secara otomatis sesudahnya tanpa penarikan otomatis atau tagihan berulang.
                      </p>
                    </div>

                    {/* Choose Payment Gateway */}
                    <div className="space-y-3">
                      <Label className="text-sm font-bold block text-foreground">Pilih Gerbang Pembayaran (Virtual Payment Gateway)</Label>
                      <p className="text-xs text-muted-foreground">Layanan enkripsi real-time instan O2O Bank Indonesia.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {[
                          { id: "qris", name: "QRIS GPN (Gopay/OVO/Dana/LinkAja/m-Banking)", provider: "Official QRIS cosmics.co" }
                        ].map((gw) => {
                          const isSelected = paymentMethod === gw.id;
                          return (
                            <button
                              key={gw.id}
                              type="button"
                              onClick={() => setPaymentMethod(gw.id)}
                              className={`border-2 p-3.5 rounded-2xl text-left transition-all flex items-center justify-between ${isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-muted-foreground/10 hover:bg-secondary/40"}`}
                            >
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-foreground block">{gw.name}</span>
                                <span className="text-[9px] text-muted-foreground">{gw.provider}</span>
                              </div>
                              {isSelected ? (
                                <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">✓</div>
                              ) : (
                                <div className="h-4 w-4 rounded-full border border-muted" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right: Checkout Invoice breakdown */}
                  <div className="lg:col-span-5 bg-secondary/20 rounded-3xl p-6 border flex flex-col justify-between gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Ringkasan Tagihan Iklan</h4>
                      
                      <div className="space-y-3 pt-2 text-xs font-semibold">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tipe Target</span>
                          <span className="font-extrabold text-foreground uppercase">{adType === "store" ? "Iklan Toko (General App)" : "Boost Postingan (Instagram-Style)"}</span>
                        </div>
                        {adType === "product" && (
                          <div className="flex justify-between pb-1 text-amber-600 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                            <span className="text-muted-foreground font-semibold">Postingan Di-boost</span>
                            <span className="font-bold truncate max-w-[150px]">
                              {products.find(item => item.id === selectedAdProductId)?.name || "Produk Pilihan"}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Paket Kampanye</span>
                          <span className="font-extrabold text-foreground">{selectedAdPkg.name} ({selectedAdPkg.duration})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tipe Penilaian</span>
                          <span className="font-bold text-foreground">Sekali Bayar</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Harga Asli</span>
                          <span className="font-semibold text-foreground">Rp {selectedAdPkg.price?.toLocaleString("id-ID")}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Biaya PPn Platform (0%)</span>
                          <span className="font-bold text-foreground">Rp 0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Biaya Gerbang Escrow Bank</span>
                          <span className="font-bold text-foreground">Gratis</span>
                        </div>
                        
                        <div className="border-t pt-3 flex justify-between items-baseline">
                          <span className="font-extrabold text-sm text-foreground">Total Grand Pembayaran</span>
                          <span className="text-xl font-black text-primary font-heading">
                            Rp {selectedAdPkg.price?.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleProceedToPayment}
                      className="w-full rounded-full h-11 bg-primary text-primary-foreground font-black text-xs hover:bg-primary/95 shadow-md shadow-primary/20 hover:shadow-none"
                    >
                      Konfirmasi & Bayar Rp {selectedAdPkg.price?.toLocaleString("id-ID")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Checkout simulated Payment Gateway Screen */}
          {checkoutStep === "pay_gateway" && selectedAdPkg && (
            <div className="max-w-xl mx-auto space-y-6">
              {/* Payment Gateway Header */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 relative overflow-hidden shadow-lg border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">TitikKembang Secure Checkout Gate</span>
                  </div>
                  <div className="bg-slate-800 text-[10px] px-2.5 py-1 rounded-full text-slate-300 font-mono tracking-wider">
                    ID: TRX-{Math.floor(100000 + Math.random() * 900000)}
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase">Total Transaksi</span>
                    <h3 className="text-2xl font-black text-amber-400 font-heading">
                      Rp {selectedAdPkg.price?.toLocaleString("id-ID")}
                    </h3>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-[9px] text-slate-400 block uppercase">Sisa Waktu Bayar</span>
                    <span className="text-base font-bold font-mono text-red-400 block">
                      {Math.floor(checkoutTimer / 60)}:{String(checkoutTimer % 60).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  Transaksikan dana melalui simulasi di bawah ini untuk mengizinkan sistem webhook mengonversi dan me-verifikasi pembayaran Anda otomatis.
                </p>
              </div>

              {/* Payment details */}
              <Card className="rounded-3xl border-none bg-card shadow-sm p-6 sm:p-8 space-y-6">
                <div className="space-y-4">
                  <QrisPaymentCode amount={selectedAdPkg.price} />
                  
                  <div className="pt-4 border-t border-muted">
                    <Label className="text-sm font-black text-foreground block mb-2 uppercase tracking-wide">
                      Unggah Bukti Bayar (Screenshot / Foto)
                    </Label>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      Silakan ambil tangkapan layar (screenshot) bukti pembayaran sukses dari e-wallet atau m-banking Anda, lalu unggah di bawah ini untuk proses validasi oleh Admin TitikKembang.
                    </p>
                    
                    {/* Drag & Drop File Upload Area */}
                    <div 
                      onClick={() => document.getElementById("proof-file-input")?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                        proofImage 
                          ? "border-green-400 bg-green-500/5" 
                          : "border-muted-foreground/20 hover:border-primary/50 hover:bg-secondary/25"
                      }`}
                    >
                      <input 
                        id="proof-file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProofFileChange}
                      />
                      
                      {proofImage ? (
                        <div className="space-y-3 flex flex-col items-center">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Check className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground max-w-xs truncate">
                              {proofImageName || "bukti_pembayaran.jpg"}
                            </p>
                            <p className="text-[10px] text-green-600 font-bold mt-1">Bukti bayar siap dikirimkan!</p>
                          </div>
                          <img 
                            src={proofImage} 
                            alt="Pratinjau Bukti Bayar" 
                            className="h-32 object-contain rounded-lg border shadow-xs bg-white"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProofImage("");
                              setProofImageName("");
                            }}
                            className="rounded-full text-xs font-bold h-8 text-red-650 border-red-100 hover:bg-red-50"
                          >
                            Ganti Gambar
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2 flex flex-col items-center py-4">
                          <Upload className="h-8 w-8 text-muted-foreground animate-bounce" />
                          <p className="text-xs font-bold text-foreground">
                            Seret & letakkan atau <span className="text-primary hover:underline">pilih file gambar</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground">Mendukung JPEG, PNG, WEBP (Maks 2MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gateway trigger buttons */}
                <div className="pt-4 border-t flex flex-col sm:flex-row items-center gap-3">
                  <Button 
                    onClick={handleSubmitProofOfPayment}
                    disabled={!proofImage || isSubmittingProof}
                    className="w-full sm:flex-1 rounded-full h-11 bg-primary text-primary-foreground font-black text-xs hover:bg-primary/95 shadow-md shadow-primary/20"
                  >
                    {isSubmittingProof ? (
                      <>Sedang Mengirim Bukti...</>
                    ) : (
                      <>Kirim Bukti Bayar & Tunggu Verifikasi Admin 🚀</>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setCheckoutStep("idle");
                      setProofImage("");
                      setProofImageName("");
                    }}
                    className="w-full sm:w-auto rounded-full h-11 px-6 border-muted-foreground/20 text-xs font-bold leading-none shrink-0"
                  >
                    Batal
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Gateway Processing Payment screen */}
          {checkoutStep === "processing" && (
            <Card className="rounded-3xl border-none bg-card shadow-sm p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <div className="space-y-1 pt-1">
                <h4 className="text-base font-bold font-heading text-foreground">Sedang Memproses Settlement...</h4>
                <p className="text-xs text-muted-foreground">Komunikasi dua arah dengan server escrow perbankan dan API webhook. Mohon tunggu beberapa detik...</p>
              </div>
            </Card>
          )}

          {/* Checkout Success screen */}
          {checkoutStep === "success" && selectedAdPkg && (
            <Card className="rounded-3xl border-none bg-card shadow-lg p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto space-y-6 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 h-32 w-32 bg-green-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 h-32 w-32 bg-primary/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="h-16 w-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-3xl shadow-sm relative z-10 animate-bounce">
                ✓
              </div>

              <div className="space-y-2 relative z-10">
                <h4 className="text-2xl font-black font-heading text-neutral-850">
                  {paymentMethod === "qris" ? "Bukti Bayar Berhasil Dikirim! 🚀" : "Pembayaran Berhasil Diverifikasi! 🚀"}
                </h4>
                <p className="text-xs text-muted-foreground font-semibold max-w-sm mx-auto">
                  {paymentMethod === "qris" 
                    ? "Bukti pembayaran QRIS Anda sedang diverifikasi oleh Admin. Iklan Anda akan aktif setelah disetujui."
                    : `Kampanye iklan untuk ${selectedAdPkg.name} berhasil di-deploy ke sistem live pembeli kriya bunga TitikKembang.`
                  }
                </p>
              </div>

              {/* Transaction Recap ticket */}
              <div className="bg-secondary/30 p-5 rounded-2xl border w-full text-left text-xs space-y-3 font-semibold text-muted-foreground relative z-10">
                <div className="flex justify-between">
                  <span>Nama Paket Iklan</span>
                  <span className="font-bold text-foreground">{selectedAdPkg.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Kampanye</span>
                  <span className="font-bold text-foreground lowercase">
                    {adType === "store" ? "Iklan Toko Utama" : `Boost Postingan "${products.find(item => item.id === selectedAdProductId)?.name}"`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Siklus Pembayaran</span>
                  <span className="font-bold text-foreground capitalize">Sekali Bayar</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal Kadaluarsa Promosi</span>
                  <span className="font-black text-primary">{getExpiryDate(selectedAdPkg.duration)}</span>
                </div>
                <div className="flex justify-between border-t pt-2.5">
                  <span className="font-bold text-foreground">Status Kampanye</span>
                  <span className={paymentMethod === "qris" ? "text-amber-600 font-extrabold flex items-center gap-1" : "text-green-600 font-extrabold flex items-center gap-1"}>
                    {paymentMethod === "qris" ? "⏳ MENUNGGU VERIFIKASI ADMIN" : "🟢 AKTIF BERJALAN"}
                  </span>
                </div>
              </div>

              <Button 
                onClick={() => {
                  setCheckoutStep("idle");
                  setSelectedAdPkg(null);
                }}
                className="rounded-full w-full h-11 bg-primary text-primary-foreground font-black text-xs relative z-10"
              >
                Kembali ke Dashboard Mitra
              </Button>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Settings Forms */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleUpdateStore} className="space-y-6">
                
                {/* 1. Basic Info Card */}
                <Card className="rounded-3xl border-none bg-card shadow-sm">
                  <CardHeader className="bg-primary/5 pb-4">
                    <CardTitle className="text-lg font-heading text-primary font-bold flex items-center gap-2">
                      <StoreIcon className="h-5 w-5" /> Informasi Dasar & Alamat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    {/* Basic info form fields */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="storeName">Nama Toko</Label>
                        <Input 
                          id="storeName" 
                          value={storeInfo?.name || ""} 
                          onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })}
                          placeholder="Contoh: Amaryllis Florist"
                          required
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownerName">Nama Pemilik</Label>
                        <Input 
                          id="ownerName" 
                          value={storeInfo?.owner || ""} 
                          onChange={(e) => setStoreInfo({ ...storeInfo, owner: e.target.value })}
                          required
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Deskripsi Toko</Label>
                      <Textarea 
                        id="description" 
                        value={storeInfo?.description || ""} 
                        onChange={(e) => setStoreInfo({ ...storeInfo, description: e.target.value })}
                        placeholder="Ceritakan tentang keunikan toko bunga Anda..."
                        rows={4}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">No. WhatsApp / HP</Label>
                        <Input 
                          id="phone" 
                          value={storeInfo?.phone || ""} 
                          onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                          placeholder="0812..."
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hours">Jam Operasional</Label>
                        <Input 
                          id="hours" 
                          value={storeInfo?.operatingHours || ""} 
                          onChange={(e) => setStoreInfo({ ...storeInfo, operatingHours: e.target.value })}
                          placeholder="Contoh: 08:00 - 20:00"
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Alamat Pickup</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="address" 
                          className="pl-9 rounded-xl"
                          value={storeInfo?.location?.address || ""} 
                          onChange={(e) => setStoreInfo({ 
                            ...storeInfo, 
                            location: { ...storeInfo.location, address: e.target.value } 
                          })}
                          placeholder="Masukkan alamat lengkap..."
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gmapLink" className="flex items-center gap-1.5 text-foreground font-semibold">
                        <span>Link Google Maps Toko 📍</span>
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="gmapLink" 
                        type="url"
                        placeholder="Contoh: https://maps.app.goo.gl/... atau https://google.com/maps/place/..."
                        className="rounded-xl text-xs sm:text-sm"
                        value={storeInfo?.location?.gmapLink || ""} 
                        onChange={(e) => {
                          const val = e.target.value;
                          const parsed = parseGMapLink(val);
                          if (parsed) {
                            setStoreInfo({
                              ...storeInfo,
                              location: {
                                ...storeInfo.location,
                                gmapLink: val,
                                lat: parsed.lat,
                                lng: parsed.lng
                              }
                            });
                          } else {
                            // Keep previous coordinates as fallback but update the custom URL link
                            const defaultLat = storeInfo?.location?.lat || -6.2088;
                            const defaultLng = storeInfo?.location?.lng || 106.8456;
                            setStoreInfo({
                              ...storeInfo,
                              location: {
                                ...storeInfo.location,
                                gmapLink: val,
                                lat: defaultLat,
                                lng: defaultLng
                              }
                            });
                          }
                        }}
                        required
                      />
                      <p className="text-[10px] text-muted-foreground leading-normal font-semibold">
                        Tempel link Google Maps hasil "Bagikan/Share" lokasi toko Anda. Sistem otomatis mendeteksi koordinat titik agar pembeli mudah pickup kriya Anda.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Aesthetics and Styling Profile Card */}
                <Card className="rounded-3xl border-none bg-card shadow-sm overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-4">
                    <CardTitle className="text-lg font-heading text-primary font-bold flex items-center gap-2">
                      <Palette className="h-5 w-5" /> Estetika Branding & Desain Profil
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    
                    {/* Choose Preset banner wrapper */}
                    <div className="space-y-3">
                      <Label className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                        <ImageIcon className="h-4 w-4 text-primary" /> Pilihan Gambar Banner Latar Belakang (Header)
                      </Label>
                      <p className="text-xs text-muted-foreground">Pilih salah satu banner floristry estetika yang dikurasi, atau ketik alamat URL kustom Anda di bawah.</p>
                      
                      {/* Presets Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
                        {PRESET_BANNERS.map((banner) => {
                          const isSelected = storeInfo?.bannerUrl === banner.url;
                          return (
                            <button
                              key={banner.id}
                              type="button"
                              className={`group relative h-16 rounded-xl overflow-hidden border-2 text-left transition-all ${isSelected ? "border-primary ring-2 ring-primary/20 scale-95" : "border-transparent opacity-80 hover:opacity-100"}`}
                              onClick={() => setStoreInfo({ ...storeInfo, bannerUrl: banner.url })}
                            >
                              <img src={banner.url} alt={banner.name} className="h-full w-full object-cover" />
                              <div className="absolute inset-0 bg-black/45 flex items-center justify-center p-1 text-center">
                                <span className="text-[10px] text-white font-bold leading-tight line-clamp-2">{banner.name}</span>
                              </div>
                              {isSelected && (
                                <div className="absolute top-1 right-1 h-4 w-4 bg-primary text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                                  <Check className="h-2 w-2 stroke-[3px]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom banner File Upload input */}
                      <div className="pt-2">
                        <div className="flex items-center gap-3">
                          <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-primary/20 hover:border-primary/50 rounded-2xl p-4 bg-muted/40 cursor-pointer transition-colors group">
                            <span className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform mb-1.5">
                              <ImageIcon className="h-4 w-4" />
                            </span>
                            <span className="text-[11px] font-bold text-foreground">Upload Gambar dari Galeri HP/Laptop</span>
                            <span className="text-[9px] text-muted-foreground mt-0.5">Format JPG, PNG, WEBP (Otomatis Dikompresi)</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const toastId = toast.loading("Mengompresi & meload foto banner pilihan... 🎨");
                                  try {
                                    const base64 = await compressAndResizeImage(file, 1200, 400); // banners can be wider
                                    setStoreInfo({ ...storeInfo, bannerUrl: base64 });
                                    toast.success("Foto banner latar belakang berhasil dimuat dengan kompresi! ⚡", { id: toastId });
                                  } catch (err: any) {
                                    toast.error("Gagal mengompresi banner: " + err.message, { id: toastId });
                                  }
                                }
                              }}
                            />
                          </label>
                          {storeInfo?.bannerUrl && (
                            <div className="relative h-20 w-32 rounded-xl overflow-hidden border bg-background group shrink-0 shadow-xs">
                              <img src={storeInfo.bannerUrl} alt="Preview Banner" className="h-full w-full object-cover" />
                              <button
                                type="button"
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-bold"
                                onClick={() => setStoreInfo({ ...storeInfo, bannerUrl: "" })}
                              >
                                Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Logo/Avatar option preset */}
                    <div className="space-y-3 border-t pt-4">
                      <Label className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                        <Smile className="h-4 w-4 text-primary" /> Profil Logo / Foto Bulat
                      </Label>
                      <p className="text-xs text-muted-foreground">Pilih foto preset floristry kami, pilih ikon prangko emoji, atau gunakan URL gambar kustom.</p>
                      
                      {/* Logo Presets Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                        {PRESET_LOGOS.map((logo) => {
                          const isSelected = storeInfo?.avatarUrl === logo.url;
                          return (
                            <button
                              key={logo.id}
                              type="button"
                              className={`group relative h-14 rounded-xl overflow-hidden border-2 text-left transition-all ${isSelected ? "border-primary ring-2 ring-primary/20 scale-95" : "border-transparent opacity-80 hover:opacity-100"}`}
                              onClick={() => setStoreInfo({ ...storeInfo, avatarUrl: logo.url, avatarLogo: "" })}
                            >
                              <img src={logo.url} alt={logo.name} className="h-full w-full object-cover" />
                              {isSelected && (
                                <div className="absolute top-1 right-1 h-4 w-4 bg-primary text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                                  <Check className="h-2 w-2 stroke-[3px]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Or Emojis */}
                      <div className="pt-2 space-y-1.5">
                        <span className="text-[11px] text-muted-foreground font-black block">Atau Pilih Stamp Emoji Kreatif:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {EMOJI_OPTIONS.map((emoji) => {
                            const isSelected = storeInfo?.avatarLogo === emoji && !storeInfo?.avatarUrl;
                            return (
                              <button
                                key={emoji}
                                type="button"
                                className={`h-8 w-8 rounded-lg text-lg flex items-center justify-center transition-all ${isSelected ? "bg-primary text-white scale-110 shadow-sm" : "bg-secondary hover:bg-secondary/80"}`}
                                onClick={() => setStoreInfo({ ...storeInfo, avatarLogo: emoji, avatarUrl: "" })}
                              >
                                {emoji}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom logo image File Upload input */}
                      <div className="pt-2">
                        <div className="flex items-center gap-3">
                          <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-primary/20 hover:border-primary/50 rounded-2xl p-4 bg-muted/40 cursor-pointer transition-colors group">
                            <span className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform mb-1.5">
                              <Smile className="h-4 w-4" />
                            </span>
                            <span className="text-[11px] font-bold text-foreground">Upload Foto dari Galeri HP/Laptop</span>
                            <span className="text-[9px] text-muted-foreground mt-0.5">Format JPG, PNG, WEBP (Otomatis Dikompresi)</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const toastId = toast.loading("Mengompresi & meload foto logo bulat... 🌸");
                                  try {
                                    const base64 = await compressAndResizeImage(file, 400, 400); // circular logo doesn't need to be huge
                                    setStoreInfo({ ...storeInfo, avatarUrl: base64, avatarLogo: "" });
                                    toast.success("Foto logo bulat berhasil dimuat dengan kompresi! ⚡", { id: toastId });
                                  } catch (err: any) {
                                    toast.error("Gagal mengompresi logo bulat: " + err.message, { id: toastId });
                                  }
                                }
                              }}
                            />
                          </label>
                          {storeInfo?.avatarUrl && (
                            <div className="relative h-16 w-16 rounded-2xl overflow-hidden border bg-background group shrink-0 shadow-xs">
                              <img src={storeInfo.avatarUrl} alt="Preview Avatar" className="h-full w-full object-cover" />
                              <button
                                type="button"
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-bold"
                                onClick={() => setStoreInfo({ ...storeInfo, avatarUrl: "" })}
                              >
                                Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Gradient color overlay preset */}
                    <div className="space-y-3 border-t pt-4">
                      <Label className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                        <Palette className="h-4 w-4 text-primary" /> Palet Gradasi Cover Banner
                      </Label>
                      <p className="text-xs text-muted-foreground">Pilih gradasi warna yang merepresentasikan gaya atau identitas florist Anda.</p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {GRADIENT_PRESETS.map((grad) => {
                          const isSelected = (storeInfo?.profileGradient || "elegant-classic") === grad.id;
                          return (
                            <button
                              key={grad.id}
                              type="button"
                              className={`relative h-10 rounded-xl bg-gradient-to-r ${grad.from} ${grad.to} border-2 flex items-center justify-center px-2 shadow-xs transition-all ${isSelected ? "border-foreground ring-1 ring-offset-1 scale-95" : "border-transparent opacity-85 hover:opacity-100"}`}
                              onClick={() => setStoreInfo({ ...storeInfo, profileGradient: grad.id })}
                            >
                              <span className="text-[10px] text-white font-extrabold tracking-tight truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                                {grad.name}
                              </span>
                              {isSelected && (
                                <div className="absolute -top-1 -right-1 h-4 w-4 bg-foreground text-background rounded-full flex items-center justify-center text-[8px] font-bold">
                                  <Check className="h-2 w-2 stroke-[3px]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Background contour theme */}
                    <div className="space-y-3 border-t pt-4">
                      <Label className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                        <Sparkles className="h-4 w-4 text-primary" /> Pola & Tema Latar Belakang Profil Pembeli
                      </Label>
                      <p className="text-xs text-muted-foreground">Atur material dan nuansa panel profil Anda yang akan dilihat pembeli ketika membuka nama toko Anda.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {PATTERN_PRESETS.map((pat) => {
                          const isSelected = (storeInfo?.profilePattern || "plain") === pat.id;
                          return (
                            <button
                              key={pat.id}
                              type="button"
                              className={`border-2 p-3 rounded-2xl text-left transition-all flex flex-col justify-between ${isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-muted-foreground/15 hover:bg-secondary/40"}`}
                              onClick={() => setStoreInfo({ ...storeInfo, profilePattern: pat.id })}
                            >
                              <span className="text-[11px] font-extrabold text-foreground flex items-center gap-1">
                                {pat.name} {isSelected && <Badge variant="outline" className="text-[8px] h-4 py-0 shrink-0 bg-primary/10 text-primary border-primary/20 font-bold uppercase">Dipilih</Badge>}
                              </span>
                              <span className="text-[9px] text-muted-foreground font-semibold mt-1">{pat.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </CardContent>
                </Card>

                {/* Actions bottom */}
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSaving} className="rounded-full px-8 shadow-md">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan Seluruh Perubahan
                  </Button>
                </div>

              </form>
            </div>

            {/* Right: Live Interactive Mockup Profile (Sticky & extremely satisfying) */}
            <div className="lg:col-span-5 sticky top-6 space-y-4">
              <div className="border border-pink-100 bg-pink-50/15 p-3 rounded-2xl flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-pink-500 animate-pulse" />
                <span className="text-[11px] text-pink-900 font-bold">PREVIEW PROFIL LIVE (Tampilan Pelanggan Anda)</span>
              </div>

              {/* Styled Mockup matching Buyer StoreModal */}
              <div className={`border rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 w-full flex flex-col
                ${storeInfo?.profilePattern === "pattern-dark" ? "bg-neutral-950 border-neutral-800 text-neutral-100" : ""}
                ${storeInfo?.profilePattern === "pattern-soft" ? "bg-rose-50/25 border-rose-100 text-foreground" : ""}
                ${storeInfo?.profilePattern === "pattern-warm" ? "bg-amber-50/20 border-amber-200/50 text-foreground" : ""}
                ${!storeInfo?.profilePattern || storeInfo?.profilePattern === "plain" ? "bg-background border-muted/50 text-foreground" : ""}
              `}>
                
                {/* Header Banner Mockup */}
                <div className={`relative h-36 bg-gradient-to-r flex items-end p-4 ${storeInfo?.profileGradient === "transparent" && !storeInfo?.bannerUrl ? "text-foreground" : "text-white"} overflow-hidden transition-all duration-300
                  ${storeInfo?.profileGradient === "romantic-rose" ? "from-rose-500 to-pink-600" : ""}
                  ${storeInfo?.profileGradient === "lavender-dream" ? "from-purple-600 to-indigo-500" : ""}
                  ${storeInfo?.profileGradient === "sunset-glow" ? "from-amber-500 to-rose-500" : ""}
                  ${storeInfo?.profileGradient === "emerald-fresh" ? "from-emerald-600 to-teal-500" : ""}
                  ${storeInfo?.profileGradient === "royal-velvet" ? "from-indigo-950 to-purple-900" : ""}
                  ${storeInfo?.profileGradient === "sweet-cotton" ? "from-pink-300 to-rose-300" : ""}
                  ${storeInfo?.profileGradient === "transparent" ? "from-transparent to-transparent bg-secondary/15 dark:bg-zinc-900/40 border-b border-muted/25" : ""}
                  ${!storeInfo?.profileGradient || storeInfo?.profileGradient === "elegant-classic" ? "from-primary/80 to-pink-500/85" : ""}
                `}>
                  {storeInfo?.bannerUrl && (
                    <img 
                      src={storeInfo.bannerUrl} 
                      alt="banner" 
                      className={`absolute inset-0 h-full w-full object-cover transition-all duration-300 ${storeInfo?.profileGradient === "transparent" ? "opacity-100" : "opacity-60 mix-blend-overlay"}`} 
                    />
                  )}
                  
                  <div className="relative z-10 flex gap-3.5 items-center w-full">
                    {/* Circle Logo */}
                    <div className="h-14 w-14 rounded-xl bg-background border border-primary/20 flex items-center justify-center font-bold text-2xl shadow-md select-none shrink-0 overflow-hidden text-primary">
                      {storeInfo?.avatarUrl ? (
                        <img src={storeInfo.avatarUrl} alt="logo" className="h-full w-full object-cover" />
                      ) : (
                        <span>{storeInfo?.avatarLogo || storeInfo?.name?.charAt(0) || "🌸"}</span>
                      )}
                    </div>

                    <div className="min-w-0 pr-3 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.6)]">
                      <div className="flex items-center gap-1 flex-wrap">
                        <h3 className="font-heading text-base font-extrabold max-w-[150px] truncate text-white">{storeInfo?.name || "Nama Toko Anda"}</h3>
                        <Badge className="bg-emerald-500 text-white rounded-full px-1.5 py-0 h-4 text-[7px] flex items-center font-bold shrink-0 border-none uppercase tracking-wide">
                          Verified
                        </Badge>
                        {storeInfo?.isFeatured && (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full px-1.5 py-0.5 h-4 text-[7px] flex items-center font-extrabold shrink-0 border-none uppercase tracking-wide gap-0.5 animate-bounce">
                            <Sparkles className="h-2.5 w-2.5 fill-white text-white" /> SPONSOR
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content mockup */}
                <div className={`p-5 space-y-4 text-xs transition-all duration-300
                  ${storeInfo?.profilePattern === "pattern-dark" ? "bg-neutral-900" : "bg-transparent"}
                `}>
                  
                  {/* Info widgets block */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between 
                      ${storeInfo?.profilePattern === "pattern-dark" ? "bg-neutral-950 border-neutral-800" : "bg-secondary/40 border-muted-foreground/10"}
                    `}>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none block">Rating Mitra</span>
                      <div className="flex items-center gap-1 mt-1 font-semibold text-xs animate-none">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span>4.8 / 5.0</span>
                      </div>
                    </div>

                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between
                      ${storeInfo?.profilePattern === "pattern-dark" ? "bg-neutral-950 border-neutral-800" : "bg-secondary/40 border-muted-foreground/10"}
                    `}>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none block">Operasional</span>
                      <span className="font-bold text-[9px] text-primary truncate mt-1 bg-primary/5 px-1.5 py-0.5 rounded-md inline-block max-w-full text-center">
                        {storeInfo?.operatingHours || "08:00 - 20:00"}
                      </span>
                    </div>
                  </div>

                  {/* About mockup */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Bio Toko & Keunikan Anda</span>
                    <p className={`line-clamp-3 text-[11px] leading-relaxed font-normal
                      ${storeInfo?.profilePattern === "pattern-dark" ? "text-neutral-400" : "text-muted-foreground"}
                    `}>
                      {storeInfo?.description || "Deskripsi toko bunga kriya Anda yang estetik dan tepercaya di mata pemesan."}
                    </p>
                  </div>

                  {/* Buttons line */}
                  <div className="pt-2 border-t border-muted/50 flex gap-2">
                    <div className="h-8 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold flex items-center justify-center flex-1">
                      <MapPin className="h-3 w-3 mr-1 animate-none" /> Alamat Fisik
                    </div>
                    <div className="h-8 rounded-full bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold flex items-center justify-center flex-1">
                      <Smartphone className="h-3 w-3 mr-1 animate-none" /> Hubungi via WA
                    </div>
                  </div>

                </div>
              </div>

              {/* Tips banner card */}
              <div className="p-4 bg-primary/5 rounded-3xl border border-primary/10">
                <h5 className="text-[11px] font-bold text-primary flex items-center gap-1">
                  💡 Tips Sukses Branding
                </h5>
                <ul className="text-[10px] text-muted-foreground space-y-1.5 mt-2 list-disc pl-3.5 leading-relaxed font-semibold">
                  <li>Gunakan banner latar belakang beresolusi tinggi dengan warna senada dengan kriya bunga Anda.</li>
                  <li>Pola <span className="text-primary font-bold">Velvet Dark</span> atau <span className="text-primary font-bold">Blossom Petal</span> cocok untuk brand florist premium/eksklusif.</li>
                </ul>
              </div>

            </div>

          </div>
        </TabsContent>
        </div> {/* col-span-12 lg:col-span-9 space-y-6 */}
        </div> {/* grid grid-cols-12 gap-6 */}
      </Tabs>

      <ProductUploadModal 
        isOpen={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onSuccess={loadData}
        productToEdit={productToEdit}
      />

      {/* Custom state-based Delete Confirmation Dialog (solves iframe blockages) */}
      <Dialog open={!!productToDelete} onOpenChange={(open) => { if(!open) setProductToDelete(null); }}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl border border-red-100 shadow-xl overflow-hidden bg-white">
          <DialogHeader className="pt-2">
            <DialogTitle className="text-lg font-bold text-red-700 flex items-center gap-2">
              <span className="text-xl">⚠️</span> Konfirmasi Hapus Produk
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Apakah Anda yakin ingin menghapus produk <strong className="text-foreground">"{productToDelete?.name}"</strong> dari katalog toko Anda? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          {productToDelete?.images?.[0] && (
            <div className="my-2 flex justify-center">
              <div className="h-28 w-28 rounded-2xl overflow-hidden border border-muted bg-[#FCFDFD] shadow-sm flex items-center justify-center">
                <img 
                  src={productToDelete.images[0]} 
                  alt={productToDelete.name} 
                  className="h-full w-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full text-xs font-semibold h-10 w-full sm:flex-1"
              onClick={() => setProductToDelete(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-full text-xs font-bold h-10 w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleDeleteProduct(productToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Ya, Hapus Produk"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dynamic confirm Dialog to bypass iframe popup blocking */}
      <Dialog open={!!confirmDialog} onOpenChange={(open) => { if (!open) setConfirmDialog(null); }}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl border border-rose-100 shadow-2xl overflow-hidden bg-white">
          <DialogHeader className="pt-2">
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>🔔</span> {confirmDialog?.title || "Konfirmasi Tindakan"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {confirmDialog?.message}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-5 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full text-xs font-semibold h-10 w-full sm:flex-1"
              onClick={() => setConfirmDialog(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant={confirmDialog?.variant === "destructive" ? "destructive" : "default"}
              className={`rounded-full text-xs font-bold h-10 w-full sm:flex-1 ${
                confirmDialog?.variant === "destructive" ? "bg-red-600 hover:bg-red-700 text-white" : ""
              }`}
              onClick={() => {
                if (confirmDialog?.onConfirm) {
                  confirmDialog.onConfirm();
                }
                setConfirmDialog(null);
              }}
            >
              {confirmDialog?.actionLabel || "Ya, Lanjutkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
