'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Save,
  Send,
  Eye,
  MessageCircle,
  Mail,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Client, Prestation } from '@/lib/types';

interface QuoteItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tva_rate: number;
  total: number;
}

export default function NewQuotePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    valid_until: '',
    notes: '',
    internal_notes: '',
  });
  const [items, setItems] = useState<QuoteItem[]>([
    { description: '', quantity: 1, unit_price: 0, tva_rate: 20, total: 0 },
  ]);
  const [company, setCompany] = useState<any>(null);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchClients();
    fetchPrestations();
    fetchCompany();
  }, []);

  const fetchClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, tva_rate')
        .eq('user_id', user.id)
        .single();
      if (companyData) {
        setCompany(companyData);
        const { data } = await supabase
          .from('clients')
          .select('*')
          .eq('company_id', companyData.id)
          .order('name');
        setClients(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchPrestations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (companyData) {
        const { data } = await supabase
          .from('prestations')
          .select('*')
          .eq('company_id', companyData.id)
          .eq('is_active', true)
          .order('name');
        setPrestations(data || []);
      }
    } catch (error) {
      console.error('Error fetching prestations:', error);
    }
  };

  const fetchCompany = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .single();
    setCompany(data);
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };
      if (field === 'quantity' || field === 'unit_price') {
        newItems[index].total = Number(
          (newItems[index].quantity * newItems[index].unit_price).toFixed(2)
        );
      }
      return newItems;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { description: '', quantity: 1, unit_price: 0, tva_rate: company?.tva_rate || 20, total: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const addPrestation = (prestationId: string) => {
    const prestation = prestations.find((p) => p.id === prestationId);
    if (!prestation) return;
    setItems((prev) => [
      ...prev,
      {
        description: prestation.name,
        quantity: 1,
        unit_price: prestation.default_price,
        tva_rate: prestation.tva_rate,
        total: prestation.default_price,
      },
    ]);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tvaAmount = items.reduce((sum, item) => sum + (item.total * item.tva_rate) / 100, 0);
    return {
      subtotal: Number(subtotal.toFixed(2)),
      tva_amount: Number(tvaAmount.toFixed(2)),
      total: Number((subtotal + tvaAmount).toFixed(2)),
    };
  };

  const generateQuoteNumber = async () => {
    const year = new Date().getFullYear();
    const { data } = await supabase.rpc('generate_quote_number', { year });
    return data;
  };

  const handleSubmit = async (sendNow: boolean = false) => {
    if (!formData.client_id) {
      toast.error('Veuillez sélectionner un client');
      return;
    }
    const validItems = items.filter((item) => item.description && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error('Veuillez ajouter au moins une prestation');
      return;
    }
    setSaving(true);
    try {
      const number = await generateQuoteNumber();
      const totals = calculateTotals();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (!companyData) throw new Error('Entreprise non trouvée');
      const { data: quote, error } = await supabase
        .from('quotes')
        .insert({
          company_id: companyData.id,
          client_id: formData.client_id,
          number,
          status: sendNow ? 'sent' : 'draft',
          valid_until: formData.valid_until || null,
          subtotal: totals.subtotal,
          tva_amount: totals.tva_amount,
          total: totals.total,
          notes: formData.notes || null,
          internal_notes: formData.internal_notes || null,
        })
        .select()
        .single();
      if (error) throw error;
      if (quote) {
        setQuoteId(quote.id);
        setShareToken(quote.share_token);
        const itemsToInsert = validItems.map((item, index) => ({
          quote_id: quote.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tva_rate: item.tva_rate,
          total: item.total,
          order: index,
        }));
        const { error: itemsError } = await supabase.from('quote_items').insert(itemsToInsert);
        if (itemsError) throw itemsError;
        toast.success(sendNow ? 'Devis envoyé' : 'Devis créé');
        if (sendNow) {
          router.push('/dashboard/quotes');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const shareLink = () => {
    if (!shareToken) return '';
    return `${window.location.origin}/q/${shareToken}`;
  };

  const copyShareLink = () => {
    if (!quoteId) return;
    navigator.clipboard.writeText(shareLink());
    toast.success('Lien copié');
  };

  const shareWhatsApp = () => {
    if (!quoteId) return;
    const text = encodeURIComponent(`Voici votre devis : ${shareLink()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareEmail = () => {
    if (!quoteId) return;
    const subject = encodeURIComponent('Votre devis');
    const body = encodeURIComponent(`Bonjour,\n\nVeuillez trouver votre devis via ce lien :\n${shareLink()}\n\nCordialement`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const previewPDF = () => {
    if (!quoteId) return;
    window.open(shareLink(), '_blank');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/quotes" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux devis
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau devis</h1>
        <p className="text-gray-600">Créez un devis professionnel en quelques clics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Sélectionner un client</Label>
                  <Select value={formData.client_id} onValueChange={(value) => updateField('client_id', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Choisir un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                          {client.contact_name && ` (${client.contact_name})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {clients.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Aucun client enregistré.{' '}
                    <Link href="/dashboard/clients/new" className="text-blue-600 hover:underline">
                      Ajouter un client
                    </Link>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Prestations</CardTitle>
              <div className="flex items-center gap-2">
                {prestations.length > 0 && (
                  <Select onValueChange={addPrestation}>
                    <SelectTrigger className="w-48 h-9">
                      <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="Ajouter prestation" />
                    </SelectTrigger>
                    <SelectContent>
                      {prestations.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — {formatCurrency(p.default_price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-12 sm:col-span-5 space-y-1">
                      <Label className="text-xs text-gray-500">Description</Label>
                      <Input
                        placeholder="Description de la prestation"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <Label className="text-xs text-gray-500">Quantité</Label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <Label className="text-xs text-gray-500">Prix unitaire</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-1 space-y-1">
                      <Label className="text-xs text-gray-500">TVA %</Label>
                      <Select value={item.tva_rate.toString()} onValueChange={(value) => updateItem(index, 'tva_rate', parseFloat(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20">20%</SelectItem>
                          <SelectItem value="10">10%</SelectItem>
                          <SelectItem value="5.5">5.5%</SelectItem>
                          <SelectItem value="2.1">2.1%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <Button variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={items.length === 1} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Notes au client (visibles sur le devis)</Label>
                <Textarea
                  placeholder="Conditions particulières, informations complémentaires..."
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes internes (non visibles)</Label>
                <Textarea
                  placeholder="Notes personnelles..."
                  value={formData.internal_notes}
                  onChange={(e) => updateField('internal_notes', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Validité</Label>
                  <Input type="date" value={formData.valid_until} onChange={(e) => updateField('valid_until', e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Sous-total HT</span>
                  <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">TVA</span>
                  <span className="font-medium">{formatCurrency(totals.tva_amount)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total TTC</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(totals.total)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button className="w-full gradient-primary text-white" onClick={() => handleSubmit(true)} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enregistrer et envoyer
                  </>
                )}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => handleSubmit(false)} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer en brouillon
              </Button>
            </div>

            {quoteId && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full" onClick={previewPDF}>
                    <Eye className="mr-2 h-4 w-4 text-blue-600" />
                    Aperçu
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" onClick={shareEmail}>
                    <Mail className="mr-2 h-4 w-4 text-blue-500" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" onClick={shareWhatsApp}>
                    <MessageCircle className="mr-2 h-4 w-4 text-green-500" />
                    WhatsApp
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
