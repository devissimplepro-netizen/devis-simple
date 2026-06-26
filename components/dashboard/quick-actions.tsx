'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Receipt, Users, Mic, ArrowRight } from 'lucide-react';

const actions = [
  {
    title: 'Créer un devis',
    description: 'Nouveau devis en quelques clics',
    icon: FileText,
    href: '/dashboard/quotes/new',
    color: 'bg-blue-500',
  },
  {
    title: 'Créer une facture',
    description: 'Générer une facture directement',
    icon: Receipt,
    href: '/dashboard/invoices/new',
    color: 'bg-green-500',
  },
  {
    title: 'Ajouter un client',
    description: 'Enregistrer un nouveau client',
    icon: Users,
    href: '/dashboard/clients/new',
    color: 'bg-indigo-500',
  },
  {
    title: 'Devis vocal',
    description: 'Créer avec l\'IA vocale',
    icon: Mic,
    href: '/dashboard/quotes/voice',
    color: 'bg-purple-500',
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actions rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group">
                <div className={`p-3 rounded-xl ${action.color}`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
