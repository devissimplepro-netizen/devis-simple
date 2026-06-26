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

  const loadUserData = async (userId: string) => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      setUser(userData ?? null);
      setIsAdmin(userData?.is_admin ?? false);

      if (userData) {
        const [{ data: companyData }, { data: subData }] = await Promise.all([
          supabase.from('companies').select('*').eq('user_id', userId).maybeSingle(),
          supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle(),
        ]);
        setCompany(companyData ?? null);
        setSubscription(subData ?? null);
      }
    } catch (err) {
      console.error('loadUserData error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearUser = () => {
    setUser(null);
    setCompany(null);
    setSubscription(null);
    setIsAdmin(false);
  };

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data } = await supabase.from('users').select('*').eq('id', authUser.id).maybeSingle();
      setUser(data ?? null);
      setIsAdmin(data?.is_admin ?? false);
    }
  };

  const refreshCompany = async () => {
    if (user) {
      const { data } = await supabase.from('companies').select('*').eq('user_id', user.id).maybeSingle();
      setCompany(data ?? null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearUser();
    router.push('/');
  };

  useEffect(() => {
    // Use onAuthStateChange exclusively — calling getUser() concurrently causes a deadlock
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            await loadUserData(session.user.id);
          } else {
            clearUser();
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          clearUser();
          setLoading(false);
        }
      }
    );

    return () => {
      authSub.unsubscribe();
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
