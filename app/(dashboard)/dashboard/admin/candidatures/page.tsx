'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { Loader2, CheckCircle, XCircle, Trash2, Mail, Phone, Shield, UserPlus, KeyRound, Copy, Upload, X, Image as ImageIcon } from 'lucide-react';
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
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function AdminCandidatureCard({
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
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Acceptée</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejetée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-semibold text-gray-900">{c.full_name}</h3>
              {getStatusBadge(c.status)}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" /> {c.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" /> {c.phone}
              </span>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Bonjour, je suis votre contact pour Devis Simple. Concernant la candidature de ${c.full_name}, je reviens vers vous sous peu.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline"
              >
                WhatsApp
              </a>
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Métier :</span> {c.trade}
            </p>
            {c.company_name && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Entreprise :</span> {c.company_name}
                {c.siret && ` — SIRET : ${c.siret}`}
              </p>
            )}
            {c.logo_url && (
              <div className="mt-2">
                <Image src={c.logo_url} alt="Logo" width={80} height={80} className="rounded border object-contain" style={{ width: 80, height: 80 }} />
              </div>
            )}
            {c.message && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <span className="font-medium">Message :</span>
                <p className="mt-1">{c.message}</p>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Reçue le {new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {c.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-200 hover:bg-green-50"
                  onClick={() => onApprove(c.id)}
                  disabled={loadingId === c.id}
                >
                  {loadingId === c.id ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  Accepter + créer compte
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => onReject(c.id)}
                  disabled={loadingId === c.id}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Rejeter
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              className="text-gray-600"
              onClick={() => onDelete(c.id)}
              disabled={loadingId === c.id}
            >
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [createdDialog, setCreatedDialog] = useState<{ email: string; password: string } | null>(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const router = useRouter();

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', session.user.id)
        .maybeSingle();
      if (!userData?.is_admin) {
        router.push('/dashboard');
        return;
      }
      setIsAdmin(true);
      fetchCandidatures();
    };
    checkAdmin();
  }, [router]);

  const fetchCandidatures = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('candidatures')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCandidatures(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const approveCandidature = async (id: string) => {
    setLoadingId(id);
    try {
      const { data: candidature } = await supabase
        .from('candidatures')
        .select('*')
        .eq('id', id)
        .single();
      if (!candidature) throw new Error('Candidature introuvable');

      const password = generatePassword();

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: candidature.email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Échec de la création du compte');

      const { error: userError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: candidature.email,
        full_name: candidature.full_name,
        phone: candidature.phone,
        trade: candidature.trade,
      });
      if (userError) throw userError;

      const { data: company } = await supabase
        .from('companies')
        .insert({
          user_id: authData.user.id,
          name: candidature.company_name || `${candidature.full_name} - ${candidature.trade}`,
          siret: candidature.siret,
          logo_url: candidature.logo_url,
        })
        .select()
        .single();

      if (company) {
        await supabase.from('subscriptions').insert({
          user_id: authData.user.id,
          plan: 'pro',
          billing_cycle: 'monthly',
          status: 'trialing',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      const { error: updateError } = await supabase
        .from('candidatures')
        .update({ status: 'approved' })
        .eq('id', id);
      if (updateError) throw updateError;

      setCandidatures((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'approved' } : c))
      );

      setCreatedDialog({ email: candidature.email, password });
      toast.success('Compte artisan créé avec succès');

      const template = emailTemplates.candidatureApproved(candidature.full_name, candidature.email, password);
      await sendEmail(candidature.email, template.subject, template.html);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du compte');
    } finally {
      setLoadingId(null);
    }
  };

  const rejectCandidature = async (id: string) => {
    setLoadingId(id);
    try {
      const { error } = await supabase
        .from('candidatures')
        .update({ status: 'rejected' })
        .eq('id', id);
      if (error) throw error;
      setCandidatures((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c))
      );
      toast.success('Candidature rejetée');

      const { data: candidature } = await supabase.from('candidatures').select('full_name, email').eq('id', id).single();
      if (candidature?.email) {
        const template = emailTemplates.candidatureRejected(candidature.full_name);
        await sendEmail(candidature.email, template.subject, template.html);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setLoadingId(null);
    }
  };

  const deleteCandidature = async (id: string) => {
    if (!confirm('Supprimer cette candidature ?')) return;
    setLoadingId(id);
    try {
      const { error } = await supabase.from('candidatures').delete().eq('id', id);
      if (error) throw error;
      setCandidatures((prev) => prev.filter((c) => c.id !== id));
      toast.success('Candidature supprimée');
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setLoadingId(null);
    }
  };

  const handleNewLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le logo ne doit pas dépasser 5 Mo');
      return;
    }
    setNewLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setNewLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const createArtisanDirectly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail || !newPhone || !newTrade) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    setCreateLoading(true);
    try {
      let logoUrl: string | null = null;
      if (newLogoFile) {
        const filePath = `logos/${newEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(filePath, newLogoFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: publicUrl } = supabase.storage.from('logos').getPublicUrl(filePath);
        logoUrl = publicUrl.publicUrl;
      }

      const password = generatePassword();

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: newEmail,
        password,
      });
      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Échec de la création du compte');

      const { error: userError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: newEmail,
        full_name: newFullName,
        phone: newPhone,
        trade: newTrade,
        is_subscribed: newIsSubscribed,
      });
      if (userError) throw userError;

      const { data: company } = await supabase
        .from('companies')
        .insert({
          user_id: authData.user.id,
          name: newCompanyName || `${newFullName} - ${newTrade}`,
          siret: newSiret,
          address: newAddress,
          city: newCity,
          postal_code: newPostalCode,
          logo_url: logoUrl,
        })
        .select()
        .single();

      if (company) {
        await supabase.from('subscriptions').insert({
          user_id: authData.user.id,
          plan: 'pro',
          billing_cycle: 'monthly',
          status: newIsSubscribed ? 'active' : 'trialing',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + (newIsSubscribed ? 30 : 14) * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      setCreateDialog(false);
      setCreatedDialog({ email: newEmail, password });
      toast.success('Artisan créé avec succès');

      const template = emailTemplates.candidatureApproved(newFullName, newEmail, password);
      await sendEmail(newEmail, template.subject, template.html);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setCreateLoading(false);
    }
  };

  const renderCandidaturesList = (status: 'pending' | 'approved' | 'rejected') => {
    const filtered = candidatures.filter((c) => c.status === status);
    if (filtered.length === 0) {
      return <p className="text-gray-500 text-center py-8">Aucune candidature {status === 'pending' ? 'en attente' : status === 'approved' ? 'acceptée' : 'rejetée'}</p>;
    }
    return (
      <div className="space-y-4">
        {filtered.map((c) => (
          <AdminCandidatureCard
            key={c.id}
            c={c}
            onApprove={approveCandidature}
            onReject={rejectCandidature}
            onDelete={deleteCandidature}
            loadingId={loadingId}
          />
        ))}
      </div>
    );
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatures</h1>
          <p className="text-gray-600">Gérez les candidatures et créez des artisans</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
              {candidatures.filter((c) => c.status === 'pending').length} en attente
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {candidatures.filter((c) => c.status === 'approved').length} acceptées
            </Badge>
          </div>
          <Button onClick={() => setCreateDialog(true)} className="gradient-primary text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Créer un artisan
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            En attente ({candidatures.filter((c) => c.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Acceptées ({candidatures.filter((c) => c.status === 'approved').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejetées ({candidatures.filter((c) => c.status === 'rejected').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">{renderCandidaturesList('pending')}</TabsContent>
        <TabsContent value="approved">{renderCandidaturesList('approved')}</TabsContent>
        <TabsContent value="rejected">{renderCandidaturesList('rejected')}</TabsContent>
      </Tabs>

      {/* Dialog compte créé */}
      <Dialog open={!!createdDialog} onOpenChange={() => setCreatedDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Compte créé
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">Le compte artisan a été créé avec succès. Voici les identifiants :</p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Email</span>
                <span className="text-sm font-medium text-gray-900">{createdDialog?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Mot de passe</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-900">{createdDialog?.password}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(`Email: ${createdDialog?.email}\nMot de passe: ${createdDialog?.password}`);
                      toast.success('Identifiants copiés');
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <Button className="w-full gradient-primary text-white" onClick={() => setCreatedDialog(null)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog créer artisan directement */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Créer un artisan
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={createArtisanDirectly} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom complet *</Label>
              <Input value={newFullName} onChange={(e) => setNewFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Téléphone *</Label>
              <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Métier *</Label>
              <Select value={newTrade} onValueChange={setNewTrade}>
                <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                <SelectContent>
                  {TRADES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Entreprise</Label>
              <Input value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>SIRET</Label>
              <Input value={newSiret} onChange={(e) => setNewSiret(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Ville</Label>
                <Input value={newCity} onChange={(e) => setNewCity(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Code postal</Label>
              <Input value={newPostalCode} onChange={(e) => setNewPostalCode(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {newLogoPreview ? (
                    <Image src={newLogoPreview} alt="Logo" width={64} height={64} className="object-contain" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={handleNewLogoChange} />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-3 w-3 mr-1" />
                    Choisir
                  </Button>
                  {newLogoPreview && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setNewLogoFile(null); setNewLogoPreview(null); }}>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="subscribed" checked={newIsSubscribed} onChange={(e) => setNewIsSubscribed(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
              <Label htmlFor="subscribed" className="text-sm">Artisan abonné (paiement actif)</Label>
            </div>
            <Button type="submit" disabled={createLoading} className="w-full gradient-primary text-white">
              {createLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4 mr-2" />
              )}
              Créer le compte
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
