import React from 'react';

export interface ProductVariant {
  size: string;
  price: number;
  stock: number;
}

export interface Review {
  id: string;
  product_id: string; // Changed from productId
  user_id: string; // Changed from userId
  user_name: string; // Changed from userName
  user_avatar?: string;
  rating: number; // 1-5
  comment?: string;
  created_at: string; // Changed from date
}

export interface Product {
  id: string; // Base product ID
  name: string;
  category: string;
  images: string[]; // URL to image.
  description: string; // Detailed description
  variants: ProductVariant[];
  ingredients?: string[]; // Can be used for materials
  storage_instructions?: string; // Can be used for care instructions, changed from storageInstructions
  reviews?: Review[]; // Array of reviews for the product
  created_at?: string;
}

export interface CartItem {
  id: string; // Unique ID for cart item, e.g., product.id + "_" + variant.size
  productId: string; // Reference to the base Product's id
  name: string;
  price: number; // Price of the selected variant
  category: string;
  image: string;
  size: string; // size of the selected variant
  quantity: number;
  description?: string; 
}


export interface User {
  id: string; // Can be Google's sub (subject) claim for Google users
  email: string;
  name: string;
  address?: string; // Optional address
  picture?: string; // Optional: URL for Google profile picture
  referral_code: string; // Changed from referralCode
  referred_by_code?: string; // Changed from referredByCode
  referred_users: string[]; // Array of new user IDs they referred
  is_admin?: boolean;
}

export interface Order {
  id:string;
  items: CartItem[]; // Items will now be based on the detailed CartItem type
  totalAmount: number;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentProof?: string; // e.g., transaction ID or filename
  couponCode?: string;
  discountAmount?: number;
}

export interface Testimonial {
  id: string;
  avatar: string; // URL to image
  text: string;
  name: string;
  role: string;
}

export interface Category {
  id: string;
  name: string;
  path: string; // path for routing, e.g. /products?category=Clothes
  icon: React.ReactNode;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'fixed' | 'percentage'; // changed from discountType
  value: number; // The discount value (e.g., 1000 for ₦1000, or 10 for 10%)
  expiry_date: string; // ISO date string, changed from expiryDate
  min_purchase?: number; // Optional minimum purchase amount, changed from minPurchase
  is_active: boolean; // changed from isActive
  used_by: string[]; // Array of user IDs who have used this coupon
  owner_id?: string; // If set, only this user ID can use it, changed from ownerId
  created_at?: string;
}

export interface Message {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
    is_read: boolean;
}