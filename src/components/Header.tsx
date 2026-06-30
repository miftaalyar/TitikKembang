import { useState, useEffect, useRef } from "react";
import { Leaf, Search, ShoppingBag, User as UserIcon, LogOut, Menu, Store, ShieldAlert, Compass, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User } from "firebase/auth";
import { getCart } from "@/src/lib/cartService";
import CartModal from "./CartModal";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/src/lib/dataService";
import { toast } from "sonner";

interface HeaderProps {
  user: User | null;
  userRole: "customer" | "florist" | "admin";
  profileRole: "customer" | "florist" | "admin";
  onOpenAuth: (mode: "login" | "signup", defaultRole: "customer" | "florist" | "admin") => void;
  onSwitchRole: (role: "customer" | "florist" | "admin") => void;
  onLogout: () => void;
  onSwitchView?: (view: "map" | "grid" | "admin" | "profile") => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  webConfig?: any;
}

export default function Header({
  user,
  userRole,
  profileRole,
  onOpenAuth,
  onSwitchRole,
  onLogout,
  onSwitchView,
  searchQuery = "",
  onSearchQueryChange,
  webConfig = {}
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // Initial load
    const currentCart = getCart();
    setCartCount(currentCart.reduce((total, item) => total + item.quantity, 0));

    // Listen to changes
    const handleCartUpdate = (e: any) => {
      const updatedCart = e.detail || [];
      setCartCount(updatedCart.reduce((total: number, item: any) => total + item.quantity, 0));
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  // Real-time notifications snapshot listener
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const sorted = list.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.createdAt || 0).getTime() / 1000;
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.createdAt || 0).getTime() / 1000;
        return timeB - timeA;
      });

      // Show toast on-screen for any newly created unread notifications
      if (!isFirstLoad.current) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            if (!data.isRead) {
              toast.info(`🔔 ${data.title}`, {
                description: data.message,
                duration: 5000,
                action: {
                  label: "Lihat",
                  onClick: () => {
                    setIsNotificationsOpen(true);
                  }
                }
              });
            }
          }
        });
      }

      setNotifications(sorted);
      isFirstLoad.current = false;
    }, (err) => {
      console.warn("Error listening to notifications:", err);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Click outside listener for the notification popup to close automatically
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const container = document.getElementById("notifications-popover-container");
      if (container && !container.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isNotificationsOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0" onClick={() => onSwitchView?.("grid")} id="titikkembang-brand-wrapper">
          <div 
            id="titikkembang-logo-box" 
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 duration-200 overflow-hidden"
            style={{ 
              backgroundColor: webConfig?.logoType === "custom_url" && webConfig?.logoUrl ? "transparent" : (webConfig?.logoBgColor || "#1E3E2A"),
              color: webConfig?.logoTextColor || "#E8F2EC",
              boxShadow: `0 10px 15px -3px ${webConfig?.logoBgColor ? webConfig.logoBgColor + "20" : "rgba(0, 0, 0, 0.1)"}`
            }}
          >
            {webConfig?.logoType === "custom_url" && webConfig?.logoUrl ? (
              <img 
                id="titikkembang-logo-img"
                src={webConfig.logoUrl} 
                alt={webConfig.brandName || "Logo"} 
                className="h-full w-full object-cover rounded-xl sm:rounded-2xl" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <svg 
                id="titikkembang-logo-svg"
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5.5 w-5.5 sm:h-6 sm:w-6"
              >
                {/* Elegant Thin Rounded Capsule */}
                <rect 
                  id="titikkembang-logo-capsule"
                  x="18" 
                  y="10" 
                  width="64" 
                  height="80" 
                  rx="32" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  fill="none" 
                />
                
                {/* Double Stalk */}
                <path 
                  id="titikkembang-logo-stalk-left"
                  d="M46 88 L46 51" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                />
                <path 
                  id="titikkembang-logo-stalk-right"
                  d="M54 88 L54 51" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                />
                
                {/* Left Leaf */}
                <path 
                  id="titikkembang-logo-leaf-left"
                  d="M46 51 C22 51 24 30 48 30 C48 38 48 45 46 51" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                
                {/* Right Leaf */}
                <path 
                  id="titikkembang-logo-leaf-right"
                  d="M54 51 C78 51 76 30 52 30 C52 38 52 45 54 51" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                
                {/* Third Leaf (Bottom Right) */}
                <path 
                  id="titikkembang-logo-leaf-bottom"
                  d="M54 80 C72 80 80 68 78 54 C75 46 62 51 54 51" 
                  stroke="currentColor" 
                  strokeWidth="3.6" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            )}
          </div>
          <span className="hidden min-[370px]:inline font-heading text-sm sm:text-lg md:text-xl font-bold tracking-tight text-gray-800 animate-fade-in" id="titikkembang-brand-label">
            {(!webConfig.brandName || webConfig.brandName === "TitikKembang") ? (
              <>Titik<span className="text-primary">Kembang</span></>
            ) : (
              webConfig.brandName
            )}
          </span>
        </div>
        
        {/* Search bar Desktop */}
        <div className="hidden flex-1 items-center justify-center px-12 md:flex">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari buket kawat bulu, mawar..."
              className="w-full rounded-full pl-9 bg-secondary border-none h-11"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange?.(e.target.value)}
            />
          </div>
        </div>

        {/* Action Header Column */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Real-time Notification Dropdown */}
          {user && (
            <div className="relative" id="notifications-popover-container">
              <Button
                variant="outline"
                size="icon"
                className="relative rounded-full h-8 w-8 sm:h-10 sm:w-10 border-primary/25 text-primary hover:bg-primary/5 hover:text-primary transition-all duration-200 shrink-0"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                title="Notifikasi Masuk"
              >
                <Bell className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm ring-2 ring-background animate-bounce z-10">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* Notification drop-down popover panel */}
              {isNotificationsOpen && (
                <div 
                  className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border bg-white p-4 shadow-xl shadow-slate-200/80 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left"
                  id="notifications-dropdown-menu"
                >
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-gray-800">Notifikasi ({unreadCount})</span>
                      {unreadCount > 0 && (
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[10px] text-primary hover:text-[#1D3C29] h-7 rounded-lg font-bold px-2 py-1 shadow-none"
                        onClick={async () => {
                          try {
                            await markAllNotificationsAsRead(user.uid);
                            toast.success("Semua notifikasi ditandai dibaca");
                          } catch (err) {
                            console.warn(err);
                          }
                        }}
                      >
                        Tandai semua dibaca
                      </Button>
                    )}
                  </div>

                  {/* Scrollable list */}
                  <div className="max-h-80 overflow-y-auto space-y-2 pr-1 animate-fade-in" id="notifications-scrollable-area">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground select-none">
                        <div className="text-2xl mb-1.5">🔕</div>
                        <p className="text-xs font-semibold">Belum ada notifikasi baru</p>
                        <p className="text-[10px] opacity-75 mt-0.5">Semua update transaksi akan tertera di sini</p>
                      </div>
                    ) : (
                      notifications.slice(0, 15).map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-3 rounded-xl border transition-all text-xs flex gap-2.5 relative group cursor-pointer 
                            ${notif.isRead 
                              ? "bg-slate-50/50 text-muted-foreground/80 border-slate-100 hover:bg-slate-100/50" 
                              : "bg-emerald-50/40 border-emerald-100/40 shadow-xs hover:bg-[#E8F2EC]/30 font-medium text-slate-900"}`}
                          onClick={async () => {
                            if (!notif.isRead) {
                              try {
                                await markNotificationAsRead(notif.id);
                              } catch (err) {
                                console.warn(err);
                              }
                            }
                            // Close popup
                            setIsNotificationsOpen(false);
                            // Redirect user based on role or context
                            if (notif.orderId) {
                              onSwitchView?.("profile");
                            }
                          }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-extrabold text-foreground">{notif.title}</span>
                              {!notif.isRead && (
                                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                              )}
                            </div>
                            <p className="text-[11px] leading-relaxed mt-1 font-sans text-gray-700">
                              {notif.message}
                            </p>
                            <span className="text-[9px] text-muted-foreground font-semibold mt-1.5 block">
                              {notif.createdAt?.seconds 
                                ? new Date(notif.createdAt.seconds * 1000).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })
                                : "Baru saja"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shopping Cart button in desktop */}
          {userRole === "customer" && (
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-full h-8 w-8 sm:h-10 sm:w-10 border-primary/25 text-primary hover:bg-primary/5 hover:text-primary transition-all duration-200 shrink-0"
              onClick={() => setIsCartOpen(true)}
              title="Keranjang Belanja Saya"
            >
              <ShoppingBag className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm ring-2 ring-background animate-pulse">
                  {cartCount}
                </span>
              )}
            </Button>
          )}

          {/* Profil Button for customer */}
          {userRole === "customer" && user && (
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-full h-8 w-8 sm:h-10 sm:w-10 border-primary/25 text-primary hover:bg-primary/5 hover:text-primary transition-all duration-200 shrink-0"
              onClick={() => onSwitchView?.("profile")}
              title="Profil Buyer Saya (Dashboard)"
            >
              <UserIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </Button>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              {/* Quick Switcher inside Header for Logged-In Users */}
              <div className="hidden items-center gap-2 md:flex">
                {profileRole === "admin" && user?.email?.toLowerCase() === "miftaalyar@gmail.com" && (
                  <Button
                    variant={userRole === "admin" ? "default" : "outline"}
                    size="sm"
                    className="rounded-full text-xs h-9"
                    onClick={() => {
                      onSwitchRole("admin");
                      onSwitchView?.("admin");
                    }}
                  >
                    <ShieldAlert className="mr-1 h-3.5 w-3.5" /> Portal Admin
                  </Button>
                )}
                {(profileRole === "florist" || (profileRole === "admin" && user?.email?.toLowerCase() === "miftaalyar@gmail.com")) && (
                  <Button
                    variant={userRole === "florist" ? "default" : "outline"}
                    size="sm"
                    className="rounded-full text-xs h-9"
                    onClick={() => {
                      const nextRole = userRole === "florist" ? "customer" : "florist";
                      onSwitchRole(nextRole);
                      onSwitchView?.("grid");
                    }}
                  >
                    {userRole === "florist" ? (
                      <><Compass className="mr-1.5 h-3.5 w-3.5 text-primary animate-pulse" /> Mode Pembeli</>
                    ) : (
                      <><Store className="mr-1.5 h-3.5 w-3.5 text-primary" /> Mode Penjual</>
                    )}
                  </Button>
                )}
              </div>

              <div 
                className="hidden flex-col items-end md:flex border-l pl-3 cursor-pointer select-none hover:opacity-85 transition-opacity"
                onClick={() => {
                  if (userRole === "customer") {
                    onSwitchView?.("profile");
                  }
                }}
                title={userRole === "customer" ? "Buka Profil Pembeli / Pesanan" : undefined}
              >
                <span className="text-sm font-bold">{user.displayName || "User"}</span>
                <span className="text-[10px] text-muted-foreground capitalize font-semibold bg-secondary/80 px-2 py-0.5 rounded-full mt-0.5">
                  {userRole === "customer" ? "Pembeli" : userRole === "florist" ? "Penjual" : (user?.email?.toLowerCase() === "miftaalyar@gmail.com" ? "Admin" : "Pembeli")}
                </span>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden md:inline-flex rounded-full h-9 w-9 hover:bg-red-50 hover:text-red-650 transition-colors" 
                onClick={onLogout}
                title="Keluar"
              >
                <LogOut className="h-4 w-4 text-muted-foreground hover:text-red-650" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="rounded-full h-11 px-5 border-primary/20 text-primary hover:bg-primary/5 font-semibold text-xs sm:text-sm flex items-center gap-1.5" 
                  onClick={() => onOpenAuth("login", "customer")}
                >
                  <Search className="h-4 w-4" /> Cari Bunga
                </Button>
                <Button 
                  variant="default" 
                  className="rounded-full h-11 px-5 font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-primary/10" 
                  onClick={() => onOpenAuth("login", "florist")}
                >
                  <Store className="h-4 w-4" /> Jual Bunga
                </Button>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="md:hidden rounded-full text-[10px] sm:text-xs h-8 sm:h-9 font-bold px-2 sm:px-3 border-primary/25 text-primary hover:bg-primary/5 shrink-0" 
                onClick={() => onOpenAuth("login", "customer")}
              >
                Masuk
              </Button>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded-full hover:bg-secondary h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center shrink-0 border"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 md:top-20 inset-x-0 bg-background/95 border-b z-50 p-6 shadow-xl flex flex-col gap-5 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari buket kawat bulu, mawar..."
              className="w-full rounded-full pl-9 bg-secondary border-none h-11"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange?.(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            {/* Mobile shopping cart entry */}
            {userRole === "customer" && (
              <Button
                variant="outline"
                className="w-full rounded-full justify-between text-xs h-11 px-4 font-bold border-primary/25 text-primary hover:bg-primary/5 mr-1"
                onClick={() => {
                  setIsCartOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" /> Keranjang Belanja Saya
                </span>
                {cartCount > 0 && (
                  <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-[10px] text-white">
                    {cartCount} Item
                  </Badge>
                )}
              </Button>
            )}

            {user ? (
              <>
                <div className="py-2 px-1 border-b">
                  <p className="text-sm font-bold text-foreground">Halo, {user.displayName || "User"}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">Role Masuk: {userRole === "customer" ? "Pembeli" : userRole === "florist" ? "Penjual" : "Admin"}</p>
                </div>
                
                {/* Mobile Notification Button entry */}
                <Button
                  variant="outline"
                  className="w-full rounded-full justify-between text-xs h-11 px-4 font-bold border-primary/25 text-primary hover:bg-primary/5 mr-1"
                  onClick={() => {
                    setIsNotificationsOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Bell className="h-4 w-4" /> Notifikasi Saya 🔔
                  </span>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-[10px] text-white">
                      {unreadCount} Baru
                    </Badge>
                  )}
                </Button>
                {userRole === "customer" && (
                  <Button
                    variant="outline"
                    className="w-full rounded-full justify-start text-xs h-11 px-4 font-bold border-rose-100 text-primary hover:bg-rose-50/20"
                    onClick={() => {
                      onSwitchView?.("profile");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <UserIcon className="mr-2 h-4 w-4 shrink-0 text-primary/70" /> Profil & Pesanan Saya 👤
                  </Button>
                )}
                {profileRole === "admin" && user?.email?.toLowerCase() === "miftaalyar@gmail.com" && (
                  <Button
                    variant={userRole === "admin" ? "default" : "outline"}
                    className="w-full rounded-full justify-start text-xs h-11 px-4 font-bold"
                    onClick={() => {
                      onSwitchRole("admin");
                      onSwitchView?.("admin");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <ShieldAlert className="mr-2 h-4 w-4 shrink-0 text-red-500 animate-pulse" /> Portal Admin 🛡️
                  </Button>
                )}
                {(profileRole === "florist" || (profileRole === "admin" && user?.email?.toLowerCase() === "miftaalyar@gmail.com")) && (
                  <Button
                    variant={userRole === "florist" ? "default" : "outline"}
                    className="w-full rounded-full justify-start text-xs h-11 px-4 font-semibold"
                    onClick={() => {
                      const nextRole = userRole === "florist" ? "customer" : "florist";
                      onSwitchRole(nextRole);
                      onSwitchView?.("grid");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {userRole === "florist" ? (
                      <><Compass className="mr-2 h-4 w-4 shrink-0 text-primary" /> Beralih ke Mode Pembeli</>
                    ) : (
                      <><Store className="mr-2 h-4 w-4 shrink-0 text-primary" /> Beralih ke Mode Penjual</>
                    )}
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full rounded-full justify-start text-red-650 hover:bg-red-50 text-xs h-11 px-4 font-bold mt-1"
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4 shrink-0 text-red-500" /> Beralih / Keluar Akun
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Button 
                  variant="outline" 
                  className="rounded-full h-11 px-4 border-primary/20 text-primary font-bold text-xs flex items-center justify-center gap-1.5" 
                  onClick={() => {
                    onOpenAuth("login", "customer");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Search className="h-4 w-4" /> Cari Bunga
                </Button>
                <Button 
                  variant="default" 
                  className="rounded-full h-11 px-4 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-primary/10" 
                  onClick={() => {
                    onOpenAuth("login", "florist");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Store className="h-4 w-4" /> Jual Bunga
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Persistent global Cart modal drawer */}
      <CartModal isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
    </header>
  );
}
