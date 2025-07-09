import React from 'react';
import { useUsers } from '../hooks/useUsers';
import { Link } from 'react-router-dom';

const AdminReferralsPage: React.FC = () => {
  const { users, loading } = useUsers();

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Referral Management</h1>
        <div className="flex items-center space-x-4">
          <Link to="/admin/dashboard" className="text-sm text-amber-600 hover:text-amber-800">&larr; Back to Dashboard</Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-xl overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-4 font-semibold text-gray-600">User Name</th>
              <th className="p-4 font-semibold text-gray-600">Email</th>
              <th className="p-4 font-semibold text-gray-600">Referral Code</th>
              <th className="p-4 font-semibold text-gray-600"># of Referrals</th>
              <th className="p-4 font-semibold text-gray-600">Referred By</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const referrer = users.find(u => u.referral_code === user.referred_by_code);
              return (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-gray-800 font-medium">{user.name}</td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4 text-amber-600 font-mono">{user.referral_code}</td>
                  <td className="p-4 text-gray-600 font-bold text-center">{user.referred_users.length}</td>
                  <td className="p-4 text-gray-600">
                    {referrer ? (
                      <div>
                        <p>{referrer.name}</p>
                        <p className="text-xs text-gray-500 font-mono">({referrer.referral_code})</p>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">None</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center text-gray-500 py-8">No users have signed up yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminReferralsPage;