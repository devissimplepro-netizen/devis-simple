'use client';

import { useAuth } from '@/lib/auth-context';
import { Bell, User, Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user, company, signOut } = useAuth();

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>

        {/* Mobile new quote button */}
        <Link href="/dashboard/quotes/new" className="lg:hidden">
          <Button
            size="sm"
            className="text-white"
            style={{ background: 'linear-gradient(135deg, #1B3C96, #2554C7)' }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </Link>

        {/* Desktop search */}
        <div className="hidden lg:block relative max-w-md flex-1">
          <div className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 text-xs">
            Recherche bientot disponible
          </div>
          <div className="w-full h-10 bg-gray-50 border border-gray-200 rounded-md px-3" />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 sm:gap-3 h-8 sm:h-10">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                <AvatarImage src={company?.logo_url || ''} />
                <AvatarFallback
                  className="text-white text-xs font-medium"
                  style={{ background: `linear-gradient(135deg, ${company?.primary_color || '#1E40AF'}, ${company?.secondary_color || '#3B82F6'})` }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-xs sm:text-sm font-medium text-gray-900">
                  {user?.full_name || 'Utilisateur'}
                </p>
                <p className="text-xs text-gray-500 hidden md:block">
                  {company?.name || 'Mon entreprise'}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <User className="mr-2 h-4 w-4" />
                Parametres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/subscription">
                <span>Abonnement</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              Se deconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
