import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Users, 
  Store, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  PlusCircle,
  DollarSign,
  Clock,
  Check,
  RotateCw,
  Smartphone,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Layers,
  Settings,
  Globe,
  Upload,
  QrCode,
  X,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  fetchStores, 
  updateStoreStatus, 
  clearAllAccountsData,
  fetchAdPackages,
  createAdPackage,
  deleteAdPackage,
  deleteStore,
  updateStoreProfile,
  fetchPromoBanners,
  createPromoBanner,
  updatePromoBanner,
  deletePromoBanner,
  seedPromoBannersIfNeeded,
  fetchProducts,
  fetchWebConfig,
  updateWebConfig,
  fetchPremiumPayments,
  updatePremiumPaymentStatus,
  updateUserProfile
} from "@/src/lib/dataService";
import { toast } from "sonner";
import { Trash2, Database, HelpCircle } from "lucide-react";

const MOCK_PENDING_FLORISTS: any[] = [];

export default function AdminDashboard() {
  const [stores, setStores] = useState<any[]>([]);

  const safeConfirm = (message: string): boolean => {
    try {
      return window.confirm(message);
    } catch (_) {
      return true;
    }
  };

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

  const [pending, setPending] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  // Premium payments validation states
  const [premiumPayments, setPremiumPayments] = useState<any[]>([]);
  const [selectedProofImage, setSelectedProofImage] = useState<string>("");
  const [rejectingPaymentId, setRejectingPaymentId] = useState<string>("");
  const [rejectReasonInput, setRejectReasonInput] = useState<string>("");

  // Search filter states
  const [activeTab, setActiveTab] = useState("verification");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [verificationSearchQuery, setVerificationSearchQuery] = useState("");
  const [storesSearchQuery, setStoresSearchQuery] = useState("");
  const [promotionsSearchQuery, setPromotionsSearchQuery] = useState("");
  const [promoFilter, setPromoFilter] = useState("all"); // "all" | "slide" | "main"

  // Paid Ads States
  const [adPackages, setAdPackages] = useState<any[]>([]);
  const [isCreatingAd, setIsCreatingAd] = useState(false);
  const [adForm, setAdForm] = useState({
    name: "",
    price: "",
    duration: "30 Hari",
    benefits: ""
  });

  // Slider Promo Banners States
  const [promoBanners, setPromoBanners] = useState<any[]>([]);
  const [isPromoFormLoading, setIsPromoFormLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    order: "0",
    isActive: true,
    overlayType: "dark-grad"
  });
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  // Web Profile Settings states
  const [webConfig, setWebConfig] = useState<any>({
    brandName: "",
    slogan: "",
    csPhone: "",
    runningText: "",
    promoText: "",
    emailVisible: "",
    isMaintenance: false,
    logoType: "default",
    logoUrl: "",
    logoBgColor: "#1E3E2A",
    logoTextColor: "#E8F2EC",
    qrisMerchantName: "cosmics.co",
    qrisNmid: "ID1022232744543",
    qrisImageUrl: ""
  });
  const [isSavingWebConfig, setIsSavingWebConfig] = useState(false);
  const [isLogoDragging, setIsLogoDragging] = useState(false);
  const [isQrisDragging, setIsQrisDragging] = useState(false);

  const handleQrisFileChange = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Format file harus berupa gambar (JPEG, PNG, SVG, webp, dsb)!");
      return;
    }
    // Limit to 2MB for storage in firestore
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran QRIS maksimal adalah 2MB! ⚡");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setWebConfig((prev: any) => ({
          ...prev,
          qrisImageUrl: event.target!.result as string
        }));
        toast.success("Gambar QRIS berhasil dibaca! Klik 'Simpan Perubahan' di bawah untuk mempublikasikannya secara real-time. ✨");
      }
    };
    reader.onerror = () => {
      toast.error("Gagal memproses file gambar QRIS.");
    };
    reader.readAsDataURL(file);
  };

  const handleLogoFileChange = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Format file harus berupa gambar (JPEG, PNG, SVG, webp, dsb)!");
      return;
    }
    // Limit to 2MB for storage in firestore
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran logo maksimal adalah 2MB agar loading web tetap super cepat! ⚡");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setWebConfig((prev: any) => ({
          ...prev,
          logoUrl: event.target!.result as string
        }));
        toast.success("Logo gambar berhasil dibaca dari file lokal! Klik 'Simpan Perubahan' di bawah untuk mempublikasikan. ✨");
      }
    };
    reader.onerror = () => {
      toast.error("Gagal memproses file gambar logo.");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveWebConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWebConfig(true);
    try {
      await updateWebConfig(webConfig);
      toast.success("Profil websitemu berhasil disimpan dan diperbarui secara real-time! ✨");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan profil web.");
    } finally {
      setIsSavingWebConfig(false);
    }
  };

  async function loadPromoBanners() {
    try {
      const b = await fetchPromoBanners();
      setPromoBanners(b);
    } catch (e) {
      console.warn("Gagal memuat promo banners:", e);
    }
  }

  async function loadAdPackages() {
    const pkgs = await fetchAdPackages();
    setAdPackages(pkgs);
  }

  async function loadPremiumPaymentsData() {
    try {
      const payments = await fetchPremiumPayments();
      setPremiumPayments(payments || []);
    } catch (e) {
      console.warn("Gagal memuat bukti pembayaran:", e);
    }
  }

  async function loadStoresData() {
    const s = await fetchStores();
    setStores(s);
    setPending(s.filter((store: any) => !store.isVerified));
    try {
      const p = await fetchProducts();
      setProducts(p || []);
    } catch (e) {
      console.warn("Gagal memuat produk pendaftaran:", e);
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadStoresData();
      await loadAdPackages();
      await loadPromoBanners();
      await loadPremiumPaymentsData();
      toast.success("Antrean pendaftaran terbaru berhasil disinkronkan!");
    } catch (e) {
      console.error(e);
      toast.error("Gagal menyegarkan data pendaftaran.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      await clearAllAccountsData();
      await seedPromoBannersIfNeeded();
      toast.success("Semua data akun dan toko pendaftaran berhasil dihapus! Sistem di-reset ke katalog bawaan.");
      await loadStoresData();
      setIsConfirmingClear(false);
      await loadAdPackages();
      await loadPromoBanners();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus data akun.");
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    async function initData() {
      setLoading(true);
      try {
        await loadStoresData();
        await loadAdPackages();
        await seedPromoBannersIfNeeded();
        await loadPromoBanners();
        await loadPremiumPaymentsData();
        const cfg = await fetchWebConfig();
        if (cfg) {
          setWebConfig(cfg);
        }
      } catch (e) {
        console.error("Init data error:", e);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  // NEW: Promo Banners Management Handlers
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.imageUrl) {
      toast.error("Silakan unggah gambar banner terlebih dahulu!");
      return;
    }

    setIsPromoFormLoading(true);
    try {
      const dataToSave = {
        title: bannerForm.title,
        description: bannerForm.description,
        imageUrl: bannerForm.imageUrl,
        linkUrl: bannerForm.linkUrl,
        order: Number(bannerForm.order) || 0,
        isActive: bannerForm.isActive,
        overlayType: bannerForm.overlayType || "dark-grad"
      };

      if (editingBannerId) {
        await updatePromoBanner(editingBannerId, dataToSave);
        toast.success("Promo banner berhasil diperbarui!");
      } else {
        await createPromoBanner(dataToSave);
        toast.success("Promo banner baru berhasil ditambahkan!");
      }

      // Reset form
      setBannerForm({
        title: "",
        description: "",
        imageUrl: "",
        linkUrl: "",
        order: "0",
        isActive: true,
        overlayType: "dark-grad"
      });
      setEditingBannerId(null);
      await loadPromoBanners();
    } catch (err) {
      console.error("Gagal menyimpan banner:", err);
      toast.error("Gagal menyimpan data banner.");
    } finally {
      setIsPromoFormLoading(false);
    }
  };

  const handleEditBannerClick = (banner: any) => {
    setEditingBannerId(banner.id);
    setBannerForm({
      title: banner.title || "",
      description: banner.description || "",
      imageUrl: banner.imageUrl || "",
      linkUrl: banner.linkUrl || "",
      order: banner.order !== undefined ? String(banner.order) : "0",
      isActive: banner.isActive !== undefined ? banner.isActive : true,
      overlayType: banner.overlayType || "dark-grad"
    });
    
    // Smooth scroll to the form
    const formEl = document.getElementById("banner-form-card");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleDeleteBannerClick = (id: string, title: string) => {
    confirmAction(
      "Hapus Promo Banner",
      `Apakah Anda yakin ingin menghapus iklan "${title || "Tanpa Judul"}" ini? Tindakan ini tidak dapat dibatalkan.`,
      async () => {
        try {
          await deletePromoBanner(id);
          toast.success("Promo banner berhasil dihapus! 🍃");
          await loadPromoBanners();
        } catch (err) {
          console.error("Gagal menghapus banner:", err);
          toast.error("Gagal menghapus banner.");
        }
      },
      "Ya, Hapus Banner",
      "destructive"
    );
  };

  const handleToggleBannerActive = async (id: string, currentStatus: boolean, title: string) => {
    try {
      await updatePromoBanner(id, { isActive: !currentStatus });
      toast.success(`Iklan "${title}" telah ${!currentStatus ? "diaktifkan" : "dinonaktifkan"}`);
      await loadPromoBanners();
    } catch (err) {
      console.error("Gagal mengubah status banner:", err);
      toast.error("Gagal memperbarui status.");
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Berkas yang dipilih harus berupa gambar!");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Create canvas to scale image to 1200 max-width to optimize load speed and satisfy Firestore 1MB doc limits
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxW = 1200;
        
        if (width > maxW) {
          height = (maxW / width) * height;
          width = maxW;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert page element to compressed base64 JPEG at 0.75 quality (perfect balance)
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
        setBannerForm((prev) => ({ ...prev, imageUrl: compressedBase64 }));
        setIsUploading(false);
        toast.success("Gambar berhasil diunggah & dioptimalkan!");
      };
      img.onerror = () => {
        setIsUploading(false);
        toast.error("Gagal mengurai file gambar.");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCancelEdit = () => {
    setEditingBannerId(null);
    setBannerForm({
      title: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      order: "0",
      isActive: true,
      overlayType: "dark-grad"
    });
  };

  const handleApprove = async (id: string) => {
    try {
      await updateStoreStatus(id, true);
      try {
        await updateUserProfile(id, { role: "florist" });
      } catch (roleErr) {
        console.warn("Failed to update user profile role in admin approval:", roleErr);
      }
      setPending(pending.filter(p => p.id !== id));
      setStores(stores.map(s => s.id === id ? { ...s, isVerified: true } : s));
      toast.success("Mitra berhasil disetujui!");
    } catch (e) {
      console.error(e);
      toast.error("Gagal menyetujui mitra.");
    }
  };

  const handleReject = (id: string, name: string) => {
    confirmAction(
      "Tolak Pendaftaran Florist",
      `Apakah Anda yakin ingin menolak & menghapus berkas pendaftaran "${name}"? Mitra tersebut harus mengirimkan formulir pendaftaran kembali.`,
      async () => {
        try {
          await deleteStore(id);
          setPending(pending.filter(p => p.id !== id));
          setStores(stores.filter(s => s.id !== id));
          toast.success(`Pendaftaran "${name}" berhasil ditolak & dihapus! 🍃`);
        } catch (e) {
          console.error(e);
          toast.error("Gagal menolak mitra.");
        }
      },
      "Ya, Tolak & Hapus",
      "destructive"
    );
  };

  const handleDeleteStore = (storeId: string, storeName: string) => {
    confirmAction(
      "Hapus Toko / Mitra Bunga",
      `Apakah Anda yakin ingin menghapus toko "${storeName}" secara permanen dari sistem? Seluruh data produk dan pengaturan toko ini akan ikut terhapus secara permanen.`,
      async () => {
        try {
          await deleteStore(storeId);
          setStores(stores.filter(s => s.id !== storeId));
          toast.success(`Toko "${storeName}" berhasil dihapus permanen! 🍃`);
        } catch (e) {
          console.error(e);
          toast.error("Gagal menghapus toko.");
        }
      },
      "Ya, Hapus Permanen",
      "destructive"
    );
  };

  const handleCreateAdPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adForm.name.trim() || !adForm.price.trim()) {
      toast.error("Mohon lengkapi nama dan harga paket iklan.");
      return;
    }

    setIsCreatingAd(true);
    try {
      await createAdPackage({
        name: adForm.name,
        price: parseInt(adForm.price),
        duration: adForm.duration,
        benefits: adForm.benefits.split("\n").map(b => b.trim()).filter(b => b !== "")
      });
      toast.success("Paket iklan berbayar berhasil dibuat!");
      setAdForm({ name: "", price: "", duration: "30 Hari", benefits: "" });
      loadAdPackages();
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuat paket iklan.");
    } finally {
      setIsCreatingAd(false);
    }
  };

  const handleDeleteAdPackage = (id: string) => {
    confirmAction(
      "Hapus Paket Iklan",
      "Apakah Anda yakin ingin menghapus paket iklan ini dari sistem? Mitra florist tidak akan dapat memilih atau memperpanjang paket ini lagi.",
      async () => {
        try {
          await deleteAdPackage(id);
          toast.success("Paket iklan telah dihapus! 🍃");
          loadAdPackages();
        } catch (err) {
          console.error(err);
          toast.error("Gagal menghapus paket iklan.");
        }
      },
      "Ya, Hapus Paket",
      "destructive"
    );
  };

  const handleDeactivatePromotion = (storeId: string, storeName: string) => {
    confirmAction(
      "Hentikan Promosi Toko",
      `Apakah Anda yakin ingin menonaktifkan seluruh status promosi sponsor untuk toko "${storeName}"? Lencana utama dan sorotan produk toko ini akan langsung dicabut.`,
      async () => {
        try {
          await updateStoreProfile(storeId, {
            isFeatured: false,
            isBoosted: false,
            activeAdPkg: null,
            activeAds: []
          });
          // Synchronize in local collections state
          setStores(stores.map(s => s.id === storeId ? { ...s, isFeatured: false, isBoosted: false, activeAdPkg: null, activeAds: [] } : s));
          toast.success(`Seluruh promosi iklan aktif untuk "${storeName}" berhasil dicabut! 🍃`);
        } catch (e) {
          console.error(e);
          toast.error("Gagal menonaktifkan promosi iklan.");
        }
      },
      "Ya, Hentikan Promosi",
      "destructive"
    );
  };

  const handleDeactivateSpecificAd = (storeId: string, adId: string, adType: string) => {
    confirmAction(
      "Nonaktifkan Kampanye",
      `Apakah Anda yakin ingin menonaktifkan kampanye "${adType === "slide_feeds" ? "Slide Feeds" : "Main Feeds"}" ini?`,
      async () => {
        try {
          const store = stores.find(s => s.id === storeId);
          if (!store) return;
          
          let updates: any = {};

          if (adId === "legacy-slide" || (adId === "legacy" && adType === "slide_feeds")) {
            updates = {
              isFeatured: false,
              activeAdPkg: store.isBoosted ? store.activeAdPkg : null,
              activeAds: (store.activeAds || []).filter((ad: any) => ad.id !== "legacy-slide" && ad.id !== "legacy")
            };
          } else if (adId === "legacy-main" || (adId === "legacy" && adType === "main_feeds")) {
            updates = {
              isBoosted: false,
              activeAdPkg: store.isFeatured ? store.activeAdPkg : null,
              activeAds: (store.activeAds || []).filter((ad: any) => ad.id !== "legacy-main" && ad.id !== "legacy")
            };
          } else {
            const updatedActiveAds = (store.activeAds || []).filter((ad: any) => ad.id !== adId);

            // Also set the main toggles if there are no more active ads of that type
            const hasActiveSlide = updatedActiveAds.some((ad: any) => ad.type === "slide_feeds" && ad.status === "active");
            const hasActiveMain = updatedActiveAds.some((ad: any) => ad.type === "main_feeds" && ad.status === "active");

            updates = {
              activeAds: updatedActiveAds,
              isFeatured: hasActiveSlide,
              isBoosted: hasActiveMain
            };

            // If no active ads remain at all, set activeAdPkg to null
            const anyActive = updatedActiveAds.some((ad: any) => ad.status === "active");
            if (!anyActive) {
              updates.activeAdPkg = null;
            }
          }

          await updateStoreProfile(storeId, updates);
          
          // Update local state
          setStores(stores.map(s => s.id === storeId ? { ...s, ...updates } : s));
          toast.success("Kampanye promosi berhasil dihentikan! 🍃");
        } catch (err) {
          console.error(err);
          toast.error("Gagal menghentikan kampanye.");
        }
      },
      "Ya, Hentikan Reklame",
      "destructive"
    );
  };

  const handleResetAllStorePromotions = () => {
    confirmAction(
      "Reset Semua Promosi Toko",
      "Apakah Anda yakin ingin menghapus dan menonaktifkan seluruh paket promosi & kampanye iklan aktif (Slide Feeds & Main Feeds) dari semua florist terdaftar di sistem? Tindakan ini akan mengosongkan status berbayar toko dan mereset ke versi non-premium.",
      async () => {
        try {
          setIsRefreshing(true);
          // Loop through all stores and clear features
          const promises = stores.map((s) => {
            const updates = {
              isFeatured: false,
              isBoosted: false,
              activeAdPkg: null,
              activeAds: []
            };
            return updateStoreProfile(s.id, updates).then(() => ({ id: s.id, ...updates }));
          });
          
          const results = await Promise.all(promises);
          
          // Update local state
          const updatedStores = stores.map((s) => {
            const result = results.find(r => r.id === s.id);
            if (result) {
              return { ...s, ...result };
            }
            return s;
          });
          setStores(updatedStores);
          toast.success("Seluruh promosi & booster toko berhasil dibersihkan! ✨");
        } catch (err) {
          console.error("Gagal mereset promosi:", err);
          toast.error("Gagal melakukan pembersihan promosi.");
        } finally {
          setIsRefreshing(false);
        }
      },
      "Ya, Bersihkan Semua",
      "destructive"
    );
  };

  const handleApprovePremiumPayment = async (payment: any) => {
    confirmAction(
      "Setujui Pembayaran Promosi",
      `Apakah Anda yakin ingin menyetujui bukti pembayaran untuk paket "${payment.packageName}" dari toko "${payment.storeName}"? Kampanye promosi akan langsung diaktifkan secara otomatis.`,
      async () => {
        try {
          const store = stores.find(it => it.id === payment.storeId);
          if (!store) {
            toast.error("Toko florist tidak ditemukan dalam sistem.");
            return;
          }

          const durationStr = payment.duration || "30 Hari";
          const matchDays = durationStr.match(/\d+/);
          const days = matchDays ? parseInt(matchDays[0]) : 30;

          const activeAdPkg = {
            packageId: payment.packageId,
            name: payment.packageName,
            price: payment.price,
            duration: payment.duration,
            subscribedAt: new Date().toLocaleDateString("id-ID"),
            expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID")
          };

          const isSlideFeeds = payment.adType === "slide_feeds";
          const isMainFeeds = payment.adType === "main_feeds";

          const existingActiveAds = store.activeAds || [];
          const newAdId = "qris-ad-" + Date.now();
          const newAd = {
            id: newAdId,
            name: payment.packageName + " (" + (isSlideFeeds ? "Slide Feeds" : "Main Feeds") + ")",
            price: payment.price,
            duration: payment.duration,
            type: payment.adType,
            status: "active",
            subscribedAt: activeAdPkg.subscribedAt,
            expiresAt: activeAdPkg.expiresAt
          };

          const updates: any = {
            activeAdPkg,
            activeAds: [...existingActiveAds.filter((ad: any) => ad.status === "active"), newAd]
          };

          if (isSlideFeeds) {
            updates.isFeatured = true;
          } else if (isMainFeeds) {
            updates.isBoosted = true;
          }

          await updateStoreProfile(payment.storeId, updates);
          await updatePremiumPaymentStatus(payment.id, "approved");
          
          toast.success(`Sponsor ${payment.packageName} untuk toko "${payment.storeName}" sukses diaktifkan!`);
          
          // Refresh data
          await loadStoresData();
          await loadPremiumPaymentsData();
        } catch (error) {
          console.error(error);
          toast.error("Gagal menyetujui bukti pembayaran.");
        }
      },
      "Setujui & Aktifkan",
      "primary"
    );
  };

  const handleRejectPremiumPayment = async () => {
    if (!rejectReasonInput.trim()) {
      toast.error("Alasan penolakan wajib diisi!");
      return;
    }

    try {
      await updatePremiumPaymentStatus(rejectingPaymentId, "rejected", rejectReasonInput);
      toast.success("Pengajuan bukti pembayaran berhasil ditolak.");
      
      // Reset dialog state
      setRejectingPaymentId("");
      setRejectReasonInput("");
      
      // Refresh
      await loadPremiumPaymentsData();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menolak bukti pembayaran.");
    }
  };

  // Filter lists based on search queries (including ID Pendaftaran slice(0,8))
  const filteredPending = pending.filter((p) => {
    if (!verificationSearchQuery) return true;
    const q = verificationSearchQuery.toLowerCase().trim();
    const regId = (p.id || "").slice(0, 8).toLowerCase();
    const fullId = (p.id || "").toLowerCase();
    const name = (p.name || "").toLowerCase();
    const owner = (p.owner || "").toLowerCase();
    const email = (p.email || "").toLowerCase();
    return regId.includes(q) || fullId.includes(q) || name.includes(q) || owner.includes(q) || email.includes(q);
  });

  const filteredStores = stores.filter((s) => {
    if (!storesSearchQuery) return true;
    const q = storesSearchQuery.toLowerCase().trim();
    const regId = (s.id || "").slice(0, 8).toLowerCase();
    const fullId = (s.id || "").toLowerCase();
    const name = (s.name || "").toLowerCase();
    const owner = (s.owner || "").toLowerCase();
    const email = (s.email || "").toLowerCase();
    const address = (s.location?.address || "").toLowerCase();
    return regId.includes(q) || fullId.includes(q) || name.includes(q) || owner.includes(q) || email.includes(q) || address.includes(q);
  });

  const filteredPromotions = stores.filter((s) => {
    const hasActiveSlideFeeds = s.isFeatured || s.activeAds?.some((ad: any) => ad.type === "slide_feeds" && ad.status === "active");
    const hasActiveMainFeeds = s.isBoosted || s.activeAds?.some((ad: any) => ad.type === "main_feeds" && ad.status === "active");
    
    // Apply promoFilter state
    if (promoFilter === "slide" && !hasActiveSlideFeeds) return false;
    if (promoFilter === "main" && !hasActiveMainFeeds) return false;
    if (promoFilter === "all" && !hasActiveSlideFeeds && !hasActiveMainFeeds) return false;

    if (!promotionsSearchQuery) return true;
    const q = promotionsSearchQuery.toLowerCase().trim();
    const regId = (s.id || "").slice(0, 8).toLowerCase();
    const fullId = (s.id || "").toLowerCase();
    const name = (s.name || "").toLowerCase();
    const owner = (s.owner || "").toLowerCase();
    const email = (s.email || "").toLowerCase();
    const pkgName = (s.activeAdPkg?.name || "").toLowerCase();
    return regId.includes(q) || fullId.includes(q) || name.includes(q) || owner.includes(q) || email.includes(q) || pkgName.includes(q);
  });

  const activeCampaigns = stores.flatMap((s) => {
    const ads = s.activeAds || [];
    const activeFromList = ads
      .filter((ad: any) => ad.status === "active")
      .map((ad: any) => ({
        storeId: s.id,
        storeName: s.name,
        adId: ad.id,
        name: ad.name || (ad.type === "slide_feeds" ? "Sponsor Slide Feeds" : "Sponsor Main Feeds"),
        type: ad.type,
        price: ad.price,
        subscribedAt: ad.subscribedAt || s.activeAdPkg?.subscribedAt || "Hari Ini",
        expiresAt: ad.expiresAt || s.activeAdPkg?.expiresAt || "30 Hari",
        isLegacy: false,
      }));

    if (activeFromList.length === 0 && (s.isFeatured || s.isBoosted)) {
      const legacyCampaigns = [];
      if (s.isFeatured) {
        legacyCampaigns.push({
          storeId: s.id,
          storeName: s.name,
          adId: "legacy-slide",
          name: s.activeAdPkg?.name || "Sponsor Slide Feeds (Legacy)",
          type: "slide_feeds",
          price: s.activeAdPkg?.price || 75000,
          subscribedAt: s.activeAdPkg?.subscribedAt || "Hari Ini",
          expiresAt: s.activeAdPkg?.expiresAt || "30 Hari",
          isLegacy: true,
        });
      }
      if (s.isBoosted) {
        legacyCampaigns.push({
          storeId: s.id,
          storeName: s.name,
          adId: "legacy-main",
          name: s.activeAdPkg?.name || "Sponsor Main Feeds (Legacy)",
          type: "main_feeds",
          price: s.activeAdPkg?.price || 120000,
          subscribedAt: s.activeAdPkg?.subscribedAt || "Hari Ini",
          expiresAt: s.activeAdPkg?.expiresAt || "30 Hari",
          isLegacy: true,
        });
      }
      return legacyCampaigns;
    }

    return activeFromList;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-primary">Admin Control Center</h2>
          <p className="text-muted-foreground underline decoration-primary/20 underline-offset-4">Mengelola ekosistem O2O TitikKembang.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="rounded-full flex items-center gap-1.5 h-10 px-4 text-xs font-semibold text-primary border-primary/20 hover:bg-primary/5 active:scale-95 transition-all"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Menyegarkan..." : "Segarkan Data"}
          </Button>
          <Button variant="outline" className="rounded-full">Export Data</Button>
          <Button className="rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-none">Platform Settings</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { icon: Store, label: "Total Toko Terdaftar", value: stores.length.toString(), delta: "All time", onClick: null },
          { icon: ShieldCheck, label: "Mitra Terverifikasi", value: stores.filter((s: any) => s.isVerified).length.toString(), delta: `${Math.round((stores.filter((s: any) => s.isVerified).length / (stores.length || 1)) * 100)}%`, onClick: () => setActiveTab("stores") },
          { icon: AlertTriangle, label: "Butuh Verifikasi", value: pending.length.toString(), delta: "High Priority", color: pending.length > 0 ? "text-yellow-500" : "text-green-500", onClick: () => setActiveTab("verification") }
        ].map((stat, i) => (
          <Card 
            key={i} 
            className={`rounded-3xl border-none bg-card shadow-sm transition-all ${stat.onClick ? "cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95 ring-1 ring-transparent hover:ring-primary/10" : ""}`}
            onClick={stat.onClick || undefined}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`rounded-2xl bg-secondary p-3 ${stat.color || "text-primary"}`}>
                  <stat.icon size={20} />
                </div>
                <Badge variant="secondary" className="rounded-full text-[10px]">{stat.delta}</Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  {stat.label}
                  {stat.onClick && <ArrowUpRight className="h-3.5 w-3.5 text-primary/60" />}
                </p>
                <h4 className="text-2xl font-bold">{stat.value}</h4>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setIsSidebarOpen(false); }} className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
          
          {/* Mobile Sidebar Toggle Header */}
          <div className="col-span-12 lg:hidden flex items-center justify-between p-4 bg-secondary/30 rounded-3xl border border-secondary/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                {activeTab === "verification" && <ShieldCheck size={18} />}
                {activeTab === "stores" && <Store size={18} />}
                {activeTab === "promotions" && <DollarSign size={18} className="text-emerald-600" />}
                {activeTab === "ads" && <Sparkles size={18} className="text-amber-500 animate-pulse" />}
                {activeTab === "banners" && <ImageIcon size={18} className="text-blue-500" />}
                {activeTab === "webProfile" && <Settings size={18} className="text-purple-500 animate-spin-slow" />}
                {activeTab === "system" && <Database size={18} className="text-red-650" />}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Panel Admin</span>
                <h4 className="text-sm font-bold text-primary leading-none">
                  {activeTab === "verification" && "Antrean Verifikasi"}
                  {activeTab === "stores" && "Semua Toko"}
                  {activeTab === "promotions" && "Promosi Berbayar"}
                  {activeTab === "ads" && "Paket Iklan"}
                  {activeTab === "banners" && "Promo Slider"}
                  {activeTab === "webProfile" && "Profil & Pengaturan Web"}
                  {activeTab === "system" && "Database & Sistem"}
                </h4>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-full flex items-center gap-1.5 text-xs border-primary/20 hover:bg-primary/5 text-primary"
            >
              <Menu size={14} />
              <span>Menu Panel</span>
            </Button>
          </div>

          {/* Backdrop for mobile sidebar drawer */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] lg:hidden transition-opacity duration-300"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar Panel - persistent on desktop, drawer on mobile */}
          <div className={`
            col-span-12 lg:col-span-3 
            fixed inset-y-0 left-0 z-[90] w-72 bg-card p-6 border-r border-secondary/50 shadow-2xl lg:shadow-none
            lg:relative lg:inset-auto lg:z-auto lg:w-auto lg:bg-transparent lg:p-0 lg:border-none
            transform transition-transform duration-300 ease-in-out h-full lg:h-auto
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}>
            {/* Sidebar content container */}
            <Card className="rounded-3xl border border-secondary/50 bg-card/60 backdrop-blur-md p-4 lg:p-5 h-full lg:sticky lg:top-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-6">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between lg:justify-start gap-3 border-b border-secondary/60 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-primary text-primary-foreground rounded-xl shadow-md shadow-primary/20">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-primary leading-none">Admin Panel</h3>
                      <p className="text-[10px] text-muted-foreground mt-1">Control Center</p>
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

                {/* Sidebar Tab Triggers */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-3 block mb-2">Navigasi Utama</span>
                  
                  {/* Verification Trigger */}
                  <button
                    onClick={() => { setActiveTab("verification"); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left ${
                      activeTab === "verification" 
                        ? "bg-primary text-primary-foreground shadow-sm font-bold" 
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck size={16} className={activeTab === "verification" ? "text-primary-foreground" : "text-primary/70"} />
                      <span>Antrean Verifikasi</span>
                    </div>
                    <Badge variant={activeTab === "verification" ? "secondary" : "outline"} className={`rounded-full px-2 py-0.5 text-[10px] ${
                      activeTab === "verification" ? "bg-white/20 text-white border-transparent" : "bg-primary/5 text-primary border-primary/20"
                    }`}>
                      {pending.length}
                    </Badge>
                  </button>

                  {/* Stores Trigger */}
                  <button
                    onClick={() => { setActiveTab("stores"); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left ${
                      activeTab === "stores" 
                        ? "bg-primary text-primary-foreground shadow-sm font-bold" 
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Store size={16} className={activeTab === "stores" ? "text-primary-foreground" : "text-primary/70"} />
                      <span>Semua Toko</span>
                    </div>
                    <Badge variant={activeTab === "stores" ? "secondary" : "outline"} className={`rounded-full px-2 py-0.5 text-[10px] ${
                      activeTab === "stores" ? "bg-white/20 text-white border-transparent" : "bg-primary/5 text-primary border-primary/20"
                    }`}>
                      {stores.length}
                    </Badge>
                  </button>

                  {/* Promotions Trigger */}
                  <button
                    onClick={() => { setActiveTab("promotions"); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left ${
                      activeTab === "promotions" 
                        ? "bg-primary text-primary-foreground shadow-sm font-bold" 
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <DollarSign size={16} className={activeTab === "promotions" ? "text-emerald-350 text-emerald-300" : "text-emerald-500"} />
                      <span>Promosi Berbayar</span>
                    </div>
                    <Badge variant={activeTab === "promotions" ? "secondary" : "outline"} className={`rounded-full px-2 py-0.5 text-[10px] ${
                      activeTab === "promotions" ? "bg-white/20 text-white border-transparent" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {stores.filter((s: any) => s.isFeatured).length}
                    </Badge>
                  </button>

                  {/* Ads Trigger */}
                  <button
                    onClick={() => { setActiveTab("ads"); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left ${
                      activeTab === "ads" 
                        ? "bg-primary text-primary-foreground shadow-sm font-bold" 
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles size={16} className={activeTab === "ads" ? "text-amber-300 animate-pulse" : "text-amber-500"} />
                      <span>Paket Iklan</span>
                    </div>
                    <Badge variant={activeTab === "ads" ? "secondary" : "outline"} className={`rounded-full px-2 py-0.5 text-[10px] ${
                      activeTab === "ads" ? "bg-white/20 text-white border-transparent" : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {adPackages.length}
                    </Badge>
                  </button>

                  {/* Banners Trigger */}
                  <button
                    onClick={() => { setActiveTab("banners"); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left ${
                      activeTab === "banners" 
                        ? "bg-primary text-primary-foreground shadow-sm font-bold" 
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ImageIcon size={16} className={activeTab === "banners" ? "text-blue-300" : "text-blue-500"} />
                      <span>Promo Slider</span>
                    </div>
                    <Badge variant={activeTab === "banners" ? "secondary" : "outline"} className={`rounded-full px-2 py-0.5 text-[10px] ${
                      activeTab === "banners" ? "bg-white/20 text-white border-transparent" : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      {promoBanners.length}
                    </Badge>
                  </button>

                  {/* Web Profile Trigger */}
                  <button
                    onClick={() => { setActiveTab("webProfile"); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left ${
                      activeTab === "webProfile" 
                        ? "bg-primary text-primary-foreground shadow-sm font-bold" 
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings size={16} className={activeTab === "webProfile" ? "text-purple-300 animate-spin-slow" : "text-purple-500"} />
                      <span>Profil & Pengaturan Web</span>
                    </div>
                  </button>

                  {/* System Trigger */}
                  <button
                    onClick={() => { setActiveTab("system"); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left ${
                      activeTab === "system" 
                        ? "bg-red-600 text-white shadow-sm font-bold" 
                        : "text-red-650 hover:bg-red-50 hover:text-red-750"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Database size={16} className={activeTab === "system" ? "text-white" : "text-red-650"} />
                      <span>Database & Sistem</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="border-t border-secondary/60 pt-4 mt-6">
                <div className="rounded-2xl bg-secondary/30 p-3 text-center border border-secondary/40">
                  <p className="text-[10px] font-medium text-muted-foreground">Admin Mode Active</p>
                  <div className="mt-1 flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Secure Session</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Panel */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            <TabsContent value="verification" className="mt-0 border-none">
          {/* Search bar inside Verification Tab */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold font-heading text-primary">Antrean Pendaftaran Baru</h3>
              <p className="text-xs text-muted-foreground">Pencarian cerdas berdasarkan Nama, Pemilik, Email, atau ID Pendaftaran (Contoh: IXRRBEWR)</p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Cari ID Pendaftaran (8-karakter)..." 
                className="rounded-full pl-9 bg-card border shadow-sm"
                value={verificationSearchQuery}
                onChange={(e) => setVerificationSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredPending.length === 0 ? (
            <Card className="rounded-3xl border border-dashed border-muted p-12 text-center bg-card shadow-sm flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold font-heading">Tidak Ada Pengajuan Ditemukan ✨</h4>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {verificationSearchQuery ? "Tidak ada pengajuan mitra yang cocok dengan filter pencarian Anda." : "Semua mitra berhasil diverifikasi! Klik tombol di bawah untuk menyegarkan data secara langsung."}
                </p>
              </div>
              <div className="flex gap-2">
                {verificationSearchQuery && (
                  <Button 
                    onClick={() => setVerificationSearchQuery("")} 
                    variant="outline" 
                    className="rounded-full"
                  >
                    Hapus Pencarian
                  </Button>
                )}
                <Button 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                  className="rounded-full flex items-center gap-2"
                >
                  <RotateCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  Segarkan Antrean
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredPending.map((p) => {
                const isMatchQuery = verificationSearchQuery && p.id?.toLowerCase().includes(verificationSearchQuery.toLowerCase());
                return (
                  <Card key={p.id} className={`rounded-3xl border ${isMatchQuery ? 'border-amber-400 bg-amber-50/5 ring-1 ring-amber-400' : 'border-none'} bg-card overflow-hidden shadow-sm hover:shadow-md transition-all`}>
                    <div className="flex flex-col md:flex-row">
                      <div className="h-48 w-full md:w-1/3 bg-secondary overflow-hidden relative group">
                        <img 
                          src={p.portfolio?.[0] || p.verificationImage || "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80"} 
                          className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-200" 
                          alt="Portfolio" 
                          onError={(e: any) => {
                            e.target.src = "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80";
                          }}
                        />
                        <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm text-yellow-400 font-bold px-2 py-1 text-[9px] rounded-lg tracking-wider flex items-center gap-1">
                          <span>Bukti Kriya Validasi 📸</span>
                        </div>
                      </div>
                      <div className="flex-1 p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20 font-mono tracking-wider">
                                REGISTER ID: {p.id?.slice(0, 8).toUpperCase()}
                              </Badge>
                              {p.isVerified && <Badge className="bg-green-100 text-green-700">Aktif</Badge>}
                            </div>
                            <h4 className="font-heading text-xl font-bold">{p.name || "Toko Bunga Baru"}</h4>
                            <p className="text-sm text-muted-foreground">{p.owner || "Pemilik"} • {p.email || "Email"}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Daftar: {p.appliedAt || "Baru saja"}</p>
                            <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 py-1 px-2.5 rounded-lg border border-emerald-100 flex items-center gap-1.5 w-fit mt-2">
                              <span>📸 Foto Validasi Terlampir</span>
                            </p>
                          </div>
                          <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-250 shrink-0">Pending Review</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button className="flex-1 rounded-full bg-green-600 hover:bg-green-700 font-semibold" size="sm" onClick={() => handleApprove(p.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Setujui
                          </Button>
                          <Button 
                            variant="outline" 
                            className="rounded-full border-red-200 text-red-650 hover:bg-red-50 hover:text-red-750 hover:border-red-300 font-semibold" 
                            size="sm"
                            onClick={() => handleReject(p.id, p.name)}
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Tolak
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stores" className="mt-6">
          <Card className="rounded-3xl border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between flex-col md:flex-row gap-4">
                <div>
                  <CardTitle>Partner Directory</CardTitle>
                  <CardDescription>Daftar semua toko yang terdaftar di platform.</CardDescription>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Cari ID, Nama, atau Lokasi..." 
                    className="rounded-full pl-9 bg-secondary border-none" 
                    value={storesSearchQuery}
                    onChange={(e) => setStoresSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredStores.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-secondary/10 rounded-2xl">
                  Tidak ada toko terdaftar yang cocok dengan pencarian Anda.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredStores.map((s) => (
                    <div key={s.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-primary font-bold">
                          {s.name?.charAt(0) || "T"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold">{s.name}</p>
                            <span className="text-[9px] bg-secondary px-1.5 py-0.5 rounded font-mono text-muted-foreground font-semibold">
                              ID: {s.id?.slice(0, 8).toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{s.location?.address || "Tidak ada detail alamat"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {(s.isFeatured || s.isBoosted || s.activeAdPkg || (s.activeAds && s.activeAds.length > 0)) && (
                          <div className="flex items-center gap-1">
                            <Badge className="bg-amber-100 text-amber-800 border-none font-bold text-[10px] whitespace-nowrap">
                              Sponsor ⚡
                            </Badge>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="rounded-full text-[10px] font-bold h-7 px-3 hover:bg-red-700 active:scale-95 transition-all text-white font-sans"
                              onClick={() => handleDeactivatePromotion(s.id, s.name)}
                            >
                              Cabut Iklan 🛑
                            </Button>
                          </div>
                        )}
                        {s.isVerified ? (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full">Verified</Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-full">Unverified</Badge>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full text-xs font-bold px-3 h-8 flex items-center gap-1"
                          onClick={() => handleDeleteStore(s.id, s.name)}
                        >
                          🗑️ Hapus
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions" className="mt-6">
          <Card className="rounded-3xl border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between flex-col md:flex-row gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-500 fill-emerald-500/10 animate-bounce" /> Promosi Toko Berbayar
                  </CardTitle>
                  <CardDescription>Mengelola mitra florist yang memiliki kampanye iklan berbayar (Slide Feeds & Main Feeds Booster).</CardDescription>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={handleResetAllStorePromotions}
                      className="rounded-full border-red-200 text-red-650 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-[11px] font-extrabold h-8 shadow-sm flex items-center gap-1.5"
                    >
                      <span>🧹</span> Reset / Bersihkan Semua Promosi Toko
                    </Button>
                  </div>
                </div>
                
                {/* Segment Filter for Slide and Main Feeds */}
                <div className="flex bg-secondary/60 rounded-full p-1 border text-xs gap-1">
                  <button
                    type="button"
                    className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${promoFilter === "all" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/5 text-muted-foreground"}`}
                    onClick={() => setPromoFilter("all")}
                  >
                    Semua ({stores.filter(s => s.isFeatured || s.isBoosted || s.activeAds?.some((ad: any) => ad.status === "active")).length})
                  </button>
                  <button
                    type="button"
                    className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${promoFilter === "slide" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/5 text-muted-foreground"}`}
                    onClick={() => setPromoFilter("slide")}
                  >
                    Slide Feeds ({stores.filter(s => s.isFeatured || s.activeAds?.some((ad: any) => ad.type === "slide_feeds" && ad.status === "active")).length})
                  </button>
                  <button
                    type="button"
                    className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${promoFilter === "main" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/5 text-muted-foreground"}`}
                    onClick={() => setPromoFilter("main")}
                  >
                    Main Feeds ({stores.filter(s => s.isBoosted || s.activeAds?.some((ad: any) => ad.type === "main_feeds" && ad.status === "active")).length})
                  </button>
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Cari ID, Nama Toko, atau Paket..." 
                    className="rounded-full pl-9 bg-secondary border-none" 
                    value={promotionsSearchQuery}
                    onChange={(e) => setPromotionsSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Persetujuan Bukti Bayar QRIS */}
              <div className="bg-emerald-500/5 border border-emerald-300/40 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-emerald-950 flex items-center gap-1.5 uppercase">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      Verifikasi Pengajuan Bukti Bayar QRIS ({premiumPayments.filter(p => p.status === "pending").length} Pending)
                    </h4>
                    <p className="text-[11px] text-emerald-900/80 font-medium">
                      Berikut adalah daftar merchant yang telah melakukan pembayaran paket promosi menggunakan QRIS dan mengunggah screenshot bukti bayarnya. Periksa bukti transfer untuk mengaktifkan paket iklan secara otomatis.
                    </p>
                  </div>
                </div>

                {premiumPayments.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground bg-background/40 rounded-xl border border-dashed">
                    Tidak ada pengajuan pembayaran QRIS saat ini.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {premiumPayments.map((payment) => (
                      <Card key={payment.id} className="rounded-2xl border bg-background/50 overflow-hidden flex flex-col justify-between p-4 space-y-3 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h5 className="font-extrabold text-foreground text-sm">{payment.storeName}</h5>
                            <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 uppercase">
                              Owner: <span className="text-foreground">{payment.ownerEmail || "-"}</span>
                            </p>
                          </div>
                          <Badge className={`text-[9px] font-bold uppercase rounded-lg px-2 py-0.5 border-none ${
                            payment.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : payment.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                          }`}>
                            {payment.status === "rejected" 
                              ? "Ditolak" 
                              : payment.status === "approved" 
                                ? "Disetujui" 
                                : "Menunggu Verifikasi"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-background/60 p-3 rounded-xl border font-medium">
                          <div>
                            <p className="text-muted-foreground">Paket Iklan:</p>
                            <p className="text-foreground font-bold">{payment.packageName}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Target / Durasi:</p>
                            <p className="text-foreground font-bold uppercase">{payment.adType} / {payment.duration}</p>
                          </div>
                          <div className="col-span-2 pt-1 border-t">
                            <p className="text-muted-foreground">Nominal Pembayaran:</p>
                            <p className="text-emerald-700 font-extrabold text-xs">Rp {payment.price?.toLocaleString("id-ID")}</p>
                          </div>
                        </div>

                        {payment.proofUrl && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Bukti Screenshot Bayar:</span>
                            <div className="relative group cursor-pointer overflow-hidden rounded-xl border bg-black/5" onClick={() => setSelectedProofImage(payment.proofUrl)}>
                              <img src={payment.proofUrl} alt="Bukti Transfer QRIS" className="w-full h-24 object-cover group-hover:scale-105 transition-all" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-all">
                                🔍 Klik untuk Memperbesar
                              </div>
                            </div>
                          </div>
                        )}

                        {payment.status === "pending" && (
                          <div className="flex gap-2 pt-1">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] h-8 rounded-lg"
                              onClick={() => handleApprovePremiumPayment(payment)}
                            >
                              ✅ Setujui & Aktifkan
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-650 hover:bg-red-50 hover:border-red-300 font-bold text-[10px] h-8 rounded-lg"
                              onClick={() => {
                                setRejectingPaymentId(payment.id);
                                setRejectReasonInput("");
                              }}
                            >
                              ❌ Tolak
                            </Button>
                          </div>
                        )}

                        {payment.status === "rejected" && (
                          <div className="bg-red-50 text-[10px] p-2.5 rounded-lg text-red-700 border border-red-200 font-medium">
                            ⚠️ Alasan Penolakan: {payment.rejectReason || "-"}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Promotion Slide Feeds Activator / Maker */}
              <div className="bg-amber-500/5 border border-amber-300/40 p-5 rounded-2xl shadow-sm">
                <h4 className="text-sm font-black text-amber-950 flex items-center gap-1.5 uppercase">
                  <Sparkles className="h-4 w-4 text-amber-600 animate-pulse" />
                  Aktifkan Promosi Toko Baru (Slide / Main Feeds)
                </h4>
                <p className="text-[11px] text-amber-900/80 mb-4 font-medium">Beri hak bintang sponsor / penambah visibilitas untuk toko mana saja sehingga produk mereka langsung berputar di slide feeds atas atau muncul pada urutan teratas katalog kriya.</p>
                <div className="grid gap-4 md:grid-cols-4 items-end">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-amber-950 uppercase">Pilih Toko Florist</Label>
                    <select
                      id="add-sponsor-store-select"
                      className="w-full text-xs rounded-lg border bg-background p-2 font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none h-9"
                    >
                      <option value="">-- Pilih Toko Terdaftar --</option>
                      {stores.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.owner || "No Owner"})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-amber-950 uppercase">Tipe Kampanye</Label>
                    <select
                      id="add-sponsor-type-select"
                      className="w-full text-xs rounded-lg border bg-background p-2 font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none h-9"
                    >
                      <option value="slide_feeds">Slide Feeds Sponsor (Slider Atas)</option>
                      <option value="main_feeds">Main Feeds Sponsor (Baris Teratas)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-amber-950 uppercase">Pilih Paket Sponsor</Label>
                    <select
                      id="add-sponsor-package-select"
                      className="w-full text-xs rounded-lg border bg-background p-2 font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none h-9"
                    >
                      <option value="">-- Pilih Paket Sponsor --</option>
                      {adPackages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} (Rp {pkg.price?.toLocaleString("id-ID")} / {pkg.duration})
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg h-9 text-xs font-black w-full"
                    onClick={async () => {
                      const selectEl = document.getElementById("add-sponsor-store-select") as HTMLSelectElement;
                      const typeEl = document.getElementById("add-sponsor-type-select") as HTMLSelectElement;
                      const pkgEl = document.getElementById("add-sponsor-package-select") as HTMLSelectElement;
                      const storeId = selectEl?.value;
                      const adType = typeEl?.value || "slide_feeds";
                      const pkgId = pkgEl?.value;
                      
                      if (!storeId) {
                        toast.error("Silakan pilih toko florist terlebih dahulu.");
                        return;
                      }
                      if (!pkgId) {
                        toast.error("Silakan pilih paket sponsor terlebih dahulu.");
                        return;
                      }

                      try {
                        const store = stores.find(it => it.id === storeId);
                        const selectedPkg = adPackages.find(it => it.id === pkgId);
                        if (!selectedPkg) {
                          toast.error("Paket sponsor tidak ditemukan.");
                          return;
                        }

                        const durationStr = selectedPkg.duration || "30 Hari";
                        const matchDays = durationStr.match(/\d+/);
                        const days = matchDays ? parseInt(matchDays[0]) : 30;

                        const activeAdPkg = {
                          packageId: selectedPkg.id,
                          name: selectedPkg.name,
                          price: selectedPkg.price,
                          duration: selectedPkg.duration,
                          subscribedAt: new Date().toLocaleDateString("id-ID"),
                          expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID")
                        };

                        const isSlideFeeds = adType === "slide_feeds";
                        const isMainFeeds = adType === "main_feeds";

                        const existingActiveAds = store.activeAds || [];
                        const newAdId = "admin-ad-" + Date.now();
                        const newAd = {
                          id: newAdId,
                          name: selectedPkg.name + " (" + (isSlideFeeds ? "Slide Feeds" : "Main Feeds") + ")",
                          price: selectedPkg.price,
                          duration: selectedPkg.duration,
                          type: adType,
                          status: "active",
                          subscribedAt: activeAdPkg.subscribedAt,
                          expiresAt: activeAdPkg.expiresAt
                        };

                        const updates: any = {
                          activeAdPkg,
                          activeAds: [...existingActiveAds.filter((ad: any) => ad.status === "active"), newAd]
                        };

                        if (isSlideFeeds) {
                          updates.isFeatured = true;
                        } else if (isMainFeeds) {
                          updates.isBoosted = true;
                        }

                        await updateStoreProfile(storeId, updates);

                        // Sync local state
                        setStores(stores.map(s => s.id === storeId ? { ...s, ...updates } : s));
                        toast.success(`Berhasil mengaktifkan promosi ${isSlideFeeds ? "slide feeds" : "main feeds"} untuk toko "${store?.name}"!`);
                        if (selectEl) selectEl.value = "";
                        if (pkgEl) pkgEl.value = "";
                      } catch (e) {
                        toast.error("Gagal mengaktifkan promosi toko.");
                      }
                    }}
                  >
                    Tayangkan Sebagai Berbayar 🚀
                  </Button>
                </div>
              </div>

              {filteredPromotions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-secondary/10 rounded-3xl max-w-md mx-auto space-y-4 flex flex-col items-center justify-center p-8">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                    $
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">Tidak Ada Toko Berlangganan Iklan</p>
                    <p className="text-xs text-muted-foreground">Belum ada florist terdaftar berkampanye sponsor yang cocok dengan penyaringan "{promoFilter === "all" ? "Semua Kampanye" : promoFilter === "slide" ? "Slide Feeds" : "Main Feeds"}".</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredPromotions.map((s) => {
                    const phone = s.phone || "";
                    let cleanPhone = phone.replace(/[^0-9]/g, "");
                    if (cleanPhone.startsWith("0")) {
                      cleanPhone = "62" + cleanPhone.slice(1);
                    }
                    const waMsg = `Halo Kak ${s.owner || "Owner"} dari ${s.name || "Florist"},\nKami dari tim Admin *TitikKembang* ingin mengonfirmasi terkait status iklan berbayar Anda saat ini aktif dan berjalan dengan lancar. Terima kasih atas kerja sama Anda! 😊💐`;
                    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`;
                    
                    const hasSlideFeeds = s.isFeatured || s.activeAds?.some((ad: any) => ad.type === "slide_feeds" && ad.status === "active");
                    const hasMainFeeds = s.isBoosted || s.activeAds?.some((ad: any) => ad.type === "main_feeds" && ad.status === "active");

                    return (
                      <Card key={s.id} className="rounded-2xl border border-emerald-500/15 overflow-hidden bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                          <div className="bg-emerald-500/5 p-4 border-b border-emerald-500/10 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold uppercase">
                                {s.name?.charAt(0) || "T"}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 leading-none">
                                  {s.name}
                                </h4>
                                <p className="text-[10px] text-muted-foreground font-mono mt-0.5 uppercase">ID: {s.id?.slice(0, 8)}</p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                              {hasSlideFeeds && (
                                <Badge className="bg-amber-500 text-white border-none rounded-full text-[8.5px] font-black tracking-wide uppercase px-2 py-0.5">
                                  Slide Feeds Sponsor
                                </Badge>
                              )}
                              {hasMainFeeds && (
                                <Badge className="bg-sky-500 text-white border-none rounded-full text-[8.5px] font-black tracking-wide uppercase px-2 py-0.5">
                                  Main Feeds Boosted
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <CardContent className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3 bg-secondary/35 p-3.5 rounded-xl text-xs">
                              <div className="space-y-0.5">
                                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Paket Terpilih</span>
                                <span className="font-extrabold text-primary">{s.activeAdPkg?.name || "Kampanye Booster"}</span>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Investasi Iklan</span>
                                <span className="font-extrabold text-foreground">Rp {s.activeAdPkg?.price?.toLocaleString("id-ID") || "0"}</span>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Tanggal Aktif</span>
                                <span className="font-extrabold text-foreground">{s.activeAdPkg?.subscribedAt || "Hari Ini"}</span>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Masa Berlaku</span>
                                <span className="font-extrabold text-primary">{s.activeAdPkg?.expiresAt || "-"}</span>
                              </div>
                            </div>

                            {/* ACTIVE KAMPANYE SUB-LIST & CONTROLS */}
                            <div className="space-y-2 border-t pt-3">
                              <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest block">Kampanye Aktif Berjalan</span>
                              <div className="space-y-2">
                                {hasSlideFeeds && (
                                  <div className="flex items-center justify-between p-2.5 bg-amber-500/5 rounded-xl border border-amber-500/10 text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                      <div>
                                        <p className="font-extrabold text-amber-800">Slide Feeds Flyer</p>
                                        <p className="text-[10px] text-muted-foreground">Tampil & Berputar di Slider Utama Beranda</p>
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        const ad = s.activeAds?.find((a: any) => a.type === "slide_feeds" && a.status === "active");
                                        handleDeactivateSpecificAd(s.id, ad?.id || "legacy", "slide_feeds");
                                      }}
                                      className="text-red-500 hover:text-red-600 hover:bg-red-50 text-[10.5px] font-bold h-7 px-2.5 rounded-lg"
                                    >
                                      Hentikan
                                    </Button>
                                  </div>
                                )}

                                {hasMainFeeds && (
                                  <div className="flex items-center justify-between p-2.5 bg-sky-500/5 rounded-xl border border-sky-500/10 text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                                      <div>
                                        <p className="font-extrabold text-sky-800">Main Feeds Booster</p>
                                        <p className="text-[10px] text-muted-foreground">Paling Atas di Katalog Utama Halaman Depan</p>
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        const ad = s.activeAds?.find((a: any) => a.type === "main_feeds" && a.status === "active");
                                        handleDeactivateSpecificAd(s.id, ad?.id || "legacy", "main_feeds");
                                      }}
                                      className="text-red-500 hover:text-red-600 hover:bg-neutral-50 text-[10.5px] font-bold h-7 px-2.5 rounded-lg"
                                    >
                                      Hentikan
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* CONFIGURATION SECTION FOR LIVE SLIDING FEEDS (ONLY IF ACTIVE) */}
                            {hasSlideFeeds && (
                              <div className="border border-dashed border-amber-300 bg-amber-50/10 p-3 rounded-xl space-y-3">
                                <div className="flex items-center gap-1.5 text-xs font-black text-amber-700 uppercase tracking-wide">
                                  <Sparkles className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                                  Kustomisasi Konten Slide Feeds
                                </div>
                                
                                {/* Catalog selection dropdown */}
                                <div className="space-y-1">
                                  <Label className="text-[9px] font-bold text-muted-foreground uppercase">Katalog Utama Slide (Cover)</Label>
                                  <select
                                    className="w-full text-xs rounded-lg border bg-background p-1.5 font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                                    value={s.featuredProductId || ""}
                                    onChange={async (e) => {
                                      const prodId = e.target.value;
                                      try {
                                        await updateStoreProfile(s.id, { featuredProductId: prodId });
                                        setStores(stores.map(item => item.id === s.id ? { ...item, featuredProductId: prodId } : item));
                                        toast.success("Katalog unggulan slide feeds berhasil disinkronkan!");
                                      } catch (err) {
                                        toast.error("Gagal memperbarui katalog unggulan.");
                                      }
                                    }}
                                  >
                                    <option value="">-- DEFAULT: Produk Terbaru Toko --</option>
                                    {products.filter(p => p.storeId === s.id).map(p => (
                                      <option key={p.id} value={p.id}>
                                        {p.name} - (Rp {p.price?.toLocaleString("id-ID")})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Promo caption description input text */}
                                <div className="space-y-1">
                                  <Label className="text-[9px] font-bold text-muted-foreground uppercase">Teks Promosi Banner (Deskripsi Feed)</Label>
                                  <Input
                                    placeholder="Tulis jargon / harga spektakuler..."
                                    className="text-xs h-8 bg-background"
                                    defaultValue={s.promoText || ""}
                                    onBlur={async (e) => {
                                      const text = e.target.value;
                                      if (text === s.promoText) return;
                                      try {
                                        await updateStoreProfile(s.id, { promoText: text });
                                        setStores(stores.map(item => item.id === s.id ? { ...item, promoText: text } : item));
                                        toast.success("Teks promosi slide feeds berhasil disinkronkan!");
                                      } catch (err) {
                                        toast.error("Gagal memperbarui teks promosi.");
                                      }
                                    }}
                                  />
                                  <span className="text-[8px] text-muted-foreground leading-none block">Tekan enter atau klik di luar kotak untuk langsung menyimpan.</span>
                                </div>
                              </div>
                            )}

                            <div className="text-xs space-y-1.5 border-t border-dashed pt-3">
                              <p className="text-muted-foreground font-medium">
                                <strong>Pemilik:</strong> {s.owner || "Tidak ada nama"}
                              </p>
                              <p className="text-muted-foreground font-medium">
                                <strong>Surel:</strong> {s.email || "Tidak ada email"}
                              </p>
                              {phone && (
                                <p className="text-muted-foreground font-medium flex items-center gap-1">
                                  <strong>WhatsApp:</strong> <span className="text-green-650 font-extrabold">{phone}</span>
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </div>
                        
                        <div className="px-5 pb-5 pt-0">
                          <div className="flex gap-2.5 border-t pt-4">
                            {phone && (
                              <Button
                                size="sm"
                                type="button"
                                variant="outline"
                                className="flex-1 rounded-full border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer h-9 bg-white"
                                onClick={() => window.open(waUrl, "_blank")}
                              >
                                <Smartphone className="h-4 w-4 text-green-500" /> WhatsApp
                              </Button>
                            )}
                            <Button
                              size="sm"
                              type="button"
                              variant="destructive"
                              className="flex-1 rounded-full text-xs font-bold hover:bg-red-700 h-9"
                              onClick={() => handleDeactivatePromotion(s.id, s.name)}
                            >
                              Hentikan Semua
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Left side: list of packages AND running campaigns */}
            <div className="md:col-span-2 space-y-8">
              {/* SECTION 1: MASTER PACKAGES DEFINED BY ADMIN */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-heading text-foreground">Daftar Paket Iklan Aktif (Opsi Merchant)</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {adPackages.map((pkg) => (
                    <Card key={pkg.id} className="rounded-3xl border-none bg-card shadow-sm overflow-hidden flex flex-col justify-between">
                      <CardHeader className="bg-primary/5 p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none rounded-full mb-1 text-[10px]">
                              {pkg.duration}
                            </Badge>
                            <h4 className="font-bold text-lg font-heading text-primary">{pkg.name}</h4>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-650 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDeleteAdPackage(pkg.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4 bg-card">
                        <div>
                          <p className="text-2xl font-black text-foreground">
                            Rp {pkg.price?.toLocaleString("id-ID")}
                          </p>
                          <ul className="mt-3 space-y-2">
                            {pkg.benefits?.map((benefit: string, bidx: number) => (
                              <li key={bidx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <Check className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {adPackages.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground bg-secondary/20 rounded-3xl">
                      Belum ada paket iklan dibuat. Daftarkan paket baru di samping kanan.
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: ACTIVE RUNNING USER CAMPAIGNS & SUBSCRIPTIONS */}
              <div className="space-y-4 border-t border-dashed pt-8">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xl font-bold font-heading text-foreground">Kampanye & Paket Berjalan Florist</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Daftar seluruh promosi, lencana sponsor, dan paket berbayar yang sedang aktif berjalan di kalangan florist partner.</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-none rounded-full px-3 py-1 font-extrabold text-xs flex items-center gap-1.5 shrink-0">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    {activeCampaigns.length} Kampanye Aktif
                  </Badge>
                </div>

                {activeCampaigns.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-secondary/10 border border-dashed rounded-3xl p-8">
                    <p className="font-bold text-foreground mb-1">Tidak Ada Paket Sedang Berjalan</p>
                    <p className="text-xs text-muted-foreground">Saat ini tidak ada florist yang memiliki kampanye iklan, lencana sponsor, atau slider feeds yang aktif berjalan.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {activeCampaigns.map((camp, cIdx) => (
                      <Card key={`${camp.storeId}-${camp.adId}-${cIdx}`} className="rounded-2xl border border-muted/50 overflow-hidden bg-card shadow-sm hover:shadow-md transition-all">
                        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-foreground text-sm">{camp.storeName}</span>
                              <Badge className={camp.type === "slide_feeds" ? "bg-amber-500 text-white hover:bg-amber-600 border-none rounded-full text-[9px] font-black uppercase tracking-wider px-2 py-0.5" : "bg-sky-500 text-white hover:bg-sky-600 border-none rounded-full text-[9px] font-black uppercase tracking-wider px-2 py-0.5"}>
                                {camp.type === "slide_feeds" ? "Slide Feeds Flyer" : "Main Feeds Boosted"}
                              </Badge>
                            </div>
                            <p className="text-xs text-primary font-bold">
                              Nama Paket: <span className="font-extrabold underline decoration-primary/20">{camp.name}</span>
                            </p>
                            <div className="flex items-center gap-4 text-[10.5px] text-muted-foreground flex-wrap">
                              <span>📅 Mulai: <strong className="text-foreground">{camp.subscribedAt}</strong></span>
                              <span>⏳ Selesai: <strong className="text-primary font-extrabold">{camp.expiresAt}</strong></span>
                              <span>💰 Dana: <strong className="text-green-600 underline">Rp {camp.price?.toLocaleString("id-ID")}</strong></span>
                            </div>
                          </div>
                          <div className="flex items-center justify-end shrink-0">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="rounded-full font-bold text-xs px-4 h-9 shadow-sm hover:bg-red-750 active:scale-95 transition-all text-white"
                              onClick={() => handleDeactivateSpecificAd(camp.storeId, camp.adId, camp.type)}
                            >
                              Hentikan Paket 🛑
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Create Package Form */}
            <div>
              <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-primary/5 p-5">
                  <CardTitle className="font-heading text-lg text-primary">Buat Paket Iklan Baru</CardTitle>
                  <CardDescription className="text-xs mt-1">Sellers/Florists akan memilih paket ini untuk memajang promosi berbayar mereka.</CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-4 bg-card">
                  <form onSubmit={handleCreateAdPackage} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="adName">Nama Paket</Label>
                      <Input 
                        id="adName" 
                        placeholder="Contoh: Paket Promosi Gold" 
                        value={adForm.name} 
                        onChange={(e) => setAdForm({...adForm, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adPrice">Harga (IDR)</Label>
                      <Input 
                        id="adPrice" 
                        type="number" 
                        placeholder="Contoh: 150000" 
                        value={adForm.price} 
                        onChange={(e) => setAdForm({...adForm, price: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adDuration">Durasi Iklan</Label>
                      <select 
                        id="adDuration" 
                        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                        value={adForm.duration} 
                        onChange={(e) => setAdForm({...adForm, duration: e.target.value})}
                      >
                        <option value="3 Hari (Weekend saja Jumat-Minggu)">3 Hari (Weekend saja Jumat-Minggu)</option>
                        <option value="7 Hari">7 Hari</option>
                        <option value="15 Hari">15 Hari</option>
                        <option value="30 Hari">30 Hari</option>
                        <option value="90 Hari">90 Hari</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adBenefits">Manfaat Paket (Pemisah per baris)</Label>
                      <Textarea 
                        id="adBenefits" 
                        rows={4} 
                        placeholder="Tampil di bagian promosi atas&#10;Logo lencana emas sponsor&#10;Prioritas tinggi pencarian" 
                        value={adForm.benefits} 
                        onChange={(e) => setAdForm({...adForm, benefits: e.target.value})}
                      />
                    </div>
                    <Button type="submit" disabled={isCreatingAd} className="w-full rounded-full bg-primary text-primary-foreground font-semibold">
                      {isCreatingAd ? "Membuat..." : "Buat Paket Iklan"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="banners" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Form Section */}
            <div className="lg:col-span-1">
              <Card id="banner-form-card" className="rounded-3xl border border-muted/50 bg-card shadow-sm sticky top-24">
                <CardHeader className="p-6 pb-4 border-b border-muted/20">
                  <CardTitle className="font-heading text-lg font-bold text-primary flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-blue-500" />
                    {editingBannerId ? "Sunting Iklan Slide" : "Tambah Iklan Baru"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {editingBannerId 
                      ? "Perbarui detail slide iklan yang telah Anda pilih." 
                      : "Buat spanduk promosi meluncur yang tampil memikat di beranda."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSaveBanner} className="space-y-4">
                    <div className="space-y-1.55">
                      <Label htmlFor="bannerTitle" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Judul Iklan Promo (Opsional)</Label>
                      <Input 
                        id="bannerTitle"
                        placeholder="Contoh: Diskon Flash Hari Raya! 🎉"
                        value={bannerForm.title}
                        onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                        className="rounded-xl h-10 border-muted"
                      />
                      <span className="text-[10px] text-muted-foreground block mt-0.5">Kosongkan jika poster spanduk Anda sudah memiliki tulisan di dalam gambar (Image Only).</span>
                    </div>

                    <div className="space-y-1.55">
                      <Label htmlFor="bannerDesc" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Deksripsi Utama</Label>
                      <Textarea 
                        id="bannerDesc"
                        rows={2}
                        placeholder="Masukkan detail penawaran menarik..."
                        value={bannerForm.description}
                        onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                        className="rounded-xl border-muted"
                      />
                    </div>

                    <div className="space-y-1.55">
                      <Label htmlFor="bannerLink" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">URL / Rute Tujuan (Toko/Kategori)</Label>
                      <Input 
                        id="bannerLink"
                        placeholder="Contoh: ?cat=Kado Wisuda atau #ads"
                        value={bannerForm.linkUrl}
                        onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                        className="rounded-xl h-10 border-muted"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="text-[10px] text-muted-foreground self-center">Pintas:</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 rounded-full px-2 text-[10px] bg-secondary/60 text-secondary-foreground hover:bg-secondary border border-transparent hover:border-muted-foreground/15"
                          onClick={() => setBannerForm({ ...bannerForm, linkUrl: "?cat=Buket Kawat Bulu" })}
                        >
                          Buket Kawat Bulu
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 rounded-full px-2 text-[10px] bg-secondary/60 text-secondary-foreground hover:bg-secondary border border-transparent hover:border-muted-foreground/15"
                          onClick={() => setBannerForm({ ...bannerForm, linkUrl: "?cat=Kado Wisuda" })}
                        >
                          Kado Wisuda
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 rounded-full px-2 text-[10px] bg-secondary/60 text-secondary-foreground hover:bg-secondary border border-transparent hover:border-muted-foreground/15"
                          onClick={() => setBannerForm({ ...bannerForm, linkUrl: "#ads" })}
                        >
                          Beli Paket Iklan
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.55">
                        <Label htmlFor="bannerOrder" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Urutan Tampil</Label>
                        <Input 
                          id="bannerOrder"
                          type="number"
                          placeholder="0"
                          value={bannerForm.order}
                          onChange={(e) => setBannerForm({ ...bannerForm, order: e.target.value })}
                          className="rounded-xl h-10 border-muted"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6 pl-2">
                        <input
                          id="bannerActive"
                          type="checkbox"
                          checked={bannerForm.isActive}
                          onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                        />
                        <Label htmlFor="bannerActive" className="text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer select-none">Aktif Sekarang</Label>
                      </div>
                    </div>

                    <div className="space-y-1.55">
                      <Label htmlFor="bannerOverlay" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Gaya Gradasi / Transparansi</Label>
                      <select
                        id="bannerOverlay"
                        value={bannerForm.overlayType || "dark-grad"}
                        onChange={(e) => setBannerForm({ ...bannerForm, overlayType: e.target.value })}
                        className="flex h-10 w-full rounded-xl border border-muted bg-background px-3 py-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="dark-grad">Gradasi Noir Gelap (Bawaan)</option>
                        <option value="solid-dark">Gelap Rata Sunyi (Tipis)</option>
                        <option value="solid-dark-heavy">Gelap Rata Pekat (Tebal)</option>
                        <option value="primary-grad">Gradasi Warna Brand (Violet Utama)</option>
                        <option value="sunset-grad">Gradasi Sunset Hangat (Saffron / Rose)</option>
                        <option value="ocean-grad">Gradasi Hutan Emerald (Teal / Hijau)</option>
                        <option value="transparent">🚫 Tanpa Gradasi (Transparan Murni)</option>
                      </select>
                    </div>

                    {/* Image Drag and Drop Upload Card */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Gambar Spanduk Banner</Label>
                      
                      {bannerForm.imageUrl ? (
                        <div className="relative group rounded-2xl overflow-hidden border border-muted aspect-[3/1] bg-secondary/35">
                          <img 
                            src={bannerForm.imageUrl} 
                            alt="Pratinjau Unggah" 
                            className="w-full h-full object-cover"
                            onError={(e: any) => {
                              e.target.src = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600&auto=format&fit=crop&q=80";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-250 gap-2">
                            <label className="bg-white/95 hover:bg-white text-foreground hover:scale-105 active:scale-95 text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer transition-all shadow-sm">
                              Ubah Gambar
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleImageFileChange}
                              />
                            </label>
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm" 
                              className="rounded-full h-7 text-xs font-bold hover:scale-105"
                              onClick={() => setBannerForm({ ...bannerForm, imageUrl: "" })}
                            >
                              Hapus
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="border-2 border-dashed border-muted hover:border-primary/50 transition-colors rounded-2xl p-6 text-center bg-secondary/15 flex flex-col items-center justify-center cursor-pointer min-h-[110px]"
                          onClick={() => document.getElementById("file-loader")?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            if (file) processImageFile(file);
                          }}
                        >
                          <ImageIcon className="h-6 w-6 text-muted-foreground mb-2 animate-bounce" />
                          <span className="text-xs font-semibold text-foreground">
                            {isUploading ? "Mengompres gambar..." : "Pilih atau Seret Gambar"}
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, WEBP (Max 10MB)</span>
                          <input 
                            id="file-loader"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageFileChange}
                            disabled={isUploading}
                          />
                        </div>
                      )}
                      
                      <div className="space-y-1 mt-1">
                        <span className="text-[10px] text-muted-foreground block leading-tight">Atau tempel tautan gambar online:</span>
                        <Input 
                          placeholder="https://images.unsplash.com/promo-banner.jpg..." 
                          value={bannerForm.imageUrl.startsWith("data:") ? "" : bannerForm.imageUrl}
                          onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                          className="rounded-xl h-8 text-[11px] border-muted"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        type="submit" 
                        disabled={isPromoFormLoading || isUploading} 
                        className="flex-1 rounded-full bg-primary text-primary-foreground font-semibold h-11"
                      >
                        {isPromoFormLoading ? "Menyimpan..." : (editingBannerId ? "Simpan Perubahan" : "Tambahkan Iklan")}
                      </Button>
                      
                      {editingBannerId && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="rounded-full px-4 h-11"
                          onClick={handleCancelEdit}
                        >
                          Batal
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* List Collection Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg font-bold text-primary">Daftar Banner Berjalan</h3>
                  <p className="text-xs text-muted-foreground">Spanduk meluncur yang saat ini tersimpan dalam sistem.</p>
                </div>
                
                {promoBanners.length === 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full text-xs font-semibold"
                    onClick={async () => {
                      await seedPromoBannersIfNeeded();
                      await loadPromoBanners();
                      toast.success("Contoh spanduk bawaan berhasil direstorasi!");
                    }}
                  >
                    Muat Contoh Banner
                  </Button>
                )}
              </div>

              {promoBanners.length === 0 ? (
                <Card className="rounded-3xl border border-dashed border-muted p-12 text-center bg-card">
                  <CardContent className="flex flex-col items-center justify-center p-0">
                    <div className="bg-secondary p-4 rounded-full text-muted-foreground mb-4">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-base font-bold">Belum Ada Spanduk Terunggah</CardTitle>
                    <CardDescription className="max-w-sm mx-auto mt-2 text-xs">
                      Spanduk penawaran Anda kosong. Silakan gunakan formulir di samping untuk menambahkan iklan promosi baru, atau restorasi contoh spanduk bawaan.
                    </CardDescription>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-1">
                  {promoBanners.map((banner: any, idx) => (
                    <Card key={banner.id} className="rounded-2xl border border-muted/50 overflow-hidden bg-card hover:shadow-md transition-all">
                      <div className="grid md:grid-cols-12 gap-0">
                        {/* Thumbnail View */}
                        <div className="md:col-span-4 relative h-32 md:h-full min-h-[105px] overflow-hidden bg-secondary/10 border-r border-muted/20">
                          <img 
                            src={banner.imageUrl} 
                            alt={banner.title} 
                            className="w-full h-full object-cover"
                            onError={(e: any) => {
                              e.target.src = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600&auto=format&fit=crop&q=80";
                            }}
                          />
                          <div className="absolute top-2 left-2 z-10 flex gap-1">
                            <Badge className="bg-black/70 border-none text-white text-[10px] rounded-md font-bold">
                              # {idx + 1}
                            </Badge>
                            <Badge className="bg-sky-650 border-none text-white text-[10px] rounded-md font-bold">
                              Prioritas: {banner.order}
                            </Badge>
                          </div>
                        </div>

                        {/* Details View */}
                        <div className="md:col-span-8 p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-heading font-extrabold text-base text-foreground flex items-center gap-1.5">
                                {banner.title || <span className="text-muted-foreground font-normal italic text-xs">Tanpa Judul (Hanya Gambar/Deskripsi)</span>}
                              </h4>
                              <span 
                                onClick={() => handleToggleBannerActive(banner.id, banner.isActive, banner.title || "Tanpa Judul")}
                                className={`cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border select-none transition-all ${
                                  banner.isActive !== false 
                                    ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                                    : "bg-red-50 text-red-650 border-red-200 hover:bg-red-100"
                                }`}
                              >
                                {banner.isActive !== false ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                {banner.isActive !== false ? "AKTIF" : "NONAKTIF"}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                              {banner.description || "Tidak ada deskripsi spanduk."}
                            </p>
                            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                              {banner.linkUrl ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Rute Link:</span>
                                  <code className="text-[10px] bg-secondary/80 px-2 py-0.5 rounded-md font-semibold text-primary">
                                    {banner.linkUrl}
                                  </code>
                                </div>
                              ) : (
                                <span className="text-[10px] font-semibold text-muted-foreground italic">Tidak ada link rute</span>
                              )}
                              
                              <div className="flex items-center gap-1.5 bg-blue-50/70 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-105">
                                <span className="text-[9px] font-extrabold uppercase tracking-wider">Overlay:</span>
                                <span className="text-[9px] font-bold">
                                  {banner.overlayType === "none" || banner.overlayType === "transparent"
                                    ? "🚫 Transparan"
                                    : banner.overlayType === "solid-dark"
                                    ? "Gelap Tipis"
                                    : banner.overlayType === "solid-dark-heavy"
                                    ? "Gelap Tentu"
                                    : banner.overlayType === "primary-grad"
                                    ? "Violet Brand"
                                    : banner.overlayType === "sunset-grad"
                                    ? "Saffron Sunset"
                                    : banner.overlayType === "ocean-grad"
                                    ? "Hutan Tosca"
                                    : "Noir Gelap (Bawaan)"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 border-t border-muted/20 pt-3 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-full text-xs font-semibold h-8"
                              onClick={() => handleEditBannerClick(banner)}
                            >
                              Sunting
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="rounded-full text-xs font-bold h-8 text-white"
                              onClick={() => handleDeleteBannerClick(banner.id, banner.title || "Tanpa Judul")}
                            >
                              Hapus
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="webProfile" className="mt-6">
          <Card className="rounded-3xl border border-muted/35 bg-card shadow-sm overflow-hidden">
            <CardHeader className="border-b border-muted/25 bg-secondary/15 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-heading text-xl font-bold text-primary flex items-center gap-2">
                    <Globe className="h-5 w-5 text-purple-500 animate-pulse" />
                    Profil Web & Pengaturan Umum
                  </CardTitle>
                  <CardDescription>
                    Perbarui identitas, kontak pelayanan, dan pesan promosi resmi di seluruh halaman website secara langsung.
                  </CardDescription>
                </div>
                <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-100 py-1 px-3.5 border border-purple-200 rounded-full h-fit w-fit font-bold text-xs">
                  Sistem O2O Terintegrasi
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSaveWebConfig} className="space-y-8">
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="webBrandName" className="text-sm font-semibold text-primary flex items-center gap-1.5">
                        Nama Aplikasi / Brand Web
                      </Label>
                      <Input
                        id="webBrandName"
                        value={webConfig.brandName}
                        onChange={(e) => setWebConfig({ ...webConfig, brandName: e.target.value })}
                        placeholder="Contoh: TitikKembang"
                        className="rounded-xl border border-muted/50 bg-[#FCFDFD] px-4 py-3 text-sm focus:border-purple-500"
                        required
                      />
                      <p className="text-[11px] text-muted-foreground">Digunakan sebagai nama utama di header, footer, dan menu brand.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="webSlogan" className="text-sm font-semibold text-primary">
                        Slogan / Tagline Utama
                      </Label>
                      <Input
                        id="webSlogan"
                        value={webConfig.slogan}
                        onChange={(e) => setWebConfig({ ...webConfig, slogan: e.target.value })}
                        placeholder="Contoh: Portal Buket & Kerajinan Kawat Bulu"
                        className="rounded-xl border border-muted/50 bg-[#FCFDFD] px-4 py-3 text-sm"
                        required
                      />
                      <p className="text-[11px] text-muted-foreground">Teks pembuka berkarakter elegan yang tampil pada jumbotron / intro web.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="webCsPhone" className="text-sm font-semibold text-primary flex items-center gap-1.5">
                          <Smartphone className="h-4 w-4 text-green-500" /> WhatsApp CS Pusat
                        </Label>
                        <Input
                          id="webCsPhone"
                          value={webConfig.csPhone}
                          onChange={(e) => setWebConfig({ ...webConfig, csPhone: e.target.value })}
                          placeholder="Mulai dengan 62 (Contoh: 628212345678)"
                          className="rounded-xl border border-muted/50 bg-[#FCFDFD] px-4 py-3 text-sm font-mono"
                          required
                        />
                        <p className="text-[11px] text-muted-foreground">Penerima obrolan bantuan utama untuk tombol Customer Service pusat.</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="webEmailVisible" className="text-sm font-semibold text-primary">
                          Email Info Terbuka
                        </Label>
                        <Input
                          id="webEmailVisible"
                          type="email"
                          value={webConfig.emailVisible}
                          onChange={(e) => setWebConfig({ ...webConfig, emailVisible: e.target.value })}
                          placeholder="support@titikkembang.com"
                          className="rounded-xl border border-muted/50 bg-[#FCFDFD] px-4 py-3 text-sm font-mono"
                        />
                        <p className="text-[11px] text-muted-foreground">Surel resmi yang dipajang di bagian footer bawah web.</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="webRunningText" className="text-sm font-semibold text-[#1F2937] flex items-center gap-1.5">
                        Teks Berjalan Pengumuman (Header Banner)
                      </Label>
                      <Textarea
                        id="webRunningText"
                        value={webConfig.runningText}
                        onChange={(e) => setWebConfig({ ...webConfig, runningText: e.target.value })}
                        placeholder="Masukkan teks pemberitahuan / promosi di bagian paling atas..."
                        className="rounded-xl border border-muted/50 bg-[#FCFDFD] px-4 py-3 text-sm resize-none h-20 leading-relaxed"
                      />
                      <p className="text-[11px] text-muted-foreground">Teks bergulir (marquee) di jembatan banner teratas situs web Anda.</p>
                    </div>

                    {/* DYNAMIC LOGO BRAND SETTINGS FORM BLOCK */}
                    <div className="p-5 rounded-2xl bg-secondary/10 border border-muted/20 space-y-4">
                      <div className="flex items-center justify-between border-b border-muted/20 pb-3">
                        <Label className="text-sm font-bold text-primary flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-purple-600 animate-pulse" />
                          Pengaturan Logo Utama Website
                        </Label>
                        <Badge className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 border-none rounded-full">
                          Kustomisasi Tampilan
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3" id="logo-type-radio-group">
                        <button
                          type="button"
                          onClick={() => setWebConfig({ ...webConfig, logoType: "default" })}
                          className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                            webConfig.logoType === "default" || !webConfig.logoType
                              ? "bg-purple-650 text-white border-purple-850 shadow-sm font-bold"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          🍃 Logo Icon Default (SVG)
                        </button>
                        <button
                          type="button"
                          onClick={() => setWebConfig({ ...webConfig, logoType: "custom_url" })}
                          className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                            webConfig.logoType === "custom_url"
                              ? "bg-purple-650 text-white border-purple-850 shadow-sm font-bold"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          🖼️ Logo Gambar (URL)
                        </button>
                      </div>

                      {webConfig.logoType === "custom_url" ? (
                        <div className="space-y-4 animate-fade-in" id="custom-logo-file-and-url-container">
                          {/* DRAG AND DROP FILE UPLOADER */}
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                              📂 Upload File Logo Baru
                            </Label>
                            
                            <div
                              className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                                isLogoDragging
                                  ? "border-purple-600 bg-purple-55/10"
                                  : "border-muted/60 bg-[#FCFDFD] hover:border-purple-400 hover:bg-slate-50/50"
                              }`}
                              onDragOver={(e) => {
                                e.preventDefault();
                                setIsLogoDragging(true);
                              }}
                              onDragLeave={() => setIsLogoDragging(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsLogoDragging(false);
                                if (e.dataTransfer.files?.length) {
                                  handleLogoFileChange(e.dataTransfer.files[0]);
                                }
                              }}
                              onClick={() => document.getElementById("logo-file-element-picker")?.click()}
                              id="logo-drag-drop-zone"
                            >
                              <input
                                id="logo-file-element-picker"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.length) {
                                    handleLogoFileChange(e.target.files[0]);
                                  }
                                }}
                              />
                              
                              {webConfig.logoUrl && webConfig.logoUrl.startsWith("data:") ? (
                                <div className="relative flex flex-col items-center gap-2">
                                  <div className="h-14 w-14 rounded-xl border border-muted bg-white shadow-sm overflow-hidden relative group">
                                    <img 
                                      src={webConfig.logoUrl} 
                                      alt="Pratinjau Logo" 
                                      className="h-full w-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[11px] font-bold text-green-650 flex items-center justify-center gap-1">
                                      ✨ Berhasil Memuat File Gambar
                                    </p>
                                    <p className="text-[9px] text-muted-foreground mt-0.5">
                                      Klik area ini untuk mengganti dengan file lain
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setWebConfig({ ...webConfig, logoUrl: "" });
                                      toast.info("Logo gambar direset.");
                                    }}
                                    className="absolute -top-1 -right-1 bg-red-100 text-red-700 hover:bg-red-200 p-1 rounded-full border border-red-200 transition-colors"
                                    title="Hapus Logo"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm">
                                    <Upload className="h-5 w-5" />
                                  </div>
                                  <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-gray-800">
                                      Tarik & Lepas File Gambar atau <span className="text-purple-600 underline">Pilih File</span>
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      Format PNG, JPEG, SVG, WebP (Rasio ideal 1:1, maks 2MB)
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* TEXT URL FALLBACK SLURRY */}
                          <div className="space-y-2 border-t border-muted/20 pt-3">
                            <Label htmlFor="webLogoUrl" className="text-xs font-semibold text-gray-750 flex items-center justify-between">
                              <span>Atau Masukkan Tautan (URL) Gambar Logo</span>
                              {webConfig.logoUrl && !webConfig.logoUrl.startsWith("data:") && (
                                <span className="text-[10px] text-emerald-600 font-bold">✨ Menggunakan Tautan Eksternal</span>
                              )}
                            </Label>
                            <Input
                              id="webLogoUrl"
                              value={webConfig.logoUrl || ""}
                              onChange={(e) => setWebConfig({ ...webConfig, logoUrl: e.target.value })}
                              placeholder="Contoh: https://i.imgur.com/example.png"
                              className="rounded-xl border border-muted/50 bg-[#FCFDFD] px-3.5 py-2.5 text-xs font-mono focus:border-purple-500"
                            />
                            <p className="text-[9px] text-muted-foreground leading-relaxed">
                              Gunakan opsi ini jika ingin memposting gambar logo yang dihost pada layanan penyimpanan cloud atau CDN eksternal.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 animate-fade-in" id="svg-color-pickers-container">
                          <div className="space-y-2">
                            <Label htmlFor="webLogoBgColor" className="text-xs font-semibold text-gray-750">
                              Latar Logo (HEX)
                            </Label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                id="webLogoBgColorPicker"
                                value={webConfig.logoBgColor || "#1E3E2A"}
                                onChange={(e) => setWebConfig({ ...webConfig, logoBgColor: e.target.value })}
                                className="h-9 w-9 p-0.5 rounded-lg border border-gray-200 cursor-pointer shrink-0"
                              />
                              <Input
                                id="webLogoBgColor"
                                value={webConfig.logoBgColor || "#1E3E2A"}
                                onChange={(e) => setWebConfig({ ...webConfig, logoBgColor: e.target.value })}
                                placeholder="#1E3E2A"
                                className="rounded-xl border border-muted/50 bg-[#FCFDFD] px-3 py-2 text-xs font-mono"
                                maxLength={7}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="webLogoTextColor" className="text-xs font-semibold text-gray-755">
                              Warna Icon (HEX)
                            </Label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                id="webLogoTextColorPicker"
                                value={webConfig.logoTextColor || "#E8F2EC"}
                                onChange={(e) => setWebConfig({ ...webConfig, logoTextColor: e.target.value })}
                                className="h-9 w-9 p-0.5 rounded-lg border border-gray-200 cursor-pointer shrink-0"
                              />
                              <Input
                                id="webLogoTextColor"
                                value={webConfig.logoTextColor || "#E8F2EC"}
                                onChange={(e) => setWebConfig({ ...webConfig, logoTextColor: e.target.value })}
                                placeholder="#E8F2EC"
                                className="rounded-xl border border-muted/50 bg-[#FCFDFD] px-3 py-2 text-xs font-mono"
                                maxLength={7}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="webPromoText" className="text-sm font-semibold text-primary">
                          Promo Badge Utama (Diskon / Gratis Ongkir)
                        </Label>
                        <Input
                          id="webPromoText"
                          value={webConfig.promoText}
                          onChange={(e) => setWebConfig({ ...webConfig, promoText: e.target.value })}
                          placeholder="Contoh: Diskon Hingga 15%!"
                          className="rounded-xl border border-muted/50 bg-[#FCFDFD] px-4 py-3 text-sm"
                        />
                        <p className="text-[11px] text-muted-foreground">Slogan diskon kecil yang terpajang di sudut visual promosi.</p>
                      </div>

                      <div className="space-y-3 flex flex-col justify-end pb-1.5">
                        <div className="flex items-center space-x-3 bg-red-50/20 border border-red-100/40 px-3 py-2 rounded-xl">
                          <input
                            type="checkbox"
                            id="webIsMaintenance"
                            checked={!!webConfig.isMaintenance}
                            onChange={(e) => setWebConfig({ ...webConfig, isMaintenance: e.target.checked })}
                            className="h-4.5 w-4.5 rounded text-red-650 focus:ring-red-500 border-red-300"
                          />
                          <div>
                            <Label htmlFor="webIsMaintenance" className="text-xs font-bold text-[#DC2626] cursor-pointer flex items-center gap-1">
                              ⚠️ Modus Pemeliharaan Web
                            </Label>
                            <p className="text-[10px] text-muted-foreground">Mengunci sementara web dalam halaman under-construction.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* QRIS PAYMENT CONFIGURATION */}
                    <div className="border-t border-muted/50 pt-6 space-y-4">
                      <div>
                        <h4 className="text-sm font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                          <QrCode className="h-4 w-4 text-rose-600 animate-bounce" />
                          Pengaturan QRIS Pembayaran Resmi
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Konfigurasikan Merchant Name, NMID, dan unggah berkas QR Code QRIS Anda sendiri yang bisa discan pelanggan untuk membayar iklan & lencana premium.
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="qrisMerchantName" className="text-xs font-semibold text-primary">
                            Nama Merchant QRIS
                          </Label>
                          <Input
                            id="qrisMerchantName"
                            value={webConfig.qrisMerchantName || ""}
                            onChange={(e) => setWebConfig({ ...webConfig, qrisMerchantName: e.target.value })}
                            placeholder="Contoh: cosmics.co"
                            className="rounded-xl border border-muted/50 bg-[#FCFDFD] px-4 py-2.5 text-xs focus:border-rose-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="qrisNmid" className="text-xs font-semibold text-primary">
                            NMID Resmi QRIS
                          </Label>
                          <Input
                            id="qrisNmid"
                            value={webConfig.qrisNmid || ""}
                            onChange={(e) => setWebConfig({ ...webConfig, qrisNmid: e.target.value })}
                            placeholder="Contoh: ID1022232744543"
                            className="rounded-xl border border-muted/50 bg-[#FCFDFD] px-4 py-2.5 text-xs font-mono focus:border-rose-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-primary block">
                          File / Gambar QR Code QRIS Asli (Bisa Di-scan)
                        </Label>
                        <div 
                          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 ${
                            isQrisDragging 
                              ? "border-rose-500 bg-rose-50/10" 
                              : "border-muted-foreground/20 hover:border-rose-500 hover:bg-rose-50/5"
                          }`}
                          onDragOver={(e) => { e.preventDefault(); setIsQrisDragging(true); }}
                          onDragLeave={() => setIsQrisDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsQrisDragging(false);
                            if (e.dataTransfer.files?.[0]) handleQrisFileChange(e.dataTransfer.files[0]);
                          }}
                          onClick={() => document.getElementById("qris-file-input")?.click()}
                        >
                          <input 
                            id="qris-file-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleQrisFileChange(e.target.files[0]);
                            }}
                          />
                          {webConfig.qrisImageUrl ? (
                            <div className="space-y-2 flex flex-col items-center">
                              <div className="relative group overflow-hidden rounded-lg border bg-white p-1">
                                <img 
                                  src={webConfig.qrisImageUrl} 
                                  alt="QRIS QR Code" 
                                  className="h-32 w-32 object-contain rounded"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                                  <span className="text-[10px] text-white font-bold">Ganti Gambar</span>
                                </div>
                              </div>
                              <p className="text-[10px] text-emerald-650 font-bold flex items-center justify-center gap-1">
                                <span>✓ QR Code Aktif Terunggah</span>
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setWebConfig({ ...webConfig, qrisImageUrl: "" });
                                  toast.info("Gambar QR Code QRIS dihapus. Sistem kembali menampilkan gambar default.");
                                }}
                                className="h-7 text-[10px] text-red-650 rounded-full border-red-100 hover:bg-red-50"
                              >
                                Hapus QR Code
                              </Button>
                            </div>
                          ) : (
                            <div className="py-2 space-y-1">
                              <Upload className="h-6 w-6 text-muted-foreground mx-auto animate-pulse" />
                              <p className="text-xs font-bold text-gray-700">
                                Seret & letakkan gambar QR atau <span className="text-rose-600 hover:underline">pilih file</span>
                              </p>
                              <p className="text-[10px] text-muted-foreground">Mendukung file gambar PNG/JPEG/WEBP (Maks 2MB)</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full rounded-xl bg-purple-600 font-bold text-sm text-white px-6 py-3.5 hover:bg-purple-700 shadow-md hover:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      disabled={isSavingWebConfig}
                    >
                      {isSavingWebConfig ? (
                        <>
                          <RotateCw className="h-4 w-4 animate-spin" />
                          Menyimpan Profil Web...
                        </>
                      ) : (
                        "Simpan Perubahan Pengaturan Web"
                      )}
                    </Button>
                  </div>

                  {/* Right Side: LIVE MOCKUP PREVIEW */}
                  <div className="lg:border-l lg:border-muted/30 lg:pl-8 space-y-6">
                    <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-purple-600" />
                      Visual Jumbotron & Header (Simulasi Live Preview)
                    </h4>
                    
                    <div className="rounded-2xl border border-muted/50 bg-[#F4F6F4] p-4 shadow-inner space-y-4">
                      {/* 1. Header Marquee Simulator */}
                      <div className="bg-[#1E3E2A] text-white text-[9px] py-1.5 px-3 overflow-hidden whitespace-nowrap rounded-lg relative font-sans flex items-center">
                        <span className="font-semibold block truncate">
                          📣 {webConfig.runningText || "Masukan teks berjalan pengumuman disini..."}
                        </span>
                      </div>

                      {/* 2. Web Header Navbar Mockup */}
                      <div className="bg-white rounded-xl py-3 px-4 flex items-center justify-between border border-muted/30 shadow-sm">
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold overflow-hidden transition-all duration-200 shadow-sm"
                            style={{ 
                              backgroundColor: webConfig?.logoType === "custom_url" && webConfig?.logoUrl ? "transparent" : (webConfig?.logoBgColor || "#1E3E2A"),
                              color: webConfig?.logoTextColor || "#E8F2EC"
                            }}
                          >
                            {webConfig?.logoType === "custom_url" && webConfig?.logoUrl ? (
                              <img 
                                src={webConfig.logoUrl} 
                                alt="Logo" 
                                className="h-full w-full object-cover rounded-lg" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span>🌸</span>
                            )}
                          </div>
                          <span className="font-heading text-xs font-extrabold text-gray-800">
                            {webConfig.brandName || "TitikKembang"}
                          </span>
                        </div>
                        <div className="flex gap-2 text-[9px] text-muted-foreground font-semibold">
                          <span>Produk</span>
                          <span>Mitra</span>
                          <span className="text-purple-600">Kontak Cs</span>
                        </div>
                      </div>

                      {/* 3. Hero / Jumbotron Section Mockup */}
                      <div className="bg-gradient-to-br from-[#1E3E2A] to-emerald-950 text-white rounded-2xl p-6 relative overflow-hidden shadow-md">
                        {/* Abstract flower bubble shape */}
                        <div className="absolute right-[-10px] top-[-10px] h-20 w-20 rounded-full bg-white/10 blur-xl"></div>
                        <div className="absolute left-[-20px] bottom-[-20px] h-28 w-28 rounded-full bg-white/5 blur-2xl"></div>

                        {webConfig.promoText && (
                          <Badge className="bg-orange-500 hover:bg-orange-500 text-white rounded-full text-[8px] font-bold px-2 py-0.5 border-none inline-block mb-2">
                            ✨ {webConfig.promoText}
                          </Badge>
                        )}
                        <h1 className="text-sm md:text-base font-extrabold leading-tight">
                          Selamat Datang di {webConfig.brandName || "TitikKembang"} 🌸
                        </h1>
                        <p className="text-[10px] text-emerald-100/90 mt-1.5 leading-relaxed font-sans max-w-xs">
                          {webConfig.slogan || "Tagline websitemu akan dipajang megah di sini sebagai intro selamat datang bagi pembeli."}
                        </p>
                        
                        <div className="flex gap-1.5 items-center mt-4">
                          <div className="bg-[#E8F2EC] text-[#1E3E2A] text-[9px] font-extrabold px-3 py-1 rounded-full cursor-pointer hover:bg-white transition-colors">
                            Belanja Sekarang
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm text-white border border-white/20 text-[9px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Smartphone className="h-2.5 w-2.5 text-green-400" />
                            CS Center
                          </div>
                        </div>
                      </div>

                      {/* 4. Contact Footer Info */}
                      <div className="bg-white/80 rounded-xl p-3 border border-muted/20 text-[9px] text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Layanan WhatsApp:</span>
                          <span className="font-mono font-bold text-gray-700">+{webConfig.csPhone || "628xxx"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hubungi Surel:</span>
                          <span className="font-mono text-gray-700">{webConfig.emailVisible || "support@web.com"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status Pemeliharaan:</span>
                          <span className={`font-bold ${webConfig.isMaintenance ? "text-[#DC2626]" : "text-green-650"}`}>
                            {webConfig.isMaintenance ? "🔴 PEMELIHARAAN AKTIF" : "🟢 NORMAL (TAMPIL)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <Card className="rounded-3xl border border-red-100 bg-red-50/5 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-red-100 bg-red-50/10 p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-red-100 p-3 text-red-600">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <CardTitle className="text-red-700 font-heading text-xl">Danger Zone (Pengaturan Sistem)</CardTitle>
                  <CardDescription className="text-red-600/85 mt-1">
                    Hapus semua data pendaftaran akun pembeli, akun penjual (florist), produk custom, dan riwayat transaksi.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6 bg-card">
              <div className="rounded-2xl bg-background border border-red-100/50 p-5 space-y-4">
                <div className="flex items-start justify-between flex-col md:flex-row gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-red-500" /> Hapus Seluruh Data Pendaftaran
                    </h4>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                      Menghapus semua profiles pengguna di Firestore yang telah terdaftar atau yang pernah membuat akun baru, menghapus semua produk buatan pengguna, serta mengosongkan semua riwayat order. Setelah dibersihkan, database sistem akan di-inisialisasi ulang (di-reset) ke menu dan toko original bawaan.
                    </p>
                  </div>
                  
                  <div className="min-w-[220px] self-end md:self-center flex justify-end">
                    {!isConfirmingClear ? (
                      <Button 
                        variant="destructive" 
                        className="rounded-full font-semibold px-6 w-full shadow-lg shadow-red-500/10 hover:shadow-none"
                        onClick={() => setIsConfirmingClear(true)}
                      >
                        Hapus Semua Data Akun
                      </Button>
                    ) : (
                      <div className="flex flex-col items-end gap-2 w-full p-3 bg-red-50/50 rounded-xl border border-red-100">
                        <p className="text-xs text-red-600 font-bold">Apakah Anda benar-benar yakin?</p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="rounded-full px-4 h-9 text-xs"
                            onClick={() => setIsConfirmingClear(false)}
                            disabled={isClearing}
                          >
                            Batal
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="rounded-full px-5 h-9 text-xs font-semibold bg-red-600 hover:bg-red-700 shadow-sm"
                            disabled={isClearing}
                            onClick={handleClearAllData}
                          >
                            {isClearing ? "Menghapus..." : "Ya, Hapus!"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
          </div> {/* Closing col-span-12 lg:col-span-9 space-y-6 */}
        </div> {/* Closing grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative */}
      </Tabs>

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

      {/* ZOOM MODAL FOR PAYMENTS PROOF */}
      <Dialog open={!!selectedProofImage} onOpenChange={(open) => { if (!open) setSelectedProofImage(""); }}>
        <DialogContent className="max-w-xl rounded-3xl p-6 bg-white border shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black">Bukti Screenshot Pembayaran QRIS</DialogTitle>
            <DialogDescription className="text-xs">
              Silakan verifikasi keabsahan nominal dan rincian transaksi sebelum menyetujui pengajuan.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-center items-center overflow-hidden rounded-2xl border bg-neutral-900 p-2">
            <img src={selectedProofImage} alt="Bukti Transfer QRIS" className="max-h-[70vh] object-contain rounded-xl" referrerPolicy="no-referrer" />
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => setSelectedProofImage("")} className="rounded-full font-bold text-xs px-5 bg-primary">
              Tutup Rincian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REJECTION REASON DIALOG */}
      <Dialog open={!!rejectingPaymentId} onOpenChange={(open) => { if (!open) setRejectingPaymentId(""); }}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white border shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-red-650">Tolak Bukti Pembayaran QRIS</DialogTitle>
            <DialogDescription className="text-xs">
              Berikan alasan penolakan yang jelas agar pemilik toko dapat mengetahuinya dan mengunggah ulang bukti bayar yang valid.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-2">
            <Label className="text-xs font-bold uppercase text-foreground">Alasan Penolakan</Label>
            <Textarea
              placeholder="Contoh: Bukti transfer tidak terbaca / buram, atau nominal kurang dari tarif paket."
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              className="rounded-xl border text-xs min-h-[100px]"
            />
          </div>
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setRejectingPaymentId("")} className="rounded-full font-bold text-xs">
              Batal
            </Button>
            <Button onClick={handleRejectPremiumPayment} className="rounded-full font-bold text-xs bg-red-600 hover:bg-red-700 text-white">
              Kirim Penolakan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
