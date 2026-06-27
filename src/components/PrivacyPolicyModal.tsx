import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Eye, Lock, Globe, FileText, Check } from "lucide-react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PrivacyPolicyModal({ isOpen, onOpenChange }: PrivacyPolicyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent id="privacy-policy-content" className="max-w-[90vw] md:max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 md:p-8">
        <DialogHeader className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary w-fit">
            <Shield className="h-6 w-6" id="privacy-shield-icon" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight font-heading">
            Kebijakan Privasi <span className="text-primary">TitikKembang</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Terakhir Diperbarui: 8 Juni 2026
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6 text-sm text-foreground/85 leading-relaxed">
          <p className="text-muted-foreground">
            Selamat datang di <strong>TitikKembang</strong>. Kami berkomitmen untuk melindungi informasi pribadi Anda dan hak privasi Anda sesuai dengan ketentuan perundang-undangan yang berlaku. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan menjaga informasi Anda saat Anda menggunakan platform kami untuk mencari atau menjual kreasi bunga dan kriya lokal.
          </p>

          <div className="space-y-3.5 border-t pt-5">
            <h3 className="font-bold text-foreground text-base flex items-center gap-2">
              <Eye className="h-4.5 w-4.5 text-primary" />
              1. Informasi yang Kami Kumpulkan
            </h3>
            <p className="text-muted-foreground">
              Untuk memberikan layanan pencarian peta florist lokal dan transaksi pengambilan sendiri (self-pickup) yang optimal, kami dapat mengumpulkan informasi berikut:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-xs">
              <li>
                <strong className="text-foreground">Informasi Akun:</strong> Nama lengkap, alamat email, dan kata sandi yang Anda buat saat mendaftar menggunakan Firebase Authentication.
              </li>
              <li>
                <strong className="text-foreground">Informasi Toko (untuk Penjual):</strong> Nama toko, foto profil/cover, katalog bunga/kriya, nomor WhatsApp, deskripsi toko, serta tautan (link) Google Maps lokasi presisi toko fisik Anda.
              </li>
              <li>
                <strong className="text-foreground">Detail Lokasi & Koordinasi Pickup:</strong> Sistem melacak atau mengonversi tautan Google Maps toko menjadi koordinat lintang (latitude) & bujur (longitude) agar memudahkan pembeli mencari florist terdekat dan mendapatkan petunjuk arah presisi.
              </li>
              <li>
                <strong className="text-foreground">Data Keranjang & Transaksi Pembelian:</strong> Riwayat barang di keranjang belanja, jadwal penjemputan, dan metadata transaksi terkait.
              </li>
            </ul>
          </div>

          <div className="space-y-3.5 border-t pt-5">
            <h3 className="font-bold text-foreground text-base flex items-center gap-2">
              <Globe className="h-4.5 w-4.5 text-primary" />
              2. Bagaimana Kami Menggunakan Informasi Anda
            </h3>
            <p className="text-muted-foreground">
              Kami menggunakan data yang dikumpulkan untuk tujuan operasional platform TitikKembang, termasuk:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-xs">
              <li>Menampilkan toko fisik florist dan crafter di atas peta interaktif TitikKembang secara akurat.</li>
              <li>Menghitung estimasi jarak terdekat antara lokasi pembeli dengan toko kriya tujuan.</li>
              <li>Memproses pesanan, membuat rincian penjemputan mandiri (self-pickup), dan mempermudah komunikasi langsung melalui WhatsApp.</li>
              <li>Melakukan pengelolaan administrasi, pemeliharaan keamanan, serta verifikasi kepemilikan dashboard bagi pelaku florist lokal.</li>
            </ul>
          </div>

          <div className="space-y-3.5 border-t pt-5">
            <h3 className="font-bold text-foreground text-base flex items-center gap-2">
              <Lock className="h-4.5 w-4.5 text-primary" />
              3. Penyimpanan & Keamanan Data
            </h3>
            <p className="text-muted-foreground text-xs">
              Seluruh data pribadi, kredensial akun, kredensial toko, serta informasi produk disimpan secara aman menggunakan infrastruktur cloud berbasis <strong className="text-foreground">Google Cloud & Firebase (Firestore Database & Firebase Auth)</strong> dengan perlindungan lapis keamanan industri. Kami memberlakukan aturan keamanan Firebase dan tidak secara sengaja membagikan data pribadi Anda kepada broker data komersial atau agensi periklanan pihak ketiga.
            </p>
          </div>

          <div className="space-y-3.5 border-t pt-5">
            <h3 className="font-bold text-foreground text-base flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-primary" />
              4. Hak-Hak Pengguna
            </h3>
            <p className="text-muted-foreground text-xs">
              Anda berhak melihat, mengedit/memutakhirkan informasi profil, mengubah tautan Google Maps toko, menyunting atau menghapus katalog produk craft Anda kapan saja melalui Florist Dashboard yang telah kami sediakan. Jika Anda ingin melakukan penghapusan akun secara keseluruhan dari sistem, Anda dapat menghubungi tim administrasi kami.
            </p>
          </div>

          <div className="space-y-3.5 border-t pt-5">
            <h4 className="font-bold text-foreground">Kontak Hubungi Kami</h4>
            <p className="text-muted-foreground text-xs">
              Jika Anda memiliki pertanyaan mengenai penggunaan data atau Kebijakan Privasi platform TitikKembang ini, jangan ragu untuk berkoordinasi langsung dengan Pengelola Data kami melalui email admin: <a href="mailto:miftaalyar@gmail.com" className="text-primary hover:underline font-bold">miftaalyar@gmail.com</a>.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-8 border-t pt-4 flex sm:justify-end">
          <Button 
            id="close-privacy-btn"
            onClick={() => onOpenChange(false)} 
            className="rounded-full w-full sm:w-auto px-6 font-semibold flex items-center justify-center gap-1.5"
          >
            <Check className="h-4 w-4" /> Saya Mengerti
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
