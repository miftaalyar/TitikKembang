export interface CartItem {
  id: string; // unique cart item ID
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  note: string;
  storeId: string;
  storeName: string;
  storePhone?: string;
  storeLocation?: any;
}

const CART_KEY = "titikkembang_cart";

export function getCart(): CartItem[] {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to parse cart storage:", error);
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    // Dispatch custom event to notify all components
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: cart }));
  } catch (error) {
    console.error("Failed to save cart storage:", error);
  }
}

export function addToCart(item: Omit<CartItem, "id">) {
  const cart = getCart();
  
  // Find if product with same custom notes already exists in the cart, so we can increment quantity
  const existingItemIndex = cart.findIndex(
    (i) => i.productId === item.productId && i.note.trim() === item.note.trim()
  );

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += item.quantity;
  } else {
    const id = `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    cart.push({ ...item, id });
  }

  saveCart(cart);
}

export function updateCartQuantity(id: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(id);
    return;
  }
  
  const cart = getCart();
  const itemIndex = cart.findIndex((i) => i.id === id);
  if (itemIndex > -1) {
    cart[itemIndex].quantity = quantity;
    saveCart(cart);
  }
}

export function updateCartNote(id: string, note: string) {
  const cart = getCart();
  const itemIndex = cart.findIndex((i) => i.id === id);
  if (itemIndex > -1) {
    cart[itemIndex].note = note;
    saveCart(cart);
  }
}

export function removeFromCart(id: string) {
  const cart = getCart();
  const filtered = cart.filter((i) => i.id !== id);
  saveCart(filtered);
}

export function clearCart() {
  saveCart([]);
}

export function clearCartByStore(storeId: string) {
  const cart = getCart();
  const filtered = cart.filter((i) => i.storeId !== storeId);
  saveCart(filtered);
}
