import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCoupons } from '../hooks/useCoupons';
import ReferralInfoCard from '../components/ReferralInfoCard';

const DashboardPage: React.FC = () => {
  const { user, logout, updateUser, loading: authLoading } = useAuth();
  const { coupons, loading: couponsLoading } = useCoupons();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    address: user?.address || '',
  });

  if (authLoading || !user) {
    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
        </div>
    );
  }
  
  const availableCoupons = coupons.filter(c => {
    if (!user) return false;
    const isExpired = new Date(c.expiry_date) < new Date();
    const hasBeenUsed = c.used_by.includes(user.id);
    const isOwned = !c.owner_id || c.owner_id === user.id;
    
    return c.is_active && !isExpired && !hasBeenUsed && isOwned;
  });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && formData.name.trim()) {
      await updateUser({ name: formData.name.trim(), address: formData.address.trim() });
      setIsEditing(false);
    } else {
        alert("Name cannot be empty.");
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ name: user.name, address: user.address || '' });
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b">
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name}!</h1>
          <button 
            onClick={logout}
            className="mt-4 sm:mt-0 bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
          >
            Logout
          </button>
        </div>

        {/* Profile and Referral Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <section className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Profile Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm h-full">
              {!isEditing ? (
                <>
                  <div className="space-y-2">
                    <p><strong className="text-gray-600 w-24 inline-block">Name:</strong> {user.name}</p>
                    <p><strong className="text-gray-600 w-24 inline-block">Email:</strong> {user.email}</p>
                    <p><strong className="text-gray-600 w-24 inline-block">Address:</strong> {user.address || <span className="text-gray-400 italic">Not provided</span>}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setFormData({ name: user.name, address: user.address || '' });
                    }}
                    className="mt-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 text-sm"
                  >
                    Edit Profile
                  </button>
                </>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Delivery Address</label>
                    <textarea
                      name="address"
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                    ></textarea>
                  </div>
                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-lg transition duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
          <ReferralInfoCard />
        </div>
        
         {/* My Coupons Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">My Coupons</h2>
          {couponsLoading ? (
            <p className="text-gray-600 bg-gray-50 p-4 rounded-md">Loading coupons...</p>
          ) : availableCoupons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCoupons.map(coupon => (
                <div key={coupon.id} className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
                   <p className="font-mono text-lg font-bold text-amber-800 tracking-wider">{coupon.code}</p>
                   <p className="text-gray-700 mt-1">
                     {coupon.discount_type === 'fixed' 
                        ? `₦${coupon.value.toLocaleString()} off`
                        : `${coupon.value}% off`}
                   </p>
                   {coupon.min_purchase && <p className="text-sm text-gray-500">on orders over ₦{coupon.min_purchase.toLocaleString()}</p>}
                   <p className="text-xs text-gray-500 mt-2">Expires: {new Date(coupon.expiry_date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 bg-gray-50 p-4 rounded-md">You have no available coupons at the moment.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;