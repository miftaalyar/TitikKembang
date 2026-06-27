import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Smartphone, MessageSquare, ShieldCheck, Clock, User, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface ChatModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
  store: any;
}

interface Message {
  id: string;
  sender: "buyer" | "florist";
  text: string;
  timestamp: Date;
}

export default function ChatModal({ isOpen, onOpenChange, product, store }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // First welcome message
      setMessages([
        {
          id: "welcome",
          sender: "florist",
          text: `Halo Kak! Selamat datang di chat customer service *${store?.name || "Florist"}* 😊. Ada yang bisa kami bantu atau kustomisasi mengenai produk bouquet *${product?.name || "Kawat Bulu"}* seharga *Rp ${product?.price?.toLocaleString("id-ID") || "0"}* ini?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, product, store]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const newBuyerMsg: Message = {
      id: `m-${Date.now()}`,
      sender: "buyer",
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newBuyerMsg]);
    setIsTyping(true);

    // Simulate florist typing and replying
    setTimeout(() => {
      setIsTyping(false);
      let replyText = "";
      const q = text.toLowerCase();

      if (q.includes("pita") || q.includes("warna") || q.includes("kertas") || q.includes("wrap")) {
        replyText = `Bisa sekali kak! Pilihan pita & kertas pembungkus (wrapping) buket kami sangat lengkap. Kami menyediakan warna: merah ceri, pink pastel, biru langit, hitam elegan, putih mutiara, cream manis, emas mewah, dan hijau sage. Kakak bisa tambahkan catatan request warna ini di detail pemesanan ya, gratis tanpa biaya tambahan! 🎀`;
      } else if (q.includes("cepat") || q.includes("dadakan") || q.includes("estimasi") || q.includes("lama") || q.includes("jam") || q.includes("hari")) {
        replyText = `Untuk orderan bouquet buket bunga kawat bulu kustom ini pengerjaannya butuh waktu sekitar 1 sampai 2 jam saja kak setelah konfirmasi. Bila bunga segar (fresh roses) langsung dirangkai 30-45 menit. Kakak bisa jadwalkan jam pengambilan sesuai keinginan kakak! ⏱️`;
      } else if (q.includes("ucapan") || q.includes("kartu") || q.includes("tag") || q.includes("tulis")) {
        replyText = `Tentu saja sudah dapat gratis Kartu Ucapan / Greeting Card premium kak! Kakak bebas request isi ucapannya (misal untuk wisuda, ulang tahun, anniversary). Nanti isi pesan kartunya akan kami print rapi agar estetik! 📝`;
      } else if (q.includes("kirim") || q.includes("kurir") || q.includes("instant") || q.includes("gojek") || q.includes("grab")) {
        replyText = `Untuk pemesanan via web ini adalah sistem *Self-Pickup* (ambil sendiri di toko), agar aman dan bunga tidak rusak di jalan. Tapi jika kakak ingin dikirim via gosend/grab express instan, kakak bisa chat WhatsApp kami setelah pesan, nanti ongkir silakan dibayar di tempat! 🛵`;
      } else {
        replyText = `Siap kak, pertanyaan kakak terkait produk ini telah kami catat dengan senang hati! Agar transaksi & konfirmasi kustomisasi bunga berjalan kilat, kakak sangat kami rekomendasikan untuk menekan tombol **"Lanjut Chat via WhatsApp"** di bawah agar tersambung langsung ke obrolan admin florist kami. Ada bonus voucher potongan juga lho!`;
      }

      setMessages(prev => [...prev, {
        id: `r-${Date.now()}`,
        sender: "florist",
        text: replyText,
        timestamp: new Date()
      }]);
    }, 1200);
  };

  const handleTemplateClick = (text: string) => {
    handleSendMessage(text);
  };

  const exitToWhatsApp = () => {
    const storePhone = store?.phone || "08123456789"; 
    let cleanPhone = storePhone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }

    // Capture the latest chat state to WhatsApp
    const lastBuyerMessages = messages
      .filter(m => m.sender === "buyer")
      .map(m => `- User: "${m.text}"`)
      .join("\n");

    const textMessage = `Halo ${store?.name || "Penjual Bunga"},\nsaya ingin tanya-tanya kustomisasi produk:\n💐 *${product?.name}*\n💰 Harga: *Rp ${product?.price?.toLocaleString("id-ID")}*\n\nBerikut pertanyaan saya sebelum memesan:\n${lastBuyerMessages || "- Apakah bungkusan pitanya bisa diganti kustom?"}\n\nMohon bantuannya ya admin cantik! Terima kasih!`;
    
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMessage)}`;
    window.open(waUrl, "_blank");
    toast.success("Membuka obrolan WhatsApp Penjual resmi...");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden flex flex-col h-[85vh] sm:h-[600px] rounded-3xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Chat Header */}
        <DialogHeader className="p-5 flex flex-row items-center gap-3.5 space-y-0 shrink-0 border-b bg-transparent text-foreground">
          <div className="relative">
            <div className="h-11 w-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-lg text-primary text-center">
              {store?.name?.charAt(0) || "F"}
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base truncate pr-2 text-foreground">{store?.name || "Toko Florist"}</h3>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 font-medium">
              <Clock className="h-3 w-3 text-muted-foreground" /> Buka: {store?.operatingHours || "08:00 - 20:00"}
              <span className="mx-1">•</span>
              <ShieldCheck className="h-3 w-3 text-muted-foreground inline shrink-0" /> Terpercaya
            </p>
          </div>
        </DialogHeader>

        {/* Product Widget Attachment */}
        <div className="bg-secondary/40 border-b px-5 py-3 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <img 
              src={product?.images?.[0]} 
              alt={product?.name} 
              className="h-10 w-10 rounded-lg object-cover border bg-card"
            />
            <div>
              <p className="text-xs font-bold text-foreground line-clamp-1">{product?.name}</p>
              <p className="text-[10px] text-primary font-bold">Rp {product?.price?.toLocaleString("id-ID")}</p>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold bg-secondary px-2.5 py-1 rounded-full border">
            Bahas Kustomisasi Bunga
          </span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-muted/20">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col max-w-[85%] ${
                m.sender === "buyer" ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  m.sender === "buyer"
                    ? "bg-primary text-primary-foreground rounded-tr-none shadow-md shadow-primary/5"
                    : "bg-background text-foreground rounded-tl-none border shadow-sm"
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-muted-foreground mt-1 px-1 flex items-center gap-0.5">
                {m.sender === "buyer" ? <User className="h-2 w-2" /> : <ShieldCheck className="h-2 w-2 text-emerald-600" />}
                {m.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex flex-col items-start max-w-[85%] mr-auto">
              <div className="bg-background text-foreground p-3 rounded-2xl rounded-tl-none border shadow-sm flex items-center gap-1 text-xs">
                <span className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Guidelines / Suggestion Chips */}
        {messages.length < 6 && (
          <div className="px-4 py-2 border-t bg-background shrink-0 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none select-none">
            {[
              "Apakah pitanya bisa request warna?",
              "Ganti pembungkus warna krim?",
              "Bisa disisipkan kartu ucapan?",
              "Berapa jam langsung kelar kak?",
              "Bisa dikirim instan kurir?"
            ].map((qStr) => (
              <Button
                key={qStr}
                variant="outline"
                size="sm"
                className="rounded-full text-[10px] h-7 px-3 py-1 font-semibold text-primary hover:text-primary hover:bg-secondary/40 shrink-0 border-primary/20"
                onClick={() => handleTemplateClick(qStr)}
              >
                {qStr}
              </Button>
            ))}
          </div>
        )}

        {/* Input Bar Footer */}
        <div className="p-4 border-t bg-background flex items-center gap-2 shrink-0">
          <Input
            placeholder="Tulis pesan kustomisasi bunga..."
            value={inputValue}
            className="flex-1 rounded-full bg-secondary border-none h-11 text-xs px-4"
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputValue.trim()) {
                handleSendMessage(inputValue);
                setInputValue("");
              }
            }}
          />
          <Button
            size="icon"
            className="rounded-full h-11 w-11 shrink-0 shadow-lg shadow-primary/15"
            disabled={!inputValue.trim()}
            onClick={() => {
              handleSendMessage(inputValue);
              setInputValue("");
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="rounded-full h-11 w-11 shrink-0 border-green-650/40 text-green-650 bg-green-50/50 hover:bg-green-100 shadow-md shadow-green-650/10 hover:text-green-700 hover:border-green-600/60 transition-all duration-300"
            onClick={exitToWhatsApp}
            title="Lanjut Obrolan WhatsApp"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-[21px] w-[21px] animate-pulse">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.705 1.457h.006c6.551 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
