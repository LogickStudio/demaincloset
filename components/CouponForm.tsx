import React, { useState, useEffect } from 'react';
import { useCoupons } from '../hooks/useCoupons';
import { Coupon } from '../types';

interface CouponFormProps {
  couponToEdit: Coupon | null;
  onFormClose: () => void;
}

const initialFormData = {
  code: '',
  discount_type: 'fixed' as 'fixed' | 'percentage',
  value: 0,
  expiry_date: '',
  min_purchase: 0,
  is_active: true,
};

const CouponForm: React.FC<CouponFormProps> = ({ couponToEdit, onFormClose }) => {
  const { addCoupon, updateCoupon, coupons } = useCoupons();
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (couponToEdit) {
      setFormData({
        code: couponToEdit.code,
        discount_type: couponToEdit.discount_type,
        value: couponToEdit.value,
        expiry_date: couponToEdit.expiry_date.split('T')[0], // Format for date input
        min_purchase: couponToEdit.min_purchase || 0,
        is_active: couponToEdit.is_active,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [couponToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!couponToEdit && coupons.some(c => c.code.toUpperCase() === formData.code.toUpperCase())) {
        alert('A coupon with this code already exists. Please use a unique code.');
        setIsSubmitting(false);
        return;
    }
    
    if (couponToEdit && couponToEdit.code.toUpperCase() !== formData.code.toUpperCase()) {
        if(coupons.some(c => c.id !== couponToEdit.id && c.code.toUpperCase() === formData.code.toUpperCase())) {
            alert('A coupon with this code already exists. Please use a unique code.');
            setIsSubmitting(false);
            return;
        }
    }
    
    const couponData = {
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        value: Number(formData.value),
        expiry_date: new Date(formData.expiry_date + 'T23:59:59').toISOString(), 
        min_purchase: Number(formData.min_purchase),
        is_active: formData.is_active
    };
    
    try {
        if (couponToEdit) {
          await updateCoupon({ ...couponData, id: couponToEdit.id, used_by: couponToEdit.used_by, owner_id: couponToEdit.owner_id });
        } else {
          await addCoupon(couponData as Omit<Coupon, 'id' | 'used_by'>);
        }
        onFormClose();
    } catch(error: any) {
        alert("Error saving coupon: " + error.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{couponToEdit ? 'Edit Coupon' : 'Add New Coupon'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">Coupon Code</label>
            <input type="text" name="code" id="code" value={formData.code} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition uppercase"/>
          </div>
          <div>
            <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700">Expiry Date</label>
            <input type="date" name="expiry_date" id="expiry_date" value={formData.expiry_date} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"/>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label htmlFor="discount_type" className="block text-sm font-medium text-gray-700">Discount Type</label>
                <select name="discount_type" id="discount_type" value={formData.discount_type} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition">
                <option value="fixed">Fixed Amount (₦)</option>
                <option value="percentage">Percentage (%)</option>
                </select>
            </div>
            <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-700">Value</label>
                <input type="number" name="value" id="value" value={formData.value} onChange={handleChange} required min="0" step="any" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"/>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
                <label htmlFor="min_purchase" className="block text-sm font-medium text-gray-700">Minimum Purchase (₦)</label>
                <input type="number" name="min_purchase" id="min_purchase" value={formData.min_purchase} onChange={handleChange} min="0" step="any" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"/>
                 <p className="text-xs text-gray-500 mt-1">Leave as 0 if no minimum purchase is required.</p>
            </div>
            <div className="pt-6">
                <label htmlFor="is_active" className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" name="is_active" id="is_active" checked={formData.is_active} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"/>
                    <span className="text-sm font-medium text-gray-700">Activate Coupon</span>
                </label>
            </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button type="button" onClick={onFormClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors">
            {isSubmitting ? 'Saving...' : (couponToEdit ? 'Update Coupon' : 'Add Coupon')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CouponForm;