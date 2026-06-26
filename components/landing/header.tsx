'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/449DD949-1F0A-44B8-BC5B-6C98FEED14A8.PNG"
              alt="Devis Simple"
              width={140}
              height={36}
              style={{ height: 36, width: 'auto', objectFit: 'contain' }}
              priority
            />
          </Link>

          <div className="hidden md:flex md:items-center md:gap-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-[#1E40AF] transition-colors">
              Fonctionnalités
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-[#1E40AF] transition-colors">
              Tarifs
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-[#1E40AF] transition-colors">
              Témoignages
            </Link>
            <Link href="#faq" className="text-sm font-medium text-gray-600 hover:text-[#1E40AF] transition-colors">
              FAQ
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-[#1E40AF]">
                Connexion
              </Button>
            </Link>
            <Link href="/candidature">
              <Button className="gradient-primary text-white shadow-md hover:shadow-lg transition-shadow">
                Candidater
              </Button>
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden rounded-md p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/50">
            <div className="flex flex-col gap-4">
              <Link href="#features" className="text-base font-medium text-gray-600 hover:text-[#1E40AF]">Fonctionnalités</Link>
              <Link href="#pricing" className="text-base font-medium text-gray-600 hover:text-[#1E40AF]">Tarifs</Link>
              <Link href="#testimonials" className="text-base font-medium text-gray-600 hover:text-[#1E40AF]">Témoignages</Link>
              <Link href="#faq" className="text-base font-medium text-gray-600 hover:text-[#1E40AF]">FAQ</Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200/50">
                <Link href="/login"><Button variant="outline" className="w-full">Connexion</Button></Link>
                <Link href="/candidature"><Button className="w-full gradient-primary text-white">Candidater</Button></Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
