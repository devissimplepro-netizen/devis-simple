'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';

const FREE_DOCUMENT_LIMIT = 3;

export interface DocumentLimitState {
  count: number;
  limit: number;
  isLimited: boolean;
  loading: boolean;
}

export function useDocumentLimit(): DocumentLimitState {
  const { subscription, company } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const isPro = subscription?.plan === 'pro' && subscription?.status !== 'canceled';

  useEffect(() => {
    if (!company) {
      setLoading(false);
      return;
    }
    if (isPro) {
      setLoading(false);
      return;
    }

    const fetchCount = async () => {
      setLoading(true);
      try {
        const [quotesRes, invoicesRes] = await Promise.all([
          supabase
            .from('quotes')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', company.id),
          supabase
            .from('invoices')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', company.id),
        ]);
        const total = (quotesRes.count ?? 0) + (invoicesRes.count ?? 0);
        setCount(total);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, [company?.id, isPro]);

  return {
    count,
    limit: FREE_DOCUMENT_LIMIT,
    isLimited: !isPro && count >= FREE_DOCUMENT_LIMIT,
    loading,
  };
}
