import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Coupon } from '../types';
import { supabase } from '../utils/supabaseClient';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateUser: (updatedDetails: Partial<User>) => Promise<void>;
  createReferralRewardCoupons: (referrer: User, newUser: User) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to poll for a profile, giving the DB trigger time to run.
const pollForProfile = async (userId: string, attempts = 5, delay = 500): Promise<User | null> => {
    for (let i = 0; i < attempts; i++) {
        const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (profile) return profile as User;
        if (error && error.code !== 'PGRST116') { // 'PGRST116' means no rows found
             console.error("Polling for profile failed with error:", error);
             throw error;
        }
        await new Promise(res => setTimeout(res, delay));
    }
    return null; 
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  const handleUserProfile = async (supabaseUser: SupabaseUser) => {
    // The handle_new_user trigger in the DB will create the profile.
    // We poll here to wait for it to be available.
    const profile = await pollForProfile(supabaseUser.id);

    if (profile) {
      setUser(profile);
    } else {
      console.error(`Profile for user ${supabaseUser.id} not found after multiple attempts.`);
      // If profile is not found, something is wrong. Log them out to be safe.
      await supabase.auth.signOut();
    }
  };


  useEffect(() => {
    const getInitialSession = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
      } else if (data.session) {
        setSession(data.session);
        await handleUserProfile(data.session.user);
      }
      setLoading(false);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setLoading(true);
      if (event === 'SIGNED_IN' && session?.user) {
        await handleUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const createReferralRewardCoupons = async (referrer: User, newUser: User) => {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const sixtyDaysFromNow = new Date();
      sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

      const couponsToCreate: Omit<Coupon, 'id' | 'created_at'>[] = [
        // Reward for new user
        {
          code: `WELCOME-${newUser.referral_code.slice(-4)}-${Date.now() % 1000}`,
          discount_type: 'percentage',
          value: 15,
          expiry_date: thirtyDaysFromNow.toISOString(),
          is_active: true,
          owner_id: newUser.id,
          min_purchase: 2000,
          used_by: [],
        },
        // Reward for referrer
        {
          code: `THANKS-${referrer.referral_code.slice(-4)}-${Date.now() % 1000}`,
          discount_type: 'fixed',
          value: 1000,
          expiry_date: sixtyDaysFromNow.toISOString(),
          is_active: true,
          owner_id: referrer.id,
          min_purchase: 5000,
          used_by: [],
        }
      ];

      const { error } = await supabase.from('coupons').insert(couponsToCreate);
      if (error) {
        console.error("Error creating referral coupons:", error);
      }
  };

  const updateUser = async (updatedDetails: Partial<User>) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update(updatedDetails)
      .eq('id', user.id);
    if (error) {
      console.error("Error updating user:", error);
    } else {
      setUser(prevUser => prevUser ? { ...prevUser, ...updatedDetails } : null);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      console.error('Google Sign In Error', error);
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
     if (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isAuthenticated, loading, logout, signInWithGoogle, updateUser, createReferralRewardCoupons }}>
      {children}
    </AuthContext.Provider>
  );
};