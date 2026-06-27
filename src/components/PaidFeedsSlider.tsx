import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, Sparkles, User, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import StoreModal from "@/src/components/StoreModal";
import PickupScheduler from "@/src/components/PickupScheduler";

interface PaidFeedsSliderProps {
  stores: any[];
  products: any[];
  onSelectStore: (storeId: string) => void;
}

export default function PaidFeedsSlider({ stores, products, onSelectStore }: PaidFeedsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likes, setLikes] = useState<Record<string, { count: number; liked: boolean }>>({});
  const [activeStore, setActiveStore] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [schedulerStore, setSchedulerStore] = useState<any>(null);

  const openProductScheduler = (product: any, store: any) => {
    setSelectedProduct(product);
    setSchedulerStore(store);
  };

  // Filter stores which have sponsored ads or are featured
  const adStores = stores.filter((s) => {
    const hasActiveSlideFeed = s.activeAds?.some((ad: any) => ad.type === "slide_feeds" && ad.status === "active");
    return s.isFeatured || s.activeAdPkg || hasActiveSlideFeed;
  });
  
  // Display only real active matching stores
  const displayStores = adStores;

  // Auto-scroll/slide to the next feed every 10 seconds (exactly 10 seconds continuous rotation as requested)
  useEffect(() => {
    if (displayStores.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayStores.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [displayStores]);

  if (displayStores.length === 0) {
    return null;
  }

  const activeStoreData = displayStores[currentIndex % displayStores.length];
  
  // Find products belonging to this active store
  const storeProducts = products.filter((p) => p.storeId === activeStoreData.id);
  
  // Admin-configured custom featured catalog/product support
  const featuredProduct = storeProducts.find((p) => p.id === activeStoreData.featuredProductId) || storeProducts[0];
  
  // Admin-configured image support or fallback
  const postImage = featuredProduct?.images?.[0] || activeStoreData.portfolio?.[0] || activeStoreData.bannerUrl || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&q=80";

  // Admin-configured custom promo descriptions support or fallback
  const fallbackPromoTexts = [
    "Katalog Unggulan: Buket wisuda & lamaran kriya estetik premium, rajutan kawat bulu anti-layu dikerjakan presisi oleh mitra pilihan.",
    "Rekomendasi Utama: Dapatkan penawaran istimewa untuk florist kriya estetis sekarang. Hubungi seller langsung di platform!",
    "Kreasi Handcrafted Spesial: Desain bunga kawat bulu terlaris mendedikasikan ketelitian tinggi untuk hadiah wisuda & kekasih tercinta."
  ];
  
  const currentText = activeStoreData.promoText || fallbackPromoTexts[currentIndex % fallbackPromoTexts.length];
  const currentLikeInfo = likes[activeStoreData.id] || { count: 32 + (currentIndex * 15), liked: false };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes((prev) => {
      const info = prev[activeStoreData.id] || { count: 32 + (currentIndex * 15), liked: false };
      return {
        ...prev,
        [activeStoreData.id]: {
          count: info.liked ? info.count - 1 : info.count + 1,
          liked: !info.liked
        }
      };
    });
  };

  return (
    <>
      <Card 
        className="relative overflow-hidden rounded-2xl border border-muted bg-card shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col justify-between group h-full"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStoreData.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col justify-between flex-1 h-full"
          >
            <div>
              {/* Profile Sponsor Header Bar */}
              <div className="p-2 sm:p-2.5 pb-2 flex items-center justify-between border-b border-muted/20 bg-secondary/15">
                <div 
                  className="flex items-center gap-1.5 cursor-pointer hover:opacity-85"
                  onClick={() => setActiveStore(activeStoreData)}
                >
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-red-50 text-red-600 font-extrabold text-[10px] flex items-center justify-center border border-red-100 overflow-hidden shrink-0">
                    {activeStoreData.avatarUrl || activeStoreData.logoUrl ? (
                      <img src={activeStoreData.avatarUrl || activeStoreData.logoUrl} alt={activeStoreData.name} className="h-full w-full object-cover" />
                    ) : activeStoreData.avatarLogo ? (
                      <span className="text-xs sm:text-sm">{activeStoreData.avatarLogo}</span>
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[10px] sm:text-xs font-black text-foreground truncate flex items-center gap-0.5">
                      {activeStoreData.name}
                    </h4>
                    <span className="text-[8px] text-muted-foreground block font-semibold leading-none">Mitra Sponsor Pilihan</span>
                  </div>
                </div>

                <Badge className="bg-amber-500 hover:bg-amber-500 text-amber-950 text-[7px] font-black rounded px-1.5 py-0.5 border-none select-none shrink-0 tracking-tight animate-pulse">
                  PROMOTE
                </Badge>
              </div>

              {/* High-Fidelity Catalog/Buket Image Display */}
              <div 
                className="relative aspect-square overflow-hidden bg-muted cursor-pointer group/img"
                onClick={() => {
                  if (featuredProduct) {
                    openProductScheduler(featuredProduct, activeStoreData);
                  }
                }}
                title="Klik untuk melihat detail katalog & memesan"
              >
                <img 
                  src={postImage} 
                  alt={activeStoreData.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Smooth visual zoom/detail overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <span className="text-white text-[10px] sm:text-xs font-black bg-[#e11d48] px-3.5 py-2 rounded-full flex items-center gap-1.5 shadow-xl transform translate-y-2 group-hover/img:translate-y-0 transition-transform duration-300">
                    <Sparkles className="h-3 w-3 text-yellow-300 shrink-0" /> Lihat Detail Bouquet 💐
                  </span>
                </div>
                
                {/* Visual indicator of automatic 10-second timer at bottom of image */}
                <div className="absolute bottom-0 left-0 h-1 bg-[#e11d48]/90 animate-progress-timer w-full" />
                
                <div className="absolute right-2 top-2 bg-black/60 backdrop-blur-sm text-yellow-300 rounded px-1.5 py-0.5 text-[8px] font-bold flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-yellow-400 animate-pulse" />
                  Katalog Unggulan
                </div>
              </div>

              {/* Custom Description Text */}
              <div className="p-2.5 sm:p-3 pb-1 select-none">
                <p className="text-[10.5px] sm:text-xs text-foreground font-semibold leading-relaxed line-clamp-3">
                  <span className="font-extrabold text-[#e11d48] mr-1">@{activeStoreData.slug || "partner"}</span>
                  {currentText}
                </p>
              </div>
            </div>

            {/* Actions Block Footer */}
            <div className="px-2.5 sm:px-3 pb-3 pt-2.5 border-t border-muted/10 mt-1 flex flex-col gap-2">
              <div className="flex items-center justify-between pb-0.5">
                <button 
                  onClick={handleLike}
                  className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Heart className={`h-3.5 w-3.5 ${currentLikeInfo.liked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                  <span>{currentLikeInfo.count}</span>
                </button>
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Direct Chat</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-2 gap-1.5 select-none">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-[9px] sm:text-[10px] font-bold h-7 sm:h-8 bg-secondary/30 hover:bg-secondary text-foreground flex items-center justify-center gap-1 px-1 border-none"
                  onClick={() => setActiveStore(activeStoreData)}
                >
                  Tinjau Toko 🔍
                </Button>
                <Button
                  size="sm"
                  className="rounded-full text-[9px] sm:text-[10px] font-black h-7 sm:h-8 bg-[#e11d48] hover:bg-[#be123c] text-white border-none shadow-sm flex items-center justify-center gap-1 px-1"
                  onClick={() => onSelectStore(activeStoreData.id)}
                >
                  <ShoppingBag className="h-3 w-3 shrink-0" /> Belanja
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Shopee-Style active rotation dots indicator row at the absolute bottom */}
        <div className="flex items-center justify-center gap-1.5 py-1.5 border-t bg-secondary/15">
          {displayStores.map((_, dotIdx) => (
            <button
              key={dotIdx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                dotIdx === currentIndex % displayStores.length
                  ? "w-4 bg-red-650"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              onClick={() => setCurrentIndex(dotIdx)}
              title={`Slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      </Card>

      {/* Embedded Single Store Profiling Modal */}
      {activeStore && (
        <StoreModal
          isOpen={!!activeStore}
          onOpenChange={(open) => !open && setActiveStore(null)}
          store={activeStore}
          onSelectShopFilter={(storeId) => {
            onSelectStore(storeId);
            setActiveStore(null);
          }}
          onOpenProductDetail={(prod) => {
            openProductScheduler(prod, activeStore);
          }}
        />
      )}

      {selectedProduct && schedulerStore && (
        <PickupScheduler
          isOpen={!!selectedProduct}
          onOpenChange={(open) => !open && setSelectedProduct(null)}
          product={selectedProduct}
          store={schedulerStore}
        />
      )}
    </>
  );
}
