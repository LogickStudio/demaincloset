
import React, { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Coupon, User } from '../types';
import { supabase } from '../utils/supabaseClient';

interface CouponContextType {
  coupons: Coupon[];
  loading: boolean;
  addCoupon: (couponData: Omit<Coupon, 'id' | 'used_by' | 'created_at'>) => Promise<void>;
  updateCoupon: (updatedCoupon: Coupon) => Promise<void>;
  deleteCoupon: (couponId: string) => Promise<void>;
  validateAndGetCoupon: (code: string, userId: string) => Promise<Coupon>;
  markCouponAsUsed: (code: string, userId: string) => Promise<void>;
}

export const CouponContext = createContext<CouponContextType | undefined>(undefined);

export const CouponProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('coupons').select('*');
    if (error) {
      console.error("Error fetching coupons:", error);
      setCoupons([]);
    } else {
      setCoupons(data as Coupon[]);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    fetchCoupons();

    const channel = supabase
      .channel('public:coupons')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons' }, (payload) => {
        console.log('Coupon change received!', payload);
        fetchCoupons(); // Refetch on change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  const addCoupon = async (couponData: Omit<Coupon, 'id' | 'used_by' | 'created_at'>) => {
    const { error } = await supabase.from('coupons').insert([{ ...couponData, used_by: [] }]);
    if (error) throw error;
  };

  const updateCoupon = async (updatedCoupon: Coupon) => {
    const { id, created_at, ...dataToUpdate } = updatedCoupon;
    const { error } = await supabase
      .from('coupons')
      .update(dataToUpdate)
      .eq('id', id);
    if (error) throw error;
  };

  const deleteCoupon = async (couponId: string) => {
    const { error } = await supabase.from('coupons').delete().eq('id', couponId);
    if (error) throw error;
  };
  
  const validateAndGetCoupon = async (code: string, userId: string): Promise<Coupon> => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();
    
    if (error || !data) throw new Error("Invalid coupon code.");
    
    const coupon = data as Coupon;
    if (!coupon.is_active) throw new Error("This coupon is currently not active.");
    if (new Date(coupon.expiry_date) < new Date()) throw new Error("This coupon has expired.");
    if (coupon.used_by.includes(userId)) throw new Error("You have already used this coupon.");
    if (coupon.owner_id && coupon.owner_id !== userId) throw new Error("This coupon is not assigned to you.");
    
    return coupon;
  };

  const markCouponAsUsed = async (code: string, userId: string) => {
    const { data: coupon, error: fetchError } = await supabase
      .from('coupons')
      .select('used_by')
      .eq('code', code.toUpperCase())
      .single();
    
    if (fetchError || !coupon) {
      console.error("Could not find coupon to mark as used");
      return;
    }

    const updatedUsedBy = [...coupon.used_by, userId];

    const { error: updateError } = await supabase
      .from('coupons')
      .update({ used_by: updatedUsedBy })
      .eq('code', code.toUpperCase());

    if (updateError) {
      console.error("Error marking coupon as used:", updateError);
    }
  };


  const value = useMemo(() => ({
    coupons,
    loading,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    validateAndGetCoupon,
    markCouponAsUsed,
  }), [coupons, loading]);

  return (
    <CouponContext.Provider value={value}>
      {children}
    </CouponContext.Provider>
  );
};
