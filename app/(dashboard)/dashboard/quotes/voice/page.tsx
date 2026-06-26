'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useDocumentLimit } from '@/hooks/use-document-limit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { hasFeature, UPGRADE_MESSAGES } from '@/lib/plan-features';
import { ArrowLeft, Mic, MicOff, Loader2, Save, Send, Check, X, Pencil, AlertCircle, Sparkles, Lock } from 'lucide-react';
import { toast } from 'sonner';
import type { Client } from '@/lib/types';
import { analyzeTranscript, createSpeechRecognition } from '@/lib/voice-engine';
import type { ParsedQuote, PrestationLibraryEntry } from '@/lib/voice-engine';

export default function VoiceQuotePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [parsedQuote, setParsedQuote] = useState<ParsedQuote | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [prestationLibrary, setPrestationLibrary] = useState<PrestationLibraryEntry[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognition> | null>(null);
  const router = useRouter();
  const { subscription } = useAuth();
  const { isLimited, count, limit } = useDocumentLimit();

  const plan = subscription?.plan || 'starter';
  const isPro = hasFeature(plan as any, 'pro');

  useEffect(() => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }
    fetchData();
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [isPro]);

  async function fetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: company } = await supabase.from('companies').select('id').eq('user_id', user.id).single();
      if (company) {
        const [clientsRes, prestationsRes] = await Promise.all([
          supabase.from('clients').select('*').eq('company_id', company.id).order('name'),
          supabase.from('prestations').select('*').eq('company_id', company.id).eq('is_active', true),
        ]);
        setClients(clientsRes.data || []);
        setPrestationLibrary(prestationsRes.data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function startRecording() {
    const recognition = createSpeechRecognition(
      (text, isFinal) => {
        if (isFinal) {
          setTranscript((prev) => prev + (prev ? ' ' : '') + text);
          setInterimTranscript('');
        } else {
          setInterimTranscript(text);
        }
      },
      () => {
        setIsRecording(false);
        setInterimTranscript('');
      },
      (err) => {
        toast.error(err);
        setIsRecording(false);
        setInterimTranscript('');
      }
    );
    if (!recognition.isSupported) {
      setIsSupported(false);
      toast.error('Reconnaissance vocale non supportée');
      return;
    }
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setTranscript('');
    setInterimTranscript('');
    setParsedQuote(null);
  }

  function stopRecording() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setInterimTranscript('');
  }

  async function processTranscript() {
    if (!transcript) {
      toast.error('Enregistrez une description vocale');
      return;
    }
    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const parsed = analyzeTranscript(transcript, prestationLibrary);
    setParsedQuote(parsed);
    if (parsed.client_name) {
      const matchingClient = clients.find(
        (c) =>
          c.name.toLowerCase().includes(parsed.client_name.toLowerCase()) ||
          parsed.client_name.toLowerCase().includes(c.name.toLowerCase())
      );
      if (matchingClient) setSelectedClientId(matchingClient.id);
    }
    setProcessing(false);
  }

  function updateItem(index: number, field: string, value: string | number) {
    if (!parsedQuote) return;
    const newItems = [...parsedQuote.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setParsedQuote({ ...parsedQuote, items: newItems });
  }

  function removeItem(index: number) {
    if (!parsedQuote) return;
    const newItems = parsedQuote.items.filter((_, i) => i !== index);
    setParsedQuote({ ...parsedQuote, items: newItems });
  }

  function calculateTotals() {
    if (!parsedQuote) return { subtotal: 0, tva: 0, total: 0 };
    let subtotal = 0;
    let totalTva = 0;
    parsedQuote.items.forEach((item) => {
      const itemTotal = item.quantity * item.unit_price;
      const itemTva = itemTotal * (item.tva_rate / 100);
      subtotal += itemTotal;
      totalTva += itemTva;
    });
    return { subtotal, tva: totalTva, total: subtotal + totalTva };
  }

  async function handleSave(sendNow: boolean) {
    if (!parsedQuote || parsedQuote.items.length === 0) {
      toast.error('Ajoutez au moins une prestation');
      return;
    }
    if (!selectedClientId) {
      toast.error('Sélectionnez un client');
      return;
    }
    if (isLimited) {
      toast.error(`Limite de ${limit} documents atteinte. Passez en Pro.`);
      return;
    }
    setSaving(true);
    try {
      const year = new Date().getFullYear();
      const { data: number } = await supabase.rpc('generate_quote_number', { year });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');
      const { data: company } = await supabase.from('companies').select('*').eq('user_id', user.id).single();
      if (!company) throw new Error('Entreprise non trouvée');
      const totals = calculateTotals();
      const { data: quote, error } = await supabase
        .from('quotes')
        .insert({
          company_id: company.id,
          client_id: selectedClientId,
          number,
          status: sendNow ? 'sent' : 'draft',
          subtotal: totals.subtotal,
          tva_amount: totals.tva,
          total: totals.total,
          notes: parsedQuote.notes || null,
        })
        .select()
        .single();
      if (error) throw error;
      if (quote) {
        const itemsToInsert = parsedQuote.items.map((item, index) => ({
          quote_id: quote.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tva_rate: item.tva_rate,
          total: item.quantity * item.unit_price,
          order: index,
        }));
        await supabase.from('quote_items').insert(itemsToInsert);
        toast.success(sendNow ? 'Devis envoyé' : 'Devis créé');
        router.push('/dashboard/quotes');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  const totals = calculateTotals();
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

  if (!isPro) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Link href="/dashboard/quotes" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux devis
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Créer un devis vocal</h1>
          <p className="text-gray-600">Dictez votre devis, il est généré automatiquement</p>
        </div>

        <UpgradeModal
          open={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          title={UPGRADE_MESSAGES.voice.title}
          description={UPGRADE_MESSAGES.voice.description}
        />

        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center py-8">
              <div className="w-32 h-32 rounded-full flex items-center justify-center bg-gray-200 opacity-50">
                <Mic className="h-12 w-12 text-gray-400" />
              </div>
              <p className="mt-6 text-lg font-medium text-gray-500">Fonctionnalité Pro</p>
              <p className="text-sm text-gray-400 mt-2 text-center max-w-md">
                La création de devis vocaux est réservée aux forfaits Pro.
              </p>
              <Button
                className="mt-6 text-white"
                style={{ background: 'linear-gradient(135deg, #1B3C96 0%, #2554C7 100%)' }}
                onClick={() => setShowUpgradeModal(true)}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Passer au forfait Pro
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      <div>
        <Link href="/dashboard/quotes" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux devis
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Créer un devis vocal</h1>
        <p className="text-gray-600">Dictez votre devis, il est généré automatiquement</p>
      </div>

      {isLimited && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3 items-start">
          <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 text-sm">Limite atteinte — {count}/{limit} documents</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Passez en Pro pour créer des documents illimités.{' '}
              <Link href="/dashboard/subscription" className="underline underline-offset-2 font-medium">Voir les offres</Link>
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center py-6">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isSupported}
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'gradient-primary hover:opacity-90'
              } disabled:opacity-50`}
            >
              {isRecording ? (
                <MicOff className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              ) : (
                <Mic className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              )}
            </button>

            <p className="mt-5 text-lg font-semibold text-gray-900">
              {isRecording ? 'Écoute en cours...' : 'Appuyez pour parler'}
            </p>
            <p className="text-sm text-gray-500 mt-1.5 text-center max-w-sm px-4">
              Exemple : <em>"Intervention chez Monsieur Martin. Pose chauffe-eau 650 euros."</em>
            </p>

            {!isSupported && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 w-full max-w-sm">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">Reconnaissance vocale non supportée. Utilisez Chrome ou Safari.</p>
              </div>
            )}
          </div>

          {/* Live transcript area */}
          {(transcript || interimTranscript || isRecording) && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 min-h-[80px]">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Transcription</p>
              <p className="text-gray-900 leading-relaxed">
                {transcript}
                {interimTranscript && (
                  <span className="text-gray-400 italic">{transcript ? ' ' : ''}{interimTranscript}</span>
                )}
                {isRecording && !transcript && !interimTranscript && (
                  <span className="inline-flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </p>
            </div>
          )}

          {transcript && !parsedQuote && (
            <div className="flex justify-center mt-5">
              <Button onClick={processTranscript} disabled={processing} className="gradient-primary text-white px-6">
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Générer le devis
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {parsedQuote && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-lg">Devis généré</CardTitle>
                <Badge
                  className={
                    parsedQuote.confidence > 0.7
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  Confiance : {Math.round(parsedQuote.confidence * 100)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Client détecté</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {parsedQuote.client_name ? (
                    <Badge variant="outline" className="text-base py-1 px-3 font-medium">
                      {parsedQuote.client_name}
                    </Badge>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Aucun client détecté</span>
                  )}
                  {selectedClientId && <Check className="h-5 w-5 text-green-600" />}
                </div>
                <select
                  className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                >
                  <option value="">-- Sélectionner un client --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {!selectedClientId && (
                  <Link
                    href="/dashboard/clients/new"
                    className="text-sm text-blue-600 hover:underline inline-block mt-1"
                  >
                    + Créer un nouveau client
                  </Link>
                )}
              </div>

              <Separator />

              {/* Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">Prestations détectées</p>
                  <p className="text-xs text-gray-400">Cliquez sur une ligne pour modifier</p>
                </div>
                {parsedQuote.items.map((item, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 overflow-hidden">
                    {editingItem === index ? (
                      <div className="p-4 space-y-3 bg-blue-50/50">
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Description"
                          className="bg-white"
                        />
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Qté</label>
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              className="bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Prix HT</label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">TVA %</label>
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              value={item.tva_rate}
                              onChange={(e) => updateItem(index, 'tva_rate', parseFloat(e.target.value) || 0)}
                              className="bg-white"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="gradient-primary text-white" onClick={() => setEditingItem(null)}>
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Valider
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => removeItem(index)}>
                            <X className="h-3.5 w-3.5 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setEditingItem(index)}
                      >
                        <div className="min-w-0 flex-1 pr-4">
                          <p className="font-medium text-gray-900 truncate">{item.description}</p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {item.quantity} × {formatCurrency(item.unit_price)} — TVA {item.tva_rate}%
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <p className="font-semibold text-gray-900">{formatCurrency(item.quantity * item.unit_price)}</p>
                          <Pencil className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="ml-auto max-w-xs space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total HT</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA</span>
                  <span>{formatCurrency(totals.tva)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total TTC</span>
                  <span className="text-blue-600">{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setParsedQuote(null);
                setTranscript('');
                setInterimTranscript('');
                setSelectedClientId('');
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Recommencer
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={saving || !selectedClientId || parsedQuote.items.length === 0 || isLimited}
            >
              <Save className="mr-2 h-4 w-4" />
              Brouillon
            </Button>
            <Button
              className="gradient-primary text-white"
              onClick={() => handleSave(true)}
              disabled={saving || !selectedClientId || parsedQuote.items.length === 0 || isLimited}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
