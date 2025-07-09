import React, { createContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { User } from '../types';
import { supabase } from '../utils/supabaseClient';

interface UserContextType {
  users: User[];
  loading: boolean;
  getUserById: (userId: string) => User | undefined;
  getUserByReferralCode: (referralCode: string) => User | undefined;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error("Error fetching users for admin:", error);
      // Non-admins will get RLS error, this is expected.
      setUsers([]);
    } else {
      setUsers(data as User[]);
    }
    setLoading(false);
  }, []);


  useEffect(() => {
    // Initial fetch
    fetchUsers();

    // Listen for changes
     const channel = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        fetchUsers();
      })
      .subscribe();

      return () => {
        supabase.removeChannel(channel);
      }
  }, [fetchUsers]);


  const getUserById = useCallback((userId: string) => {
    return users.find(u => u.id === userId);
  }, [users]);

  const getUserByReferralCode = useCallback((referralCode: string) => {
    return users.find(u => u.referral_code?.toUpperCase() === referralCode.toUpperCase());
  }, [users]);

  const value = useMemo(() => ({
    users,
    loading,
    getUserById,
    getUserByReferralCode,
  }), [users, loading, getUserById, getUserByReferralCode]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};