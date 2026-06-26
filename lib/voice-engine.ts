/**
 * Voice Engine — Zero-cost AI quote generation
 * Uses only the Web Speech API (browser-native) + rule-based NLP.
 * Architecture allows adding an external AI (e.g. OpenAI) later
 * by swapping the `analyzeTranscript` export for an API call.
 */

export interface ParsedItem {
  description: string;
  quantity: number;
  unit_price: number;
  tva_rate: number;
}

export interface ParsedQuote {
  client_name: string;
  items: ParsedItem[];
  notes?: string;
  confidence: number; // 0-1
}

export interface PrestationLibraryEntry {
  id: string;
  name: string;
  description?: string | null;
  default_price: number;
  tva_rate: number;
  unit?: string | null;
  keywords: string[];
}

// ─── Extractors ───────────────────────────────────────────────────────────────

function extractClientName(text: string): string {
  // "chez M./Mme/Monsieur/Madame <Name>" or "pour M. <Name>"
  const patterns = [
    /(?:chez|pour)\s+(?:M\.?|Mme\.?|Monsieur|Madame|Mr\.?)\s+([A-Za-zÀ-ÿ\-']+(?:\s+[A-Za-zÀ-ÿ\-']+)?)/i,
    /(?:chez|pour)\s+(?:la\s+société|l['']entreprise|la\s+maison)?\s+([A-Za-zÀ-ÿ\-'\s]{3,30})/i,
    /(?:client[e]?\s+)?([A-Za-zÀ-ÿ\-']+(?:\s+[A-Za-zÀ-ÿ\-']+)?)\s+(?:demande|souhaite|veut)/i,
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].trim();
  }
  return '';
}

function extractPrices(text: string): number[] {
  const prices: number[] = [];
  const regex = /(\d+(?:[.,]\d{1,2})?)\s*(?:euro(?:s)?|€)/gi;
  let m;
  while ((m = regex.exec(text)) !== null) {
    prices.push(parseFloat(m[1].replace(',', '.')));
  }
  return prices;
}

function extractQuantity(text: string, beforeDesc: string): number {
  const qtyPatterns = [
    /(\d+(?:[.,]\d+)?)\s*(?:unité(?:s)?|pièce(?:s)?|fois|heure(?:s)?|jour(?:s)?)/i,
    /(\d+)\s+(?:de\s+)?(?:pose(?:s)?|installation(?:s)?|remplacement(?:s)?)/i,
  ];
  for (const p of qtyPatterns) {
    const m = (beforeDesc + ' ' + text).match(p);
    if (m) return parseFloat(m[1]);
  }
  return 1;
}

// ─── Keywords built-in (augmented by library) ──────────────────────────────

const BUILT_IN_KEYWORDS: Record<string, Partial<ParsedItem>> = {
  'chauffe-eau': { description: 'Fourniture et pose chauffe-eau', unit_price: 650 },
  'chauffe eau': { description: 'Fourniture et pose chauffe-eau', unit_price: 650 },
  'cumulus': { description: 'Fourniture et pose cumulus', unit_price: 600 },
  'robinet': { description: 'Remplacement robinet', unit_price: 180 },
  'fuite': { description: 'Recherche et réparation de fuite', unit_price: 250 },
  'débouchage': { description: 'Débouchage canalisation', unit_price: 200 },
  'climatisation': { description: 'Installation climatisation', unit_price: 1200 },
  'clim': { description: 'Installation climatisation', unit_price: 1200 },
  'tableau électrique': { description: 'Mise en conformité tableau électrique', unit_price: 800 },
  'tableau electrique': { description: 'Mise en conformité tableau électrique', unit_price: 800 },
  'peinture': { description: 'Travaux de peinture', unit_price: 400 },
  'carrelage': { description: 'Pose carrelage', unit_price: 600 },
  'parquet': { description: 'Pose parquet', unit_price: 700 },
  'serrure': { description: 'Remplacement serrure', unit_price: 250 },
  'vitre': { description: 'Remplacement vitre', unit_price: 300 },
  'toiture': { description: 'Réparation toiture', unit_price: 900 },
};

function matchLibraryKeywords(
  text: string,
  library: PrestationLibraryEntry[]
): ParsedItem[] {
  const lc = text.toLowerCase();
  const matched: ParsedItem[] = [];

  for (const prestation of library) {
    const allKeywords = [
      prestation.name.toLowerCase(),
      ...(prestation.keywords || []).map((k) => k.toLowerCase()),
    ];
    if (allKeywords.some((kw) => kw && lc.includes(kw))) {
      matched.push({
        description: prestation.name,
        quantity: 1,
        unit_price: prestation.default_price,
        tva_rate: prestation.tva_rate,
      });
    }
  }

  return matched;
}

