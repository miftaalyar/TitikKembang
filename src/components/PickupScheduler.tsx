import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { generateTimeSlots } from "@/src/lib/dateUtils";
import { Clock, MapPin, ArrowRight, MessageSquare, AlertTriangle, Smartphone, Plus, Minus, ShoppingCart } from "lucide-react";
import { createOrder } from "@/src/lib/dataService";
import { auth } from "@/src/lib/firebase";
import { toast } from "sonner";
import { addToCart } from "@/src/lib/cartService";

interface PickupSchedulerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
  store: any;
}

export default function PickupScheduler({ isOpen, onOpenChange, product, store }: PickupSchedulerProps) {
  const [checkoutMode, setCheckoutMode] = useState<"instant" | "scheduled">("scheduled");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [sellerNote, setSellerNote] = useState("");
  const [buyerPhone, setBuyerPhone] = useState<string>(() => localStorage.getItem("buyer_phone") || "");

  const slots = date ? generateTimeSlots(date, store?.operatingHours) : [];

  // Reset internal inputs on open/close
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSellerNote("");
      setSelectedSlot(null);
      setDate(new Date());
      setCheckoutMode("scheduled"); // Default to scheduled mode
    }
  }, [isOpen]);

  // Pre-select the first slot of the current date on load/change
  useEffect(() => {
    if (isOpen && date) {
      const generatedSlots = generateTimeSlots(date, store?.operatingHours);
      if (generatedSlots && generatedSlots.length > 0) {
        setSelectedSlot(generatedSlots[0]);
      } else {
        setSelectedSlot("Segera");
      }
    }
  }, [isOpen, date, store?.operatingHours]);

  const handleOrder = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("Silakan masuk terlebih dahulu untuk memesan.");
      return;
    }

    if (!buyerPhone.trim()) {
      toast.error("Silakan masukkan nomor WhatsApp aktif Anda terlebih dahulu untuk memudahkan florist menghubungi Kakak.");
      return;
    }

    if (checkoutMode === "scheduled" && !selectedSlot) {
      toast.error("Silakan tentukan jam pengambilan buket terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const pickupTimeString = format(date || new Date(), "yyyy-MM-dd") + " " + selectedSlot;

      const totalCost = product.price * quantity;

      await createOrder({
        customerId: user.uid,
        customerName: user.displayName || user.email,
        customerPhone: buyerPhone,
        storeId: store.id,
        storeName: store.name,
        items: [{
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          note: sellerNote
        }],
        totalPrice: totalCost,
        pickupTime: pickupTimeString,
        sellerNote: sellerNote, // legacy support
        quantity: quantity,     // legacy support
      });
      
      toast.success(`Pesanan dicatat! Membuka chat WhatsApp Penjual secara langsung...`);

      // WhatsApp Formatting
      const storePhone = store?.phone || "08123456789"; 
      let cleanPhone = storePhone.replace(/[^0-9]/g, "");
      if (cleanPhone.startsWith("0")) {
        cleanPhone = "62" + cleanPhone.slice(1);
      }

      let textMessage = `Halo *${store?.name || "Penjual Bunga"}*,\nsaya ingin memesan langsung (Beli Sekarang):\n💐 *${product?.name}*\n`;
      textMessage += `   - Jumlah: *${quantity} buket*\n`;
      if (sellerNote.trim()) {
        textMessage += `   - Catatan Kustom: _"${sellerNote.trim()}"_\n`;
      }
      textMessage += `💰 Total Pembayaran: *Rp ${totalCost.toLocaleString("id-ID")}*\n`;
      textMessage += `🗓️ Jadwal Pengambilan: *${format(date || new Date(), 'EEEE, dd MMMM yyyy', { locale: localeId }) + " pukul " + selectedSlot}*\n\n`;
      textMessage += `Mohon bantuannya ya admin cantik/ganteng. Terima kasih! 😊`;
      
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMessage)}`;
      window.open(waUrl, "_blank");

      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("Gagal menjadwalkan pesanan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || !store) return;
    
    addToCart({
      productId: product.id,
      name: product.name,
      image: product.images?.[0] || "",
      price: product.price,
      quantity: quantity,
      note: sellerNote,
      storeId: store.id,
      storeName: store.name,
      storePhone: store.phone,
      storeLocation: store.location
    });

    toast.success(`Berhasil! "${product.name}" (${quantity}x) ditambah ke Keranjang.`);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden rounded-3xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex flex-col max-h-[90vh]">
        
        {/* Title area */}
        <DialogHeader className="p-5 pb-4 border-b shrink-0 bg-transparent text-foreground">
          <DialogTitle className="font-heading text-lg font-bold">Beli Sekarang (Pilih Detail & Jadwal)</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Silakan tentukan jumlah, catatan kustom, serta tanggal & waktu pengambilan di gerai {store?.name}.
          </DialogDescription>
        </DialogHeader>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-transparent">
          {/* Header info */}
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-secondary/40 p-3.5 border shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <img src={product?.images?.[0] || ""} alt="" className="h-14 w-14 rounded-xl object-cover border shrink-0 bg-card" />
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-foreground line-clamp-1">{product?.name}</h4>
                <p className="text-xs text-primary font-bold mt-0.5">Rp {product?.price.toLocaleString("id-ID")}</p>
              </div>
            </div>
            
            {/* Quantity Stepper */}
            <div className="flex flex-col items-end gap-1 shrink-0 select-none">
              <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Jumlah</span>
              <div className="flex items-center bg-background rounded-full p-1 border shadow-xs h-8">
                <Button
                  size="icon"
                  variant="ghost"
                  type="button"
                  disabled={quantity <= 1}
                  className="h-6 w-6 rounded-full text-foreground hover:bg-secondary"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="px-2.5 text-xs font-bold font-sans leading-none">{quantity}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  type="button"
                  className="h-6 w-6 rounded-full text-foreground hover:bg-secondary"
                  disabled={product.inventory !== undefined && product.inventory !== null && quantity >= product.inventory}
                  onClick={() => {
                    if (product.inventory !== undefined && product.inventory !== null && quantity >= product.inventory) {
                      toast.error(`Maaf, sisa stok produk ini hanya tinggal ${product.inventory} unit.`);
                      return;
                    }
                    setQuantity(prev => prev + 1);
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Notes area for seller */}
          <div className="grid gap-1.5 p-3.5 rounded-2xl bg-secondary/15 border border-dashed text-xs shrink-0">
            <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1 leading-none">
              🖊️ Catatan Buket (Warna Pita, Pembungkus Wrapping, Kartu Ucapan)
            </label>
            <Textarea 
              id="seller-note" 
              placeholder="Contoh: pita merah gold, kertas wrapping hitam elegan, bonus cetak kartu ucapan wisuda 'Congrats Budi, S.T!'"
              className="resize-none h-[64px] text-xs bg-background rounded-xl border border-muted"
              value={sellerNote}
              onChange={(e) => setSellerNote(e.target.value)}
            />
          </div>

          {/* Schedulers */}
          <div className="grid gap-3.5 md:grid-cols-2">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase">1. Opsi Tanggal Ambil</label>
              <div className="mt-1.5 rounded-2xl border bg-background p-1.5 flex justify-center scale-90 origin-top-left">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date() || d > addDays(new Date(), 14)}
                  className="rounded-md"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">2. Opsi Jam Ambil</label>
              <ScrollArea className="mt-1.5 h-[195px] rounded-2xl border bg-background p-2">
                <div className="grid grid-cols-2 gap-1 px-0.5">
                  {slots.map((slot) => (
                    <Button
                      key={slot}
                      type="button"
                      variant={selectedSlot === slot ? "default" : "outline"}
                      className="text-[10px] h-7 px-1 font-semibold rounded-lg"
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </Button>
                  ))}
                  {slots.length === 0 && (
                    <p className="col-span-2 py-8 text-center text-xs text-muted-foreground leading-snug">
                      Toko tutup pada hari ini.
                    </p>
                  )}
                </div>
              </ScrollArea>
              <p className="text-[9px] text-muted-foreground mt-2 leading-snug">
                *Sesuai Jam Kerja: <span className="font-bold text-foreground">{store?.operatingHours || "08:00 - 20:00"}</span>
              </p>
            </div>
          </div>

          {/* WhatsApp input field */}
          <div className="bg-green-500/5 border border-green-500/15 rounded-2xl p-4 shrink-0 space-y-2.5">
            <Label htmlFor="buyerPhone" className="text-xs font-black text-green-700 uppercase flex items-center gap-1.5 leading-none">
              <Smartphone className="h-4 w-4" /> 3. Masukkan WhatsApp Aktif Anda:
            </Label>
            <div className="space-y-1">
              <Input
                id="buyerPhone"
                type="tel"
                placeholder="Contoh: 08123456789 atau 628..."
                value={buyerPhone}
                onChange={(e) => {
                  const val = e.target.value;
                  setBuyerPhone(val);
                  localStorage.setItem("buyer_phone", val);
                }}
                className="rounded-xl border-dashed border-green-300 focus-visible:ring-green-500 bg-white text-xs h-9"
              />
              <p className="text-[9px] text-muted-foreground font-semibold leading-normal">
                *Florist membutuhkan nomor WhatsApp Kakak untuk koordinasi kriya bouquet kawat bulu & info penjemputan.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/10 bg-primary/5 p-3.5 shrink-0">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-primary animate-bounce shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-foreground leading-none">Lokasi Ambil Sendiri (Self-Pickup):</p>
                <p className="text-muted-foreground mt-1 leading-relaxed text-[11px]">{store?.location.address}</p>
                <a 
                  href={store?.location?.gmapLink || `https://www.google.com/maps/search/?api=1&query=${store?.location.lat},${store?.location.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 text-[10px] text-primary hover:underline font-bold inline-flex items-center gap-1"
                >
                  Buka Maps Hub <ArrowRight className="h-2 w-2" />
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-200 bg-yellow-50/40 p-3 shrink-0">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-yellow-650 shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-normal">
                <span className="font-bold text-foreground block">⚠️ Pembayaran Langsung ke Toko Penjual:</span>
                Order tidak menggunakan metode pay tengah. Kakak bisa membayarnya saat mengambil buket (COD) atau transfer bank pribadi usai chat WhatsApp terkonfirmasi.
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <DialogFooter className="p-4 bg-transparent border-t shrink-0 flex items-center justify-between px-6">
          <div className="text-left shrink-0">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">Total Belanja ({quantity}x)</p>
            <p className="text-lg font-black text-primary leading-tight">Rp {(product?.price * quantity).toLocaleString("id-ID")}</p>
          </div>
          <div className="flex gap-2 shrink-0 select-none">
            <Button 
              type="button"
              className="rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-11 shadow-lg shadow-primary/10 flex items-center justify-center gap-1.5" 
              disabled={isSubmitting || !selectedSlot}
              onClick={handleOrder}
              title={!selectedSlot ? "Silakan jadwalkan tanggal & jam pick-up untuk beli sekarang" : ""}
            >
              {isSubmitting ? "Mengirim..." : "Beli Sekarang ⚡"} <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
