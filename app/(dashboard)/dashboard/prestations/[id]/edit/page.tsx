'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Plus, X, Tag } from 'lucide-react';
import { toast } from 'sonner';
import type { Prestation } from '@/lib/types';

export default function EditPrestationPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultPrice, setDefaultPrice] = useState('');
  const [tvaRate, setTvaRate] = useState('20');
  const [unit, setUnit] = useState('forfait');
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    fetchPrestation();
  }, [id]);

  const fetchPrestation = async () => {
    try {
      const { data, error } = await supabase
        .from('prestations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setName(data.name);
        setDescription(data.description || '');
        setDefaultPrice(data.default_price.toString());
        setTvaRate(data.tva_rate.toString());
        setUnit(data.unit || 'forfait');
        setKeywords(data.keywords || []);
      }
    } catch (error: any) {
      toast.error('Erreur lors du chargement');
      router.push('/dashboard/prestations');
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = () => {
    const kw = keywordInput.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !defaultPrice) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('prestations')
        .update({
          name,
          description: description || null,
          default_price: parseFloat(defaultPrice),
          tva_rate: parseFloat(tvaRate),
          unit: unit || null,
          keywords,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Prestation mise à jour');
      router.push('/dashboard/prestations');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/dashboard/prestations"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux prestations
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Modifier la prestation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la prestation *</Label>
              <Input
                id="name"
                placeholder="Ex: Installation chauffe-eau"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description détaillée de la prestation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix par défaut *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="650.00"
                  value={defaultPrice}
                  onChange={(e) => setDefaultPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tva">Taux TVA (%)</Label>
                <Input
                  id="tva"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={tvaRate}
                  onChange={(e) => setTvaRate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unité</Label>
                <Input
                  id="unit"
                  placeholder="forfait, m², heure..."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Mots-clés pour la reconnaissance vocale</Label>
              <p className="text-sm text-gray-500">
                Ces mots-clés permettent à l'assistant vocal d'identifier automatiquement cette prestation.
              </p>

              <div className="flex gap-2">
                <Input
                  placeholder="Ex: cumulus, ballon d'eau chaude..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addKeyword}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      <Tag className="h-3 w-3" />
                      {kw}
                      <button
                        type="button"
                        onClick={() => removeKeyword(kw)}
                        className="ml-1 hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="gradient-primary text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
              <Link href="/dashboard/prestations">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