function matchBuiltInKeywords(text: string): ParsedItem[] {
  const lc = text.toLowerCase();
  const matched: ParsedItem[] = [];

  for (const [kw, partial] of Object.entries(BUILT_IN_KEYWORDS)) {
    if (lc.includes(kw)) {
      matched.push({
        description: partial.description || kw,
        quantity: 1,
        unit_price: partial.unit_price || 0,
        tva_rate: 20,
      });
    }
  }

  return matched;
}

// ─── Main label-price pairing from transcript ─────────────────────────────

function extractLabeledPrices(text: string): ParsedItem[] {
  const items: ParsedItem[] = [];

  // Pattern: "<label> <price>€" or "<label> <price> euros"
  const labeled = /([a-zà-ÿ\s']{3,40}?)\s+(\d+(?:[.,]\d{1,2})?)\s*(?:€|euro(?:s)?)/gi;
  let m;
  while ((m = labeled.exec(text)) !== null) {
    const label = m[1].trim();
    const price = parseFloat(m[2].replace(',', '.'));
    // Skip client-name fragments
    if (/monsieur|madame|mme|chez|pour/i.test(label)) continue;
    items.push({
      description: capitalize(label),
      quantity: 1,
      unit_price: price,
      tva_rate: 20,
    });
  }

  return items;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function analyzeTranscript(
  transcript: string,
  library: PrestationLibraryEntry[] = []
): ParsedQuote {
  if (!transcript.trim()) {
    return { client_name: '', items: [], confidence: 0 };
  }

  const clientName = extractClientName(transcript);

  // Priority 1: match against user's personal library
  let items = matchLibraryKeywords(transcript, library);

  // Priority 2: match built-in keyword dictionary (don't duplicate)
  const existingDescs = new Set(items.map((i) => i.description.toLowerCase()));
  const builtIn = matchBuiltInKeywords(transcript).filter(
    (i) => !existingDescs.has(i.description.toLowerCase())
  );
  items.push(...builtIn);

  // Priority 3: labeled prices from transcript (fallback)
  if (items.length === 0) {
    items = extractLabeledPrices(transcript);
  }

  // If still no items, add placeholder
  if (items.length === 0) {
    const prices = extractPrices(transcript);
    if (prices.length > 0) {
      prices.forEach((p, i) => {
        items.push({
          description: i === 0 ? 'Fourniture' : "Main d'œuvre",
          quantity: 1,
          unit_price: p,
          tva_rate: 20,
        });
      });
    } else {
      items.push({ description: 'Intervention', quantity: 1, unit_price: 0, tva_rate: 20 });
    }
  }

  // Update prices from transcript if an item has price=0 and transcript mentions amounts
  const prices = extractPrices(transcript);
  const noPrice = items.filter((i) => i.unit_price === 0);
  if (noPrice.length > 0 && prices.length > 0) {
    let pi = 0;
    for (const item of items) {
      if (item.unit_price === 0 && pi < prices.length) {
        item.unit_price = prices[pi++];
      }
    }
  }

  const confidence = Math.min(
    1,
    (clientName ? 0.4 : 0) +
    (items.length > 0 && items[0].unit_price > 0 ? 0.4 : 0.1) +
    (items.length > 1 ? 0.2 : 0)
  );

  return { client_name: clientName, items, confidence };
}

// ─── Web Speech API helpers ──────────────────────────────────────────────────

export interface SpeechRecognitionController {
  start: () => void;
  stop: () => void;
  isSupported: boolean;
}

export function createSpeechRecognition(
  onTranscript: (text: string, isFinal: boolean) => void,
  onEnd: () => void,
  onError: (err: string) => void
): SpeechRecognitionController {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) {
    return { start: () => {}, stop: () => {}, isSupported: false };
  }

  const recognition = new SR();
  recognition.lang = 'fr-FR';
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event: any) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript;
      if (event.results[i].isFinal) final += t;
      else interim += t;
    }
    if (final) onTranscript(final, true);
    else if (interim) onTranscript(interim, false);
  };

  recognition.onend = onEnd;
  recognition.onerror = (e: any) => onError(e.error || 'Erreur inconnue');

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
    isSupported: true,
  };
}
