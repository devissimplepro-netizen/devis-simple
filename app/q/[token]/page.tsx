'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  CheckCircle,
  XCircle,
  Download,
  Loader2,
  Building2,
  Mail,
  Phone,
  MapPin,
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

interface QuoteWithDetails extends Quote {
  clients: Client;
  quote_items: QuoteItem[];
  companies: Company;
}

export default function PublicQuotePage() {
  const [quote, setQuote] = useState<QuoteWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<'none' | 'accept' | 'refuse'>('none');
  const [signatureData, setSignatureData] = useState({
    name: '',
    email: '',
    comment: '',
  });
  const [processing, setProcessing] = useState(false);
  const params = useParams();

  useEffect(() => {
    fetchQuote();
  }, [params.token]);

  const fetchQuote = async () => {
    try {
      const { data } = await supabase
        .from('quotes')
        .select(`
          *,
          clients(*),
          quote_items(*),
          companies(*)
        `)
        .eq('share_token', params.token)
        .single();

      if (data) {
        setQuote(data as QuoteWithDetails);

        if (data.status === 'sent') {
          await supabase
            .from('quotes')
            .update({ status: 'viewed' })
            .eq('id', data.id);

          await supabase.from('quote_views').insert({
            quote_id: data.id,
          });

          setQuote({ ...data, status: 'viewed' } as QuoteWithDetails);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!signatureData.name) {
      toast.error('Veuillez entrer votre nom');
      return;
    }

    setProcessing(true);

    try {
      const { error: sigError } = await supabase.from('quote_signatures').insert({
        quote_id: quote!.id,
        client_name: signatureData.name,
        client_email: signatureData.email || null,
        status: 'accepted',
        comment: signatureData.comment || null,
      });

      if (sigError) throw sigError;

      const { error: updateError } = await supabase
        .from('quotes')
        .update({ status: 'accepted' })
        .eq('id', quote!.id);

      if (updateError) throw updateError;

      setQuote({ ...quote!, status: 'accepted' } as QuoteWithDetails);
      setAction('none');
      toast.success('Devis accepté avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setProcessing(false);
    }
  };

  const handleRefuse = async () => {
    if (!signatureData.name) {
      toast.error('Veuillez entrer votre nom');
      return;
    }

    setProcessing(true);

    try {
      const { error: sigError } = await supabase.from('quote_signatures').insert({
        quote_id: quote!.id,
        client_name: signatureData.name,
        client_email: signatureData.email || null,
        status: 'refused',
        comment: signatureData.comment || null,
      });

      if (sigError) throw sigError;

      const { error: updateError } = await supabase
        .from('quotes')
        .update({ status: 'refused' })
        .eq('id', quote!.id);

      if (updateError) throw updateError;

      setQuote({ ...quote!, status: 'refused' } as QuoteWithDetails);
      setAction('none');
      toast.success('Votre réponse a été enregistrée');
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setProcessing(false);
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

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-medium text-gray-900">Devis introuvable</p>
          <p className="text-gray-600">Ce lien n'est pas valide ou le devis n'existe plus.</p>
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
            style={{ background: `linear-gradient(135deg, ${quote.companies?.primary_color || '#1E40AF'}, ${quote.companies?.secondary_color || '#3B82F6'})` }}
          >
            {quote.companies?.logo_url ? (
              <img
                src={quote.companies.logo_url}
                alt={quote.companies.name}
                className="h-12 w-12 object-contain"
              />
            ) : (
              <FileText className="h-8 w-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{quote.companies?.name}</h1>
        </div>

        <Card className="overflow-hidden">
          <div
            className="h-2"
            style={{ background: `linear-gradient(135deg, ${quote.companies?.primary_color || '#1E40AF'}, ${quote.companies?.secondary_color || '#3B82F6'})` }}
          />
          <CardContent className="p-0">
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">DEVIS</p>
                  <h2 className="text-2xl font-bold text-gray-900">{quote.number}</h2>
                </div>
                <Badge className={`
                  ${quote.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}
                  ${quote.status === 'refused' ? 'bg-red-100 text-red-800' : ''}
                  ${quote.status === 'viewed' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${quote.status === 'sent' ? 'bg-blue-100 text-blue-800' : ''}
                `}>
                  {statusLabels[quote.status]}
                </Badge>
              </div>
            </div>

            <div className="p-8 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Émetteur</p>
                  <p className="font-medium text-gray-900">{quote.companies?.name}</p>
                  {quote.companies?.address && <p className="text-gray-600">{quote.companies.address}</p>}
                  {(quote.companies?.postal_code || quote.companies?.city) && (
                    <p className="text-gray-600">{quote.companies.postal_code} {quote.companies.city}</p>
                  )}
                  {quote.companies?.email && (
                    <p className="text-gray-600 text-sm mt-2">{quote.companies.email}</p>
                  )}
                  {quote.companies?.phone && (
                    <p className="text-gray-600 text-sm">{quote.companies.phone}</p>
                  )}
                  {quote.companies?.siret && (
                    <p className="text-gray-500 text-sm mt-2">SIRET: {quote.companies.siret}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Client</p>
                  <p className="font-medium text-gray-900">{quote.clients?.name}</p>
                  {quote.clients?.contact_name && (
                    <p className="text-gray-600">{quote.clients.contact_name}</p>
                  )}
                  {quote.clients?.address && <p className="text-gray-600">{quote.clients.address}</p>}
                  {(quote.clients?.postal_code || quote.clients?.city) && (
                    <p className="text-gray-600">{quote.clients.postal_code} {quote.clients.city}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Qté</div>
                  <div className="col-span-2 text-right">Prix U.</div>
                  <div className="col-span-2 text-right">Total HT</div>
                </div>
                {quote.quote_items?.map((item) => (
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
                  <span className="text-gray-900">{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TVA</span>
                  <span className="text-gray-900">{formatCurrency(quote.tva_amount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total TTC</span>
                  <span style={{ color: quote.companies?.primary_color || '#1E40AF' }}>
                    {formatCurrency(quote.total)}
                  </span>
                </div>
              </div>

              {quote.notes && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{quote.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {quote.status !== 'accepted' && quote.status !== 'refused' && (
          <Card className="mt-6">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Votre réponse</h3>
                <p className="text-gray-600">
                  Veuillez remplir vos informations et accepter ou refuser ce devis.
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sig-name">Votre nom *</Label>
                    <Input
                      id="sig-name"
                      placeholder="Jean Dupont"
                      value={signatureData.name}
                      onChange={(e) => setSignatureData({ ...signatureData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sig-email">Votre email</Label>
                    <Input
                      id="sig-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={signatureData.email}
                      onChange={(e) => setSignatureData({ ...signatureData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sig-comment">Commentaire (optionnel)</Label>
                    <Textarea
                      id="sig-comment"
                      placeholder="Remarques, questions..."
                      value={signatureData.comment}
                      onChange={(e) => setSignatureData({ ...signatureData, comment: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 text-green-600 border-green-300 hover:bg-green-50"
                    onClick={handleAccept}
                    disabled={processing}
                  >
                    {processing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Accepter
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                    onClick={handleRefuse}
                    disabled={processing}
                  >
                    {processing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Refuser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {(quote.status === 'accepted' || quote.status === 'refused') && (
          <div className={`mt-6 p-8 rounded-xl text-center ${
            quote.status === 'accepted' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {quote.status === 'accepted' ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-900 mb-2">Devis accepté</h3>
                <p className="text-green-700">
                  Merci pour votre confiance. {quote.companies?.name} vous contactera prochainement.
                </p>
              </>
            ) : (
              <>
                <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-900 mb-2">Devis refusé</h3>
                <p className="text-red-700">
                  Votre répondnse a bien été prise en compte.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
