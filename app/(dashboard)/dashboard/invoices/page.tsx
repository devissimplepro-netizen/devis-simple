'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MoreHorizontal, Eye, Send, FileText, MessageCircle, Mail, Copy, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
interface InvoiceWithClient {
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
  sent: 'Envoyée',
  viewed: 'Vue',
  paid: 'Payée',
  late: 'En retard',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  viewed: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  late: 'bg-red-100 text-red-800',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
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
          .from('invoices')
          .select('*, clients(name)')
          .eq('company_id', company.id)
          .order('created_at', { ascending: false });

        setInvoices(data || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const shareLink = (token: string) => `${window.location.origin}/i/${token}`;

  const copyShareLink = (shareToken: string) => {
    navigator.clipboard.writeText(shareLink(shareToken));
    toast.success('Lien copié dans le presse-papier');
  };

  const shareWhatsApp = (invoice: InvoiceWithClient) => {
    const text = encodeURIComponent(`Voici votre facture ${invoice.number} : ${shareLink(invoice.share_token)}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareEmail = (invoice: InvoiceWithClient) => {
    const subject = encodeURIComponent(`Facture ${invoice.number}`);
    const body = encodeURIComponent(`Bonjour,\n\nVeuillez consulter votre facture via ce lien :\n${shareLink(invoice.share_token)}\n\nCordialement`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.number.toLowerCase().includes(search.toLowerCase()) ||
    invoice.clients?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
          <p className="text-gray-600">Gérez toutes vos factures</p>
        </div>
        <Link href="/dashboard/quotes">
          <Button variant="outline" className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            Créer via un devis accepté
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une facture..."
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
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {search ? 'Aucune facture trouvée' : 'Aucune facture créée'}
              </p>
              {!search && (
                <Link href="/dashboard/quotes">
                  <Button className="gradient-primary text-white">
                    Transformer un devis en facture
                  </Button>
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
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.number}</TableCell>
                      <TableCell>{invoice.clients?.name || 'Client'}</TableCell>
                      <TableCell>{formatCurrency(invoice.total)}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[invoice.status]}>
                          {statusLabels[invoice.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                            title="Aperçu" onClick={() => window.open(shareLink(invoice.share_token), '_blank')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                            title="WhatsApp" onClick={() => shareWhatsApp(invoice)}>
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-50"
                            title="Email" onClick={() => shareEmail(invoice)}>
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
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
                              <Link href={`/dashboard/invoices/${invoice.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyShareLink(invoice.share_token)}>
                              <Send className="mr-2 h-4 w-4" />
                              Copier le lien
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
