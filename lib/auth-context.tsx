'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
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

  const loadUserData = async (authUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('loadUserData profiles error:', error.message);
        setLoading(false);
        return;
      }

     if (!profile) {
  console.warn('Profile missing, using fallback user');

  setUser({
    id: authUser.id,
    email: authUser.email!,
    role: 'artisan',
    full_name: null,
    phone: null,
    trade: null,
    created_at: '',
    updated_at: '',
  });

  setIsAdmin(false);
}

      const userData: User = {
        id: authUser.id,
        email: authUser.email!,
        role: profile.role,
        full_name: profile.full_name,
        phone: profile.phone,
        trade: profile.trade,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      setUser(userData);
      setIsAdmin(profile.role === 'admin');

      if (profile.role === 'artisan') {
        const [{ data: companyData }, { data: subData }] = await Promise.all([
          supabase.from('companies').select('*').eq('user_id', authUser.id).maybeSingle(),
          supabase.from('subscriptions').select('*').eq('user_id', authUser.id).maybeSingle(),
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile) {
        setUser({
          id: authUser.id,
          email: authUser.email!,
          role: profile.role,
          full_name: profile.full_name,
          phone: profile.phone,
          trade: profile.trade,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        });
        setIsAdmin(profile.role === 'admin');
      }
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
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            await loadUserData(session.user);
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
