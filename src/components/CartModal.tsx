import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { 
  getCart, 
  removeFromCart, 
  updateCartQuantity, 
  updateCartNote, 
  clearCartByStore,
  CartItem 
} from "@/src/lib/cartService";
import { generateTimeSlots } from "@/src/lib/dateUtils";
import { createOrder } from "@/src/lib/dataService";
import { auth } from "@/src/lib/firebase";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  NotebookPen, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CalendarDays,
  CheckCircle,
  X,
  Store,
  Smartphone,
  Check,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface CartModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartModal({ isOpen, onOpenChange }: CartModalProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activeStep, setActiveStep] = useState<"cart" | "schedule" | "success">("cart");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  
  // Advanced scheduling for single or all stores
  const [activeStoreForSchedule, setActiveStoreForSchedule] = useState<string>("");
  const [storeSchedules, setStoreSchedules] = useState<Record<string, { date: Date; slot: string | null }>>({});
  
  // Calendar Selector states
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buyerPhone, setBuyerPhone] = useState<string>(() => localStorage.getItem("buyer_phone") || "");

  // Successful checkout results
  const [successfulOrders, setSuccessfulOrders] = useState<Array<{
    storeId: string;
    storeName: string;
    storePhone: string;
    pickupTime: string;
    totalPrice: number;
    itemsCount: number;
    waUrl: string;
    waClicked: boolean;
  }>>([]);

  useEffect(() => {
    if (isOpen) {
      setCartItems(getCart());
      setActiveStep("cart");
      setSelectedStoreId(null);
      setDate(new Date());
      setSelectedSlot(null);
      setSuccessfulOrders([]);
      setStoreSchedules({});
      setActiveStoreForSchedule("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleCartUpdate = (e: any) => {
      setCartItems(e.detail || []);
    };
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  // Group cart items by store
  const groupedItems = cartItems.reduce((acc, item) => {
    if (!acc[item.storeId]) {
      acc[item.storeId] = {
        storeId: item.storeId,
        storeName: item.storeName,
        storePhone: item.storePhone,
        storeLocation: item.storeLocation,
        items: []
      };
    }
    acc[item.storeId].items.push(item);
    return acc;
  }, {} as Record<string, { storeId: string; storeName: string; storePhone?: string; storeLocation?: any; items: CartItem[] }>);

  const storesList = Object.values(groupedItems);
  const overallTotal = cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  const startCheckout = (storeId: string | "all") => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("Silakan masuk terlebih dahulu untuk melakukan pemesanan.");
      return;
    }
    setSelectedStoreId(storeId);
    
    // Setup target stores
    const targetStores = storeId === "all" ? storesList : storesList.filter(s => s.storeId === storeId);
    
    // Create initial schedules dictionary
    const initialSchedules: Record<string, { date: Date; slot: string | null }> = {};
    targetStores.forEach(s => {
      initialSchedules[s.storeId] = {
        date: new Date(),
        slot: null
      };
    });
    
    setStoreSchedules(initialSchedules);
    setActiveStoreForSchedule(targetStores[0]?.storeId || "");
    setActiveStep("schedule");
  };

  // Synchronize internal calendar selector view with selected store schedules
  useEffect(() => {
    if (activeStoreForSchedule && storeSchedules[activeStoreForSchedule]) {
      setDate(storeSchedules[activeStoreForSchedule].date);
      setSelectedSlot(storeSchedules[activeStoreForSchedule].slot);
    }
  }, [activeStoreForSchedule]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    setDate(newDate);
    if (activeStoreForSchedule) {
      setStoreSchedules(prev => ({
        ...prev,
        [activeStoreForSchedule]: {
          ...prev[activeStoreForSchedule],
          date: newDate
        }
      }));
    }
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    if (activeStoreForSchedule) {
      setStoreSchedules(prev => ({
        ...prev,
        [activeStoreForSchedule]: {
          ...prev[activeStoreForSchedule],
          slot: slot
        }
      }));
    }
  };

  const applyActiveScheduleToAll = () => {
    if (!date || !selectedSlot) {
      toast.error("Silakan tentukan jadwal (tanggal & jam) aktif terlebih dahulu.");
      return;
    }
    setStoreSchedules(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(storeId => {
        next[storeId] = {
          date: date,
          slot: selectedSlot
        };
      });
      return next;
    });
    toast.success("Jadwal aktif berhasil diterapkan ke semua gerai florist! 💐");
  };

  const handleCheckoutSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("Silakan masuk terlebih dahulu.");
      return;
    }

    const targetStoreGroups = selectedStoreId === "all" 
      ? storesList 
      : storesList.filter(s => s.storeId === selectedStoreId);

    if (targetStoreGroups.length === 0) {
      toast.error("Tidak ada item di dalam checkout.");
      return;
    }

    // Validate that all target stores have scheduled pick-up times
    const incompleteStore = targetStoreGroups.find(s => !storeSchedules[s.storeId]?.slot);
    if (incompleteStore) {
      toast.error(`Silakan tentukan jadwal pengambilan untuk ${incompleteStore.storeName} terlebih dahulu.`);
      setActiveStoreForSchedule(incompleteStore.storeId);
      return;
    }

    if (!buyerPhone.trim()) {
      toast.error("Silakan masukkan nomor WhatsApp aktif Anda terlebih dahulu pada langkah Ke-3 untuk memudahkan florist menghubungi Kakak.");
      return;
    }

    setIsSubmitting(true);
    try {
      const ordersToRecord: typeof successfulOrders = [];

      for (const storeGroup of targetStoreGroups) {
        const sched = storeSchedules[storeGroup.storeId];
        const formattedDate = format(sched.date, "yyyy-MM-dd");
        const pickupTimeString = `${formattedDate} ${sched.slot}`;
        
        const checkoutTotal = storeGroup.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Save order to Firestore
        const orderData = {
          customerId: user.uid,
          customerName: user.displayName || user.email,
          customerPhone: buyerPhone,
          storeId: storeGroup.storeId,
          storeName: storeGroup.storeName,
          items: storeGroup.items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            note: item.note
          })),
          totalPrice: checkoutTotal,
          pickupTime: pickupTimeString,
        };

        await createOrder(orderData);

        // Build WhatsApp Link
        const storePhone = storeGroup.storePhone || "08123456789"; 
        let cleanPhone = storePhone.replace(/[^0-9]/g, "");
        if (cleanPhone.startsWith("0")) {
          cleanPhone = "62" + cleanPhone.slice(1);
        }

        let textMessage = `Halo *${storeGroup.storeName}*,\nsaya ingin memesan bouquet sebagai berikut:\n\n`;
        storeGroup.items.forEach((item, index) => {
          textMessage += `${index + 1}. *${item.name}*\n   - Jumlah: *${item.quantity} buket*\n`;
          if (item.note.trim()) {
            textMessage += `   - Catatan Kustom: _"${item.note.trim()}"_\n`;
          }
          textMessage += `   - Harga Satuan: Rp ${item.price.toLocaleString("id-ID")}\n\n`;
        });

        textMessage += `💰 *Total Pembayaran:* Rp ${checkoutTotal.toLocaleString("id-ID")}\n`;
        textMessage += `🗓️ *Jadwal Pengambilan:* ${format(sched.date, 'EEEE, dd MMMM yyyy', { locale: localeId })} pukul *${sched.slot}*\n\n`;
        textMessage += `Mohon bantuannya ya kak untuk dipersiapkan. Mohon infokan metode transfer atau konfirmasi pesanan ini. Terima kasih! 😊💐`;

        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMessage)}`;

        ordersToRecord.push({
          storeId: storeGroup.storeId,
          storeName: storeGroup.storeName,
          storePhone: storePhone,
          pickupTime: `${format(sched.date, 'EEEE, dd MMMM yyyy', { locale: localeId })} jam ${sched.slot}`,
          totalPrice: checkoutTotal,
          itemsCount: storeGroup.items.length,
          waUrl: waUrl,
          waClicked: false
        });

        // Clear local storage cart for this store
        clearCartByStore(storeGroup.storeId);
      }

      setSuccessfulOrders(ordersToRecord);
      
      // If only checking out ONE store, we can automatically try to redirect to WA
      if (ordersToRecord.length === 1) {
        window.open(ordersToRecord[0].waUrl, "_blank");
      }

      setActiveStep("success");
      toast.success("Semua pesanan Anda berhasil didaftarkan di sistem! 🎉");
    } catch (e) {
      console.error("Multi-checkout order creation failed:", e);
      toast.error("Gagal mengirim pesanan. Silakan coba kembali.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMultiStore = selectedStoreId === "all";
  const activeStoreGroup = groupedItems[activeStoreForSchedule];
  const activeStoreOperatingHours = activeStoreGroup?.storeLocation?.operatingHours || "08:00 - 20:00"; 
  const activeStoreSlots = date ? generateTimeSlots(date, activeStoreOperatingHours) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent id="cart-modal-content" className={`sm:max-w-[580px] p-0 overflow-hidden flex flex-col h-[85vh] sm:h-[680px] rounded-3xl`}>
        
        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b shrink-0 bg-transparent text-foreground">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <DialogTitle className="font-heading text-lg font-bold">
              {activeStep === "success" ? "Pesanan Selesai!" : "Keranjang Bouquet Saya"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {activeStep === "cart" && "Tinjau bunga bulu kawat dan bouquet manis pilihan Anda."}
            {activeStep === "schedule" && (isMultiStore 
              ? "Atur jadwal pengambilan untuk setiap florist di bawah ini." 
              : `Atur jadwal pengambilan untuk ${activeStoreGroup?.storeName}.`
            )}
            {activeStep === "success" && "Kirimkan detail checkout Anda langsung ke WhatsApp florist."}
          </DialogDescription>
        </DialogHeader>

        {activeStep === "cart" ? (
          <>
            {/* View Step: Cart Items list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-transparent">
              {storesList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                  <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center text-primary/45 mb-4 animate-bounce">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <h4 className="font-bold text-base text-foreground">Keranjang Masih Kosong 🌻</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                    Wah, belum ada bouquet kawat bulu atau bunga manis yang kamu tambahkan. Yuk cek katalog & temukan terdekat!
                  </p>
                  <Button 
                    className="mt-6 rounded-full px-6 text-xs font-bold"
                    onClick={() => onOpenChange(false)}
                  >
                    Mulai Belanja Bouquet 🛍️
                  </Button>
                </div>
              ) : (
                storesList.map((storeGroup) => {
                  const storeSubtotal = storeGroup.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                  
                  return (
                    <div key={storeGroup.storeId} className="bg-background rounded-2xl border p-4 shadow-sm space-y-4">
                      
                      {/* Store banner row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-primary font-bold text-xs">
                          <Store className="h-4 w-4" />
                          <span>{storeGroup.storeName}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-secondary/30 rounded-full py-0.5 font-bold">
                          {storeGroup.items.length} Item
                        </Badge>
                      </div>

                      <Separator className="opacity-50" />

                      {/* Store specific Items */}
                      <div className="space-y-3.5">
                        {storeGroup.items.map((item) => (
                          <div key={item.id} className="flex flex-col gap-2">
                            <div className="flex gap-3 items-start">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="h-16 w-16 rounded-xl object-cover border bg-muted shrink-0" 
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-xs text-foreground line-clamp-1">{item.name}</h4>
                                <p className="text-xs font-bold text-primary mt-0.5">Rp {item.price.toLocaleString("id-ID")}</p>
                                
                                {/* Stepper & Delete action row */}
                                <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                                  <div className="flex items-center bg-secondary/60 rounded-full p-1 border">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 rounded-full text-foreground hover:bg-secondary"
                                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="px-3 text-xs font-bold leading-none">{item.quantity}</span>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 rounded-full text-foreground hover:bg-secondary"
                                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs text-red-500 hover:text-red-650 font-semibold px-2 hover:bg-red-50/50 rounded-full"
                                    onClick={() => removeFromCart(item.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Live editable notes field for seller */}
                            <div className="mt-1 flex items-start gap-1.5 p-2 bg-secondary/35 rounded-xl border border-dashed text-xs">
                              <NotebookPen className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Catatan Kustomisasi (Kertas, Pita, Kartu Ucapan)</p>
                                <Input
                                  value={item.note}
                                  placeholder="Contoh: ganti kertas wrapping pink, request kartu 'Happy Birthday Rara'"
                                  className="h-7 text-xs bg-transparent border-none p-0 focus-visible:ring-0 shadow-none text-foreground font-medium"
                                  onChange={(e) => updateCartNote(item.id, e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator className="opacity-50" />

                      {/* Store Action Subtotal Footer */}
                      <div className="flex items-center justify-between pt-1 flex-wrap gap-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Subtotal {storeGroup.storeName}</p>
                          <p className="text-base font-extrabold text-foreground">Rp {storeSubtotal.toLocaleString("id-ID")}</p>
                        </div>
                        <Button
                          size="sm"
                          className="rounded-full font-bold text-xs h-9 px-4 flex items-center gap-1 shadow-md shadow-primary/5 cursor-pointer"
                          onClick={() => startCheckout(storeGroup.storeId)}
                        >
                          Checkout Toko Ini 💐
                        </Button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

            {/* Overall Cart Footer Info (if items exist) */}
            {cartItems.length > 0 && (
              <div className="p-4 bg-background border-t shrink-0 flex flex-col gap-3.5 px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Total Gabungan ({cartItems.length} barang)</p>
                    <p className="text-xl font-black text-primary">Rp {overallTotal.toLocaleString("id-ID")}</p>
                  </div>
                  {storesList.length > 1 ? (
                    <Button
                      id="checkout-all-stores-btn"
                      className="rounded-full font-black text-sm h-12 px-6 flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/95 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 cursor-pointer"
                      onClick={() => startCheckout("all")}
                    >
                      Checkout Semua Toko Sekaligus <Sparkles className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
                <p className="text-[9px] text-muted-foreground font-medium bg-secondary/30 p-2 rounded-xl text-center">
                  💡 Pemesanan dicatat per florist di sistem agar penyiapan bouquet oleh masing-masing crafter lokal berlangsung instan dan terjadwal presisi.
                </p>
              </div>
            )}
          </>
        ) : activeStep === "schedule" ? (
          <>
            {/* View Step: Scheduling Date/Time picker */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-transparent">
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs font-bold text-primary flex items-center gap-1 hover:bg-secondary rounded-full cursor-pointer"
                onClick={() => setActiveStep("cart")}
              >
                &larr; Kembali ke Keranjang
              </Button>

              {/* Multi-store selector tabs */}
              {isMultiStore ? (
                <div className="flex flex-col gap-2.5">
                  <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                    Pilih Florist Untuk Atur Jadwal Ambil:
                  </p>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-hide">
                    {storesList.map((store) => {
                      const isSelected = activeStoreForSchedule === store.storeId;
                      const sched = storeSchedules[store.storeId];
                      const hasSlot = !!sched?.slot;
                      
                      return (
                        <button
                          key={store.storeId}
                          type="button"
                          onClick={() => setActiveStoreForSchedule(store.storeId)}
                          className={`flex flex-col items-start p-3 rounded-2xl border text-left min-w-[155px] transition-all duration-300 relative shrink-0 cursor-pointer ${
                            isSelected 
                              ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                              : "border-border bg-card/65 hover:bg-secondary/40"
                          }`}
                        >
                          <span className="text-xs font-bold font-heading line-clamp-1 flex items-center gap-1">
                            <Store className="h-3 w-3 text-primary shrink-0" />
                            {store.storeName}
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-1.5 font-semibold">
                            {hasSlot ? (
                              <span className="text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-md">
                                📅 {sched.slot}
                              </span>
                            ) : (
                              <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded-md">
                                Belum Diatur
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-background rounded-2xl border p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary animate-bounce" />
                    <div>
                      <h4 className="font-bold text-xs text-foreground">Selesaikan Orderan Toko:</h4>
                      <p className="text-xs font-extrabold text-primary">{activeStoreGroup?.storeName}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary font-bold">
                    {activeStoreGroup?.items.length} Item Bunga
                  </Badge>
                </div>
              )}

              {/* Dynamic instruction helper for Multi-Store */}
              {isMultiStore && (
                <div className="flex flex-col gap-2 p-3 bg-primary/5 rounded-2xl border border-primary/15">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary" />
                    <span className="text-xs font-black text-foreground">
                      Mengatur Jadwal: <span className="text-primary">{activeStoreGroup?.storeName}</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                    Setiap florist memiliki lokasi dan jam operasional masing-masing. Atur jadwal satu per satu, atau gunakan tombol di bawah untuk menjadwalkan pengambilan serentak.
                  </p>
                </div>
              )}

              {/* Grid selectors */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-primary" /> 1. Pilih Tanggal Ambil
                  </label>
                  <div className="rounded-2xl border bg-background p-1.5 flex items-center justify-center scale-90 origin-top-left">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      disabled={(d) => d < new Date() || d > addDays(new Date(), 14)}
                      className="rounded-md"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" /> 2. Pilih Jam Ambil
                  </label>
                  <ScrollArea className="h-[210px] rounded-2xl border bg-background p-2">
                    <div className="grid grid-cols-2 gap-1.5">
                      {activeStoreSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedSlot === slot ? "default" : "outline"}
                          className="text-[11px] h-8 font-semibold rounded-lg cursor-pointer"
                          onClick={() => handleSlotSelect(slot)}
                        >
                          {slot}
                        </Button>
                      ))}
                      {activeStoreSlots.length === 0 && (
                        <p className="col-span-2 py-8 text-center text-xs text-muted-foreground">
                          Tidak ada jadwal operasional pada opsi hari ini.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                  <p className="text-[10px] text-muted-foreground mt-2 leading-snug">
                    *Jam operasional {activeStoreGroup?.storeName}: <span className="font-bold text-foreground">{activeStoreOperatingHours}</span>.
                  </p>
                </div>
              </div>

              {/* Bulk Apply schedules control (exclusive for Multi-Store) */}
              {isMultiStore && (
                <div className="flex flex-col gap-2 p-3 bg-secondary/35 rounded-2xl border border-dashed">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase leading-none">💨 Pengambilan Serentak?</p>
                  <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                    <span className="text-[10px] text-muted-foreground font-medium leading-tight">
                      Tekan tombol berikut jika Anda ingin menerapkan jadwal {date ? format(date, "dd MMM yyyy") : ""} pukul {selectedSlot || "belum ditentukan"} di atas ke seluruh florist terpilih.
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      disabled={!selectedSlot}
                      className="text-[10px] h-7 font-extrabold rounded-lg px-3 bg-background text-primary border-primary hover:bg-primary/5 cursor-pointer shrink-0"
                      onClick={applyActiveScheduleToAll}
                    >
                      Terapkan Ke Semua Florist
                    </Button>
                  </div>
                </div>
              )}

              {/* WhatsApp input field */}
              <div className="bg-green-500/5 border border-green-500/15 rounded-2xl p-4 shrink-0 space-y-2.5">
                <Label htmlFor="buyerPhone" className="text-xs font-black text-green-700 uppercase flex items-center gap-1.5 leading-none cursor-pointer">
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
                    className="rounded-xl border-dashed border-green-350 focus-visible:ring-green-500 bg-white text-xs h-9"
                  />
                  <p className="text-[9px] text-muted-foreground font-semibold leading-normal">
                    *Florist membutuhkan nomor WhatsApp Kakak untuk keperluan kustomisasi kawat bulu, status pengerjaan, dan koordinasi pick-up.
                  </p>
                </div>
              </div>

              {/* Alerts & Verification */}
              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 flex gap-2.5 items-start">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5 animate-bounce" />
                <div className="text-xs">
                  <p className="font-bold text-foreground">Lokasi Toko Fisik ({activeStoreGroup?.storeName}):</p>
                  <p className="text-muted-foreground mt-0.5 leading-relaxed font-semibold">
                    {activeStoreGroup?.storeLocation?.address || "Alamat Florist"}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50/50 border border-yellow-200 rounded-2xl p-3.5 flex gap-2.5 items-start">
                <AlertTriangle className="h-4.5 w-4.5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-[10px] leading-relaxed text-muted-foreground font-semibold">
                  <p className="font-bold text-foreground text-yellow-850">⚠️ Transaksi Tanpa Rekening Bersama:</p>
                  Pembayaran disepakati langsung (COD saat ambil di gerai atau transfer pribadi langsung ke WA penjual). Platform lepas dari tanggung jawab sengketa keuangan.
                </div>
              </div>

            </div>

            {/* Footer with Scheduler Actions */}
            <DialogFooter className="p-4 bg-background border-t shrink-0 flex flex-col sm:flex-row gap-3 items-center justify-between px-6">
              <div className="text-center sm:text-left">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Total Tagihan Checkout</p>
                <p className="text-xl font-black text-primary">
                  Rp {(selectedStoreId === "all" ? overallTotal : (activeStoreGroup?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0)).toLocaleString("id-ID")}
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="ghost"
                  className="rounded-full text-xs font-semibold h-11 cursor-pointer"
                  onClick={() => setActiveStep("cart")}
                >
                  Batal
                </Button>
                <Button 
                  className="rounded-full h-11 px-6 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-green-500/10 cursor-pointer" 
                  disabled={isSubmitting}
                  onClick={handleCheckoutSubmit}
                >
                  {isSubmitting ? "Memproses..." : "Selesaikan Orderan"} <Check className="h-4 w-4" />
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* View Step: Multi-Store Success page */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col items-center justify-center bg-transparent text-center">
              <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center text-green-600 animate-pulse">
                <CheckCircle className="h-9 w-9" />
              </div>
              
              <div className="text-center space-y-1 max-w-sm">
                <h3 className="font-heading text-xl font-black text-foreground">Pesanan Sukses Dicatat! 🎉</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pesanan Anda telah berhasil tersimpan di sistem <strong className="text-primary font-bold">TitikKembang</strong>. Sekarang, mari kirim rincian pesanan ke WhatsApp masing-masing florist untuk mempercepat koordinasi pembuatan & kustomisasi bouquet.
                </p>
              </div>

              <div className="w-full space-y-3 pt-2">
                <p className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-widest text-center">
                  Hubungi {successfulOrders.length} Florist Melalui WhatsApp:
                </p>

                <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
                  {successfulOrders.map((order, idx) => {
                    return (
                      <div key={order.storeId} className="border bg-background rounded-2xl p-4 text-left shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                            <Store className="h-3.5 w-3.5 text-primary" />
                            <span>{order.storeName}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground font-semibold">
                            ⏰ {order.pickupTime}
                          </p>
                          <p className="text-[11px] font-extrabold text-primary">
                            Subtotal: Rp {order.totalPrice.toLocaleString("id-ID")}
                          </p>
                        </div>

                        <Button
                          className={`rounded-full text-xs font-black h-9 px-4.5 flex items-center gap-1.5 shadow-md cursor-pointer ${
                            order.waClicked 
                              ? "bg-secondary text-muted-foreground hover:bg-secondary/90 shadow-none border" 
                              : "bg-green-600 hover:bg-green-700 text-white shadow-green-600/10"
                          }`}
                          onClick={() => {
                            setSuccessfulOrders(prev => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], waClicked: true };
                              return next;
                            });
                            window.open(order.waUrl, "_blank");
                          }}
                        >
                          <Smartphone className="h-4 w-4" /> 
                          {order.waClicked ? "Hubungi Lagi ✅" : "Kirim Rincian WA"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground text-center max-w-xs font-medium leading-normal">
                *Setiap florist memiliki lokasi dan nomor kontak tersendiri. Hubungi semuanya agar kriya bunga Anda dipersiapkan dengan baik.
              </p>
            </div>

            {/* Success Footer */}
            <DialogFooter className="p-5 border-t shrink-0 flex items-center justify-between bg-background">
              <div className="text-left hidden sm:block">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block">Total Belanjaan Kamu</span>
                <span className="text-base font-extrabold text-primary">Rp {successfulOrders.reduce((sum, order) => sum + order.totalPrice, 0).toLocaleString("id-ID")}</span>
              </div>
              <Button 
                id="close-success-dialog-btn"
                className="rounded-full px-8 text-xs font-black w-full sm:w-auto h-11 cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Selesai Belanja 💐
              </Button>
            </DialogFooter>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
