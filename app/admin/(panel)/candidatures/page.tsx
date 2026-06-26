'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Loader2, CheckCircle, XCircle, Trash2, Mail, Phone, UserPlus,
  KeyRound, Copy, Upload, X, Image as ImageIcon, MessageSquare,
} from 'lucide-react';
import { TRADES } from '@/lib/constants';
import Image from 'next/image';
import { sendEmail, emailTemplates } from '@/lib/email';

const WHATSAPP_NUMBER = '33611761040';

type Candidature = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  trade: string;
  company_name: string | null;
  siret: string | null;
  message: string | null;
  logo_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
  return password;
}

function CandidatureCard({
  c,
  onApprove,
  onReject,
  onDelete,
  loadingId,
}: {
  c: Candidature;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  loadingId: string | null;
}) {
  const statusBadge = {
    pending: <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">En attente</Badge>,
    approved: <Badge className="bg-green-100 text-green-700 border-green-200">Acceptée</Badge>,
    rejected: <Badge className="bg-red-100 text-red-700 border-red-200">Rejetée</Badge>,
  }[c.status];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex gap-4 flex-1 min-w-0">
            {c.logo_url && (
              <Image src={c.logo_url} alt="Logo" width={56} height={56}
                className="rounded-lg border object-contain flex-shrink-0" style={{ width: 56, height: 56 }} />
            )}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900">{c.full_name}</h3>
                {statusBadge}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{c.email}</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{c.phone}</span>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Bonjour, concernant la candidature de ${c.full_name}.`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-green-600 hover:underline"
                >
                  <MessageSquare className="h-3.5 w-3.5" />WhatsApp
                </a>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Métier :</span> {c.trade}
                {c.company_name && <span> — <span className="font-medium">Entreprise :</span> {c.company_name}</span>}
                {c.siret && <span> — SIRET : {c.siret}</span>}
              </p>
              {c.message && (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-2 mt-1">{c.message}</p>
              )}
              <p className="text-xs text-gray-400">
                {new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {c.status === 'pending' && (
              <>
                <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50"
                  onClick={() => onApprove(c.id)} disabled={loadingId === c.id}>
                  {loadingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                  Accepter
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => onReject(c.id)} disabled={loadingId === c.id}>
                  <XCircle className="h-4 w-4 mr-1" />Rejeter
                </Button>
              </>
            )}
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-500"
              onClick={() => onDelete(c.id)} disabled={loadingId === c.id}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminCandidaturesPage() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [createdDialog, setCreatedDialog] = useState<{ email: string; password: string } | null>(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTrade, setNewTrade] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newSiret, setNewSiret] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newIsSubscribed, setNewIsSubscribed] = useState(false);
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [newLogoPreview, setNewLogoPreview] = useState<string | null>(null);

  useEffect(() => { fetchCandidatures(); }, []);

  const fetchCandidatures = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('candidatures').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCandidatures(data || []);
    } catch (e: any) {
      toast.error(e.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const approveCandidature = async (id: string) => {
    setLoadingId(id);
    try {
      const { data: candidature } = await supabase.from('candidatures').select('*').eq('id', id).single();
      if (!candidature) throw new Error('Candidature introuvable');

      const password = generatePassword();
      const { data: authData, error: signUpError } = await supabase.auth.signUp({ email: candidature.email, password });
      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Échec création compte');

      await supabase.from('users').insert({
        id: authData.user.id, email: candidature.email,
        full_name: candidature.full_name, phone: candidature.phone, trade: candidature.trade,
      });

      const { data: company } = await supabase.from('companies').insert({
        user_id: authData.user.id,
        name: candidature.company_name || `${candidature.full_name} - ${candidature.trade}`,
        siret: candidature.siret, logo_url: candidature.logo_url,
      }).select().single();

      if (company) {
        await supabase.from('subscriptions').insert({
          user_id: authData.user.id, plan: 'pro', billing_cycle: 'monthly', status: 'trialing',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      await supabase.from('candidatures').update({ status: 'approved' }).eq('id', id);
      setCandidatures(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' } : c));
      setCreatedDialog({ email: candidature.email, password });
      toast.success('Compte artisan créé');

      const template = emailTemplates.candidatureApproved(candidature.full_name, candidature.email, password);
      await sendEmail(candidature.email, template.subject, template.html);
    } catch (e: any) {
      toast.error(e.message || 'Erreur');
    } finally {
      setLoadingId(null);
    }
  };

  const rejectCandidature = async (id: string) => {
    setLoadingId(id);
    try {
      await supabase.from('candidatures').update({ status: 'rejected' }).eq('id', id);
      setCandidatures(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' } : c));
      toast.success('Candidature rejetée');
      const { data: c } = await supabase.from('candidatures').select('full_name, email').eq('id', id).single();
      if (c?.email) {
        const template = emailTemplates.candidatureRejected(c.full_name);
        await sendEmail(c.email, template.subject, template.html);
      }
    } catch (e: any) {
      toast.error(e.message || 'Erreur');
    } finally {
      setLoadingId(null);
    }
  };

  const deleteCandidature = async (id: string) => {
    if (!confirm('Supprimer cette candidature ?')) return;
    setLoadingId(id);
    try {
      await supabase.from('candidatures').delete().eq('id', id);
      setCandidatures(prev => prev.filter(c => c.id !== id));
      toast.success('Supprimée');
    } catch (e: any) {
      toast.error(e.message || 'Erreur');
    } finally {
      setLoadingId(null);
    }
  };

  const handleNewLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5 Mo'); return; }
    setNewLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setNewLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const createArtisanDirectly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail || !newPhone || !newTrade) {
      toast.error('Remplissez les champs obligatoires');
      return;
    }
    setCreateLoading(true);
    try {
      let logoUrl: string | null = null;
      if (newLogoFile) {
        const filePath = `logos/${newEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
        const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, newLogoFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: pub } = supabase.storage.from('logos').getPublicUrl(filePath);
        logoUrl = pub.publicUrl;
      }

      const password = generatePassword();
      const { data: authData, error: signUpError } = await supabase.auth.signUp({ email: newEmail, password });
      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Échec création compte');

      await supabase.from('users').insert({
        id: authData.user.id, email: newEmail, full_name: newFullName,
        phone: newPhone, trade: newTrade, is_subscribed: newIsSubscribed,
      });

      const { data: company } = await supabase.from('companies').insert({
        user_id: authData.user.id,
        name: newCompanyName || `${newFullName} - ${newTrade}`,
        siret: newSiret, address: newAddress, city: newCity,
        postal_code: newPostalCode, logo_url: logoUrl,
      }).select().single();

      if (company) {
        await supabase.from('subscriptions').insert({
          user_id: authData.user.id, plan: 'pro', billing_cycle: 'monthly',
          status: newIsSubscribed ? 'active' : 'trialing',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + (newIsSubscribed ? 30 : 14) * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      setCreateDialog(false);
      setCreatedDialog({ email: newEmail, password });
      toast.success('Artisan créé');
      const template = emailTemplates.candidatureApproved(newFullName, newEmail, password);
      await sendEmail(newEmail, template.subject, template.html);
    } catch (e: any) {
      toast.error(e.message || 'Erreur');
    } finally {
      setCreateLoading(false);
    }
  };

  const renderList = (status: 'pending' | 'approved' | 'rejected') => {
    const filtered = candidatures.filter(c => c.status === status);
    if (filtered.length === 0) {
      return (
        <div className="text-center py-16 text-gray-400">
          <p>Aucune candidature {status === 'pending' ? 'en attente' : status === 'approved' ? 'acceptée' : 'rejetée'}</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {filtered.map(c => (
          <CandidatureCard key={c.id} c={c} onApprove={approveCandidature}
            onReject={rejectCandidature} onDelete={deleteCandidature} loadingId={loadingId} />
        ))}
      </div>
    );
  };

  const pending = candidatures.filter(c => c.status === 'pending').length;
  const approved = candidatures.filter(c => c.status === 'approved').length;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatures artisans</h1>
          <p className="text-gray-500 mt-1">Acceptez ou refusez les demandes d'accès</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2">
            <Badge className="bg-yellow-100 text-yellow-700">{pending} en attente</Badge>
            <Badge className="bg-green-100 text-green-700">{approved} acceptées</Badge>
          </div>
          <Button onClick={() => setCreateDialog(true)} className="gradient-primary text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Créer un artisan
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">En attente ({pending})</TabsTrigger>
            <TabsTrigger value="approved">Acceptées ({approved})</TabsTrigger>
            <TabsTrigger value="rejected">Rejetées ({candidatures.filter(c => c.status === 'rejected').length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">{renderList('pending')}</TabsContent>
          <TabsContent value="approved">{renderList('approved')}</TabsContent>
          <TabsContent value="rejected">{renderList('rejected')}</TabsContent>
        </Tabs>
      )}

      {/* Dialog : compte créé */}
      <Dialog open={!!createdDialog} onOpenChange={() => setCreatedDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Compte créé avec succès
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Le compte artisan a été créé. Voici les identifiants à envoyer à l'artisan :
            </p>
            <div className="bg-gray-50 border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Email</span>
                <span className="text-sm font-medium text-gray-900">{createdDialog?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Mot de passe</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-semibold text-gray-900 bg-white border rounded px-2 py-0.5">
                    {createdDialog?.password}
                  </span>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                    onClick={() => {
                      navigator.clipboard.writeText(`Email: ${createdDialog?.email}\nMot de passe: ${createdDialog?.password}`);
                      toast.success('Identifiants copiés');
                    }}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 gradient-primary text-white" onClick={() => {
                const text = encodeURIComponent(`Bonjour ${createdDialog?.email?.split('@')[0]},\n\nVotre compte Devis Simple a été créé !\n\nEmail : ${createdDialog?.email}\nMot de passe : ${createdDialog?.password}\n\nConnectez-vous sur https://devis-simple.fr/login`);
                window.open(`https://wa.me/?text=${text}`, '_blank');
              }}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Envoyer par WhatsApp
              </Button>
              <Button variant="outline" onClick={() => setCreatedDialog(null)}>Fermer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog : créer artisan */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Créer un artisan directement
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={createArtisanDirectly} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Nom complet *</Label>
                <Input value={newFullName} onChange={e => setNewFullName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Téléphone *</Label>
                <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} required />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Métier *</Label>
                <Select value={newTrade} onValueChange={setNewTrade}>
                  <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                  <SelectContent>
                    {TRADES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Entreprise</Label>
                <Input value={newCompanyName} onChange={e => setNewCompanyName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>SIRET</Label>
                <Input value={newSiret} onChange={e => setNewSiret(e.target.value)} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Adresse</Label>
                <Input value={newAddress} onChange={e => setNewAddress(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Ville</Label>
                <Input value={newCity} onChange={e => setNewCity(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Code postal</Label>
                <Input value={newPostalCode} onChange={e => setNewPostalCode(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Logo</Label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}>
                  {newLogoPreview
                    ? <Image src={newLogoPreview} alt="Logo" width={56} height={56} className="object-contain" />
                    : <ImageIcon className="h-5 w-5 text-gray-400" />}
                </div>
                <div className="flex gap-2">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleNewLogoChange} />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5 mr-1" />Choisir
                  </Button>
                  {newLogoPreview && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setNewLogoFile(null); setNewLogoPreview(null); }}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="subscribed" checked={newIsSubscribed} onChange={e => setNewIsSubscribed(e.target.checked)} className="h-4 w-4 rounded" />
              <Label htmlFor="subscribed" className="text-sm font-normal cursor-pointer">Artisan abonné (paiement actif)</Label>
            </div>

            <Button type="submit" disabled={createLoading} className="w-full gradient-primary text-white">
              {createLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <KeyRound className="h-4 w-4 mr-2" />}
              Créer le compte
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
