import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Clock, MessageSquare, Eye, Store } from "lucide-react";
import PickupScheduler from "@/src/components/PickupScheduler";
import ImageLightbox from "@/src/components/ImageLightbox";
import ChatModal from "@/src/components/ChatModal";
import StoreModal from "@/src/components/StoreModal";
import { addToCart } from "@/src/lib/cartService";
import { toast } from "sonner";

interface ProductProps {
  product: {
    id: string;
    storeId: string;
    name: string;
    price: number;
    category: string;
    images: string[];
    description: string;
    isFeatured?: boolean;
    isBoosted?: boolean;
    activeAdPkg?: any;
    inventory?: number;
  };
  store?: any;
}

export default function ProductCard({ product, store }: ProductProps) {
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);

  const handleSelectShopFilter = (storeId: string) => {
    // Dispatch custom event to notify main app window
    const filterEvent = new CustomEvent("filter-shop-only", { detail: storeId });
    window.dispatchEvent(filterEvent);
  };

  const handleOpenProductDetail = (p: any) => {
    setIsSchedulerOpen(true);
  };

  // Calculate stable pseudo-random rating, percentage, mock sales, and location for high-fidelity look
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const pId = product?.id || "p";
  const pName = product?.name || "";
  const seed = hashCode(pId + pName);
  
  // Decide if this product gets a discount (66% chance of discount)
  const hasDiscount = seed % 3 !== 0;
  const discountPercent = hasDiscount ? (10 + (seed % 4) * 8) : 0; // 10%, 18%, 26%, 34%
  const originalPrice = hasDiscount ? Math.round(product.price * (100 / (100 - discountPercent)) / 500) * 500 : product.price;

  // Decide mock rating
  const mockRating = (4.5 + (seed % 6) * 0.1).toFixed(1); // 4.5, 4.6, 4.7, 4.8, 4.9, 5.0
  const mockSales = (10 + (seed % 15) * 12) + " terjual";

  // Mock location based on real store address or fallback
  const storeLoc = store?.address 
    ? (store.address.split(",")[0] || "Yogyakarta") 
    : (seed % 2 === 0 ? "Godean" : "Sleman");

  return (
    <>
      <Card 
        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-muted bg-card shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full"
      >
        <div className="relative">
          {/* Bouquet Image Card Area */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={product?.images?.[0] || ""}
              alt={product?.name || "Product"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {store?.isClosed && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1.5 z-20">
                <span className="text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider bg-rose-600 px-3 py-1 rounded-full shadow-lg">
                  Toko Tutup 🚫
                </span>
                <span className="text-[10px] text-white/90 font-medium px-2 text-center leading-snug">
                  Menerima pesanan saat buka kembali
                </span>
              </div>
            )}

            {/* Quick action: Image zoom in fullscreen overlay on hover (desktop only) */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:flex justify-center gap-2 z-20">
              <Button 
                size="sm" 
                variant="secondary" 
                className="rounded-full text-xs font-bold shadow-lg h-8 px-3.5 flex items-center gap-1.5 hover:bg-primary hover:text-white transition-all scale-95 group-hover:scale-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
              >
                <Eye className="h-3.5 w-3.5" /> Lihat Detail 🔍
              </Button>
            </div>
          </div>

          <CardContent className="p-2.5 sm:p-3.5 pb-2">
            {/* Florist link name */}
            <div 
              className="mb-1 text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1 cursor-pointer hover:underline hover:text-primary max-w-fit"
              onClick={(e) => {
                e.stopPropagation();
                setIsStoreOpen(true);
              }}
              title="Kunjungi Profil Toko Florist"
            >
              <Store className="h-3 w-3 shrink-0 text-primary" />
              <span className="truncate max-w-[120px] sm:max-w-[150px]">{store?.name || "Toko Florist"}</span>
            </div>

            {/* Catalog-style title constraint */}
            <h3 className="font-heading text-xs sm:text-sm font-bold tracking-tight text-foreground line-clamp-2 min-h-[32px] sm:min-h-[40px] group-hover:text-primary transition-colors leading-snug">
              {product.name}
            </h3>
          </CardContent>
        </div>

        {/* Footer info & persistent control buttons */}
        <div className="px-2.5 sm:px-3.5 pb-3 pt-2 border-t mt-1 flex flex-col gap-2">
          {/* Price Layout */}
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-black text-rose-650 font-sans">
              Rp {product.price.toLocaleString("id-ID")}
            </span>
            {product.inventory !== undefined && product.inventory !== null ? (
              product.inventory <= 0 ? (
                <Badge variant="destructive" className="text-[9px] px-2 py-0.5 rounded-full font-extrabold shadow-none">
                  Habis 🚫
                </Badge>
              ) : product.inventory <= 5 ? (
                <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-700 text-[9px] px-2 py-0.5 rounded-full font-extrabold border-none shadow-none">
                  Sisa {product.inventory} ⚠️
                </Badge>
              ) : (
                <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full font-extrabold border-none shadow-none">
                  Stok: {product.inventory}
                </Badge>
              )
            ) : (
              <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded-full font-extrabold border-none shadow-none">
                Ready Stock
              </Badge>
            )}
          </div>

          {/* Interactive grid of action buttons */}
          <div className="flex flex-col gap-1.5 mt-2 select-none">
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-[9px] sm:text-[10px] font-bold h-7 sm:h-8 bg-secondary/40 hover:bg-secondary text-foreground border-none flex items-center justify-center gap-0.5 sm:gap-1 px-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsChatOpen(true);
                }}
              >
                <MessageSquare className="h-3 w-3 text-primary shrink-0" /> Tanya 💬
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={product.inventory !== undefined && product.inventory !== null && product.inventory <= 0 || !!store?.isClosed}
                className="rounded-full text-[9px] sm:text-[10px] font-bold h-7 sm:h-8 border border-primary/20 hover:bg-primary/5 text-primary flex items-center justify-center gap-0.5 sm:gap-1 px-1 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart({
                    productId: product.id,
                    name: product.name,
                    image: product.images?.[0] || "",
                    price: product.price,
                    quantity: 1,
                    note: "",
                    storeId: store.id,
                    storeName: store.name,
                    storePhone: store?.phone,
                    storeLocation: store?.location
                  });
                  toast.success(`"${product.name}" dimasukkan ke keranjang 🛒`);
                }}
              >
                + Keranjang 🛒
              </Button>
            </div>

            <Button
              size="sm"
              variant="default"
              disabled={(product.inventory !== undefined && product.inventory !== null && product.inventory <= 0) || !!store?.isClosed}
              className="w-full rounded-full text-[10px] sm:text-xs font-black h-8 shadow-md flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => {
                e.stopPropagation();
                setIsSchedulerOpen(true);
              }}
            >
              {store?.isClosed ? "Toko Sedang Tutup 🚫" : (product.inventory !== undefined && product.inventory !== null && product.inventory <= 0 ? "Stok Habis 🚫" : "Beli Sekarang ⚡")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Lightbox Modal */}
      <ImageLightbox
        isOpen={isLightboxOpen}
        onOpenChange={setIsLightboxOpen}
        imageUrl={product?.images?.[0] || ""}
        imageAlt={product?.name || ""}
      />

      {/* Chat Console Modal */}
      <ChatModal 
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
        product={product}
        store={store}
      />

      {/* Store Profiling Modal */}
      <StoreModal
        isOpen={isStoreOpen}
        onOpenChange={setIsStoreOpen}
        store={store}
        onSelectShopFilter={handleSelectShopFilter}
        onOpenProductDetail={handleOpenProductDetail}
      />

      {/* Booking schedule flow */}
      <PickupScheduler 
        isOpen={isSchedulerOpen}
        onOpenChange={setIsSchedulerOpen}
        product={product}
        store={store}
      />
    </>
  );
}
