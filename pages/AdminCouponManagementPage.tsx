import React, { useState } from 'react';
import { useCoupons } from '../hooks/useCoupons';
import { Coupon } from '../types';
import CouponForm from '../components/CouponForm';
import { Link } from 'react-router-dom';

const AdminCouponManagementPage: React.FC = () => {
  const { coupons, deleteCoupon, updateCoupon, loading } = useCoupons();
  const [showForm, setShowForm] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState<Coupon | null>(null);

  const handleAddNew = () => {
    setCouponToEdit(null);
    setShowForm(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setCouponToEdit(coupon);
    setShowForm(true);
  };

  const handleDelete = async (couponId: string) => {
    if (window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
        try {
            await deleteCoupon(couponId);
        } catch(error: any) {
            alert("Error deleting coupon: " + error.message);
        }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setCouponToEdit(null);
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
        await updateCoupon({ ...coupon, is_active: !coupon.is_active });
    } catch (error: any) {
        alert("Error updating coupon: " + error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Coupon Management</h1>
        <div className="flex items-center space-x-4">
          <Link to="/admin/dashboard" className="text-sm text-amber-600 hover:text-amber-800">&larr; Back to Dashboard</Link>
          <button
            onClick={handleAddNew}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            + Add New Coupon
          </button>
        </div>
      </div>

      {showForm ? (
        <CouponForm couponToEdit={couponToEdit} onFormClose={handleFormClose} />
      ) : loading ? (
        <div className="text-center p-8">Loading coupons...</div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-xl overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-4 font-semibold text-gray-600">Code</th>
                <th className="p-4 font-semibold text-gray-600">Type</th>
                <th className="p-4 font-semibold text-gray-600">Value</th>
                <th className="p-4 font-semibold text-gray-600">Expiry Date</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600">Times Used</th>
                <th className="p-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.sort((a, b) => new Date(b.expiry_date).getTime() - new Date(a.expiry_date).getTime()).map(coupon => {
                const isExpired = new Date(coupon.expiry_date) < new Date();
                const status = coupon.is_active ? (isExpired ? 'Expired' : 'Active') : 'Inactive';
                return (
                    <tr key={coupon.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-800 font-mono font-medium">{coupon.code}</td>
                    <td className="p-4 text-gray-600 capitalize">{coupon.discount_type}</td>
                    <td className="p-4 text-gray-600">
                        {coupon.discount_type === 'fixed' ? `₦${coupon.value.toLocaleString()}` : `${coupon.value}%`}
                    </td>
                    <td className="p-4 text-gray-600">{new Date(coupon.expiry_date).toLocaleDateString()}</td>
                    <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            status === 'Active' ? 'bg-green-100 text-green-800' :
                            status === 'Expired' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-200 text-gray-800'
                        }`}>
                            {status}
                        </span>
                    </td>
                    <td className="p-4 text-gray-600 text-center">{coupon.used_by.length}</td>
                    <td className="p-4">
                        <div className="flex space-x-2">
                          <button onClick={() => handleEdit(coupon)} className="text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md transition-colors">Edit</button>
                          <button onClick={() => handleToggleActive(coupon)} disabled={isExpired} className={`text-sm font-medium text-white px-3 py-1 rounded-md transition-colors ${ coupon.is_active ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600' } disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {coupon.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => handleDelete(coupon.id)} className="text-sm font-medium text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md transition-colors">Delete</button>
                        </div>
                    </td>
                    </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCouponManagementPage;