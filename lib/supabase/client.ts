import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          logo_url?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
          phone?: string | null;
          email?: string | null;
          siret?: string | null;
          tva_number?: string | null;
          tva_rate?: number;
          legal_mentions?: string | null;
          primary_color?: string;
          secondary_color?: string;
          pdf_template?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          logo_url?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
          phone?: string | null;
          email?: string | null;
          siret?: string | null;
          tva_number?: string | null;
          tva_rate?: number;
          legal_mentions?: string | null;
          primary_color?: string;
          secondary_color?: string;
          pdf_template?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
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
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          contact_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          contact_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      quotes: {
        Row: {
          id: string;
          company_id: string;
          client_id: string;
          number: string;
          status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'refused' | 'invoiced';
          valid_until: string | null;
          subtotal: number;
          tva_amount: number;
          total: number;
          notes: string | null;
          internal_notes: string | null;
          share_token: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          client_id: string;
          number: string;
          status?: 'draft' | 'sent' | 'viewed' | 'accepted' | 'refused' | 'invoiced';
          valid_until?: string | null;
          subtotal?: number;
          tva_amount?: number;
          total?: number;
          notes?: string | null;
          internal_notes?: string | null;
          share_token?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          client_id?: string;
          number?: string;
          status?: 'draft' | 'sent' | 'viewed' | 'accepted' | 'refused' | 'invoiced';
          valid_until?: string | null;
          subtotal?: number;
          tva_amount?: number;
          total?: number;
          notes?: string | null;
          internal_notes?: string | null;
          share_token?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      quote_items: {
        Row: {
          id: string;
          quote_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          tva_rate: number;
          total: number;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quote_id: string;
          description: string;
          quantity?: number;
          unit_price?: number;
          tva_rate?: number;
          total?: number;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          quote_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          tva_rate?: number;
          total?: number;
          order?: number;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          company_id: string;
          client_id: string;
          quote_id: string | null;
          number: string;
          status: 'draft' | 'sent' | 'viewed' | 'paid' | 'late';
          issue_date: string;
          due_date: string | null;
          subtotal: number;
          tva_amount: number;
          total: number;
          notes: string | null;
          share_token: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          client_id: string;
          quote_id?: string | null;
          number: string;
          status?: 'draft' | 'sent' | 'viewed' | 'paid' | 'late';
          issue_date?: string;
          due_date?: string | null;
          subtotal?: number;
          tva_amount?: number;
          total?: number;
          notes?: string | null;
          share_token?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          client_id?: string;
          quote_id?: string | null;
          number?: string;
          status?: 'draft' | 'sent' | 'viewed' | 'paid' | 'late';
          issue_date?: string;
          due_date?: string | null;
          subtotal?: number;
          tva_amount?: number;
          total?: number;
          notes?: string | null;
          share_token?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          tva_rate: number;
          total: number;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity?: number;
          unit_price?: number;
          tva_rate?: number;
          total?: number;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          tva_rate?: number;
          total?: number;
          order?: number;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          plan: 'starter' | 'pro' | 'expert';
          billing_cycle: 'monthly' | 'yearly';
          status: 'active' | 'canceled' | 'past_due' | 'trialing';
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          plan?: 'starter' | 'pro' | 'expert';
          billing_cycle?: 'monthly' | 'yearly';
          status?: 'active' | 'canceled' | 'past_due' | 'trialing';
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          plan?: 'starter' | 'pro' | 'expert';
          billing_cycle?: 'monthly' | 'yearly';
          status?: 'active' | 'canceled' | 'past_due' | 'trialing';
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          first_name: string | null;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          first_name?: string | null;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          email?: string;
          created_at?: string;
        };
      };
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
