'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle, MessageCircle, ArrowLeft, Upload, X } from 'lucide-react';
import { TRADES } from '@/lib/constants';
import { sendEmail, emailTemplates } from '@/lib/email';

export default function CandidaturePage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [trade, setTrade] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [siret, setSiret] = useState('');
  const [message, setMessage] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le logo ne doit pas dépasser 5 Mo');
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      toast.error('Formats acceptés : PNG, JPG, WebP');
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !trade) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      let logoUrl: string | null = null;

      if (logoFile) {
        const filePath = `candidatures/${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(filePath, logoFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: publicUrl } = supabase.storage.from('logos').getPublicUrl(filePath);
        logoUrl = publicUrl.publicUrl;
      }

      const { error } = await supabase.from('candidatures').insert({
        full_name: fullName,
        email,
        phone,
        trade,
        company_name: companyName,
        siret,
        message,
        logo_url: logoUrl,
      });

      if (error) throw error;

      setSuccess(true);

      const template = emailTemplates.candidatureReceived(fullName);
      await sendEmail(email, template.subject, template.html);

      setFullName('');
      setEmail('');
      setPhone('');
      setTrade('');
      setCompanyName('');
      setSiret('');
      setMessage('');
      setLogoFile(null);
      setLogoPreview(null);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi de la candidature');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/images/449DD949-1F0A-44B8-BC5B-6C98FEED14A8.PNG"
              alt="Devis Simple"
              width={140}
              height={36}
              style={{ height: 36, width: 'auto', objectFit: 'contain' }}
              priority
            />
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Candidature artisan
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Devis Simple est un service sélectionné. Remplissez le formulaire ci-dessous et notre équipe vous recontactera dans les 24h.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-8 p-4 bg-blue-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Préférez WhatsApp ?</p>
              <p className="text-sm text-blue-700">
                <a
                  href="https://wa.me/33611761040?text=Bonjour%2C%20je%20souhaite%20candidater%20pour%20Devis%20Simple"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Cliquez ici pour candidater par WhatsApp
                </a>
              </p>
            </div>
          </div>

          {success ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidature envoyée !</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                Merci pour votre candidature. Notre équipe l'examinera et vous recontactera dans les 24h par email ou téléphone.
              </p>
              <Link href="/">
                <Button className="gradient-primary text-white">Retour à l'accueil</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nom complet *</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jean Dupont"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06 11 76 10 40"
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trade">Votre métier *</Label>
                  <Select value={trade} onValueChange={setTrade}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Sélectionnez votre métier" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRADES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations entreprise</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nom de l'entreprise</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Dupont SARL"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siret">SIRET</Label>
                    <Input
                      id="siret"
                      value={siret}
                      onChange={(e) => setSiret(e.target.value)}
                      placeholder="123 456 789 00012"
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (optionnel)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Parlez-nous de votre activité et de vos besoins..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Logo de l'entreprise</Label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {logoPreview ? (
                      <Image src={logoPreview} alt="Logo preview" width={96} height={96} className="object-contain" />
                    ) : (
                      <div className="text-center">
                        <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                        <span className="text-xs text-gray-500">Logo</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="mb-1">
                      <Upload className="h-4 w-4 mr-2" />
                      Choisir un fichier
                    </Button>
                    <p className="text-xs text-gray-500">PNG, JPG, WebP — max 5 Mo</p>
                  </div>
                  {logoPreview && (
                    <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(null); }} className="text-gray-400 hover:text-red-500">
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 gradient-primary text-white text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer ma candidature'
                )}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
