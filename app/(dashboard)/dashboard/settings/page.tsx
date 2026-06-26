'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UpgradeModal, ProBadge } from '@/components/ui/upgrade-modal';
import { hasFeature, UPGRADE_MESSAGES } from '@/lib/plan-features';
import { Loader2, Save, Upload, Check, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { PDF_TEMPLATES } from '@/lib/constants';

const defaultColors = [
  { primary: '#1E40AF', secondary: '#3B82F6', name: 'Bleu professionnel' },
  { primary: '#047857', secondary: '#10B981', name: 'Vert nature' },
  { primary: '#B45309', secondary: '#F59E0B', name: 'Orange chaleureux' },
  { primary: '#0369A1', secondary: '#0EA5E9', name: 'Bleu ciel' },
  { primary: '#18181B', secondary: '#52525B', name: 'Noir élégant' },
];

export default function SettingsPage() {
  const { company, refreshCompany, subscription } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; feature: string }>({ open: false, feature: 'default' });

  const plan = subscription?.plan || 'starter';
  const isPro = hasFeature(plan as any, 'pro');

  const [formData, setFormData] = useState({
    name: company?.name || '',
    address: company?.address || '',
    city: company?.city || '',
    postal_code: company?.postal_code || '',
    phone: company?.phone || '',
    email: company?.email || '',
    siret: company?.siret || '',
    tva_number: company?.tva_number || '',
    tva_rate: company?.tva_rate || 20,
    legal_mentions: company?.legal_mentions || '',
    primary_color: company?.primary_color || '#1E40AF',
    secondary_color: company?.secondary_color || '#3B82F6',
    pdf_template: company?.pdf_template || 1,
    logo_url: company?.logo_url || '',
  });

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format de fichier non supporte. Utilisez PNG, JPG, SVG ou WebP.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux. Maximum 5Mo.');
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifie');

      // Determine file extension
      let fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      if (file.type === 'image/svg+xml') fileExt = 'svg';
      else if (file.type === 'image/webp') fileExt = 'webp';
      else if (file.type === 'image/jpeg' || file.type === 'image/jpg') fileExt = 'jpg';

      const fileName = `${user.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Le stockage de logos n\'est pas encore configure. Contactez le support.');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      updateField('logo_url', publicUrl);

      await supabase
        .from('companies')
        .update({ logo_url: publicUrl })
        .eq('id', company?.id);

      refreshCompany();
      toast.success('Logo uploade avec succes');
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast.error(error.message || 'Erreur lors de l\'upload du logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: formData.name,
          address: formData.address || null,
          city: formData.city || null,
          postal_code: formData.postal_code || null,
          phone: formData.phone || null,
          email: formData.email || null,
          siret: formData.siret || null,
          tva_number: formData.tva_number || null,
          tva_rate: formData.tva_rate,
          legal_mentions: formData.legal_mentions || null,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          pdf_template: formData.pdf_template,
          logo_url: formData.logo_url || null,
        })
        .eq('id', company?.id);

      if (error) throw error;

      refreshCompany();
      toast.success('Paramètres enregistrés');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600">Gérez les paramètres de votre compte et entreprise</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="branding">Image de marque</TabsTrigger>
          <TabsTrigger value="pdf">PDF</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations entreprise</CardTitle>
              <CardDescription>
                Ces informations apparaîtront sur vos devis et factures.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="settings-name">Nom de l'entreprise</Label>
                  <Input
                    id="settings-name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="settings-address">Adresse</Label>
                  <Input
                    id="settings-address"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-city">Ville</Label>
                  <Input
                    id="settings-city"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-postal">Code postal</Label>
                  <Input
                    id="settings-postal"
                    value={formData.postal_code}
                    onChange={(e) => updateField('postal_code', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-phone">Téléphone</Label>
                  <Input
                    id="settings-phone"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-email">Email</Label>
                  <Input
                    id="settings-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-siret">SIRET</Label>
                  <Input
                    id="settings-siret"
                    value={formData.siret}
                    onChange={(e) => updateField('siret', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-tva">Numéro TVA</Label>
                  <Input
                    id="settings-tva"
                    value={formData.tva_number}
                    onChange={(e) => updateField('tva_number', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-tva-rate">Taux TVA par défaut (%)</Label>
                  <Select
                    value={formData.tva_rate.toString()}
                    onValueChange={(value) => updateField('tva_rate', parseFloat(value))}
                  >
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

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="settings-legal">Mentions légales</Label>
                  <Textarea
                    id="settings-legal"
                    value={formData.legal_mentions}
                    onChange={(e) => updateField('legal_mentions', e.target.value)}
                    rows={3}
                    placeholder="Conditions de paiement, informations bancaires..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t">
                <Button onClick={handleSave} disabled={saving} className="gradient-primary text-white">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <UpgradeModal
            open={upgradeModal.open}
            onClose={() => setUpgradeModal({ open: false, feature: 'default' })}
            title={UPGRADE_MESSAGES.custom_colors.title}
            description={UPGRADE_MESSAGES.custom_colors.description}
          />

          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>
                Ajoutez votre logo pour personnaliser vos documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                {formData.logo_url ? (
                  <div className="relative">
                    <img
                      src={formData.logo_url}
                      alt="Logo"
                      className="h-32 w-auto object-contain rounded-lg border p-4"
                    />
                    <button
                      onClick={() => updateField('logo_url', '')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    {uploading ? (
                      <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                    ) : (
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    )}
                    <span className="text-sm text-gray-600">Télécharger</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Couleurs
                    {!isPro && <ProBadge />}
                  </CardTitle>
                  <CardDescription>
                    Choisissez les couleurs de votre marque.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isPro ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {defaultColors.map((color) => (
                      <button
                        key={color.primary}
                        onClick={() => {
                          updateField('primary_color', color.primary);
                          updateField('secondary_color', color.secondary);
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
                      </button>
                    ))}
                  </div>

                  <div className="pt-6 border-t">
                    <h4 className="font-medium mb-4">Personnalisation avancee</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Couleur principale</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.primary_color}
                            onChange={(e) => updateField('primary_color', e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={formData.primary_color}
                            onChange={(e) => updateField('primary_color', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Couleur secondaire</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.secondary_color}
                            onChange={(e) => updateField('secondary_color', e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={formData.secondary_color}
                            onChange={(e) => updateField('secondary_color', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Lock className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    La personnalisation des couleurs est reservee au forfait Pro.
                  </p>
                  <Button
                    onClick={() => setUpgradeModal({ open: true, feature: 'custom_colors' })}
                    style={{ background: 'linear-gradient(135deg, #1B3C96 0%, #2554C7 100%)' }}
                    className="text-white"
                  >
                    Passer au forfait Pro
                  </Button>
                </div>
              )}

              <div className="flex justify-end pt-6 border-t">
                <Button onClick={handleSave} disabled={saving} className="gradient-primary text-white">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pdf" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Modele PDF</CardTitle>
                  <CardDescription>
                    Choisissez le modele de vos devis et factures.
                  </CardDescription>
                </div>
                {!isPro && (
                  <button
                    onClick={() => setUpgradeModal({ open: true, feature: 'custom_templates' })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                    style={{ background: '#F47319' }}
                  >
                    <Lock className="h-3 w-3" />
                    PRO
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isPro ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PDF_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => updateField('pdf_template', template.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.pdf_template === template.id
                            ? 'border-blue-600 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{template.name}</span>
                          {formData.pdf_template === template.id && (
                            <Check className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{template.description}</p>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Lock className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    Les modeles PDF personnalises sont reserves au forfait Pro.
                  </p>
                  <Button
                    onClick={() => setUpgradeModal({ open: true, feature: 'custom_templates' })}
                    style={{ background: 'linear-gradient(135deg, #1B3C96 0%, #2554C7 100%)' }}
                    className="text-white"
                  >
                    Passer au forfait Pro
                  </Button>
                </div>
              )}

              <div className="flex justify-end pt-6 border-t">
                <Button onClick={handleSave} disabled={saving} className="gradient-primary text-white">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
