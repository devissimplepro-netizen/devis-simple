'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface PDFPreviewModalProps {
  templateId: number;
  templateName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PDFPreviewModal({ templateId, templateName, open, onOpenChange }: PDFPreviewModalProps) {
  const colors = [
    'bg-blue-50',
    'bg-gray-50',
    'bg-amber-50',
    'bg-white',
    'bg-orange-50',
  ];
  const color = colors[templateId - 1] || 'bg-white';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Aperçu : {templateName}
          </DialogTitle>
        </DialogHeader>
        <div className={`p-6 border-2 border-dashed border-gray-300 rounded-xl ${color}`}>
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-bold text-gray-900">Mon Entreprise</h3>
                <p className="text-sm text-gray-500">123 Rue de Paris, 75001 Paris</p>
                <p className="text-sm text-gray-500">SIRET: 123 456 789 00012</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">DEVIS</p>
                <p className="text-sm text-gray-500">D-2026-0001</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Client</p>
              <p className="text-sm text-gray-600">Jean Dupont</p>
              <p className="text-sm text-gray-600">12 Avenue de la République, 69001 Lyon</p>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500 border-b pb-2">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-right">Qté</div>
                <div className="col-span-2 text-right">Prix U.</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              <div className="grid grid-cols-12 gap-2 text-sm">
                <div className="col-span-6 text-gray-900">Pose de parquet flottant</div>
                <div className="col-span-2 text-right text-gray-600">45</div>
                <div className="col-span-2 text-right text-gray-600">35,00 €</div>
                <div className="col-span-2 text-right font-medium">1 575,00 €</div>
              </div>
              <div className="grid grid-cols-12 gap-2 text-sm">
                <div className="col-span-6 text-gray-900">Fourniture parquet</div>
                <div className="col-span-2 text-right text-gray-600">45</div>
                <div className="col-span-2 text-right text-gray-600">28,00 €</div>
                <div className="col-span-2 text-right font-medium">1 260,00 €</div>
              </div>
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total HT</span>
                <span className="font-medium">2 835,00 €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">TVA 20%</span>
                <span className="font-medium">567,00 €</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total TTC</span>
                <span>3 402,00 €</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
