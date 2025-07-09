import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, ProductVariant, Coupon } from '../types';
import { getItem, setItem } from '../utils/localStorage';
import { useCoupons } from '../hooks/useCoupons';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getCartTotal: () => number;
  getItemCount: () => number;
  applyCoupon: (code: string) => Promise<string>;
  removeCoupon: () => void;
  appliedCoupon: Coupon | null;
  discountAmount: number;
}

const CART_STORAGE_KEY = 'demainClosetCart_v1';
const APPLIED_COUPON_KEY = 'demainClosetAppliedCoupon';

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => getItem<CartItem[]>(CART_STORAGE_KEY) || []);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => getItem<Coupon>(APPLIED_COUPON_KEY));
  const [discountAmount, setDiscountAmount] = useState(0);

  const { validateAndGetCoupon } = useCoupons();
  const { user } = useAuth();
  const { getProductById } = useProducts();

  useEffect(() => {
    setItem(CART_STORAGE_KEY, cartItems);
    // Recalculate discount if cart changes
    if (appliedCoupon) {
      calculateDiscount(appliedCoupon);
    }
  }, [cartItems]);

  useEffect(() => {
    if (appliedCoupon) {
        setItem(APPLIED_COUPON_KEY, appliedCoupon);
    } else {
        localStorage.removeItem(APPLIED_COUPON_KEY);
    }
  }, [appliedCoupon]);

  // Limit cart storage to only session (memory) unless user is logged in and checks 'Remember me' (future-proof)
  // For now, always clear cart from localStorage on logout for safety
  useEffect(() => {
    if (!user) {
      setCartItems([]);
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(APPLIED_COUPON_KEY);
    }
  }, [user]);

  const getCartSubtotal = (): number => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateDiscount = (coupon: Coupon) => {
    const subtotal = getCartSubtotal();
    if (coupon.min_purchase && subtotal < coupon.min_purchase) {
      removeCoupon();
      // Optionally notify user that coupon was removed because condition is no longer met
      return;
    }
    
    let discount = 0;
    if (coupon.discount_type === 'fixed') {
      discount = coupon.value;
    } else if (coupon.discount_type === 'percentage') {
      discount = subtotal * (coupon.value / 100);
    }
    setDiscountAmount(discount > subtotal ? subtotal : discount); // Discount can't be more than subtotal
  };


  const applyCoupon = async (code: string): Promise<string> => {
    if (!user) {
      throw new Error("You must be logged in to apply a coupon.");
    }
    
    const coupon = await validateAndGetCoupon(code, user.id); // Throws errors if invalid

    const subtotal = getCartSubtotal();
    if (coupon.min_purchase && subtotal < coupon.min_purchase) {
      throw new Error(`A minimum purchase of ₦${coupon.min_purchase.toLocaleString()} is required to use this coupon.`);
    }

    setAppliedCoupon(coupon);
    calculateDiscount(coupon);
    return "Coupon applied successfully!";
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const addToCart = (product: Product, variant: ProductVariant, quantity: number) => {
    const liveVariantData = product.variants.find(v => v.size === variant.size);
    if (!liveVariantData) {
        alert("Could not find product variant information. Please refresh and try again.");
        return;
    }
    
    setCartItems(prevItems => {
      const cartItemId = `${product.id}_${variant.size}`;
      const existingItem = prevItems.find(item => item.id === cartItemId);
      const currentQuantityInCart = existingItem ? existingItem.quantity : 0;

      if ((currentQuantityInCart + quantity) > liveVariantData.stock) {
        const canAdd = liveVariantData.stock - currentQuantityInCart;
        alert(`Sorry, only ${liveVariantData.stock} items are available. You can add ${canAdd > 0 ? canAdd : 0} more to your cart.`);
        return prevItems;
      }
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      
      const newCartItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        name: product.name,
        image: product.images[0],
        category: product.category,
        price: variant.price,
        size: variant.size,
        quantity: quantity,
        description: product.description,
      };
      return [...prevItems, newCartItem];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    const itemToUpdate = cartItems.find(item => item.id === cartItemId);
    if (!itemToUpdate) return;
    
    const product = getProductById(itemToUpdate.productId);
    if (!product) {
        console.warn(`Product not found for cart item ${cartItemId}`);
        return;
    }
    
    const variant = product.variants.find(v => v.size === itemToUpdate.size);
    if (!variant) {
        console.warn(`Variant not found for cart item ${cartItemId}`);
        return;
    }

    if (quantity > variant.stock) {
        alert(`You can only order up to ${variant.stock} of this item.`);
        quantity = variant.stock;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === cartItemId ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    removeCoupon();
  };

  const getCartTotal = (): number => {
    const subtotal = getCartSubtotal();
    const finalTotal = subtotal - discountAmount;
    return finalTotal < 0 ? 0 : finalTotal;
  };

  const getItemCount = (): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartSubtotal, getCartTotal, getItemCount, applyCoupon, removeCoupon, appliedCoupon, discountAmount }}>
      {children}
    </CartContext.Provider>
  );
};