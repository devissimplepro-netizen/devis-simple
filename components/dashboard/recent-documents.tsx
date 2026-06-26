'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Receipt, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RecentDocumentsProps {
  documents: Array<{
    id: string;
    type: 'quote' | 'invoice';
    number: string;
    client_name: string;
    total: number;
    status: string;
    created_at: string;
  }>;
}

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  viewed: 'Vu',
  accepted: 'Accepté',
  refused: 'Refusé',
  invoiced: 'Facturé',
  paid: 'Payé',
  late: 'En retard',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  viewed: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  refused: 'bg-red-100 text-red-800',
  invoiced: 'bg-purple-100 text-purple-800',
  paid: 'bg-green-100 text-green-800',
  late: 'bg-red-100 text-red-800',
};

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Documents récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Aucun document pour le moment</p>
            <Link href="/dashboard/quotes/new">
              <Button className="gradient-primary text-white">
                Créer un devis
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Documents récents</CardTitle>
        <div className="flex gap-2">
          <Link href="/dashboard/quotes">
            <Button variant="ghost" size="sm">
              Devis
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard/invoices">
            <Button variant="ghost" size="sm">
              Factures
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc) => (
            <Link
              key={`${doc.type}-${doc.id}`}
              href={`/dashboard/${doc.type}s/${doc.id}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`p-2 rounded-lg ${doc.type === 'quote' ? 'bg-blue-100' : 'bg-green-100'}`}>
                {doc.type === 'quote' ? (
                  <FileText className="h-4 w-4 text-blue-600" />
                ) : (
                  <Receipt className="h-4 w-4 text-green-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{doc.number}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600 truncate">{doc.client_name}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {format(new Date(doc.created_at), 'd MMM yyyy', { locale: fr })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{formatCurrency(doc.total)}</p>
                <Badge variant="secondary" className={statusColors[doc.status]}>
                  {statusLabels[doc.status]}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
