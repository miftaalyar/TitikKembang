import { useEffect, useState, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { createProduct, updateProduct } from "@/src/lib/dataService";
import { Package, Image as ImageIcon, Loader2, Upload, X, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

import { auth } from "@/src/lib/firebase";

interface ProductUploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  productToEdit?: any;
}

function compressAndResizeImage(file: File, maxW = 800, maxH = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }
        } else {
          if (height > maxH) {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Format gambar rusak atau tidak didukung."));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

const CATEGORIES = [
  "Bunga Segar",
  "Buket Kawat Bulu",
  "Bunga Kering",
  "Kado Wisuda"
];

export default function ProductUploadModal({ isOpen, onOpenChange, onSuccess, productToEdit }: ProductUploadModalProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Bunga Segar",
    imageUrl: "",
    inventory: ""
  });

  useEffect(() => {
    if (productToEdit && isOpen) {
      setFormData({
        name: productToEdit.name || "",
        description: productToEdit.description || "",
        price: productToEdit.price ? String(productToEdit.price) : "",
        category: productToEdit.category || "Bunga Segar",
        imageUrl: productToEdit.images?.[0] || "",
        inventory: productToEdit.inventory ? String(productToEdit.inventory) : ""
      });
      const currentImg = productToEdit.images?.[0] || "";
      if (currentImg && !currentImg.startsWith("data:")) {
        setShowUrlInput(true);
      } else {
        setShowUrlInput(false);
      }
    } else if (isOpen) {
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "Bunga Segar",
        imageUrl: "",
        inventory: ""
      });
      setShowUrlInput(false);
    }
  }, [productToEdit, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Sedang membaca & mengompresi foto produk agar muat kencang... 📸");
    try {
      const compressedBase64 = await compressAndResizeImage(file);
      setFormData(prev => ({ ...prev, imageUrl: compressedBase64 }));
      toast.success("Foto katalog berhasil diunggah dengan kompresi hemat penyimpanan! ⚡", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal mengompresi gambar: " + (err.message || String(err)), { id: toastId });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const toastId = toast.loading("Sedang mereduksi & mengimpor foto produk... 🌸");
      try {
        const compressedBase64 = await compressAndResizeImage(file);
        setFormData(prev => ({ ...prev, imageUrl: compressedBase64 }));
        toast.success("Foto katalog berhasil ditaruh & dikompresi otomatis! ⚡", { id: toastId });
      } catch (err: any) {
        console.error(err);
        toast.error("Gagal memproses gambar drop: " + (err.message || String(err)), { id: toastId });
      }
    }
  };

  const clearImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      toast.error("Silakan masuk terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price),
        inventory: parseInt(formData.inventory),
        images: [formData.imageUrl || "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80"],
        category: formData.category
      };

      if (productToEdit) {
        await updateProduct(productToEdit.id, payload);
        toast.success("Produk berhasil diperbarui!");
      } else {
        await createProduct({
          ...payload,
          storeId: user.uid
        });
        toast.success("Produk berhasil ditambahkan!");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(productToEdit ? "Gagal memperbarui produk." : "Gagal menambahkan produk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-lg font-bold">
            <Package className="h-5 w-5 text-primary" />
            {productToEdit ? "Edit Produk Katalog" : "Tambah Produk Katalog"}
          </DialogTitle>
          <DialogDescription>
            {productToEdit ? "Perbarui detail produk bunga atau kerajinan Anda." : "Isi detail produk bunga atau kerajinan Anda untuk ditampilkan kepada pembeli."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2 max-h-[75vh] overflow-y-auto px-1">
          <div className="grid gap-2">
            <Label htmlFor="name">Nama Produk</Label>
            <Input 
              id="name" 
              placeholder="Contoh: Buket Mawar Merah Premium" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Kategori</Label>
            <Select 
              value={formData.category} 
              onValueChange={(val) => setFormData({ ...formData, category: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input 
                id="price" 
                type="number" 
                placeholder="150000" 
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inventory">Stok</Label>
              <Input 
                id="inventory" 
                type="number" 
                placeholder="10" 
                required
                value={formData.inventory}
                onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="desc">Deskripsi</Label>
            <Textarea 
              id="desc" 
              placeholder="Jelaskan detail bunga, ukuran, dan bahan yang digunakan..."
              required
              className="resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                Foto Produk <span className="text-red-500">*</span>
              </Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-[10px] text-muted-foreground flex items-center gap-1 hover:text-primary rounded-full"
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                <LinkIcon className="h-3 w-3" />
                {showUrlInput ? "Gunakan Galeri" : "Gunakan URL Web"}
              </Button>
            </div>

            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {showUrlInput ? (
              <div className="flex gap-2">
                <Input 
                  id="image-url" 
                  placeholder="https://images.unsplash..." 
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  title="Pilih dari Galeri"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                  formData.imageUrl 
                    ? "border-primary/40 bg-primary/5" 
                    : "border-muted-foreground/20 hover:border-primary/40 hover:bg-secondary/40"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {formData.imageUrl ? (
                  <div className="relative group w-full aspect-video rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                    <img 
                      src={formData.imageUrl} 
                      alt="Pratinjau foto produk" 
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        className="rounded-full text-xs font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        Ganti Foto
                      </Button>
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="icon" 
                        className="rounded-full h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImage();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary mb-2">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-foreground">Pilih/Sentuh untuk Buka Galeri 📸</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[250px] mx-auto">
                      Atau seret dan taruh gambar ke sini (Rekomendasi file &lt; 1MB)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground font-semibold">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {productToEdit ? "Simpan Perubahan Katalog" : "Tambahkan ke Katalog"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
