import { useContext } from 'react';
import { CouponContext } from '../contexts/CouponContext';

export const useCoupons = () => {
  const context = useContext(CouponContext);
  if (context === undefined) {
    throw new Error('useCoupons must be used within a CouponProvider');
  }
  return context;
};
