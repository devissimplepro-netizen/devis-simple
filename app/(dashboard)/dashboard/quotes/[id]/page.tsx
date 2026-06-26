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
import { hasFeature, UPGRADE_MESSAGES } from '@/lib/plan-features';
import {
  ArrowLeft,
  Send,
  Pencil,
  FileText,
  Receipt,
  Copy,
  Loader2,
  Download,
  Printer,
  Eye,
  Share2,
  CheckCircle,
  XCircle,
  MessageCircle,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Quote, QuoteItem, Client, Company } from '@/lib/types';

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  viewed: 'Vu',
  accepted: 'Accepté',
  refused: 'Refusé',
  invoiced: 'Facturé',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  viewed: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  refused: 'bg-red-100 text-red-800',
  invoiced: 'bg-blue-100 text-blue-800',
};

interface QuoteWithDetails extends Quote {
  clients: Client;
  quote_items: QuoteItem[];
  companies: Company;
}

export default function QuoteDetailPage() {
  const [quote, setQuote] = useState<QuoteWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [transforming, setTransforming] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; feature: string }>({ open: false, feature: 'default' });
  const router = useRouter();
  const params = useParams();
  const { subscription } = useAuth();

  const plan = subscription?.plan || 'starter';
  const isPro = hasFeature(plan as any, 'pro');

  useEffect(() => {
    fetchQuote();
  }, [params.id]);

  const fetchQuote = async () => {
    try {
      const { data } = await supabase
        .from('quotes')
        .select('*, clients(*), quote_items(*), companies(*)')
        .eq('id', params.id)
        .single();

      if (data) setQuote(data as QuoteWithDetails);
    } catch (error) {
      console.error('Error fetching quote:', error);
      toast.error('Devis non trouvé');
      router.push('/dashboard/quotes');
    } finally {
      setLoading(false);
    }
  };

  const shareLink = () => `${window.location.origin}/q/${quote?.share_token}`;

  const copyShareLink = () => {
    if (!quote) return;
    navigator.clipboard.writeText(shareLink());
    toast.success('Lien copié dans le presse-papier');
  };

  const shareWhatsApp = () => {
    if (!quote) return;
    const text = encodeURIComponent(`Voici votre devis ${quote.number} : ${shareLink()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareEmail = () => {
    if (!quote) return;
    const subject = encodeURIComponent(`Devis ${quote.number} - ${quote.companies?.name || 'Notre entreprise'}`);
    const body = encodeURIComponent(`Bonjour ${quote.clients?.name || ''},

Veuillez trouver ci-joint votre devis ${quote.number}.

Montant total TTC : ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(quote.total)}

Vous pouvez consulter et signer votre devis en ligne via ce lien :
${shareLink()}

Cordialement,
${quote.companies?.name || 'Notre entreprise'}`);
    window.open(`mailto:${quote.clients?.email || ''}?subject=${subject}&body=${body}`);
  };

  const shareEmailStarter = () => {
    if (!isPro) {
      setUpgradeModal({ open: true, feature: 'email_sharing' });
      return;
    }
    shareEmail();
  };

  const previewPDF = () => {
    if (!quote) return;
    window.open(shareLink(), '_blank');
  };

  const printPDF = () => {
    if (!quote) return;
    const win = window.open(shareLink(), '_blank');
    if (win) {
      win.onload = () => win.print();
    }
  };

  const downloadPDF = () => {
    if (!quote) return;
    const win = window.open(shareLink() + '?print=1', '_blank');
    toast.info('Dans la fenêtre ouverte, utilisez Fichier → Imprimer → Enregistrer en PDF');
  };

  const sendQuote = async () => {
    if (!quote) return;
    try {
      const { error } = await supabase.from('quotes').update({ status: 'sent' }).eq('id', quote.id);
      if (error) throw error;
      setQuote({ ...quote, status: 'sent' });
      toast.success('Statut mis à jour');
      copyShareLink();
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    }
  };

  const transformToInvoice = async () => {
    if (!isPro) {
      setUpgradeModal({ open: true, feature: 'convert_invoice' });
      return;
    }
    if (!quote || quote.status !== 'accepted') {
      toast.error('Le devis doit être accepté pour être facturé');
      return;
    }
    setTransforming(true);
    try {
      const year = new Date().getFullYear();
      const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number', { year });
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          company_id: quote.company_id,
          client_id: quote.client_id,
          quote_id: quote.id,
          number: invoiceNumber,
          status: 'draft',
          issue_date: new Date().toISOString().split('T')[0],
          due_date: null,
          subtotal: quote.subtotal,
          tva_amount: quote.tva_amount,
          total: quote.total,
          notes: quote.notes,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      if (invoice) {
        const invoiceItems = quote.quote_items.map((item) => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tva_rate: item.tva_rate,
          total: item.total,
          order: item.order,
        }));
        await supabase.from('invoice_items').insert(invoiceItems);
        await supabase.from('quotes').update({ status: 'invoiced' }).eq('id', quote.id);
        toast.success('Facture créée avec succès');
        router.push(`/dashboard/invoices/${invoice.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de la facture');
    } finally {
      setTransforming(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!quote) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false, feature: 'default' })}
        title={UPGRADE_MESSAGES[upgradeModal.feature]?.title}
        description={UPGRADE_MESSAGES[upgradeModal.feature]?.description}
      />

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/quotes" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux devis
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{quote.number}</h1>
            <Badge className={statusColors[quote.status]}>{statusLabels[quote.status]}</Badge>
          </div>
          <p className="text-gray-600 mt-1">Client : {quote.clients?.name || 'Client inconnu'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quote.status === 'draft' && (
            <>
              <Link href={`/dashboard/quotes/${quote.id}/edit`}>
                <Button variant="outline"><Pencil className="mr-2 h-4 w-4" />Modifier</Button>
              </Link>
              <Button className="gradient-primary text-white" onClick={sendQuote}>
                <Send className="mr-2 h-4 w-4" />Envoyer
              </Button>
            </>
          )}
          {quote.status === 'accepted' && (
            <Button
              className="text-white"
              style={{ background: isPro ? 'linear-gradient(135deg, #1B3C96 0%, #2554C7 100%)' : '#6b7280' }}
              onClick={transformToInvoice}
              disabled={transforming}
            >
              {transforming ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Transformation...</>
              ) : (
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Transformer en facture
                  {!isPro && <ProBadge />}
                </div>
              )}
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
            <CardHeader><CardTitle className="text-lg">Informations</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date de création</p>
                  <p className="font-medium">{new Date(quote.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                {quote.valid_until && (
                  <div>
                    <p className="text-sm text-gray-500">Valide jusqu'au</p>
                    <p className="font-medium">{new Date(quote.valid_until).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Prestations</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Qté</div>
                  <div className="col-span-2 text-right">Prix U.</div>
                  <div className="col-span-2 text-right">Total HT</div>
                </div>
                {quote.quote_items?.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 text-sm">
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
                  <span>{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TVA</span>
                  <span>{formatCurrency(quote.tva_amount)}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total TTC</span>
                  <span style={{ color: quote.companies?.primary_color || '#1B3C96' }}>
                    {formatCurrency(quote.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {quote.notes && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Notes</CardTitle></CardHeader>
              <CardContent><p className="text-gray-600">{quote.notes}</p></CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Client</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{quote.clients?.name}</p>
              {quote.clients?.contact_name && <p className="text-gray-600">{quote.clients.contact_name}</p>}
              {quote.clients?.email && <p className="text-gray-600 text-sm">{quote.clients.email}</p>}
              {quote.clients?.phone && <p className="text-gray-600 text-sm">{quote.clients.phone}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Lien de partage</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Partagez ce lien avec votre client pour qu'il puisse consulter et signer le devis.
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
