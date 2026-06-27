export type Plan = 'starter' | 'pro';
export type BillingCycle = 'monthly' | 'yearly';
export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'refused' | 'invoiced';
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'late';
export type UserRole = 'admin' | 'artisan';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  trade: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  trade: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  siret: string | null;
  tva_number: string | null;
  tva_rate: number;
  legal_mentions: string | null;
  primary_color: string;
  secondary_color: string;
  pdf_template: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  company_id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tva_rate: number;
  total: number;
  order: number;
  created_at: string;
}

export interface Quote {
  id: string;
  company_id: string;
  client_id: string;
  number: string;
  status: QuoteStatus;
  valid_until: string | null;
  subtotal: number;
  tva_amount: number;
  total: number;
  notes: string | null;
  internal_notes: string | null;
  share_token: string;
  created_at: string;
  updated_at: string;
  client?: Client;
  items?: QuoteItem[];
  company?: Company;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tva_rate: number;
  total: number;
  order: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  company_id: string;
  client_id: string;
  quote_id: string | null;
  number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  tva_amount: number;
  total: number;
  notes: string | null;
  share_token: string;
  created_at: string;
  updated_at: string;
  client?: Client;
  items?: InvoiceItem[];
  company?: Company;
  quote?: Quote;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  plan: Plan;
  billing_cycle: BillingCycle;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  quotes_count: number;
  invoices_count: number;
  revenue: number;
  acceptance_rate: number;
  recent_documents: Array<{
    id: string;
    type: 'quote' | 'invoice';
    number: string;
    client_name: string;
    total: number;
    status: string;
    created_at: string;
  }>;
}

export interface QuoteView {
  id: string;
  quote_id: string;
  ip_address: string | null;
  user_agent: string | null;
  viewed_at: string;
}

export interface QuoteSignature {
  id: string;
  quote_id: string;
  client_name: string;
  client_email: string | null;
  signature_data: string | null;
  status: 'accepted' | 'refused';
  comment: string | null;
  signed_at: string;
}

export interface Prestation {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  default_price: number;
  tva_rate: number;
  unit: string | null;
  keywords: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
