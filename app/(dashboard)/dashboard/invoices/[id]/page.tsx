'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UpgradeModal, ProBadge } from '@/components/ui/upgrade-modal';
import { hasFeature } from '@/lib/plan-features';
import {
  ArrowLeft,
  Send,
  Copy,
  Loader2,
  Download,
  Printer,
  Eye,
  CheckCircle,
  MessageCircle,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Invoice, InvoiceItem, Client, Company, Quote } from '@/lib/types';

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  viewed: 'Vue',
  paid: 'Payée',
  late: 'En retard',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  viewed: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  late: 'bg-red-100 text-red-800',
};

interface InvoiceWithDetails extends Invoice {
  clients: Client;
  invoice_items: InvoiceItem[];
  companies: Company;
  quotes: Quote | null;
}

export default function InvoiceDetailPage() {
  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; feature: string }>({ open: false, feature: 'default' });
  const router = useRouter();
  const params = useParams();
  const { subscription } = useAuth();

  const plan = subscription?.plan || 'starter';
  const isPro = hasFeature(plan as any, 'pro');

  useEffect(() => {
    fetchInvoice();
  }, [params.id]);

  const fetchInvoice = async () => {
    try {
      const { data } = await supabase
        .from('invoices')
        .select(`
          *,
          clients(*),
          invoice_items(*),
          companies(*),
          quotes(*)
        `)
        .eq('id', params.id)
        .single();

      if (data) {
        setInvoice(data as InvoiceWithDetails);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error('Facture non trouvée');
      router.push('/dashboard/invoices');
    } finally {
      setLoading(false);
    }
  };

  const shareLink = () => `${window.location.origin}/i/${invoice?.share_token}`;

  const copyShareLink = () => {
    if (!invoice) return;
    navigator.clipboard.writeText(shareLink());
    toast.success('Lien copié dans le presse-papier');
  };

  const shareWhatsApp = () => {
    if (!invoice) return;
    const text = encodeURIComponent(`Voici votre facture ${invoice.number} : ${shareLink()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareEmail = () => {
    if (!invoice) return;
    const subject = encodeURIComponent(`Facture ${invoice.number} - ${invoice.companies?.name || 'Notre entreprise'}`);
    const body = encodeURIComponent(`Bonjour ${invoice.clients?.name || ''},

Veuillez trouver ci-joint votre facture ${invoice.number}.

Montant total TTC : ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(invoice.total)}

Vous pouvez consulter votre facture en ligne via ce lien :
${shareLink()}

Cordialement,
${invoice.companies?.name || 'Notre entreprise'}`);
    window.open(`mailto:${invoice.clients?.email || ''}?subject=${subject}&body=${body}`);
  };

  const previewPDF = () => {
    if (!invoice) return;
    window.open(shareLink(), '_blank');
  };

  const printPDF = () => {
    if (!invoice) return;
    const win = window.open(shareLink(), '_blank');
    if (win) {
      win.onload = () => win.print();
    }
  };

  const downloadPDF = () => {
    if (!invoice) return;
    const win = window.open(shareLink() + '?print=1', '_blank');
    toast.info('Dans la fenêtre ouverte, utilisez Fichier → Imprimer → Enregistrer en PDF');
  };

  const markAsPaid = async () => {
    if (!invoice) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoice.id);

      if (error) throw error;

      setInvoice({ ...invoice, status: 'paid' });
      toast.success('Facture marquée comme payée');
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    }
  };

  const sendInvoice = async () => {
    if (!invoice) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'sent' })
        .eq('id', invoice.id);

      if (error) throw error;

      setInvoice({ ...invoice, status: 'sent' });
      toast.success('Statut mis à jour');
      copyShareLink();
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
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
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false, feature: 'default' })}
      />

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/invoices" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux factures
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{invoice.number}</h1>
            <Badge className={statusColors[invoice.status]}>
              {statusLabels[invoice.status]}
            </Badge>
          </div>
          <p className="text-gray-600 mt-1">
            Client : {invoice.clients?.name || 'Client inconnu'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {invoice.status === 'draft' && (
            <Button className="gradient-primary text-white" onClick={sendInvoice}>
              <Send className="mr-2 h-4 w-4" />
              Envoyer
            </Button>
          )}
          {invoice.status === 'sent' && (
            <>
              <Button variant="outline" onClick={copyShareLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copier le lien
              </Button>
              <Button className="gradient-primary text-white" onClick={markAsPaid}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Marquer comme payée
              </Button>
            </>
          )}
          {invoice.status === 'paid' && (
            <Button variant="outline" onClick={copyShareLink}>
              <Copy className="mr-2 h-4 w-4" />
              Copier le lien
            </Button>
          )}
        </div>
      </div>

      {/* PDF Action bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700 mr-2">Document :</span>
            <Button variant="outline" size="sm" onClick={previewPDF}>
              <Eye className="mr-2 h-4 w-4 text-blue-600" />
              Aperçu
            </Button>
            <Button variant="outline" size="sm" onClick={downloadPDF}>
              <Download className="mr-2 h-4 w-4 text-green-600" />
              Télécharger PDF
            </Button>
            <Button variant="outline" size="sm" onClick={printPDF}>
              <Printer className="mr-2 h-4 w-4 text-gray-600" />
              Imprimer
            </Button>
            <Button variant="outline" size="sm" onClick={copyShareLink}>
              <Copy className="mr-2 h-4 w-4 text-orange-500" />
              Copier le lien
            </Button>
            <Button variant="outline" size="sm" onClick={shareEmail}>
              <Mail className="mr-2 h-4 w-4 text-blue-500" />
              Email
            </Button>
            {isPro && (
              <Button variant="outline" size="sm" onClick={shareWhatsApp}>
                <MessageCircle className="mr-2 h-4 w-4 text-green-500" />
                WhatsApp
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              {invoice.quotes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">Issu du devis</p>
                  <Link
                    href={`/dashboard/quotes/${invoice.quotes.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {(invoice.quotes as any).number || 'Voir le devis'}
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prestations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Qté</div>
                  <div className="col-span-2 text-right">Prix U.</div>
                  <div className="col-span-2 text-right">Total HT</div>
                </div>
                {invoice.invoice_items?.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 text-sm">
                    <div className="col-span-6">{item.description}</div>
                    <div className="col-span-2 text-right">{item.quantity}</div>
                    <div className="col-span-2 text-right">{formatCurrency(item.unit_price)}</div>
                    <div className="col-span-2 text-right font-medium">{formatCurrency(item.total)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total HT</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TVA</span>
                  <span>{formatCurrency(invoice.tva_amount)}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total TTC</span>
                  <span style={{ color: invoice.companies?.primary_color || '#1E40AF' }}>
                    {formatCurrency(invoice.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{invoice.clients?.name}</p>
              {invoice.clients?.contact_name && (
                <p className="text-gray-600">{invoice.clients.contact_name}</p>
              )}
              {invoice.clients?.email && (
                <p className="text-gray-600 text-sm">{invoice.clients.email}</p>
              )}
              {invoice.clients?.phone && (
                <p className="text-gray-600 text-sm">{invoice.clients.phone}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lien de partage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Partagez ce lien avec votre client pour qu'il puisse consulter la facture.
              </p>
              <Button variant="outline" className="w-full" onClick={copyShareLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copier le lien
              </Button>
              {isPro && (
                <Button variant="outline" className="w-full" onClick={shareWhatsApp}>
                  <MessageCircle className="mr-2 h-4 w-4 text-green-500" />
                  Partager WhatsApp
                </Button>
              )}
              {!isPro && (
                <button
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-sm text-gray-400 cursor-pointer hover:bg-gray-50"
                  onClick={() => setUpgradeModal({ open: true, feature: 'default' })}
                >
                  <MessageCircle className="h-4 w-4" />
                  Partager WhatsApp
                  <ProBadge />
                </button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
