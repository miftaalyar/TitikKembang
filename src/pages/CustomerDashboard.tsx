import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  ShoppingBag, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Upload, 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight, 
  ExternalLink,
  BookOpen,
  Camera,
  Heart,
  Loader2,
  Star,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { auth, db } from "@/src/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { getUserProfile, updateUserProfile, fetchBuyerOrders, fetchStores, submitReview } from "@/src/lib/dataService";
import { toast } from "sonner";
import TrackingStepper from "@/src/components/TrackingStepper";

// High-fidelity helper to compress base64 image uploads
function compressAndResizeImage(file: File, maxW = 400, maxH = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Force maximum dimension cap to prevent massive image generation
        const actualMaxW = Math.min(maxW, 600);
        const actualMaxH = Math.min(maxH, 600);

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

const PRESET_EMOJIS = ["🌸", "🧸", "🎁", "🎀", "🌷", "✨", "🎈", "🍫", "💖", "💐", "🐱", "🐼", "💫"];

interface CustomerDashboardProps {
  onBackToCatalog?: () => void;
}

export default function CustomerDashboard({ onBackToCatalog }: CustomerDashboardProps) {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [allStores, setAllStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [buyerOrderTab, setBuyerOrderTab] = useState<"tracking" | "history">("tracking");

  // Rating & Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewImage, setReviewImage] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewReminderModal, setShowReviewReminderModal] = useState(false);
  const [unreviewedOrdersList, setUnreviewedOrdersList] = useState<any[]>([]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForReview || !profile) return;
    setIsSubmittingReview(true);
    
    try {
      await submitReview({
        orderId: selectedOrderForReview.id,
        customerId: auth.currentUser?.uid || "",
        customerName: profile.name || "Pembeli",
        storeId: selectedOrderForReview.storeId,
        rating: reviewRating,
        comment: reviewComment,
        imageUrl: reviewImage || undefined
      });

      // Update order state locally & in firebase to mark reviewed
      const orderRef = doc(db, "orders", selectedOrderForReview.id);
      await updateDoc(orderRef, { hasReviewed: true });
      
      // Update local orders list state
      setOrders(prev => prev.map(o => o.id === selectedOrderForReview.id ? { ...o, hasReviewed: true } : o));
      // Remove from unreviewed reminder list as well
      setUnreviewedOrdersList(prev => prev.filter(o => o.id !== selectedOrderForReview.id));
      
      toast.success("Terima kasih! Ulasan & rating Anda telah dikirim dan sangat berharga bagi mitra florist.");
      setShowReviewModal(false);
      setReviewComment("");
      setReviewRating(5);
      setReviewImage("");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengirimkan ulasan.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Edit fields
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editAvatarLogo, setEditAvatarLogo] = useState("🌸");

  useEffect(() => {
    loadProfileAndData();
  }, []);

  // State to track manual/auto background order updates
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);

  // Manual/Auto Refresh orders from Firestore
  async function handleRefreshOrders(showToast = false) {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    if (showToast) setIsRefreshingOrders(true);
    try {
      const fetchedOrders = await fetchBuyerOrders(currentUser.uid);
      const sorted = fetchedOrders.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.createdAt || 0).getTime() / 1000;
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.createdAt || 0).getTime() / 1000;
        return timeB - timeA;
      });
      setOrders(sorted);
      const cacheOrdersKey = `cached-customer-orders-${currentUser.uid}`;
      localStorage.setItem(cacheOrdersKey, JSON.stringify(sorted));
      
      const unreviewed = fetchedOrders.filter((ord: any) => 
        (ord.status === "Pesanan Selesai" || ord.status === "Selesai") && !ord.hasReviewed
      );
      setUnreviewedOrdersList(unreviewed);
      if (showToast) {
        toast.success("Pelacakan pesanan berhasil diperbarui secara manual! 🔄");
      }
    } catch (err) {
      console.error("Gagal memperbarui data pesanan:", err);
      if (showToast) {
        toast.error("Gagal memperbarui pelacakan pesanan.");
      }
    } finally {
      if (showToast) setIsRefreshingOrders(false);
    }
  }

  // Automatic live update interval (runs every 15 seconds for active order tracking)
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const interval = setInterval(() => {
      handleRefreshOrders(false);
    }, 15000); // 15 seconds interval for ultra-live experience

    return () => clearInterval(interval);
  }, []);

  async function loadProfileAndData() {
    setLoading(true);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Load cached customer profile and data instantly
    const cacheProfileKey = `cached-customer-profile-${currentUser.uid}`;
    const cacheOrdersKey = `cached-customer-orders-${currentUser.uid}`;
    try {
      const cachedProfile = localStorage.getItem(cacheProfileKey);
      const cachedOrders = localStorage.getItem(cacheOrdersKey);
      
      if (cachedProfile) {
        const parsedProfile = JSON.parse(cachedProfile);
        setProfile(parsedProfile);
        setEditName(parsedProfile.name);
        setEditPhone(parsedProfile.phone || "");
        setEditAddress(parsedProfile.address || "");
        setEditBio(parsedProfile.bio || "");
        setEditAvatarUrl(parsedProfile.avatarUrl || "");
        setEditAvatarLogo(parsedProfile.avatarLogo || "🌸");
        setLoading(false); // Can bypass absolute block early
      }
      if (cachedOrders) {
        setOrders(JSON.parse(cachedOrders));
      }
    } catch (err) {
      console.warn("Could not read cached customer profile:", err);
    }

    try {
      const [fetchedProfile, fetchedOrders, fetchedStores] = await Promise.all([
        getUserProfile(currentUser.uid),
        fetchBuyerOrders(currentUser.uid),
        fetchStores()
      ]);

      const mergedProfile = {
        name: fetchedProfile?.name || currentUser.displayName || "Pembeli",
        email: fetchedProfile?.email || currentUser.email || "",
        phone: fetchedProfile?.phone || "",
        address: fetchedProfile?.address || "",
        bio: fetchedProfile?.bio || "Pecinta kreasi buket bunga kawat bulu & crafter lokal estetik.",
        avatarUrl: fetchedProfile?.avatarUrl || "",
        avatarLogo: fetchedProfile?.avatarLogo || "🌸",
        createdAt: fetchedProfile?.createdAt || new Date().toISOString()
      };

      setProfile(mergedProfile);
      localStorage.setItem(cacheProfileKey, JSON.stringify(mergedProfile));

      const sorted = fetchedOrders.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.createdAt || 0).getTime() / 1000;
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.createdAt || 0).getTime() / 1000;
        return timeB - timeA;
      });
      setOrders(sorted);
      localStorage.setItem(cacheOrdersKey, JSON.stringify(sorted));

      setAllStores(fetchedStores);

      // Find all completed orders that haven't been reviewed yet
      const unreviewed = fetchedOrders.filter((ord: any) => 
        (ord.status === "Pesanan Selesai" || ord.status === "Selesai") && !ord.hasReviewed
      );
      setUnreviewedOrdersList(unreviewed);
      if (unreviewed.length > 0) {
        // Open the reminder modal slightly after loading completes so it is smooth
        setTimeout(() => {
          setShowReviewReminderModal(true);
        }, 600);
      }

      // Initialize Edit values
      setEditName(mergedProfile.name);
      setEditPhone(mergedProfile.phone);
      setEditAddress(mergedProfile.address);
      setEditBio(mergedProfile.bio);
      setEditAvatarUrl(mergedProfile.avatarUrl);
      setEditAvatarLogo(mergedProfile.avatarLogo);

    } catch (e) {
      console.error("Gagal menyinkronkan data profil pembeli:", e);
      toast.error("Gagal sinkronisasi data dari Cloud Firestore.");
    } finally {
      setLoading(false);
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setSaving(true);
    try {
      const payload = {
        name: editName,
        phone: editPhone,
        address: editAddress,
        bio: editBio,
        avatarUrl: editAvatarUrl,
        avatarLogo: editAvatarLogo,
      };

      await updateUserProfile(currentUser.uid, payload);
      setProfile({ ...profile, ...payload });
      setIsEditing(false);
      toast.success("Profil Pembeli berhasil diperbarui secara permanen! ✨");
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal menyimpan profil: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Mengompresi & mengunggah foto profil baru... 🌸");
    try {
      const base64 = await compressAndResizeImage(file, 300, 300);
      setEditAvatarUrl(base64);
      setEditAvatarLogo(""); // Clear logo emoji since image is placed
      toast.success("Foto profil dimuat dengan presisi! 🎨", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal memuat gambar: " + err.message, { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Memuat Dashboard Profil Pembeli...</p>
      </div>
    );
  }

  const registeredDate = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }) : "Baru-baru ini";

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-6 animate-fade-in" id="buyer-dashboard-wrapper">
      {/* Back button row */}
      {onBackToCatalog && (
        <div className="flex items-center justify-between bg-white text-gray-800 px-4 py-2.5 rounded-2xl border border-rose-100 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToCatalog}
            className="text-primary hover:text-[#152e1f] hover:bg-rose-50/40 rounded-full text-xs font-bold flex items-center gap-2 px-3 shadow-none h-9 transition-colors"
          >
            <span className="text-sm font-semibold">←</span> Kembali ke Katalog Utama
          </Button>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-muted-foreground font-mono font-bold tracking-wider uppercase hidden sm:inline">TitikKembang O2O</span>
          </div>
        </div>
      )}

      {/* Decorative Jumbotron banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm h-32 sm:h-44 bg-gradient-to-r from-teal-700 via-[#1E3E2A] to-emerald-800 flex items-end p-5 sm:p-8 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl sm:text-2xl">👤</span>
              <h1 className="font-heading text-xl sm:text-3xl font-extrabold tracking-tight">Dashboard Profil Pembeli</h1>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-100 mt-1 sm:mt-1.5 font-medium leading-relaxed">
              Pantau pesanan kriya kawat bulu & detail pengambilan pesanan O2O Anda secara aman.
            </p>
          </div>
          <Badge className="bg-white/15 backdrop-blur-md text-emerald-50 hover:bg-white/25 rounded-full border-none w-max text-[10px] uppercase font-extrabold px-3 py-1">
            Bergabung: {registeredDate}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Profile Card & Editor Panel (Left Column) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-3xl border border-rose-100 overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-all duration-300 relative">
            <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-primary to-rose-400" />
            
            <CardHeader className="text-center pt-8 pb-5">
              <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-rose-50 overflow-hidden bg-[#F6FBF7] flex items-center justify-center shadow-md select-none group">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl sm:text-5xl">{profile?.avatarLogo || "🌸"}</span>
                )}
              </div>

              <div className="mt-4">
                <CardTitle className="font-heading text-lg sm:text-xl font-black text-gray-800">{profile?.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground font-mono mt-1">{profile?.email}</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 px-6 pb-6">
              <p className="text-xs sm:text-sm text-center italic text-muted-foreground bg-rose-50/20 px-4 py-3 rounded-2xl border border-rose-50/25 leading-relaxed">
                "{profile?.bio}"
              </p>

              <div className="border-t pt-4 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 text-primary">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">No. WhatsApp / HP</h4>
                    <p className="text-xs sm:text-sm font-semibold mt-0.5 text-gray-800">
                      {profile?.phone ? `+${profile.phone.startsWith("0") ? "62" + profile.phone.slice(1) : profile.phone}` : "Belum Atur WA 📱"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 text-amber-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Titik Preferensi / Alamat</h4>
                    <p className="text-xs sm:text-sm font-semibold mt-0.5 text-gray-800 leading-relaxed">
                      {profile?.address || "Atur lokasi utama Anda untuk mempercepat pencarian toko terdekat 📍"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="px-6 pb-6 border-t pt-4">
              <Button 
                onClick={() => setIsEditing(true)}
                className="rounded-full w-full bg-primary text-white hover:bg-[#1D3C29] text-xs font-extrabold h-11 shadow-md shadow-primary/10 flex items-center justify-center gap-1.5"
              >
                <Edit3 className="h-3.5 w-3.5" /> Sunting Profil Pembeli
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Stats / Info Widget */}
          <div className="bg-rose-50/15 border border-rose-100 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎁</span> Hak Istimewa Pembeli
            </h4>
            <div className="text-xs leading-relaxed text-slate-700 space-y-2.5">
              <p>Sebagai pembeli bersertifikat di platform O2O kawat bulu kami, Anda menikmati:</p>
              <ul className="list-disc list-inside space-y-1.5 text-muted-foreground font-medium pl-1">
                <li>Otomatisasi rujukan rute florist terdekat berbasis koordinat presisi.</li>
                <li>Kontak instan chat satu kali klik langsung mengarah ke WhatsApp pengrajin.</li>
                <li>Pickup terjadwal yang menjamin kualitas buket terkurasi sempurna.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Orders Log & Interactive Activity Records (Right Column) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-3xl border border-muted/50 overflow-hidden bg-card/45 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="font-heading text-lg sm:text-xl font-bold flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-primary" /> Dashboard Tracking Pesanan Saya 🚚
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRefreshOrders(true)}
                      disabled={isRefreshingOrders}
                      className="rounded-full h-8 w-8 hover:bg-slate-100 text-muted-foreground hover:text-primary transition-all shrink-0"
                      title="Perbarui Pelacakan"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingOrders ? "animate-spin text-primary" : ""}`} />
                    </Button>
                  </div>
                  <CardDescription className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span>Pantau status pengerjaan kriya kawat bulu & rute pickup florist Anda secara real-time.</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-green-600 bg-green-55/10 bg-green-50 px-2 py-0.5 rounded-full font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />
                      <span>Auto-sync aktif</span>
                    </span>
                  </CardDescription>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-2xl sm:rounded-full border text-xs gap-1 select-none w-full sm:w-auto shrink-0 self-start sm:self-auto flex-col sm:flex-row">
                  <button
                    type="button"
                    className={`px-4 py-2 sm:py-1.5 rounded-xl sm:rounded-full font-bold transition-all text-xs flex-1 sm:flex-none ${buyerOrderTab === "tracking" ? "bg-primary text-white shadow-xs" : "hover:bg-slate-200 text-muted-foreground"}`}
                    onClick={() => setBuyerOrderTab("tracking")}
                  >
                    Live Tracking 🚚 ({orders.filter(o => o.status !== "Selesai" && o.status !== "Pesanan Selesai").length})
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 sm:py-1.5 rounded-xl sm:rounded-full font-bold transition-all text-xs flex-1 sm:flex-none ${buyerOrderTab === "history" ? "bg-primary text-white shadow-xs" : "hover:bg-slate-200 text-muted-foreground"}`}
                    onClick={() => setBuyerOrderTab("history")}
                  >
                    Riwayat Selesai 📜 ({orders.filter(o => o.status === "Selesai" || o.status === "Pesanan Selesai").length})
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 px-3 sm:px-6 pb-6">
              {orders.length === 0 ? (
                <div className="text-center py-12 px-6 border-2 border-dashed border-muted/70 rounded-2xl bg-secondary/15">
                  <span className="text-4xl">🛍️</span>
                  <h4 className="font-bold text-gray-800 mt-3 text-sm">Belum Ada Transaksi Tercatat</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 leading-relaxed">
                    Pesanan Anda yang Anda buat di keranjang atau langsung checkout akan otomatis ditampilkan secara real-time di sini.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const filtered = orders.filter((ord) => {
                      const isDone = ord.status === "Pesanan Selesai" || ord.status === "Selesai";
                      return buyerOrderTab === "tracking" ? !isDone : isDone;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-10 px-6 border-2 border-dashed border-muted/50 rounded-2xl bg-slate-50/50">
                          <span className="text-3xl">{buyerOrderTab === "tracking" ? "📦" : "📜"}</span>
                          <h4 className="font-bold text-gray-800 mt-2 text-xs">
                            Tidak ada pesanan {buyerOrderTab === "tracking" ? "aktif yang sedang di-track" : "dalam riwayat selesai"}
                          </h4>
                          <p className="text-[11px] text-muted-foreground max-w-xs mx-auto mt-1 leading-relaxed">
                            {buyerOrderTab === "tracking" 
                              ? "Semua pesanan Anda telah selesai diproses. Klik tab 'Riwayat Selesai' untuk melihat transakasi lampau." 
                              : "Silakan selesaikan pesanan aktif Anda dengan mem-pickup langsung ke florist kawat bulu pilihan!"}
                          </p>
                        </div>
                      );
                    }

                    return filtered.map((ord) => {
                      const storeData = allStores.find(st => st.id === ord.storeId);
                      const whatsappNumber = storeData?.phone || "08123456789";
                      let cleanPhone = whatsappNumber.replace(/[^0-9]/g, "");
                      if (cleanPhone.startsWith("0")) {
                        cleanPhone = "62" + cleanPhone.slice(1);
                      }
                      
                      // Simple text encoding for WA link
                      const waMessage = encodeURIComponent(
                        `Halo ${ord.storeName},\nSy ingin mem-followup pesanan ID: ${ord.id?.slice(0, 8)} senilai Rp ${ord.totalPrice?.toLocaleString("id-ID")}`
                      );
                      const waUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

                      return (
                        <div 
                          key={ord.id} 
                          className="rounded-2xl border bg-white p-4 sm:p-5 relative shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-muted-foreground font-mono">ID: {ord.id?.slice(0, 8)}</span>
                                <Badge className={`rounded-full text-[9px] uppercase font-black px-2 py-0.5 border-none
                                  ${ord.status === "Pesanan Selesai" || ord.status === "Selesai"
                                    ? "bg-green-100 text-green-700" 
                                    : ord.status === "Siap Diambil" 
                                    ? "bg-amber-100 text-amber-700 font-bold animate-pulse" 
                                    : "bg-blue-105/10 text-primary"}`}
                                >
                                  {ord.status || "Pesanan Diterima"}
                                </Badge>
                              </div>
                              <h4 className="text-sm font-extrabold text-gray-800 mt-1 flex items-center gap-1.5 hover:text-primary transition-colors">
                                <span>🏪</span> {ord.storeName || "Toko Bunga Lokal"}
                              </h4>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> 
                                {ord.createdAt?.seconds 
                                  ? new Date(ord.createdAt.seconds * 1000).toLocaleDateString("id-ID", {
                                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                    })
                                  : "Tanggal baru saja"}
                              </span>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="space-y-1.5 py-1">
                            {ord.items?.map((item: any, iIdx: number) => (
                              <div key={iIdx} className="flex justify-between items-start gap-4 text-xs font-semibold pl-1 text-gray-700">
                                <span className="leading-relaxed">
                                  {item.name} <span className="text-muted-foreground/80 font-mono text-[10px] ml-1">x{item.quantity}</span>
                                </span>
                                <span className="text-gray-800 font-mono">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
                              </div>
                            ))}
                          </div>

                          {/* Interactive Status Tracking Stepper */}
                          <div className="mt-4 mb-3">
                            <TrackingStepper status={ord.status} />
                          </div>

                          {/* Order Footer summary */}
                          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 mt-3">
                            <div className="text-xs text-muted-foreground">
                              <span>🕒 Rencana Pickup: </span>
                              <span className="text-foreground font-bold font-sans bg-slate-100 px-2 py-0.5 rounded-full text-[11px] inline-block mt-0.5 sm:mt-0">
                                {ord.pickupTime || "Segera"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="text-right">
                                <span className="text-[10px] text-muted-foreground font-bold uppercase block">Total Belanja</span>
                                <span className="text-xs sm:text-sm font-black text-rose-750 font-mono">
                                  Rp {ord.totalPrice?.toLocaleString("id-ID")}
                                </span>
                              </div>
                              
                              {(ord.status === "Pesanan Selesai" || ord.status === "Selesai") && (
                                ord.hasReviewed ? (
                                  <span className="h-8 px-3 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border flex items-center justify-center">
                                    Sudah Dinilai ✅
                                  </span>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrderForReview(ord);
                                      setReviewRating(5);
                                      setReviewComment("");
                                      setReviewImage("");
                                      setShowReviewModal(true);
                                    }}
                                    className="h-8 rounded-full text-[10px] font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md animate-bounce"
                                  >
                                    Beri Ulasan ⭐
                                  </Button>
                                )
                              )}

                              <a 
                                href={waUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="h-8 px-3 rounded-full text-[10px] font-extrabold bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center gap-1 shadow-sm transition-all uppercase tracking-wide shrink-0"
                              >
                                Followup WA <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Modal Dialog */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white rounded-3xl border border-rose-100 shadow-2xl overflow-hidden p-6 relative text-slate-800"
            >
              <button 
                type="button" 
                onClick={() => setShowReviewModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>

              <DialogHeader>
                <DialogTitle className="font-heading text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span>Beri Rating & Ulasan ⭐</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  Bagikan pengalaman Anda berbelanja bouquet di <strong>{selectedOrderForReview?.storeName}</strong> untuk membantu pembeli lain!
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleReviewSubmit} className="space-y-4 my-4 text-left">
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2">Pilih Rating Bintang</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star 
                          className={`h-8 w-8 ${star <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} 
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-yellow-600 mt-2">
                    {reviewRating === 5 ? "Sempurna! Sangat Puas 😍" : 
                     reviewRating === 4 ? "Bagus! Cukup Puas 🙂" : 
                     reviewRating === 3 ? "Biasa Saja 😐" : 
                     reviewRating === 2 ? "Kurang Memuaskan 🙁" : "Sangat Buruk 😡"}
                  </span>
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-bold text-gray-700">Komentar / Catatan Ulasan</Label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tulis kualitas rajutan, kerapihan kawat bulu, atau kerapihan florist di sini..."
                    className="w-full min-h-[100px] p-3 text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary/40 bg-slate-50/50"
                    maxLength={300}
                    required
                  />
                  <div className="text-right text-[10px] text-muted-foreground">
                    {reviewComment.length}/300 karakter
                  </div>
                </div>

                {/* Foto Hasil Buket (Opsional) */}
                <div className="space-y-1.5 text-left">
                  <Label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <span>📸</span> Tambahkan Foto Buket (Opsional)
                  </Label>
                  
                  {reviewImage ? (
                    <div className="relative h-28 w-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img src={reviewImage} alt="Preview Ulasan" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setReviewImage("")}
                        className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white text-xs transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (!file.type.startsWith("image/")) {
                              toast.error("Format file harus berupa gambar!");
                              return;
                            }
                            try {
                              const compressed = await compressAndResizeImage(file, 480, 480);
                              setReviewImage(compressed);
                              toast.success("Foto ulasan berhasil ditambahkan! 🌸");
                            } catch (err: any) {
                              toast.error("Gagal memproses gambar: " + err.message);
                            }
                          }
                        }}
                        className="hidden"
                        id="review-image-input"
                      />
                      <label
                        htmlFor="review-image-input"
                        className="flex flex-col items-center justify-center border border-dashed border-slate-300 hover:border-rose-400 hover:bg-rose-50/10 cursor-pointer p-3 rounded-2xl text-center transition-all bg-slate-50/50"
                      >
                        <Camera className="h-4 w-4 text-slate-400 mb-1" />
                        <span className="text-[10px] font-bold text-slate-700">Unggah Foto Hasil Buket</span>
                        <span className="text-[9px] text-muted-foreground mt-0.5">Maks. 1MB (jpg, png, jpeg)</span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full flex-1 h-11 font-bold text-xs"
                    onClick={() => setShowReviewModal(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="rounded-full flex-1 h-11 font-black text-xs bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    {isSubmittingReview ? "Mengirim..." : "Kirim Ulasan Resmi 🚀"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Reminder Modal Dialog */}
      <AnimatePresence>
        {showReviewReminderModal && unreviewedOrdersList.length > 0 && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[140] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white rounded-3xl border border-rose-100 shadow-2xl overflow-hidden p-6 relative text-slate-850"
            >
              <button 
                type="button" 
                onClick={() => setShowReviewReminderModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center space-y-3 pb-4">
                <span className="text-4xl animate-bounce inline-block">🌸</span>
                <h3 className="font-heading text-lg font-black text-gray-950">
                  Ulasan Kakak Sangat Berharga! ⭐
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Halo <strong>{profile?.name || "Kak"}</strong>! Kamu memiliki <strong>{unreviewedOrdersList.length} pesanan selesai</strong> yang belum diulas. Yuk beri rating dan masukan hangat untuk mitra florist kami!
                </p>
              </div>

              <div className="max-h-[220px] overflow-y-auto space-y-3 pr-1 py-1 text-left">
                {unreviewedOrdersList.map((ord) => (
                  <div key={ord.id} className="p-3.5 bg-rose-50/10 border border-rose-100 rounded-2xl flex items-center justify-between gap-3 hover:bg-rose-50/20 transition-colors">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-gray-800 flex items-center gap-1">
                        <span>🏪</span> {ord.storeName}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-semibold">
                        ID: {ord.id?.slice(0, 8)} • Rp {ord.totalPrice?.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setShowReviewReminderModal(false);
                        setSelectedOrderForReview(ord);
                        setReviewRating(5);
                        setReviewComment("");
                        setReviewImage("");
                        setShowReviewModal(true);
                      }}
                      className="h-8 rounded-full text-[10px] font-black bg-rose-600 hover:bg-rose-700 text-white shrink-0 shadow-sm"
                    >
                      Beri Ulasan ⭐
                    </Button>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full flex-1 h-10 font-bold text-xs"
                  onClick={() => setShowReviewReminderModal(false)}
                >
                  Nanti Saja
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal Dialog */}
      <AnimatePresence>
        {isEditing && (
          <Dialog open={isEditing} onOpenChange={(open) => { if (!open) setIsEditing(false); }}>
            {/* Modal Glass Overlay */}
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-lg bg-white rounded-3xl border border-rose-100 shadow-2xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-emerald-850 to-primary p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚙️</span>
                    <h3 className="font-heading text-base font-bold">Sunting Profil Pembeli Anda</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/10 rounded-full h-8 w-8"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
                  <div className="flex flex-col items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-dotted">
                    <div className="relative w-20 h-20 rounded-full bg-rose-50 border-2 border-rose-100 flex items-center justify-center overflow-hidden">
                      {editAvatarUrl ? (
                        <img src={editAvatarUrl} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-3xl">{editAvatarLogo}</span>
                      )}
                      
                      <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-150 cursor-pointer">
                        <Camera className="h-5 w-5 text-white" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleFileChange} 
                        />
                      </label>
                    </div>

                    {/* Choose Emoji Avatar Preset */}
                    <div className="text-center w-full">
                      <Label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground block mb-2">Preset Emoji</Label>
                      <div className="flex flex-wrap justify-center gap-1.5 max-w-xs mx-auto">
                        {PRESET_EMOJIS.map((emoji) => {
                          const isSelected = editAvatarLogo === emoji && !editAvatarUrl;
                          return (
                            <button
                              type="button"
                              key={emoji}
                              className={`h-7 w-7 rounded-full text-sm flex items-center justify-center border transition-all scale-95 hover:scale-105 active:scale-95
                                ${isSelected ? "bg-primary text-white border-transparent" : "bg-white text-gray-700 border-muted"}`}
                              onClick={() => {
                                setEditAvatarLogo(emoji);
                                setEditAvatarUrl(""); // Clear uploaded url if emoji preset is picked
                              }}
                            >
                              {emoji}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-2.5 flex items-center justify-center gap-1">
                        <Label htmlFor="custom-avatar-file-input" className="text-[10px] text-primary font-extrabold underline cursor-pointer hover:text-[#152e1f]">
                          Atau Unggah Gambar Kustom 📁
                        </Label>
                        <input 
                          type="file" 
                          id="custom-avatar-file-input" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nama Lengkap</Label>
                    <Input 
                      id="edit-name" 
                      required 
                      className="rounded-xl h-10 w-full"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Masukkan nama resmi pemesanan Anda..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-phone" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nomor WhatsApp / HP</Label>
                    <Input 
                      id="edit-phone" 
                      required 
                      className="rounded-xl h-10 w-full font-mono"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Contoh: 0821xxxxxxxx"
                    />
                    <p className="text-[9px] text-muted-foreground">Isi dengan teliti agar pengrajin kriya kawat bulu dapat mengirim pesan followup.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-address" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Titik Preferensi / Alamat Utama Anda</Label>
                    <Input 
                      id="edit-address" 
                      className="rounded-xl h-10 w-full"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="Alamat / kelurahan preferensi kustom..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-bio" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bio Pengguna Singkat</Label>
                    <textarea 
                      id="edit-bio" 
                      rows={2}
                      className="flex min-h-[60px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Bagikan bio estetik singkat..."
                    />
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full flex-1 font-bold text-xs h-10"
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="rounded-full flex-1 font-bold bg-primary hover:bg-[#1D3C29] text-white text-xs h-10 flex items-center justify-center gap-1"
                    >
                      {saving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      Simpan Perubahan
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mock-up component helper for simpler inline parsing outside radix dialog limitations
function Dialog({ open, onOpenChange, children }: { open: boolean, onOpenChange: (open: boolean) => void, children: React.ReactNode }) {
  if (!open) return null;
  return <>{children}</>;
}

function DialogContent({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}

function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function DialogTitle({ className, children }: { className?: string, children: React.ReactNode }) {
  return <h3 className={className}>{children}</h3>;
}

function DialogDescription({ className, children }: { className?: string, children: React.ReactNode }) {
  return <p className={className}>{children}</p>;
}
