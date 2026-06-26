'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { DashboardStats } from '@/components/dashboard/stats';
import { RecentDocuments } from '@/components/dashboard/recent-documents';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Loader2 } from 'lucide-react';
import type { DashboardStats as DashboardStatsType } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!company) return;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const { count: quotesCount } = await supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id)
          .gte('created_at', startOfMonth);

        const { count: invoicesCount } = await supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id)
          .gte('created_at', startOfMonth);

        const { data: paidInvoices } = await supabase
          .from('invoices')
          .select('total')
          .eq('company_id', company.id)
          .eq('status', 'paid')
          .gte('created_at', startOfMonth);

        const revenue = paidInvoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;

        const { count: totalQuotes } = await supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id);

        const { count: acceptedQuotes } = await supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id)
          .eq('status', 'accepted');

        const acceptanceRate = totalQuotes && totalQuotes > 0
          ? Math.round(((acceptedQuotes || 0) / totalQuotes) * 100)
          : 0;

        const { data: recentQuotes } = await supabase
          .from('quotes')
          .select('id, number, total, status, created_at, clients(name)')
          .eq('company_id', company.id)
          .order('created_at', { ascending: false })
          .limit(3);

        const { data: recentInvoices } = await supabase
          .from('invoices')
          .select('id, number, total, status, created_at, clients(name)')
          .eq('company_id', company.id)
          .order('created_at', { ascending: false })
          .limit(2);

        const recentDocuments = [
          ...(recentQuotes?.map((q: any) => ({
            id: q.id,
            type: 'quote' as const,
            number: q.number,
            client_name: q.clients?.name || 'Client',
            total: q.total,
            status: q.status,
            created_at: q.created_at,
          })) || []),
          ...(recentInvoices?.map((i: any) => ({
            id: i.id,
            type: 'invoice' as const,
            number: i.number,
            client_name: i.clients?.name || 'Client',
            total: i.total,
            status: i.status,
            created_at: i.created_at,
          })) || []),
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

        setStats({
          quotes_count: quotesCount || 0,
          invoices_count: invoicesCount || 0,
          revenue,
          acceptance_rate: acceptanceRate,
          recent_documents: recentDocuments,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600">Bienvenue sur votre espace Devis Simple</p>
      </div>

      {stats && (
        <>
          <DashboardStats
            stats={{
              quotes_count: stats.quotes_count,
              invoices_count: stats.invoices_count,
              revenue: stats.revenue,
              acceptance_rate: stats.acceptance_rate,
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentDocuments documents={stats.recent_documents} />
            <QuickActions />
          </div>
        </>
      )}
    </div>
  );
}
