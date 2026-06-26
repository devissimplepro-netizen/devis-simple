'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, BookOpen, Loader2, Euro, Tag } from 'lucide-react';
import { toast } from 'sonner';
import type { Prestation } from '@/lib/types';

export default function PrestationsPage() {
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPrestations();
  }, []);

  const fetchPrestations = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (company) {
        const { data } = await supabase
          .from('prestations')
          .select('*')
          .eq('company_id', company.id)
          .order('created_at', { ascending: false });
        setPrestations(data || []);
      }
    } catch (error) {
      console.error('Error fetching prestations:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePrestation = async (id: string) => {
    if (!confirm('Supprimer cette prestation ?')) return;
    try {
      const { error } = await supabase.from('prestations').delete().eq('id', id);
      if (error) throw error;
      toast.success('Prestation supprimée');
      fetchPrestations();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const toggleActive = async (prestation: Prestation) => {
    try {
      const { error } = await supabase
        .from('prestations')
        .update({ is_active: !prestation.is_active })
        .eq('id', prestation.id);
      if (error) throw error;
      toast.success(prestation.is_active ? 'Prestation désactivée' : 'Prestation activée');
      fetchPrestations();
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const filteredPrestations = prestations.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.keywords && p.keywords.some(k => k.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bibliothèque de prestations</h1>
          <p className="text-gray-600">Gérez vos prestations et mots-clés pour la reconnaissance vocale</p>
        </div>
        <Link href="/dashboard/prestations/new">
          <Button className="gradient-primary text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle prestation
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou mot-clé..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredPrestations.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {search ? 'Aucune prestation trouvée' : 'Aucune prestation enregistrée'}
              </p>
              {!search && (
                <Link href="/dashboard/prestations/new">
                  <Button className="gradient-primary text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une prestation
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prestation</TableHead>
                    <TableHead>Prix unitaire</TableHead>
                    <TableHead>TVA</TableHead>
                    <TableHead>Mots-clés</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrestations.map((prestation) => (
                    <TableRow key={prestation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{prestation.name}</div>
                          {prestation.description && (
                            <div className="text-sm text-gray-500">{prestation.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Euro className="h-3 w-3 text-gray-400" />
                          {formatCurrency(prestation.default_price)}
                          {prestation.unit && (
                            <span className="text-gray-400 text-sm">/{prestation.unit}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{prestation.tva_rate}%</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {prestation.keywords && prestation.keywords.slice(0, 3).map((kw, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {kw}
                            </Badge>
                          ))}
                          {prestation.keywords && prestation.keywords.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{prestation.keywords.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={prestation.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                          {prestation.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/prestations/${prestation.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Modifier
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleActive(prestation)}>
                              {prestation.is_active ? 'Désactiver' : 'Activer'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => deletePrestation(prestation.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
