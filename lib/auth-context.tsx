'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Company, Subscription } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  subscription: Subscription | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshCompany: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        setUser(userData);
        setIsAdmin(userData?.is_admin ?? false);

        if (userData) {
          const { data: companyData } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', userData.id)
            .single();

          setCompany(companyData);

          const { data: subData } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userData.id)
            .single();

          setSubscription(subData);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      setUser(data);
    }
  };

  const refreshCompany = async () => {
    if (user) {
      const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setCompany(data);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCompany(null);
    setSubscription(null);
    router.push('/');
  };

  useEffect(() => {
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN') {
          fetchUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setCompany(null);
          setSubscription(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, company, subscription, isAdmin, loading, signOut, refreshUser, refreshCompany }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
