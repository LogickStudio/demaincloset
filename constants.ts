import React from 'react';
import { Category, Testimonial } from './types';
import TshirtIcon from './components/icons/TshirtIcon';
import BagIcon from './components/icons/BagIcon';
import ShoeIcon from './components/icons/ShoeIcon';
import JewelryIcon from './components/icons/JewelryIcon';

export const APP_NAME = "Demain Closet";
export const LOGO_TEXT = "DEMAIN"; 

export const CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Clothes', path: '/products?category=Clothes', icon: React.createElement(TshirtIcon) }, 
  { id: 'cat2', name: 'Bags', path: '/products?category=Bags', icon: React.createElement(BagIcon) },
  { id: 'cat3', name: 'Shoes', path: '/products?category=Shoes', icon: React.createElement(ShoeIcon) }, 
  { id: 'cat4', name: 'Jewelry', path: '/products?category=Jewelry', icon: React.createElement(JewelryIcon) }, 
];

export const TESTIMONIALS: Testimonial[] = [
  { 
    id: 'test1', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aisha-bello', 
    text: 'Demain Closet has the most elegant and affordable fashion I have seen. The quality is top-notch!', 
    name: 'Aisha Bello', 
    role: 'Fashionista' 
  },
  { 
    id: 'test2', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chinedu-okoro', 
    text: 'I bought a designer-inspired bag and I am in love! It feels so luxurious. My new favorite store.', 
    name: 'Chinedu Okoro', 
    role: 'Happy Shopper' 
  },
  { 
    id: 'test3', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatima-diallo', 
    text: 'Fast delivery and amazing customer service. The Jalabia I ordered fits perfectly.', 
    name: 'Fatima Diallo', 
    role: 'Loyal Customer' 
  },
];

export const HERO_IMAGE_URL = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; 
export const HERO_TAGLINE = "Elegance Within Reach";
export const HERO_CTA_TEXT = "Shop The Collection";

export const ABOUT_US_TEXT = "At Demain Closet, we believe that elegance and style shouldn't break the bank. We are dedicated to curating a collection of chic and sophisticated fashion pieces, from timeless apparel to statement accessories. Our priority is you, our customer, and we strive to provide an unparalleled shopping experience with high-quality products at prices you'll love.";

export const BANK_DETAILS = {
  accountName: 'Alabi Kaosarat',
  accountNumber: '8131972375',
  bankName: 'Opay',
};

export const WHATSAPP_NUMBER = "2349053223790"; // Country code + Number without + or spaces