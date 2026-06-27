import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  CheckCircle, 
  ShieldCheck, 
  Heart, 
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { fetchProducts, fetchStoreReviews } from "@/src/lib/dataService";
import { toast } from "sonner";

interface StoreModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  store: any;
  onSelectShopFilter?: (storeId: string) => void;
  onOpenProductDetail?: (product: any) => void;
}

export default function StoreModal({ 
  isOpen, 
  onOpenChange, 
  store, 
  onSelectShopFilter,
  onOpenProductDetail
}: StoreModalProps) {
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewsDialog, setShowReviewsDialog] = useState(false);
  const [selectedReviewImage, setSelectedReviewImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadStoreProductsAndReviews() {
      if (!isOpen || !store?.id) return;
      try {
        setLoading(true);
        setLoadingReviews(true);
        const [products, fetchedReviews] = await Promise.all([
          fetchProducts(undefined, store.id),
          fetchStoreReviews(store.id)
        ]);
        setStoreProducts(products);
        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Gagal memuat produk atau ulasan toko:", error);
      } finally {
        setLoading(false);
        setLoadingReviews(false);
      }
    }
    loadStoreProductsAndReviews();
  }, [isOpen, store]);

  if (!store) return null;

  // Formatting phone linkage
  const storePhone = store?.phone || "08123456789";
  let cleanPhone = storePhone.replace(/[^0-9]/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "62" + cleanPhone.slice(1);
  }
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Halo ${store.name}, saya pengunjung Florist Hub yang tertarik dengan penawaran buket kawat bulu & bunga kakak!`
  )}`;

  // Aesthetics mapping
  const isDarkPattern = store.profilePattern === "pattern-dark";
  
  const getBannerGradient = (gradient?: string) => {
    switch (gradient) {
      case "romantic-rose":
        return "from-rose-500 to-pink-600";
      case "lavender-dream":
        return "from-purple-600 to-indigo-500";
      case "sunset-glow":
        return "from-amber-500 to-rose-500";
      case "emerald-fresh":
        return "from-emerald-600 to-teal-500";
      case "royal-velvet":
        return "from-indigo-950 to-purple-900";
      case "sweet-cotton":
        return "from-pink-350 to-rose-350 text-pink-950";
      case "transparent":
        return "from-transparent to-transparent bg-secondary/15 dark:bg-zinc-900/40 border-b border-muted/20 text-foreground";
      case "elegant-classic":
      default:
        return "from-primary/80 to-pink-500/85";
    }
  };

  const getContainerPatternClass = (pattern?: string) => {
    switch (pattern) {
      case "pattern-dark":
        return "bg-neutral-950 text-neutral-100 border-neutral-800";
      case "pattern-soft":
        return "bg-rose-50/15 text-foreground";
      case "pattern-warm":
        return "bg-amber-50/20 text-foreground";
      default:
        return "bg-background text-foreground";
    }
  };

  const getBodyPatternClass = (pattern?: string) => {
    switch (pattern) {
      case "pattern-dark":
        return "bg-neutral-900 text-neutral-200";
      case "pattern-soft":
        return "bg-gradient-to-b from-rose-100/20 via-background to-background";
      case "pattern-warm":
        return "bg-gradient-to-b from-amber-100/20 via-background to-background";
      default:
        return "bg-transparent";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-[90vw] md:max-w-2xl p-0 overflow-hidden rounded-3xl animate-in fade-in zoom-in-95 duration-150 max-h-[88vh] flex flex-col ${getContainerPatternClass(store.profilePattern)}`}>
        
        {/* Cover Landscape Banner */}
        <div className={`relative h-44 bg-gradient-to-r ${getBannerGradient(store.profileGradient)} shrink-0 flex items-end p-5 ${store.profileGradient === "transparent" && !store.bannerUrl && !(store.portfolio && store.portfolio[0]) ? "text-foreground" : "text-white"} overflow-hidden transition-all duration-300`}>
          {store.bannerUrl ? (
            <img 
              src={store.bannerUrl} 
              alt={store.name} 
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-300 ${store.profileGradient === "transparent" ? "opacity-100" : "opacity-60 mix-blend-overlay"}`}
              referrerPolicy="no-referrer"
            />
          ) : store.portfolio && store.portfolio[0] ? (
            <img 
              src={store.portfolio[0]} 
              alt={store.name} 
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-300 ${store.profileGradient === "transparent" ? "opacity-100" : "opacity-45 mix-blend-overlay"}`}
              referrerPolicy="no-referrer"
            />
          ) : (
            store.profileGradient === "transparent" ? (
              <div className="absolute inset-0 bg-stone-150/45 dark:bg-stone-850/45" />
            ) : (
              <div className="absolute inset-x-0 h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary via-primary/70 to-secondary/35 opacity-90" />
            )
          )}
          
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLiked(!liked)}
            className={`absolute top-4 right-4 rounded-full h-9 w-9 bg-black/30 backdrop-blur-sm text-white hover:bg-black/45 border border-white/10 ${liked ? "text-red-500 fill-red-500 hover:text-red-600" : ""}`}
          >
            <Heart className="h-4 w-4" />
          </Button>

          <div className="relative z-10 flex gap-4 items-center w-full">
            {/* Logo/Avatar customized */}
            <div className="h-20 w-20 rounded-2xl bg-white border border-primary/20 flex items-center justify-center font-bold text-3xl text-primary shadow-xl select-none shrink-0 overflow-hidden bg-background">
              {store.avatarUrl ? (
                <img 
                  src={store.avatarUrl} 
                  alt={store.name} 
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-3xl text-primary font-heading animate-none">
                  {store.avatarLogo || store.name.charAt(0)}
                </span>
              )}
            </div>
            
            <div className="min-w-0 pr-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-heading text-xl md:text-2xl font-extrabold tracking-tight truncate max-w-xs text-white">{store.name}</h3>
                {store.isVerified && (
                  <Badge className="bg-emerald-500 text-white rounded-full px-2 py-0 h-5 text-[9px] flex items-center gap-0.5 font-bold shrink-0 border-none">
                    <ShieldCheck className="h-3 w-3 text-white fill-current" /> Verified Partner
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Store Detail Content */}
        <div className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-6 ${getBodyPatternClass(store.profilePattern)}`}>
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Meta widgets - left column */}
            <div className="md:col-span-1 space-y-4">
              <div className={`${isDarkPattern ? "bg-neutral-900 border-neutral-800" : "bg-secondary/40"} p-4 rounded-2xl border flex flex-col justify-between h-full space-y-3`}>
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rating Toko ⭐</h4>
                  {store.rating ? (
                    <button 
                      type="button"
                      onClick={() => setShowReviewsDialog(true)}
                      className="text-left w-full block group focus:outline-none"
                    >
                      <div className="flex items-center gap-1.5 mt-1 hover:text-primary transition-colors">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform" />
                        <span className="text-lg font-extrabold leading-none">{store.rating}</span>
                        <span className="text-xs text-muted-foreground mt-1">/ 5.0</span>
                      </div>
                      <p className="text-[10px] text-primary mt-1 font-bold group-hover:underline">
                        Lihat {reviews.length || store.reviewCount || 0} Ulasan Pelanggan 💬
                      </p>
                    </button>
                  ) : (
                    <div className="mt-1">
                      <p className="text-xs text-muted-foreground italic font-medium">Belum ada rating ulasan</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-muted/50 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Jam Operasional:</span>
                  </div>
                  <Badge variant="outline" className={`rounded-full border-primary/20 text-primary font-bold text-[10px] py-1 inline-flex items-center gap-1 ${isDarkPattern ? "bg-neutral-950 border-neutral-800" : "bg-background"}`}>
                    <Clock className="h-3 w-3 shrink-0" /> {store.operatingHours || "08:00 - 20:00"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Description & Location - right 2/3 column */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Tentang Toko 🌸</h4>
                <p className={`text-xs leading-relaxed ${isDarkPattern ? "text-neutral-300" : "text-foreground"}`}>
                  {store.description || "Toko bouquet bunga terpercaya yang selalu memberikan pelayanan ramah, kreasi kawat bulu & bunga segar kualitas terbaik untuk setiap kebahagiaan sejati momen Anda."}
                </p>
              </div>

              <div className="border-t border-muted/50 pt-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> Alamat & Koordinat
                </h4>
                <p className={`text-xs font-medium leading-normal ${isDarkPattern ? "text-neutral-400" : "text-muted-foreground"}`}>{store.location?.address || "Jl. Boulevard No.1, Jakarta"}</p>
                
                <div className="flex gap-2 mt-3 flex-wrap">
                  <a 
                    href={store.location?.gmapLink || `https://www.google.com/maps/search/?api=1&query=${store.location?.lat},${store.location?.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 transition-all hover:bg-primary/15"
                  >
                    Buka Google Maps <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                  <a 
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-green-700 hover:underline inline-flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 transition-all hover:bg-green-100"
                  >
                    <Phone className="h-2.5 w-2.5" /> Hubungi WA Toko
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Product showcase of this specific store */}
          <div className="border-t border-muted/50 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className={`text-sm font-bold ${isDarkPattern ? "text-neutral-100" : "text-foreground"}`}>Menu Bouquet Toko Ini 💐</h4>
                <p className="text-[11px] text-muted-foreground">Karya orisinil dari {store.name}. Klik untuk memesan langsung.</p>
              </div>
              <Badge className="rounded-full bg-secondary text-foreground py-1 font-bold">
                {storeProducts.length} Produk
              </Badge>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2 animate-pulse">
                    <div className="aspect-square bg-secondary rounded-2xl" />
                    <div className="h-3 bg-secondary rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : storeProducts.length === 0 ? (
              <div className={`py-8 text-center rounded-2xl border border-dashed text-xs text-muted-foreground font-semibold ${isDarkPattern ? "bg-neutral-950 border-neutral-800" : "bg-secondary/20"}`}>
                Toko ini belum menambahkan foto bouquet ke katalog.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-1">
                {storeProducts.map((p) => (
                  <div 
                    key={p.id}
                    className={`group border rounded-2xl p-2.5 cursor-pointer transition-all flex flex-col justify-between ${isDarkPattern ? "bg-neutral-950 border-neutral-800 hover:bg-neutral-800" : "bg-card hover:bg-secondary/20"}`}
                    onClick={() => {
                      onOpenProductDetail?.(p);
                    }}
                  >
                    <div>
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-2">
                        <img 
                          src={p.images?.[0]} 
                          alt={p.name} 
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h5 className={`font-bold text-[11px] line-clamp-1 group-hover:text-primary transition-colors ${isDarkPattern ? "text-neutral-200" : "text-foreground"}`}>{p.name}</h5>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-bold text-[11px] text-primary">Rp {p.price.toLocaleString("id-ID")}</span>
                      <ShoppingBag className="h-3 w-3 text-muted-foreground group-hover:text-primary shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t shrink-0 flex gap-2 flex-wrap justify-between items-center px-6 ${isDarkPattern ? "bg-neutral-950 border-neutral-800/80" : "bg-secondary/30"}`}>
          <Button
            variant="ghost"
            className="rounded-full text-xs text-muted-foreground hover:bg-secondary h-11 px-4 font-semibold"
            onClick={() => onOpenChange(false)}
          >
            Tutup Toko
          </Button>

          <Button
            variant="default"
            disabled={storeProducts.length === 0}
            className="rounded-full h-11 px-6 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-primary/10 transition-transform active:scale-95"
            onClick={() => {
              if (onSelectShopFilter) {
                onSelectShopFilter(store.id);
                onOpenChange(false);
                toast.success(`Hanya menampilkan bouquet dari ${store.name} 💐`);
              }
            }}
          >
            Saring Hanya Produk Toko Ini 🔍 <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

      </DialogContent>

      {/* Reviews Dialog Overlay */}
      <Dialog open={showReviewsDialog} onOpenChange={setShowReviewsDialog}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white border border-muted">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold flex items-center gap-2">
              <span>Ulasan Toko</span>
              <span className="text-primary">{store.name}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Ulasan asli dari pembeli yang telah sukses melakukan transaksi pengambilan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 max-h-[350px] overflow-y-auto pr-1">
            {loadingReviews ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground">Memuat ulasan asli...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-10 space-y-2 bg-secondary/10 rounded-2xl border">
                <span className="text-2xl">⭐</span>
                <p className="text-xs text-muted-foreground font-semibold">Belum ada review tertulis untuk toko ini.</p>
                <p className="text-[10px] text-muted-foreground px-4">Jadilah yang pertama memberikan ulasan setelah pesanan Anda selesai!</p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-3.5 bg-secondary/20 rounded-2xl border border-muted/30 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{rev.customerName || "Pembeli"}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "Baru saja"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${i < rev.rating ? "fill-yellow-400 text-yellow-400 text-yellow-400" : "text-muted/40"}`} 
                      />
                    ))}
                  </div>
                  {rev.comment && (
                    <p className="text-xs text-muted-foreground leading-relaxed italic bg-white/45 p-2 rounded-xl border border-dashed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  )}
                  {rev.imageUrl && (
                    <div className="mt-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedReviewImage(rev.imageUrl)}
                        className="relative rounded-xl overflow-hidden border border-slate-200 max-w-[100px] max-h-[100px] block hover:opacity-90 transition-opacity focus:outline-none bg-slate-50"
                      >
                        <img 
                          src={rev.imageUrl} 
                          alt="Ulasan Gambar" 
                          className="w-full h-full object-cover max-h-[100px]" 
                        />
                        <div className="absolute bottom-1 right-1 bg-black/60 text-[8px] font-black text-white px-1 py-0.5 rounded-full backdrop-blur-sm">
                          🔍 Lihat
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <Button 
            className="w-full rounded-full h-11 font-bold mt-2" 
            onClick={() => setShowReviewsDialog(false)}
          >
            Tutup Ulasan
          </Button>
        </DialogContent>
      </Dialog>

      {/* Zoomed Review Photo Lightbox Dialog */}
      <Dialog open={selectedReviewImage !== null} onOpenChange={(open) => { if (!open) setSelectedReviewImage(null); }}>
        <DialogContent className="max-w-lg bg-black text-white border-none p-4 rounded-3xl flex flex-col items-center justify-center">
          <DialogHeader className="w-full text-left pb-2 border-b border-white/10">
            <DialogTitle className="text-sm font-bold text-slate-100">Foto Ulasan Pembeli 📸</DialogTitle>
          </DialogHeader>
          <div className="relative mt-2 max-h-[70vh] w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black">
            <img 
              src={selectedReviewImage || ""} 
              alt="Bukti Produk Pembeli" 
              className="max-h-[65vh] max-w-full object-contain" 
            />
          </div>
          <Button 
            className="w-full mt-4 bg-white hover:bg-slate-100 text-black font-extrabold rounded-full h-10 text-xs" 
            onClick={() => setSelectedReviewImage(null)}
          >
            Tutup Foto
          </Button>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
