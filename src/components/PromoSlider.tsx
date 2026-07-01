import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Sparkles, AlertCircle } from "lucide-react";
import { fetchPromoBanners } from "@/src/lib/dataService";
import { Button } from "@/components/ui/button";

interface PromoSliderProps {
  onSelectCategory?: (category: string) => void;
  onSwitchView?: (view: "map" | "grid" | "admin") => void;
  refreshTrigger?: number;
}

export default function PromoSlider({ onSelectCategory, onSwitchView, refreshTrigger = 0 }: PromoSliderProps) {
  const [banners, setBanners] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  useEffect(() => {
    async function loadBanners() {
      try {
        setLoading(true);
        const fetched = await fetchPromoBanners();
        // Filter only active ones
        const activeBanners = fetched.filter((b: any) => b.isActive !== false);
        setBanners(activeBanners);
        setCurrentIndex(0);
      } catch (err) {
        console.error("Gagal memuat iklan penawaran:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBanners();
  }, [refreshTrigger]);

  // Auto play sliding logic
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000); // Auto-slide every 5 seconds
    return () => clearInterval(interval);
  }, [currentIndex, banners.length]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const handleBannerClick = (banner: any) => {
    const link = banner.linkUrl || "";
    if (!link) return;

    if (link === "#ads") {
      if (onSwitchView) onSwitchView("admin");
    } else if (link.includes("?cat=")) {
      const cat = decodeURIComponent(link.split("?cat=")[1]);
      if (onSelectCategory) onSelectCategory(cat);
    } else if (link.startsWith("http")) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="w-full h-40 md:h-52 lg:h-64 rounded-3xl bg-secondary/35 animate-pulse flex items-center justify-center text-muted-foreground gap-2">
        <Sparkles className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm font-semibold">Memuat promo menarik...</span>
      </div>
    );
  }

  if (banners.length === 0) {
    return null; // Don't render if there are no active banners
  }

  // Define transition slide animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const activeBanner = banners[currentIndex];

  return (
    <div id="promo-banner-slider" className="relative w-full overflow-hidden rounded-3xl border border-muted/20 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 shadow-sm group">
      {/* Slider main body */}
      <div className="relative h-44 sm:h-52 md:h-60 lg:h-[220px] w-full flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            onClick={() => handleBannerClick(activeBanner)}
            className={`absolute inset-0 w-full h-full flex flex-col md:flex-row items-center justify-between overflow-hidden cursor-pointer ${
              activeBanner.linkUrl ? "hover:opacity-95" : ""
            }`}
          >
            {/* Background Image / Banner Render */}
            <div className="absolute inset-0 w-full h-full z-0">
              <img
                src={activeBanner.imageUrl}
                alt={activeBanner.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none"
                onError={(e: any) => {
                  e.target.src = "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1600&auto=format&fit=crop&q=80";
                }}
              />
              {/* Fade scrim to guarantee typography readability depending on chosen gradient palette */}
              {(activeBanner.title || activeBanner.description) && (
                <div className={`absolute inset-0 z-10 transition-all duration-300 ${
                  activeBanner.overlayType === "none" || activeBanner.overlayType === "transparent"
                    ? "bg-transparent"
                    : activeBanner.overlayType === "solid-dark"
                    ? "bg-black/35"
                    : activeBanner.overlayType === "solid-dark-heavy"
                    ? "bg-black/60"
                    : activeBanner.overlayType === "primary-grad"
                    ? "bg-gradient-to-r from-primary/90 via-primary/50 to-transparent"
                    : activeBanner.overlayType === "sunset-grad"
                    ? "bg-gradient-to-r from-amber-950/80 via-rose-900/40 to-transparent"
                    : activeBanner.overlayType === "ocean-grad"
                    ? "bg-gradient-to-r from-teal-950/85 via-emerald-950/35 to-transparent"
                    : "bg-gradient-to-r from-black/80 via-black/45 to-transparent" // dark-grad defaults
                }`} />
              )}
            </div>

            {/* Banner Text overlay */}
            {(activeBanner.title || activeBanner.description) && (
              <div className="relative z-20 xl:max-w-3xl lg:max-w-2xl md:max-w-xl max-w-full p-6 md:p-10 text-white flex flex-col justify-center h-full select-none text-left bg-transparent">
                <div className="inline-flex items-center gap-1.5 bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold text-amber-305 w-fit mb-2 md:mb-3 border border-primary/20">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>IKLAN PENAWARAN</span>
                </div>
                {activeBanner.title && (
                  <h3 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
                    {activeBanner.title}
                  </h3>
                )}
                {activeBanner.description && (
                  <p className="mt-2 text-xs sm:text-sm md:text-base text-white/90 font-medium max-w-xl drop-shadow-sm line-clamp-2">
                    {activeBanner.description}
                  </p>
                )}
                {activeBanner.linkUrl && (
                  <div className="mt-4 hidden sm:block">
                    <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-white text-primary font-bold text-xs hover:bg-slate-50 transition-all shadow-sm">
                      Lihat Penawaran &rarr;
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Overlay Navigation Buttons (Visible on hover of the slider) */}
        {banners.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              id="slider-control-prev"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-35 bg-black/50 hover:bg-black/75 cursor-pointer backdrop-blur-sm text-white hover:scale-105 active:scale-95 h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              id="slider-control-next"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-35 bg-black/50 hover:bg-black/75 cursor-pointer backdrop-blur-sm text-white hover:scale-105 active:scale-95 h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <ChevronRight className="h-6 w-6 stroke-[2.5]" />
            </button>
          </>
        )}
      </div>

      {/* Bullet Indicators (Lower centered dots) */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              id={`slider-dot-${index}`}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex ? "w-6 sm:w-8 bg-white" : "w-2 sm:w-2.5 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
