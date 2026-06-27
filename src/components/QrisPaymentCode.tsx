import React, { useEffect, useState } from "react";
import { QrCode, Smartphone, Info } from "lucide-react";
import { fetchWebConfig } from "@/src/lib/dataService";

interface QrisPaymentCodeProps {
  amount?: number;
}

export default function QrisPaymentCode({ amount }: QrisPaymentCodeProps) {
  const [webConfig, setWebConfig] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const config = await fetchWebConfig();
        if (config) {
          setWebConfig(config);
        }
      } catch (err) {
        console.warn("Failed to load webConfig for QRIS payment:", err);
      }
    }
    load();
  }, []);

  const merchantName = webConfig?.qrisMerchantName || "cosmics.co";
  const nmid = webConfig?.qrisNmid || "ID1022232744543";

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden font-sans text-slate-800 select-none">
      {/* Red/Crimson Accent Ribbon on Left Side */}
      <div className="relative p-5 sm:p-6 bg-white flex flex-col justify-between min-h-[500px]">
        
        {/* Top Header Row with QRIS and GPN Logos */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* QRIS Logo Area */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1">
              <span className="text-xl font-extrabold tracking-tighter text-blue-800">QR</span>
              <span className="text-xl font-extrabold tracking-tighter text-rose-600">IS</span>
            </div>
            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tight leading-none mt-0.5">
              Standar Pembayaran Nasional
            </span>
          </div>

          {/* GPN Red Wing Logo */}
          <div className="flex items-center gap-1.5 bg-slate-50/80 px-2 py-1 rounded-xl">
            <svg viewBox="0 0 100 80" className="h-5 w-6 text-rose-600" fill="currentColor">
              <path d="M10 20 Q 40 5, 80 15 Q 50 35, 90 70 Q 45 65, 10 20 Z" />
              <path d="M15 35 Q 45 25, 75 35 Q 50 50, 80 75 Q 45 70, 15 35 Z" fillOpacity="0.7" />
            </svg>
            <span className="text-[10px] font-black text-blue-950 font-sans tracking-tighter">GPN</span>
          </div>
        </div>

        {/* Merchant Information Section */}
        <div className="text-center pt-5 pb-3 space-y-1">
          <h4 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none uppercase">
            {merchantName}
          </h4>
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            NMID: {nmid}
          </p>
          <p className="text-[9px] font-mono text-slate-400 font-extrabold">
            A01
          </p>
        </div>

        {/* The Central QR Code Frame */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="p-3 bg-white border-2 border-slate-150 rounded-2xl shadow-sm relative group transition-transform duration-300 hover:scale-[1.02] flex items-center justify-center min-h-[200px] min-w-[200px]">
            {webConfig?.qrisImageUrl ? (
              <img 
                src={webConfig.qrisImageUrl} 
                alt="QRIS QR Code Official" 
                className="w-[180px] h-[180px] object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <>
                {/* Top-Left Finder Pattern (Square) */}
                <div className="absolute top-4 left-4 h-9 w-9 border-[4px] border-slate-900 bg-white p-1 rounded-sm">
                  <div className="h-full w-full bg-slate-900 rounded-[1px]" />
                </div>
                {/* Top-Right Finder Pattern (Square) */}
                <div className="absolute top-4 right-4 h-9 w-9 border-[4px] border-slate-900 bg-white p-1 rounded-sm">
                  <div className="h-full w-full bg-slate-900 rounded-[1px]" />
                </div>
                {/* Bottom-Left Finder Pattern (Square) */}
                <div className="absolute bottom-4 left-4 h-9 w-9 border-[4px] border-slate-900 bg-white p-1 rounded-sm">
                  <div className="h-full w-full bg-slate-900 rounded-[1px]" />
                </div>
                {/* Bottom-Right Small Finder Pattern */}
                <div className="absolute bottom-6 right-6 h-4 w-4 border-2 border-slate-900 bg-white p-0.5 rounded-sm">
                  <div className="h-full w-full bg-slate-900" />
                </div>

                {/* Custom high-fidelity QR Code background SVG simulating the uploaded one */}
                <svg width="180" height="180" viewBox="0 0 100 100" className="text-slate-900" fill="currentColor">
                  {/* Complex randomized matrix paths to give a highly realistic QR look */}
                  <path d="M 22 10 h 2 v 2 h -2 z M 26 10 h 4 v 2 h -4 z M 34 10 h 2 v 4 h -2 z M 40 10 h 6 v 2 h -6 z M 48 10 h 2 v 2 h -2 z M 54 10 h 4 v 2 h -4 z" />
                  <path d="M 10 22 h 2 v 6 h -2 z M 14 24 h 4 v 2 h -4 z M 24 22 h 6 v 2 h -6 z M 34 22 h 2 v 2 h -2 z M 44 22 h 4 v 4 h -4 z M 52 24 h 6 v 2 h -6 z" />
                  <path d="M 22 26 h 4 v 2 h -4 z M 30 28 h 2 v 4 h -2 z M 38 26 h 8 v 2 h -8 z M 50 28 h 4 v 2 h -4 z M 56 26 h 2 v 2 h -2 z M 10 32 h 6 v 2 h -6 z" />
                  <path d="M 18 34 h 2 v 2 h -2 z M 22 32 h 4 v 4 h -4 z M 28 34 h 8 v 2 h -8 z M 38 32 h 2 v 2 h -2 z M 42 34 h 6 v 2 h -6 z M 52 32 h 4 v 2 h -4 z" />
                  <path d="M 12 40 h 2 v 2 h -2 z M 16 42 h 4 v 2 h -4 z M 22 40 h 8 v 2 h -8 z M 32 42 h 2 v 4 h -2 z M 36 40 h 6 v 2 h -6 z M 46 42 h 6 v 2 h -6 z" />
                  <path d="M 10 46 h 8 v 2 h -8 z M 20 48 h 4 v 2 h -4 z M 26 46 h 2 v 2 h -2 z M 30 48 h 6 v 2 h -6 z M 38 46 h 4 v 2 h -4 z M 44 48 h 8 v 2 h -4 z" />
                  <path d="M 14 52 h 2 v 2 h -2 z M 18 54 h 6 v 2 h -6 z M 26 52 h 4 v 2 h -4 z M 32 54 h 2 v 2 h -2 z M 36 52 h 8 v 2 h -8 z M 48 54 h 6 v 2 h -6 z" />
                  <path d="M 10 58 h 6 v 2 h -6 z M 18 60 h 2 v 4 h -2 z M 22 58 h 4 v 2 h -4 z M 28 60 h 8 v 2 h -8 z M 38 58 h 4 v 2 h -4 z M 44 60 h 6 v 2 h -6 z" />
                  <path d="M 12 66 h 4 v 2 h -4 z M 20 64 h 2 v 2 h -2 z M 24 66 h 6 v 2 h -6 z M 34 64 h 4 v 4 h -4 z M 40 66 h 2 v 2 h -2 z M 44 64 h 8 v 2 h -8 z" />
                  <path d="M 10 70 h 8 v 2 h -8 z M 22 72 h 4 v 2 h -4 z M 28 70 h 2 v 2 h -2 z M 32 72 h 6 v 2 h -6 z M 40 70 h 4 v 2 h -4 z M 46 72 h 8 v 2 h -8 z" />
                  
                  {/* Additional realistic paths on the center-right and bottom-right areas */}
                  <path d="M 64 10 h 4 v 2 h -4 z M 70 12 h 2 v 4 h -2 z M 74 10 h 6 v 2 h -6 z M 82 12 h 2 v 2 h -2 z M 86 10 h 4 v 4 h -4 z M 66 20 h 4 v 2 h -4 z" />
                  <path d="M 72 22 h 6 v 2 h -6 z M 80 24 h 2 v 2 h -2 z M 84 22 h 6 v 2 h -6 z M 64 30 h 8 v 2 h -8 z M 74 32 h 2 v 2 h -2 z M 78 30 h 6 v 2 h -6 z" />
                  <path d="M 86 32 h 4 v 2 h -4 z M 68 40 h 4 v 2 h -4 z M 74 42 h 6 v 2 h -6 z M 82 40 h 2 v 2 h -2 z M 86 42 h 4 v 2 h -4 z M 66 48 h 4 v 2 h -4 z" />
                  <path d="M 72 46 h 8 v 2 h -8 z M 82 48 h 4 v 2 h -4 z M 88 46 h 2 v 2 h -2 z M 64 56 h 6 v 2 h -6 z M 72 58 h 4 v 2 h -4 z" />
                  <path d="M 88 58 h 2 v 2 h -2 z M 66 64 h 4 v 2 h -4 z M 72 66 h 6 v 2 h -6 z M 80 64 h 2 v 2 h -2 z M 84 66 h 4 v 2 h -4 z M 64 72 h 8 v 2 h -8 z" />
                  
                  {/* Center GPN square to overlay nicely */}
                  <rect x="42" y="42" width="16" height="16" rx="3" fill="#ffffff" />
                  {/* Tiny GPN text logo in center */}
                  <text x="50" y="52" fontSize="7" fontWeight="900" fill="#E11D48" textAnchor="middle" letterSpacing="-0.5">GPN</text>
                </svg>
              </>
            )}
          </div>
        </div>

        {/* SATU QRIS UNTUK SEMUA Footer Segment */}
        <div className="text-center pt-2 space-y-1">
          <div className="inline-block border border-slate-350 px-4 py-0.5 rounded-full text-[9px] font-extrabold text-slate-800 tracking-wider bg-slate-50 uppercase leading-none">
            Satu QRIS Untuk Semua
          </div>
          <p className="text-[7px] text-slate-400 font-bold tracking-tight">
            Cek aplikasi penyelenggara di: www.aspi-qris.id
          </p>
        </div>

        {/* Small Fineprint Footer info (matches exact detail) */}
        <div className="flex items-center justify-between text-[6px] text-slate-400/80 font-mono mt-4 pt-2 border-t border-slate-100">
          <span>Dicetak oleh: 93600915</span>
          <span>Versi cetak: 1.0.10.05.24</span>
        </div>
      </div>

      {/* Pay Mode Visual Helper Board */}
      {amount !== undefined && amount > 0 && (
        <div className="bg-rose-50 border-t border-rose-100 p-3 flex items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-rose-500 shrink-0" />
            <span className="text-[10px] text-rose-800 font-extrabold">Total Tagihan Paket:</span>
          </div>
          <span className="text-xs font-black text-rose-600 font-mono">
            Rp {amount.toLocaleString("id-ID")}
          </span>
        </div>
      )}

      {/* Standard Instruction Manual Card */}
      <div className="bg-rose-600 text-white p-4 space-y-2 text-[10px]">
        <p className="font-extrabold tracking-wide text-[9px] uppercase text-white/90">Cara bayar dengan QRIS:</p>
        <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-semibold text-white/90">
          <div className="bg-rose-700/50 p-1.5 rounded-xl border border-white/10 space-y-1">
            <Smartphone className="h-4 w-4 mx-auto text-white" />
            <p className="leading-tight">1. Buka Aplikasi Berlogo QRIS</p>
          </div>
          <div className="bg-rose-700/50 p-1.5 rounded-xl border border-white/10 space-y-1">
            <QrCode className="h-4 w-4 mx-auto text-white" />
            <p className="leading-tight">2. Scan & Cek Nama Toko</p>
          </div>
          <div className="bg-rose-700/50 p-1.5 rounded-xl border border-white/10 space-y-1 bg-white/10 text-amber-300 font-extrabold">
            <span className="text-xs font-bold leading-none block">✓</span>
            <p className="leading-tight text-white">3. Masukkan PIN & Bayar</p>
          </div>
        </div>
      </div>
    </div>
  );
}
