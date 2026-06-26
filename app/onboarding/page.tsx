'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { ArrowRight, Building2, Upload, Palette, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'Votre entreprise', icon: Building2 },
  { id: 2, title: 'Votre logo', icon: Upload },
  { id: 3, title: 'Vos couleurs', icon: Palette },
];

const defaultColors = [
  { primary: '#1E40AF', secondary: '#3B82F6', name: 'Bleu professionnel' },
  { primary: '#047857', secondary: '#10B981', name: 'Vert nature' },
  { primary: '#B45309', secondary: '#F59E0B', name: 'Orange chaleureux' },
  { primary: '#0369A1', secondary: '#0EA5E9', name: 'Bleu ciel' },
  { primary: '#18181B', secondary: '#52525B', name: 'Noir élégant' },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postal_code: '',
    phone: '',
    email: '',
    siret: '',
    tva_number: '',
    logo_url: '',
    primary_color: '#1E40AF',
    secondary_color: '#3B82F6',
  });

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      updateFormData('logo_url', publicUrl);
      toast.success('Logo uploadé avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'upload');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('companies')
        .update({
          name: formData.name || 'Mon Entreprise',
          address: formData.address,
          city: formData.city,
          postal_code: formData.postal_code,
          phone: formData.phone,
          email: formData.email,
          siret: formData.siret,
          tva_number: formData.tva_number,
          logo_url: formData.logo_url,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Configuration terminée');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurez votre compte</h1>
          <p className="text-gray-600">Finalisez la configuration pour commencer à créer vos devis</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-12">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.id
                    ? 'gradient-primary text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'}`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Informations de votre entreprise</h2>
                  <p className="text-gray-600 text-sm">Ces informations apparaîtront sur vos devis et factures.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="company-name">Nom de l'entreprise</Label>
                    <Input
                      id="company-name"
                      placeholder="Entreprise Dupont SARL"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      placeholder="12 Rue de la République"
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      placeholder="Lyon"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal-code">Code postal</Label>
                    <Input
                      id="postal-code"
                      placeholder="69001"
                      value={formData.postal_code}
                      onChange={(e) => updateFormData('postal_code', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      placeholder="06 12 34 56 78"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-email">Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      placeholder="contact@entreprise.fr"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siret">SIRET</Label>
                    <Input
                      id="siret"
                      placeholder="123 456 789 00012"
                      value={formData.siret}
                      onChange={(e) => updateFormData('siret', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tva">Numéro TVA</Label>
                    <Input
                      id="tva"
                      placeholder="FR 12 345678901"
                      value={formData.tva_number}
                      onChange={(e) => updateFormData('tva_number', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Votre logo</h2>
                  <p className="text-gray-600 text-sm">Ajoutez votre logo pour personnaliser vos documents.</p>
                </div>

                <div className="flex flex-col items-center">
                  {formData.logo_url ? (
                    <div className="relative">
                      <img
                        src={formData.logo_url}
                        alt="Logo"
                        className="h-32 w-auto object-contain rounded-lg border p-4"
                      />
                      <button
                        onClick={() => updateFormData('logo_url', '')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Télécharger un logo</span>
                      <span className="text-xs text-gray-400">PNG, JPG max 2MB</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                    </label>
                  )}
                </div>

                <p className="text-center text-sm text-gray-500">
                  Vous pouvez ajouter votre logo plus tard
                </p>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Vos couleurs</h2>
                  <p className="text-gray-600 text-sm">Choisissez les couleurs de vos devis et factures.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {defaultColors.map((color) => (
                    <button
                      key={color.primary}
                      onClick={() => {
                        updateFormData('primary_color', color.primary);
                        updateFormData('secondary_color', color.secondary);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.primary_color === color.primary
                          ? 'border-blue-600 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-lg"
                          style={{ background: `linear-gradient(135deg, ${color.primary}, ${color.secondary})` }}
                        />
                        <span className="font-medium text-sm">{color.name}</span>
                      </div>
                      {formData.primary_color === color.primary && (
                        <div className="flex items-center gap-1 text-blue-600 text-sm">
                          <Check className="h-4 w-4" />
                          Sélectionné
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-4">Personnalisation avancée</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Couleur principale</Label>
                      <div className="flex items-center gap-2">
                        <input
                          id="primary-color"
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => updateFormData('primary_color', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={formData.primary_color}
                          onChange={(e) => updateFormData('primary_color', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Couleur secondaire</Label>
                      <div className="flex items-center gap-2">
                        <input
                          id="secondary-color"
                          type="color"
                          value={formData.secondary_color}
                          onChange={(e) => updateFormData('secondary_color', e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={formData.secondary_color}
                          onChange={(e) => updateFormData('secondary_color', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Aperçu</h4>
                  <div
                    className="p-4 rounded-lg"
                    style={{ borderColor: formData.primary_color, borderWidth: 2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="px-4 py-2 rounded text-white font-medium"
                        style={{ background: `linear-gradient(135deg, ${formData.primary_color}, ${formData.secondary_color})` }}
                      >
                        Devis Simple
                      </div>
                      <span style={{ color: formData.primary_color }} className="font-semibold">
                        DEV-2026-00001
                      </span>
                    </div>
                    <div className="h-2 rounded" style={{ backgroundColor: formData.primary_color, opacity: 0.2 }} />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Retour
              </Button>

              {currentStep < 3 ? (
                <Button onClick={handleNext} className="gradient-primary text-white">
                  Continuer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  disabled={loading}
                  className="gradient-primary text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Configuration...
                    </>
                  ) : (
                    'Terminer'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
