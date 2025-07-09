
import React, { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboardPage: React.FC = () => {
  const { logout, user } = useAuth();
  const { users, loading } = useUsers();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/'); // Redirect to homepage after logout
  };
  
  const referralStats = useMemo(() => {
    const totalReferredSignups = users.filter(u => u.referred_by_code).length;
    const leaderboard = [...users]
      .sort((a, b) => (b.referred_users?.length || 0) - (a.referred_users?.length || 0))
      .slice(0, 5); // Top 5 referrers
    return { totalReferredSignups, leaderboard };
  }, [users]);
  
  if (loading) {
     return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-300">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
             <Link
              to="/"
              className="text-sm text-amber-600 hover:text-amber-800"
            >
              &larr; Back to Main Site
            </Link>
            <button 
              onClick={handleLogout}
              className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Welcome, {user?.name || 'Admin'}!</h2>
          <p className="text-gray-600">This is the central hub for managing the Demain Closet web application.</p>
        </section>
        
         {/* Referral Analytics Card */}
        <section className="mb-10">
           <h2 className="text-2xl font-semibold text-gray-700 mb-6">Referral Program Analytics</h2>
           <div className="bg-amber-50 p-6 rounded-lg shadow-sm border-l-4 border-amber-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-amber-100 rounded-lg">
                  <p className="text-4xl font-bold text-amber-800">{referralStats.totalReferredSignups}</p>
                  <p className="text-sm font-medium text-amber-700 mt-1">Total Referred Sign-ups</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-gray-700 mb-2">Top Referrers</h4>
                  {referralStats.leaderboard.length > 0 ? (
                    <ul className="space-y-1 text-sm">
                      {referralStats.leaderboard.map(user => (
                        <li key={user.id} className="flex justify-between items-center p-2 bg-white rounded-md">
                          <span className="text-gray-800 font-medium">{user.name}</span>
                          <span className="font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            {user.referred_users.length} referral{user.referred_users.length !== 1 ? 's' : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-gray-500">No referrals recorded yet.</p>}
                </div>
              </div>
               <Link to="/admin/referrals">
                  <button className="mt-6 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-md transition-colors">View All Referrals</button>
                </Link>
           </div>
        </section>

        {/* Management Panels */}
        <section>
           <h2 className="text-2xl font-semibold text-gray-700 mb-6">Management Panels</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-amber-600">Product Management</h3>
                <p className="text-sm text-gray-600 mt-2">Add, edit, or remove products from the catalog.</p>
                <Link to="/admin/products">
                  <button className="mt-4 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-md transition-colors">Manage Products</button>
                </Link>
             </div>
             <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-amber-600">Coupon Management</h3>
                <p className="text-sm text-gray-600 mt-2">Create and manage discount coupons.</p>
                <Link to="/admin/coupons">
                  <button className="mt-4 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-md transition-colors">Manage Coupons</button>
                </Link>
             </div>
             <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-amber-600">View Messages</h3>
                <p className="text-sm text-gray-600 mt-2">Read and manage inquiries from the contact form.</p>
                <Link to="/admin/messages">
                  <button className="mt-4 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-md transition-colors">Manage Messages</button>
                </Link>
             </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboardPage;