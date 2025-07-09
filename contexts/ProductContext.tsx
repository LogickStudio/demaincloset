
import React, { createContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { supabase } from '../utils/supabaseClient';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'reviews' | 'created_at'>) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getProductById: (productId: string) => Product | undefined;
  getReviewsForProduct: (productId: string) => Promise<Product['reviews']>;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } else {
      setProducts(data as Product[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        console.log('Product change received!', payload);
        fetchProducts(); // Refetch all on any change for simplicity
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addProduct = async (productData: Omit<Product, 'id' | 'reviews' | 'created_at'>) => {
    const { error } = await supabase.from('products').insert([
        {...productData, storage_instructions: productData.storage_instructions }
    ]);
    if (error) throw error;
  };

  const updateProduct = async (updatedProduct: Product) => {
    const { id, reviews, created_at, ...productData } = updatedProduct;
    const { error } = await supabase
      .from('products')
      .update({
          ...productData,
          storage_instructions: productData.storage_instructions,
      })
      .eq('id', id);
    if (error) throw error;
  };

  const deleteProduct = async (productId: string) => {
    // 1. Fetch the product directly from the database to ensure we have the correct data.
    const { data: productToDelete, error: fetchError } = await supabase
      .from('products')
      .select('images')
      .eq('id', productId)
      .single();

    if (fetchError) {
      console.error("Error fetching product before deletion:", fetchError);
      throw new Error(`Could not find the product to delete. It may have already been removed. Error: ${fetchError.message}`);
    }

    if (!productToDelete) {
        throw new Error("Product not found. It may have already been deleted.");
    }
    
    // 2. Delete associated reviews to prevent foreign key constraint violations.
    const { error: reviewError } = await supabase
      .from('reviews')
      .delete()
      .eq('product_id', productId);

    if (reviewError) {
      console.error("Error deleting associated reviews:", reviewError);
      throw new Error(`Failed to delete product's reviews: ${reviewError.message}`);
    }

    // 3. Delete associated images from Supabase Storage.
    if (productToDelete.images && productToDelete.images.length > 0) {
      const filePaths = productToDelete.images
        .map(url => {
          try {
            if (url && url.includes('/storage/v1/object/public/product-images/')) {
              const urlObject = new URL(url);
              const pathParts = urlObject.pathname.split('/product-images/');
              if (pathParts.length > 1) {
                return decodeURIComponent(pathParts[1]);
              }
            }
            return null;
          } catch (e) {
            console.warn(`Could not parse URL, skipping image deletion for: ${url}`, e);
            return null;
          }
        })
        .filter((path): path is string => path !== null);

      if (filePaths.length > 0) {
        const { error: imageError } = await supabase.storage
          .from('product-images')
          .remove(filePaths);

        if (imageError) {
          console.error("Error deleting product images from storage:", imageError);
          alert("The product record was deleted, but an error occurred while removing its images from storage. Check the console for details and clean up storage manually if needed.");
        }
      }
    }

    // 4. Finally, delete the product record from the database.
    const { error: productError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (productError) {
      console.error("Error deleting product record:", productError);
      throw new Error(`Failed to delete product: ${productError.message}`);
    }
  };

  const getProductById = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };
  
  const getReviewsForProduct = async (productId: string): Promise<Product['reviews']> => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profile:profiles(name, picture)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching reviews", error);
      return [];
    }
    if (!data) return [];
    
    // Map the Supabase response to the app's Review type
    return data.map((r: any) => ({
      id: r.id,
      product_id: r.product_id,
      user_id: r.user_id,
      user_name: r.profile?.name || 'Anonymous',
      user_avatar: r.profile?.picture,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
    }));
  };

  const value = useMemo(() => ({
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getReviewsForProduct
  }), [products, loading]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
