import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { Loader2, Mail, Lock, User as UserIcon, Chrome, Store, Search, Shield } from "lucide-react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultMode?: "login" | "signup";
  defaultRole?: "customer" | "florist" | "admin";
}

export default function AuthModal({ 
  isOpen, 
  onOpenChange, 
  onSuccess, 
  defaultMode = "login",
  defaultRole = "customer"
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [selectedRole, setSelectedRole] = useState<"customer" | "florist" | "admin">(defaultRole);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setSelectedRole(defaultRole);
    }
  }, [isOpen, defaultMode, defaultRole]);

  useEffect(() => {
    if (selectedRole === "admin" && email.trim().toLowerCase() !== "miftaalyar@gmail.com") {
      setSelectedRole("customer");
    }
  }, [email, selectedRole]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      let finalRole: "customer" | "florist" | "admin" = "customer";
      
      try {
        // Check if user profile exists in firestore
        const userRef = doc(db, "users", result.user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          finalRole = result.user.email?.toLowerCase() === "miftaalyar@gmail.com"
            ? "admin"
            : (selectedRole === "admin" ? "customer" : selectedRole);
          await setDoc(userRef, {
            name: result.user.displayName,
            email: result.user.email,
            role: finalRole,
            createdAt: new Date().toISOString()
          });
        } else {
          const profileData = userSnap.data();
          finalRole = result.user.email?.toLowerCase() === "miftaalyar@gmail.com"
            ? "admin"
            : (profileData?.role === "admin" ? "customer" : (profileData?.role || "customer"));
        }
      } catch (fsError: any) {
        console.warn("Firestore access error during Google Sign In:", fsError);
        const isOffline = fsError.message?.toLowerCase().includes("offline") || fsError.code?.toLowerCase().includes("offline");
        if (isOffline) {
          toast.warning("Berhasil masuk, tetapi gagal menyinkronkan profil karena perangkat sedang offline.");
        }
      }
      
      // Dispatch custom role update event immediately
      window.dispatchEvent(new CustomEvent("role-updated", { detail: finalRole }));
      
      toast.success(`Selamat datang, ${result.user.displayName || "User"}!`);
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/popup-closed-by-user") {
        toast.info("Masuk dengan Google dibatalkan karena popup ditutup.");
      } else if (error.code === "auth/operation-not-allowed") {
        toast.error("Metode masuk Google dinonaktifkan di Firebase Console. Harap aktifkan Google provider di bawah menu Authentication > Sign-in method.");
      } else if (error.message?.toLowerCase().includes("offline") || error.code?.toLowerCase().includes("offline")) {
        toast.error("Koneksi gagal karena perangkat atau server sedang offline.");
      } else {
        toast.error(error.message || "Gagal masuk dengan Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalRole: "customer" | "florist" | "admin" = "customer";

      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        finalRole = email.trim().toLowerCase() === "miftaalyar@gmail.com"
          ? "admin"
          : (selectedRole === "admin" ? "customer" : selectedRole);

        try {
          // Initialize user role in firestore based on explicit choice
          await setDoc(doc(db, "users", userCredential.user.uid), {
            name,
            email,
            role: finalRole,
            createdAt: new Date().toISOString()
          });
        } catch (fsError: any) {
          console.warn("Firestore setup failed during signup:", fsError);
          const isOffline = fsError.message?.toLowerCase().includes("offline") || fsError.code?.toLowerCase().includes("offline");
          if (isOffline) {
            toast.warning("Pendaftaran berhasil, tetapi gagal menyimpan data tambahan karena sedang offline.");
          }
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        try {
          const userRef = doc(db, "users", userCredential.user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const profileData = userSnap.data();
            finalRole = email.trim().toLowerCase() === "miftaalyar@gmail.com"
              ? "admin"
              : (profileData?.role === "admin" ? "customer" : (profileData?.role || "customer"));
          }
        } catch (fsError) {
          console.warn("Failed to fetch user role on login:", fsError);
        }
      }
      
      // Dispatch role updated event immediately to avoid auth state race conditions
      window.dispatchEvent(new CustomEvent("role-updated", { detail: finalRole }));

      toast.success(mode === "login" ? "Selamat datang kembali!" : "Pendaftaran berhasil!");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      let message = "Terjadi kesalahan saat autentikasi.";
      
      const isOfflineStatus = error.message?.toLowerCase().includes("offline") || error.code?.toLowerCase().includes("offline");

      if (error.code === "auth/email-already-in-use") {
        message = "Email ini sudah terdaftar. Kami telah mengalihkan Anda ke tab 'Masuk'. Silakan Masuk terlebih dahulu dengan akun/email ini, lalu Anda dapat langsung mengajukan pendaftaran toko sebagai Penjual/Florist!";
        setMode("login");
      } else if (error.code === "auth/operation-not-allowed") {
        message = "Metode autentikasi (Email/Sandi) dinonaktifkan di Firebase Console. Harap aktifkan di bawah menu Authentication > Sign-in method.";
      } else if (error.code === "auth/weak-password") {
        message = "Kata sandi terlalu lemah. Gunakan minimal 6 karakter.";
      } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        message = "Email atau kata sandi tidak sesuai.";
      } else if (error.code === "auth/invalid-email") {
        message = "Format alamat email tidak valid.";
      } else if (isOfflineStatus) {
        message = "Masuk gagal karena perangkat Anda sedang offline. Periksa koneksi internet.";
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-heading">
            {mode === "login" ? "Selamat Datang Kembali" : "Buat Akun Baru"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login" 
              ? "Masuk untuk memesan bunga, mengelola toko, atau mengakses dashboard." 
              : "Gabung dengan komunitas TitikKembang sekarang."}
          </DialogDescription>
        </DialogHeader>

        {/* Account Type Selector Card */}
        <div className="space-y-2 mt-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipe Akun</Label>
          <div className={`grid ${email.trim().toLowerCase() === "miftaalyar@gmail.com" ? "grid-cols-3" : "grid-cols-2"} gap-2 p-1 bg-secondary rounded-2xl`}>
            <button
              type="button"
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-center transition-all border ${
                selectedRole === "customer"
                  ? "bg-background text-primary border-primary/20 shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
              onClick={() => setSelectedRole("customer")}
            >
              <Search className="h-4 w-4 mb-1" />
              <span className="text-[11px]">Cari Bunga</span>
            </button>
            <button
              type="button"
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-center transition-all border ${
                selectedRole === "florist"
                  ? "bg-background text-primary border-primary/20 shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
              onClick={() => setSelectedRole("florist")}
            >
              <Store className="h-4 w-4 mb-1" />
              <span className="text-[11px]">Jual Bunga</span>
            </button>
            {email.trim().toLowerCase() === "miftaalyar@gmail.com" && (
              <button
                type="button"
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-center transition-all border ${
                  selectedRole === "admin"
                    ? "bg-background text-primary border-primary/20 shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
                onClick={() => setSelectedRole("admin")}
              >
                <Shield className="h-4 w-4 mb-1" />
                <span className="text-[11px]">Admin</span>
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="name" 
                  placeholder="Budi Santoso" 
                  className="pl-10 rounded-2xl h-11 bg-secondary/30" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email" 
                type="email" 
                placeholder="email@example.com" 
                className="pl-10 rounded-2xl h-11 bg-secondary/30" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="pl-10 rounded-2xl h-11 bg-secondary/30" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full rounded-full h-12 mt-2 font-semibold" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : mode === "login" ? `Masuk sebagai ${selectedRole === "customer" ? "Pembeli" : selectedRole === "florist" ? "Penjual" : "Admin"}` : `Daftar sebagai ${selectedRole === "customer" ? "Pembeli" : selectedRole === "florist" ? "Penjual" : "Admin"}`}
          </Button>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Atau lanjut dengan</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full rounded-full h-12 font-semibold hover:bg-secondary/50" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <Chrome className="mr-2 h-4 w-4 text-red-500" /> Google
          </Button>

          <div className="text-center text-sm mt-4">
            <span className="text-muted-foreground">
              {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
            </span>
            <button 
              type="button" 
              className="text-primary font-bold hover:underline"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login" ? "Daftar" : "Masuk"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
