'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, X, Lock } from 'lucide-react';
import Link from 'next/link';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function UpgradeModal({ open, onClose, title, description }: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #1B3C96 0%, #2554C7 100%)' }}>
            <Lock className="h-8 w-8 text-white" />
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold text-white mb-4" style={{ background: '#F47319' }}>
            <Sparkles className="h-4 w-4" />
            Forfait Pro
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {title || 'Fonctionnalité réservée au forfait Pro'}
          </h2>

          <p className="text-gray-600 leading-relaxed mb-8">
            {description ||
              'Cette fonctionnalité est disponible dans le forfait Pro. Passez à la version supérieure dès maintenant pour débloquer des outils avancés et gagner encore plus de temps.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link href="/dashboard/subscription" className="flex-1">
              <Button
                className="w-full text-white"
                style={{ background: 'linear-gradient(135deg, #1B3C96 0%, #2554C7 100%)' }}
                onClick={onClose}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Passer au forfait Pro
              </Button>
            </Link>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Continuer en Starter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProBadgeProps {
  className?: string;
}

export function ProBadge({ className = '' }: ProBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold text-white ${className}`}
      style={{ background: '#F47319' }}
    >
      <Sparkles className="h-3 w-3" />
      PRO
    </span>
  );
}
