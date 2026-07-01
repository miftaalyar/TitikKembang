import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  doc, 
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import { db } from "./firebase";

export async function getStore(storeId: string) {
  try {
    const docRef = doc(db, "stores", storeId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error: any) {
    console.warn("Offline or error fetching store:", error);
    return null;
  }
}

export async function getUserProfile(uid: string) {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error: any) {
    console.warn("Offline or error fetching user profile:", error);
    return null;
  }
}

export async function fetchStores() {
  try {
    const querySnapshot = await getDocs(collection(db, "stores"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.warn("Offline or error fetching stores:", error);
    return [];
  }
}

export async function fetchProducts(category?: string, storeId?: string) {
  try {
    let q = query(collection(db, "products"));
    if (category && category !== "Semua") {
      q = query(q, where("category", "==", category));
    }
    if (storeId) {
      q = query(q, where("storeId", "==", storeId));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.warn("Offline or error fetching products:", error);
    return [];
  }
}

export async function fetchOrders(storeId?: string) {
  try {
    let q = query(collection(db, "orders"));
    if (storeId) {
      q = query(q, where("storeId", "==", storeId));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.warn("Offline or error fetching orders:", error);
    return [];
  }
}

export async function fetchBuyerOrders(customerId: string) {
  try {
    const q = query(collection(db, "orders"), where("customerId", "==", customerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    console.warn("Offline or error fetching buyer orders:", error);
    return [];
  }
}

export async function updateUserProfile(uid: string, profileData: any) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, profileData, { merge: true });
}

export async function updateStoreStatus(storeId: string, isVerified: boolean) {
  const storeRef = doc(db, "stores", storeId);
  await setDoc(storeRef, { isVerified }, { merge: true });
}

export async function deleteStore(storeId: string) {
  try {
    await deleteDoc(doc(db, "stores", storeId));
  } catch (error) {
    console.warn("Failed to delete store:", error);
    throw error;
  }
}

export async function updateStoreProfile(storeId: string, profileData: any) {
  const storeRef = doc(db, "stores", storeId);
  await setDoc(storeRef, profileData, { merge: true });
}

export async function updateOrderStatus(orderId: string, status: string) {
  const orderRef = doc(db, "orders", orderId);
  await setDoc(orderRef, { status }, { merge: true });

  // Dispend real-time notification
  try {
    const orderSnap = await getDoc(orderRef);
    if (orderSnap.exists()) {
      const orderData = orderSnap.data();
      const customerId = orderData.customerId;
      const storeId = orderData.storeId;

      // Notify Buyer
      if (customerId) {
        await createNotification(customerId, {
          title: `Status Pesanan: ${status} 🌸`,
          message: `Update terbaru: Pesanan buket bunga Anda #${orderId} kini berstatus "${status}".`,
          type: "transaction",
          orderId
        });
      }

      // Notify Florist/Seller
      if (storeId) {
        const store = (await getStore(storeId)) as any;
        if (store && store.ownerId) {
          await createNotification(store.ownerId, {
            title: `Log Update: Pesanan #${orderId}`,
            message: `Anda baru saja memperbarui status pesanan #${orderId} menjadi "${status}".`,
            type: "transaction",
            orderId
          });
        }
      }
    }
  } catch (err) {
    console.warn("Gagal membuat notifikasi saat updateOrderStatus:", err);
  }
}

export async function createOrder(orderData: any) {
  const ordersRef = collection(db, "orders");
  const docRef = await addDoc(ordersRef, {
    ...orderData,
    createdAt: serverTimestamp(),
    status: "Pesanan Diterima"
  });

  const orderId = docRef.id;

  // Real-time dispatch of transaction notifications
  try {
    // 1. Notify Buyer
    if (orderData.customerId) {
      await createNotification(orderData.customerId, {
        title: "Pemesanan Sukses 🎉",
        message: `Hore! Pesanan Anda #${orderId} telah berhasil diajukan. Pantau pengerjaannya melalui menu Pesanan Anda.`,
        type: "transaction",
        orderId
      });
    }

    // 2. Notify Seller/Florist
    if (orderData.storeId) {
      const store = (await getStore(orderData.storeId)) as any;
      if (store && store.ownerId) {
        await createNotification(store.ownerId, {
          title: "Pesanan Baru Masuk! 🌿",
          message: `Ada pesanan buket baru #${orderId} pelanggan senilai Rp ${Number(orderData.amount || 0).toLocaleString("id-ID")}. Ketuk untuk mengonfirmasi!`,
          type: "transaction",
          orderId
        });
      }
    }
  } catch (err) {
    console.warn("Gagal membuat notifikasi pemesanan di createOrder:", err);
  }

  // Auto decrement item/product inventory
  if (orderData.items && Array.isArray(orderData.items)) {
    for (const item of orderData.items) {
      if (item.productId) {
        try {
          const productRef = doc(db, "products", item.productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            const currentInventory = productSnap.data().inventory;
            const itemQty = parseInt(String(item.quantity), 10) || 1;
            
            if (currentInventory !== undefined && currentInventory !== null) {
              const currentVal = parseInt(String(currentInventory), 10) || 0;
              const nextVal = Math.max(0, currentVal - itemQty);
              await updateDoc(productRef, { inventory: nextVal });
            }
          }
        } catch (error) {
          console.warn("Gagal memproses auto-pengurangan stok produk karena:", error);
        }
      }
    }
  }

  return orderId;
}

export async function createProduct(productData: any) {
  const productsRef = collection(db, "products");
  const docRef = await addDoc(productsRef, {
    ...productData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateProduct(productId: string, productData: any) {
  const productRef = doc(db, "products", productId);
  await setDoc(productRef, productData, { merge: true });
}

export async function deleteProduct(productId: string) {
  await deleteDoc(doc(db, "products", productId));
}

export async function fetchAdPackages() {
  try {
    const snap = await getDocs(collection(db, "adPackages"));
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (list.length === 0) {
      // Auto-seed the 3 requested packages
      const defaultPkgs = [
        {
          name: "Paket Weekend 3 Hari (Jumat-Minggu)",
          price: 15000,
          duration: "3 Hari",
          benefits: [
            "Hanya aktif hari Jumat s/d Minggu",
            "Tampil di halaman pencarian premium weekend",
            "Sangat pas untuk promo kilat akhir pekan"
          ]
        },
        {
          name: "Paket Seminggu Eksklusif (7 Hari)",
          price: 35000,
          duration: "7 Hari",
          benefits: [
            "Eksklusif penuh selama 7 hari penuh (24/7)",
            "Sorotan utama di feeds aplikasi luar",
            "Lencana perunggu penjual populer"
          ]
        },
        {
          name: "Paket Sebulan Juara (30 Hari)",
          price: 120000,
          duration: "30 Hari",
          benefits: [
            "Promosi non-stop penuh selama 30 hari",
            "Boosting prioritas paling atas di seluruh pencarian",
            "Lencana emas premium mitra terpercaya"
          ]
        }
      ];
      
      const seeded: any[] = [];
      const adPackagesRef = collection(db, "adPackages");
      for (const p of defaultPkgs) {
        const docRef = await addDoc(adPackagesRef, {
          ...p,
          createdAt: serverTimestamp()
        });
        seeded.push({ id: docRef.id, ...p });
      }
      return seeded;
    }
    
    return list;
  } catch (e) {
    console.warn("Error fetching ad packages:", e);
    return [];
  }
}

export async function createAdPackage(packageData: any) {
  const adPackagesRef = collection(db, "adPackages");
  const docRef = await addDoc(adPackagesRef, {
    ...packageData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function deleteAdPackage(id: string) {
  await deleteDoc(doc(db, "adPackages", id));
}

const SEED_STORES: any[] = [];

const SEED_PRODUCTS: any[] = [];

export async function seedDatabase() {
  console.log("Seeding database...");
  
  // Seed Stores
  for (const store of SEED_STORES) {
    await setDoc(doc(db, "stores", store.id), {
      ...store,
      createdAt: serverTimestamp()
    });
  }

  // Seed Products
  for (const product of SEED_PRODUCTS) {
    await setDoc(doc(db, "products", product.id), {
      ...product,
      createdAt: serverTimestamp()
    });
  }
  
  console.log("Database seeded successfully!");
}

export async function clearAllAccountsData() {
  console.log("Clearing all registered accounts and dynamic data...");
  try {
    // 1. Delete all users
    const usersSnap = await getDocs(collection(db, "users"));
    for (const d of usersSnap.docs) {
      await deleteDoc(doc(db, "users", d.id));
    }

    // 2. Delete all orders
    const ordersSnap = await getDocs(collection(db, "orders"));
    for (const d of ordersSnap.docs) {
      await deleteDoc(doc(db, "orders", d.id));
    }

    // 3. Delete all products
    const productsSnap = await getDocs(collection(db, "products"));
    for (const d of productsSnap.docs) {
      await deleteDoc(doc(db, "products", d.id));
    }

    // 4. Delete all stores
    const storesSnap = await getDocs(collection(db, "stores"));
    for (const d of storesSnap.docs) {
      await deleteDoc(doc(db, "stores", d.id));
    }

    // 5. Re-seed default demo system state (original seed stores and products)
    await seedDatabase();

    console.log("Registered accounts and dynamic data cleared successfully!");
    return true;
  } catch (error) {
    console.error("Error clearing accounts data:", error);
    throw error;
  }
}

// PROMO BANNER ENDPOINTS FOR SLIDER "IKLAN PENAWARAN"
export async function fetchPromoBanners() {
  try {
    const querySnapshot = await getDocs(collection(db, "promoBanners"));
    const dummyTitles = [
      "Iklan Tampil Teratas! ★",
      "Koleksi Bunga Kawat Bulu Estetik 🌸",
      "Kreasi Kado Graduation Spesial 🎓"
    ];
    
    const banners: any[] = [];
    for (const d of querySnapshot.docs) {
      const data: any = d.data();
      if (dummyTitles.includes(data.title)) {
        // Delete in background from Firestore to clean up real database
        deleteDoc(doc(db, "promoBanners", d.id)).catch(err => console.warn(err));
      } else {
        banners.push({ id: d.id, ...data });
      }
    }
    
    // Sort by order asc, then by createdAt desc
    return banners.sort((a: any, b: any) => {
      const orderA = a.order !== undefined ? Number(a.order) : 999;
      const orderB = b.order !== undefined ? Number(b.order) : 999;
      if (orderA !== orderB) return orderA - orderB;
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    });
  } catch (error: any) {
    console.warn("Offline or error fetching promo banners:", error);
    return [];
  }
}

export async function createPromoBanner(bannerData: any) {
  const bannersRef = collection(db, "promoBanners");
  const docRef = await addDoc(bannersRef, {
    title: bannerData.title || "Promo Baru",
    description: bannerData.description || "",
    imageUrl: bannerData.imageUrl || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600&auto=format&fit=crop&q=80",
    linkUrl: bannerData.linkUrl || "",
    order: Number(bannerData.order) || 0,
    isActive: bannerData.isActive !== undefined ? bannerData.isActive : true,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updatePromoBanner(bannerId: string, bannerData: any) {
  const bannerRef = doc(db, "promoBanners", bannerId);
  const dataToUpdate = { ...bannerData };
  if (dataToUpdate.order !== undefined) dataToUpdate.order = Number(dataToUpdate.order);
  await setDoc(bannerRef, dataToUpdate, { merge: true });
}

export async function deletePromoBanner(bannerId: string) {
  await deleteDoc(doc(db, "promoBanners", bannerId));
}

// Bootstrap default seeded promo banners
export const DEFAULT_PROMO_BANNERS: any[] = [];

export async function seedPromoBannersIfNeeded() {
  return false;
}

// GENERAL WEBSITE PROFILE & SETTINGS
export const DEFAULT_WEB_CONFIG = {
  brandName: "TitikKembang",
  slogan: "Portal Buket & Kerajinan Kawat Bulu Premium Terlengkap",
  csPhone: "628212345678",
  runningText: "Selamat datang di TitikKembang! Dapatkan bervariasi produk buket bunga kawat bulu (plush wire bouquet) buatan crafter lokal terbaik dengan penawaran menarik! ✨",
  promoText: "Diskon Ongkir / Pick-up!",
  emailVisible: "support@titikkembang.com",
  isMaintenance: false,
  logoType: "default", // "default" | "custom_url"
  logoUrl: "",
  logoBgColor: "#1E3E2A", // Default dark emerald background for the logo circle/box
  logoTextColor: "#E8F2EC", // Off-white logo stroke/text color
  qrisMerchantName: "cosmics.co",
  qrisNmid: "ID1022232744543",
  qrisImageUrl: "",
};

export async function fetchWebConfig() {
  try {
    const docRef = doc(db, "webSettings", "configuration");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      // Seed default
      await setDoc(docRef, DEFAULT_WEB_CONFIG);
      return { id: "configuration", ...DEFAULT_WEB_CONFIG };
    }
  } catch (error: any) {
    console.warn("Offline or error fetching web configuration:", error);
    return { id: "configuration", ...DEFAULT_WEB_CONFIG };
  }
}

export function subscribeWebConfig(callback: (config: any) => void) {
  const docRef = doc(db, "webSettings", "configuration");
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      // Seed default
      setDoc(docRef, DEFAULT_WEB_CONFIG).then(() => {
        callback({ id: "configuration", ...DEFAULT_WEB_CONFIG });
      }).catch((e) => {
        console.warn("Failed to seed default web config in snapshot:", e);
        callback({ id: "configuration", ...DEFAULT_WEB_CONFIG });
      });
    }
  }, (error) => {
    console.warn("Error listening to web settings:", error);
  });
}

export async function updateWebConfig(configData: any) {
  try {
    const docRef = doc(db, "webSettings", "configuration");
    await setDoc(docRef, configData, { merge: true });
  } catch (error) {
    console.error("Gagal memperbarui webConfig:", error);
    throw error;
  }
}

// ==========================================
// REAL-TIME NOTIFICATIONS DB ACTIONS
// ==========================================

export async function createNotification(userId: string, notificationData: { title: string; message: string; type?: string; orderId?: string }) {
  try {
    const notificationsRef = collection(db, "notifications");
    await addDoc(notificationsRef, {
      userId,
      title: notificationData.title || "Notifikasi",
      message: notificationData.message || "",
      type: notificationData.type || "system",
      orderId: notificationData.orderId || null,
      isRead: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Gagal membuat notifikasi:", error);
  }
}

export async function fetchNotifications(userId: string) {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort locally by time desc
    return list.sort((a: any, b: any) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.createdAt || 0).getTime() / 1000;
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.createdAt || 0).getTime() / 1000;
      return timeB - timeA;
    });
  } catch (error) {
    console.warn("Gagal mengambil notifikasi:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, { isRead: true });
  } catch (error) {
    console.error("Gagal menandai notifikasi dibaca:", error);
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("isRead", "==", false)
    );
    const querySnapshot = await getDocs(q);
    for (const d of querySnapshot.docs) {
      await updateDoc(doc(db, "notifications", d.id), { isRead: true });
    }
  } catch (error) {
    console.error("Gagal menandai semua notifikasi dibaca:", error);
  }
}

export async function submitReview(reviewData: {
  orderId: string;
  customerId: string;
  customerName: string;
  storeId: string;
  rating: number;
  comment: string;
  imageUrl?: string;
}) {
  const docRef = await addDoc(collection(db, "reviews"), {
    ...reviewData,
    createdAt: new Date().toISOString()
  });

  const q = query(collection(db, "reviews"), where("storeId", "==", reviewData.storeId));
  const snap = await getDocs(q);
  const reviews = snap.docs.map(doc => doc.data());
  const count = reviews.length;
  const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / count;

  const storeRef = doc(db, "stores", reviewData.storeId);
  await updateDoc(storeRef, {
    rating: parseFloat(avgRating.toFixed(1)),
    reviewCount: count
  });

  return { id: docRef.id, rating: avgRating, reviewCount: count };
}

export async function fetchStoreReviews(storeId: string) {
  try {
    const q = query(collection(db, "reviews"), where("storeId", "==", storeId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  } catch (error) {
    console.warn("Error fetching store reviews:", error);
    return [];
  }
}

export async function submitPremiumPayment(paymentData: any) {
  try {
    const docRef = await addDoc(collection(db, "premiumPayments"), {
      ...paymentData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error submitting premium payment:", error);
    throw error;
  }
}

export async function fetchPremiumPayments() {
  try {
    const q = query(collection(db, "premiumPayments"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.warn("Error fetching premium payments:", error);
    return [];
  }
}

export async function fetchStorePremiumPayments(storeId: string) {
  try {
    const q = query(collection(db, "premiumPayments"), where("storeId", "==", storeId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.warn("Error fetching store premium payments:", error);
    return [];
  }
}

export async function updatePremiumPaymentStatus(paymentId: string, status: "pending" | "approved" | "rejected", reason?: string) {
  try {
    const paymentRef = doc(db, "premiumPayments", paymentId);
    const updateData: any = { status };
    if (reason !== undefined) {
      updateData.rejectReason = reason;
    }
    await updateDoc(paymentRef, updateData);
  } catch (error) {
    console.error("Error updating premium payment status:", error);
    throw error;
  }
}

