import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import { LOGO_TEXT } from '../constants';
import { supabase } from '../utils/supabaseClient';


const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const { isAuthenticated, signInWithGoogle, createReferralRewardCoupons } = useAuth();
  const { getUserByReferralCode } = useUsers(); 
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);

    try {
        let referrer;
        if (referralCode) {
            referrer = getUserByReferralCode(referralCode);
            if (!referrer) {
                throw new Error("Invalid referral code.");
            }
        }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Signup successful, but no user data returned.");

      // The backend trigger `handle_new_user` creates the profile.
      // Now, we handle the referral logic if a code was used.
      if (referrer) {
          // 1. Update the new user's profile with the referrer's code.
          const { error: updateUserError } = await supabase
            .from('profiles')
            .update({ referred_by_code: referrer.referral_code })
            .eq('id', data.user.id);

          if (updateUserError) {
              console.error("Error setting referred_by_code:", updateUserError);
              // Don't throw, as the signup was successful. Just log the issue.
          }

          // 2. Update the referrer's list of referred users.
          const updatedReferredUsers = [...referrer.referred_users, data.user.id];
          const { error: referrerUpdateError } = await supabase
              .from('profiles')
              .update({ referred_users: updatedReferredUsers })
              .eq('id', referrer.id);

          if (referrerUpdateError) {
            console.error("Error updating referrer's profile:", referrerUpdateError);
          }
          
          // 3. Create coupons for both referrer and new user.
          // We need the new user's full profile to get their generated referral code.
          const { data: newUserProfile, error: getNewProfileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (getNewProfileError || !newUserProfile) {
              console.error("Could not fetch new user's profile to create coupons.");
          } else {
             await createReferralRewardCoupons(referrer, newUserProfile);
          }
      }
      
      // onAuthStateChange in AuthContext will handle navigation to the dashboard.
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
        await signInWithGoogle();
        // onAuthStateChange will handle profile creation/fetching. 
        // Referral on Google sign up is not implemented as it adds complexity.
    } catch (err) {
        setError('Failed to sign up with Google.');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-amber-500">
            {LOGO_TEXT}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account
          </p>
        </div>
        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">{error}</p>}
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-3">
             <div>
              <label htmlFor="full-name-signup" className="sr-only">Full Name</label>
              <input
                id="full-name-signup"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-600 text-black bg-white rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address-signup" className="sr-only">Email address</label>
              <input
                id="email-address-signup"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-600 text-black bg-white rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password-signup" className="sr-only">Password</label>
              <input
                id="password-signup"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-600 text-black bg-white rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
             <div>
              <label htmlFor="referral-code-signup" className="sr-only">Referral Code (Optional)</label>
              <input
                id="referral-code-signup"
                name="referralCode"
                type="text"
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-600 text-black bg-white rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                placeholder="Referral Code (Optional)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign up with</span>
          </div>
        </div>

        <div>
           <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 177.2 56.4l-64.2 64.2c-31.4-29.4-74.2-48-121.2-48-96.6 0-175.2 78.6-175.2 175.2s78.6 175.2 175.2 175.2c105.6 0 148.2-83.2 152.4-123.4H248v-85.4h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
            Sign up with Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-amber-600 hover:text-amber-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;