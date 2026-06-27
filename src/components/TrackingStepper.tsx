import React from "react";
import { Check, Clock, Sparkles, ShoppingBag, Gift, Truck } from "lucide-react";

interface TrackingStepperProps {
  status: string;
}

const STAGES = [
  { id: "received", label: "Diterima", desc: "Pesanan telah dikirim ke Florist Mitra", icon: ShoppingBag, color: "rose" },
  { id: "building", label: "Pengerjaan", desc: "Buket bunga kawat bulu sedang dirangkai", icon: Gift, color: "amber" },
  { id: "ready", label: "Siap Diambil", desc: "Buket cantik Anda siap dijemput (O2O)", icon: Sparkles, color: "emerald" },
  { id: "completed", label: "Selesai", desc: "Pesanan selesai dan serah terima sukses", icon: Check, color: "blue" }
];

export default function TrackingStepper({ status }: TrackingStepperProps) {
  // Normalize variations
  const currentStatus = status || "Pesanan Diterima";
  
  let activeIndex = 0;
  if (currentStatus === "Sedang Dibuat" || currentStatus === "Diproses" || currentStatus === "Sedang Diproses") {
    activeIndex = 1;
  } else if (currentStatus === "Siap Diambil") {
    activeIndex = 2;
  } else if (currentStatus === "Selesai" || currentStatus === "Pesanan Selesai" || currentStatus === "Selesai Sempurna") {
    activeIndex = 3;
  }

  const isCancelled = currentStatus.toLowerCase().includes("batal");

  if (isCancelled) {
    return (
      <div className="bg-red-50/80 border border-red-100 rounded-3xl p-4 flex items-center gap-3 text-red-700 animate-pulse">
        <span className="text-xl">🛑</span>
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider">Pemberitahuan Pesanan Dibatalkan</h4>
          <p className="text-[11px] font-medium leading-relaxed opacity-90 mt-0.5">Pesanan ini telah dibatalkan. Silakan hubungi florist mitra untuk informasi pengembalian dana atau penjadwalan ulang.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50/50 border border-muted/50 rounded-2xl p-4 sm:p-5 shadow-sm" id="tracking-stepper-trace">
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#152e1f]/70 bg-emerald-50/80 px-2.5 py-1 rounded-full border border-emerald-100/40 flex items-center gap-1.5 shadow-xs">
          <Clock className="h-3 w-3 animate-spin duration-3000 text-primary" /> Live Tracking Order
        </span>
        <span className="text-xs font-bold text-slate-700">
          Status: <span className="text-primary font-black">{currentStatus}</span>
        </span>
      </div>

      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 w-full">
        {/* Horizontal Connector Line for MD views */}
        <div className="absolute left-[24px] md:left-0 md:top-[20px] bottom-6 md:bottom-auto md:right-0 h-full md:h-[3px] bg-slate-200/80 -z-10 w-[3px] md:w-full" style={{ zIndex: 0 }}>
          {/* Active indicator progress bar width/height */}
          <div 
            className="bg-gradient-to-r from-emerald-500 via-[#1E3E2A] to-[#152e1f] h-full transition-all duration-700 ease-out"
            style={{ 
              width: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${(activeIndex / (STAGES.length - 1)) * 100}%` : "3px",
              height: typeof window !== 'undefined' && window.innerWidth < 768 ? `${(activeIndex / (STAGES.length - 1)) * 100}%` : "100%" 
            }} 
          />
        </div>

        {STAGES.map((stage, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;
          const isPending = index > activeIndex;
          const StageIcon = stage.icon;

          return (
            <div 
              key={stage.id} 
              className="flex md:flex-col items-center md:text-center gap-4 md:gap-2.5 relative z-10 w-full group"
              style={{ zIndex: 10 }}
            >
              {/* Node Circle */}
              <div 
                className={`h-11 w-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-md shrink-0 border-2
                  ${isCompleted 
                    ? "bg-[#1E3E2A] border-[#1D3C29] text-white" 
                    : isActive 
                    ? "bg-amber-100 border-amber-500 text-amber-700 ring-4 ring-amber-400/20 scale-110" 
                    : "bg-white border-slate-200 text-muted-foreground/80"}`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 stroke-[3]" />
                ) : (
                  <StageIcon className={`h-5 w-5 ${isActive ? "animate-wiggle" : ""}`} />
                )}
              </div>

              {/* Text Meta info */}
              <div className="flex flex-col md:items-center">
                <span 
                  className={`text-xs font-black tracking-tight mt-0.5
                    ${isActive ? "text-[#1E3E2A] font-extrabold" : isCompleted ? "text-slate-650" : "text-muted-foreground"}`}
                >
                  {stage.label}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold leading-normal max-w-[130px] md:text-center mt-0.5 hidden sm:block">
                  {stage.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
