'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MoreHorizontal, Eye, Pencil, Send, FileText, MessageCircle, Mail, Mic, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface QuoteWithClient {
  id: string;
  number: string;
  total: number;
  status: string;
  created_at: string;
  share_token: string;
  clients?: { name: string } | null;
}

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  viewed: 'Vu',
  accepted: 'Accepté',
  refused: 'Refusé',
  invoiced: 'Facturé',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  viewed: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  refused: 'bg-red-100 text-red-800',
  invoiced: 'bg-blue-100 text-blue-800',
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchQuotes(); }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: company } = await supabase.from('companies').select('id').eq('user_id', user.id).single();
      if (company) {
        const { data } = await supabase
          .from('quotes').select('*, clients(name)')
          .eq('company_id', company.id).order('created_at', { ascending: false });
        setQuotes(data || []);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const shareLink = (token: string) => `${window.location.origin}/q/${token}`;

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(shareLink(token));
    toast.success('Lien copié');
  };

  const shareWhatsApp = (quote: QuoteWithClient) => {
    const text = encodeURIComponent(`Voici votre devis ${quote.number} : ${shareLink(quote.share_token)}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareEmail = (quote: QuoteWithClient) => {
    const subject = encodeURIComponent(`Devis ${quote.number}`);
    const body = encodeURIComponent(`Bonjour,\n\nVeuillez consulter votre devis via ce lien :\n${shareLink(quote.share_token)}\n\nCordialement`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

  const filteredQuotes = quotes.filter(q =>
    q.number.toLowerCase().includes(search.toLowerCase()) ||
    q.clients?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
          <p className="text-gray-600">Gérez tous vos devis</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/dashboard/quotes/voice">
            <Button variant="outline" size="sm">
              <Mic className="mr-2 h-4 w-4" />
              Devis vocal
            </Button>
          </Link>
          <Link href="/dashboard/quotes/new">
            <Button className="gradient-primary text-white">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau devis
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Rechercher un devis..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">{search ? 'Aucun devis trouvé' : 'Aucun devis créé'}</p>
              {!search && (
                <Link href="/dashboard/quotes/new">
                  <Button className="gradient-primary text-white"><Plus className="mr-2 h-4 w-4" />Créer un devis</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N°</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Montant TTC</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Partager</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotes.map(quote => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">{quote.number}</TableCell>
                      <TableCell>{quote.clients?.name || 'Client'}</TableCell>
                      <TableCell>{formatCurrency(quote.total)}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[quote.status]}>{statusLabels[quote.status]}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                            title="Aperçu" onClick={() => window.open(shareLink(quote.share_token), '_blank')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                            title="WhatsApp" onClick={() => shareWhatsApp(quote)}>
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-50"
                            title="Email" onClick={() => shareEmail(quote)}>
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/quotes/${quote.id}`}>
                                <Eye className="mr-2 h-4 w-4" />Voir le détail
                              </Link>
                            </DropdownMenuItem>
                            {quote.status === 'draft' && (
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/quotes/${quote.id}/edit`}>
                                  <Pencil className="mr-2 h-4 w-4" />Modifier
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => copyLink(quote.share_token)}>
                              <Send className="mr-2 h-4 w-4" />Copier le lien
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
