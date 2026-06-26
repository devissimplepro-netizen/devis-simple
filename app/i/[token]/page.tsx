'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Invoice, InvoiceItem, Client, Company } from '@/lib/types';

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  viewed: 'Vue',
  paid: 'Payée',
  late: 'En retard',
};

interface InvoiceWithDetails extends Invoice {
  clients: Client;
  invoice_items: InvoiceItem[];
  companies: Company;
}

export default function PublicInvoicePage() {
  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    fetchInvoice();
  }, [params.token]);

  const fetchInvoice = async () => {
    try {
      const { data } = await supabase
        .from('invoices')
        .select(`
          *,
          clients(*),
          invoice_items(*),
          companies(*)
        `)
        .eq('share_token', params.token)
        .single();

      if (data) {
        setInvoice(data as InvoiceWithDetails);

        if (data.status === 'sent') {
          await supabase
            .from('invoices')
            .update({ status: 'viewed' })
            .eq('id', data.id);

          setInvoice({ ...data, status: 'viewed' } as InvoiceWithDetails);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-medium text-gray-900">Facture introuvable</p>
          <p className="text-gray-600">Ce lien n'est pas valide ou la facture n'existe plus.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div
            className="inline-flex h-16 w-16 rounded-xl items-center justify-center mb-4"
            style={{ background: `linear-gradient(135deg, ${invoice.companies?.primary_color || '#1E40AF'}, ${invoice.companies?.secondary_color || '#3B82F6'})` }}
          >
            {invoice.companies?.logo_url ? (
              <img
                src={invoice.companies.logo_url}
                alt={invoice.companies.name}
                className="h-12 w-12 object-contain"
              />
            ) : (
              <FileText className="h-8 w-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{invoice.companies?.name}</h1>
        </div>

        <Card className="overflow-hidden">
          <div
            className="h-2"
            style={{ background: `linear-gradient(135deg, ${invoice.companies?.primary_color || '#1E40AF'}, ${invoice.companies?.secondary_color || '#3B82F6'})` }}
          />
          <CardContent className="p-0">
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">FACTURE</p>
                  <h2 className="text-2xl font-bold text-gray-900">{invoice.number}</h2>
                </div>
                <Badge className={`
                  ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                  ${invoice.status === 'viewed' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' : ''}
                `}>
                  {statusLabels[invoice.status]}
                </Badge>
              </div>
            </div>

            <div className="p-8 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Émetteur</p>
                  <p className="font-medium text-gray-900">{invoice.companies?.name}</p>
                  {invoice.companies?.address && <p className="text-gray-600">{invoice.companies.address}</p>}
                  {(invoice.companies?.postal_code || invoice.companies?.city) && (
                    <p className="text-gray-600">{invoice.companies.postal_code} {invoice.companies.city}</p>
                  )}
                  {invoice.companies?.email && (
                    <p className="text-gray-600 text-sm mt-2">{invoice.companies.email}</p>
                  )}
                  {invoice.companies?.siret && (
                    <p className="text-gray-500 text-sm mt-2">SIRET: {invoice.companies.siret}</p>
                  )}
                  {invoice.companies?.tva_number && (
                    <p className="text-gray-500 text-sm">TVA: {invoice.companies.tva_number}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Client</p>
                  <p className="font-medium text-gray-900">{invoice.clients?.name}</p>
                  {invoice.clients?.contact_name && (
                    <p className="text-gray-600">{invoice.clients.contact_name}</p>
                  )}
                  {invoice.clients?.address && <p className="text-gray-600">{invoice.clients.address}</p>}
                  {(invoice.clients?.postal_code || invoice.clients?.city) && (
                    <p className="text-gray-600">{invoice.clients.postal_code} {invoice.clients.city}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-sm text-gray-500">Date d'émission</p>
                  <p className="font-medium">
                    {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                {invoice.due_date && (
                  <div>
                    <p className="text-sm text-gray-500">Date d'échéance</p>
                    <p className="font-medium">
                      {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Qté</div>
                  <div className="col-span-2 text-right">Prix U.</div>
                  <div className="col-span-2 text-right">Total HT</div>
                </div>
                {invoice.invoice_items?.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 text-sm">
                    <div className="col-span-6 text-gray-900">{item.description}</div>
                    <div className="col-span-2 text-right text-gray-600">{item.quantity}</div>
                    <div className="col-span-2 text-right text-gray-600">{formatCurrency(item.unit_price)}</div>
                    <div className="col-span-2 text-right font-medium text-gray-900">{formatCurrency(item.total)}</div>
                  </div>
                ))}
              </div>

              <div className="max-w-xs ml-auto space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total HT</span>
                  <span className="text-gray-900">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TVA</span>
                  <span className="text-gray-900">{formatCurrency(invoice.tva_amount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total TTC</span>
                  <span style={{ color: invoice.companies?.primary_color || '#1E40AF' }}>
                    {formatCurrency(invoice.total)}
                  </span>
                </div>
              </div>

              {invoice.notes && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{invoice.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {invoice.status === 'paid' && (
          <div className="mt-6 p-8 rounded-xl text-center bg-green-50 border border-green-200">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-900 mb-2">Facture payée</h3>
            <p className="text-green-700">
              Merci pour votre paiement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
