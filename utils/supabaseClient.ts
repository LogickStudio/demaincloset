import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProductVariant } from '../types';

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          category: string;
          images: string[];
          description: string;
          variants: ProductVariant[];
          ingredients?: string[];
          storage_instructions?: string;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment?: string;
          created_at: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          address?: string;
          picture?: string;
          referral_code: string;
          referred_by_code?: string;
          referred_users: string[];
          is_admin?: boolean;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_type: 'fixed' | 'percentage';
          value: number;
          expiry_date: string;
          min_purchase?: number;
          is_active: boolean;
          used_by: string[];
          owner_id?: string;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          created_at: string;
          is_read: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
}


// The user has provided the credentials directly to ensure the application works correctly.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase credentials are missing or empty. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables on Netlify.'
  );
}

export const areSupabaseCredentialsSet = true; // Hardcoded to true as credentials are now set.

let supabase: SupabaseClient<Database>;

/**
 * IMPORTANT: You must create a public bucket named 'product-images' in your Supabase project's Storage.
 *
 * 1. Go to Storage -> Buckets -> Create a new bucket in your Supabase dashboard.
 * 2. Enter 'product-images' as the name.
 * 3. Toggle 'Public bucket' to ON.
 * 4. Click 'Create bucket'.
 */
try {
  // Always create the client instance. This prevents 'Cannot read properties of null' errors.
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
} catch (error) {
  console.error("Fatal error initializing Supabase client:", error);
  // If createClient itself fails (e.g., malformed URL), we must throw to stop the app.
  throw new Error("Could not initialize Supabase. Check the URL format in your configuration.");
}

// Export the client instance. It will always be a valid SupabaseClient object.
export { supabase };