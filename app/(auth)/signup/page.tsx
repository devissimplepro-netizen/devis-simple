'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/candidature');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <Image
            src="/images/449DD949-1F0A-44B8-BC5B-6C98FEED14A8.PNG"
            alt="Devis Simple"
            width={180}
            height={45}
            style={{ objectFit: 'contain', height: 45, width: 'auto', margin: '0 auto' }}
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Inscription par candidature</h1>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Les artisans ne peuvent pas s'inscrire directement. Vous devez d'abord candidater pour accéder à Devis Simple.
        </p>
        <Link href="/candidature">
          <Button size="lg" className="gradient-primary text-white px-8">
            Candidater
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
