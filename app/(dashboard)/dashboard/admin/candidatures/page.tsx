'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Trash2, Mail, Phone, MessageSquare } from 'lucide-react';

type Candidature = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  trade: string;
  company_name: string | null;
  siret: string | null;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export default function AdminCandidaturesPage() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
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

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('candidatures')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      setCandidatures((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
      toast.success(status === 'approved' ? 'Candidature acceptée' : 'Candidature rejetée');
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    }
  };

  const deleteCandidature = async (id: string) => {
    if (!confirm('Supprimer cette candidature ?')) return;
    try {
      const { error } = await supabase.from('candidatures').delete().eq('id', id);
      if (error) throw error;
      setCandidatures((prev) => prev.filter((c) => c.id !== id));
      toast.success('Candidature supprimée');
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    }
  };

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

  const renderCandidaturesList = (status: 'pending' | 'approved' | 'rejected') => {
    const filtered = candidatures.filter((c) => c.status === status);
    if (filtered.length === 0) {
      return <p className="text-gray-500 text-center py-8">Aucune candidature {status === 'pending' ? 'en attente' : status === 'approved' ? 'acceptée' : 'rejetée'}</p>;
    }
    return (
      <div className="space-y-4">
        {filtered.map((c) => (
          <Card key={c.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
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
                <div className="flex items-center gap-2">
                  {c.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => updateStatus(c.id, 'approved')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accepter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => updateStatus(c.id, 'rejected')}
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
                    onClick={() => deleteCandidature(c.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatures</h1>
          <p className="text-gray-600">Gérez les candidatures des artisans</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            {candidatures.filter((c) => c.status === 'pending').length} en attente
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            {candidatures.filter((c) => c.status === 'approved').length} acceptées
          </Badge>
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
    </div>
  );
}
