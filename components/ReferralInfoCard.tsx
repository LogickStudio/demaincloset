import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const ReferralInfoCard: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user) {
    return null;
  }

  const handleCopy = () => {
    if (!user.referral_code) return;
    navigator.clipboard.writeText(user.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Referral Program</h2>
        <div className="bg-amber-50 p-6 rounded-lg shadow-sm border-l-4 border-amber-400 h-full flex flex-col justify-between">
            <div>
                <p className="text-sm text-amber-800 mb-2">Share your code with friends! They get a discount, and you get a reward.</p>
                <p className="text-gray-700 font-medium mb-1">Your Referral Code:</p>
                <div className="flex items-center gap-2 mb-4">
                    <input 
                        type="text" 
                        value={user.referral_code} 
                        readOnly 
                        className="w-full bg-white text-lg font-mono tracking-widest p-2 border border-amber-300 rounded-md text-amber-900"
                    />
                    <button 
                        onClick={handleCopy}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-3 rounded-md transition"
                        aria-label="Copy referral code"
                    >
                        {copied ? (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        )}
                    </button>
                </div>
            </div>
            <div className="text-center bg-amber-100 p-3 rounded-md">
                <p className="text-amber-900 font-bold text-3xl">{user.referred_users.length}</p>
                <p className="text-amber-800 text-sm">Successful Referrals</p>
            </div>
        </div>
    </section>
  );
};

export default ReferralInfoCard;