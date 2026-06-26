'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useDocumentLimit } from '@/hooks/use-document-limit';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  Users,
  Receipt,
  Settings,
  CreditCard,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus,
  BookOpen,
  X,
  Shield,
  Bell,
} from 'lucide-react';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Devis', href: '/dashboard/quotes', icon: FileText },
  { name: 'Factures', href: '/dashboard/invoices', icon: Receipt },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Prestations', href: '/dashboard/prestations', icon: BookOpen },
  { name: 'Parametres', href: '/dashboard/settings', icon: Settings },
];

const secondaryNavigation = [
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Abonnement', href: '/dashboard/subscription', icon: CreditCard },
  { name: 'Aide (WhatsApp)', href: 'https://wa.me/33611761040', icon: HelpCircle },
];

const adminNavigation = [
  { name: 'Candidatures', href: '/dashboard/admin/candidatures', icon: Shield },
];

interface DashboardSidebarProps {
  onClose?: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function DashboardSidebar({ onClose, onCollapsedChange }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { signOut, company, isAdmin, subscription } = useAuth();

  const primaryColor = company?.primary_color || '#1E40AF';
  const { count, limit, isLimited } = useDocumentLimit();
  const isPro = subscription?.plan === 'pro' && subscription?.status !== 'canceled';

  const handleCollapse = (next: boolean) => {
    setCollapsed(next);
    onCollapsedChange?.(next);
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside
      className={cn(
        'h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
        {!collapsed && (
          <Link href="/dashboard" onClick={handleLinkClick}>
            <Image
              src="/images/449DD949-1F0A-44B8-BC5B-6C98FEED14A8.PNG"
              alt="Devis Simple"
              width={130}
              height={34}
              style={{ objectFit: 'contain', height: 34, width: 'auto' }}
              priority
            />
          </Link>
        )}
        <div className="flex items-center gap-1">
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
          {/* Desktop collapse button */}
          <button
            onClick={() => handleCollapse(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hidden lg:flex"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* New quote button */}
      <div className="p-4 flex-shrink-0">
        <Link href="/dashboard/quotes/new" onClick={handleLinkClick}>
          <Button
            className={cn(
              'w-full text-white shadow-sm',
              collapsed && 'px-2'
            )}
            style={{ background: `linear-gradient(135deg, #1B3C96, ${primaryColor})` }}
          >
            {collapsed ? <Plus className="h-5 w-5" /> : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau devis
              </>
            )}
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium',
                isActive
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
              style={isActive ? { background: `linear-gradient(135deg, #1E3A8A, ${primaryColor})` } : {}}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-gray-200 space-y-0.5">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Admin</p>
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium',
                    isActive
                      ? 'text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  style={isActive ? { background: `linear-gradient(135deg, #1E3A8A, ${primaryColor})` } : {}}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        )}

        <div className="pt-4 mt-4 border-t border-gray-200 space-y-0.5">
          {secondaryNavigation.map((item) => {
            const isExternal = item.href.startsWith('http');
            const isActive = !isExternal && pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium',
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
                style={isActive ? { background: `linear-gradient(135deg, #1E3A8A, ${primaryColor})` } : {}}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Document usage for free plan */}
      {!collapsed && !isPro && (
        <div className="px-4 pb-3">
          <Link href="/dashboard/subscription">
            <div className={`rounded-lg p-3 transition-colors ${isLimited ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-200'} hover:opacity-90`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-medium ${isLimited ? 'text-amber-700' : 'text-gray-600'}`}>
                  Documents
                </span>
                <span className={`text-xs font-semibold ${isLimited ? 'text-amber-700' : 'text-gray-700'}`}>
                  {count}/{limit}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isLimited ? 'bg-amber-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(100, (count / limit) * 100)}%` }}
                />
              </div>
              {isLimited && (
                <p className="text-xs text-amber-600 mt-1.5 font-medium">Passer en Pro →</p>
              )}
            </div>
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={signOut}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full transition-colors text-sm font-medium',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Deconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
