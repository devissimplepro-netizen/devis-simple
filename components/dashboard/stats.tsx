'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Receipt, TrendingUp, CheckCircle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  iconBg: string;
}

function StatCard({ title, value, description, icon: Icon, iconBg }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className={`p-3 rounded-xl ${iconBg}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  stats: {
    quotes_count: number;
    invoices_count: number;
    revenue: number;
    acceptance_rate: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Devis créés"
        value={stats.quotes_count}
        description="Ce mois"
        icon={FileText}
        iconBg="bg-blue-500"
      />
      <StatCard
        title="Factures émises"
        value={stats.invoices_count}
        description="Ce mois"
        icon={Receipt}
        iconBg="bg-green-500"
      />
      <StatCard
        title="Chiffre d'affaires"
        value={formatCurrency(stats.revenue)}
        description="Ce mois"
        icon={TrendingUp}
        iconBg="bg-indigo-500"
      />
      <StatCard
        title="Taux d'acceptation"
        value={`${stats.acceptance_rate}%`}
        description="Devis acceptés"
        icon={CheckCircle}
        iconBg="bg-emerald-500"
      />
    </div>
  );
}
