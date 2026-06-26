-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'France',
  phone TEXT,
  email TEXT,
  siret TEXT,
  tva_number TEXT,
  tva_rate DECIMAL(5,2) DEFAULT 20.00,
  legal_mentions TEXT,
  primary_color TEXT DEFAULT '#1E40AF',
  secondary_color TEXT DEFAULT '#3B82F6',
  pdf_template INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes table
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'refused', 'invoiced')),
  valid_until DATE,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tva_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  internal_notes TEXT,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quote items table
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  tva_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quote views table (tracking)
CREATE TABLE quote_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quote signatures table
CREATE TABLE quote_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  signature_data TEXT,
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('accepted', 'refused')),
  comment TEXT,
  signed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'late')),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tva_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice items table
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  tva_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'expert')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter subscribers
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "select_own_user" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "insert_own_user" ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_user" ON users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- RLS Policies for companies
CREATE POLICY "select_own_companies" ON companies FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert_own_companies" ON companies FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own_companies" ON companies FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete_own_companies" ON companies FOR DELETE TO authenticated USING (user_id = auth.uid());

-- RLS Policies for clients
CREATE POLICY "select_own_clients" ON clients FOR SELECT TO authenticated 
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
CREATE POLICY "insert_own_clients" ON clients FOR INSERT TO authenticated 
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
CREATE POLICY "update_own_clients" ON clients FOR UPDATE TO authenticated 
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
CREATE POLICY "delete_own_clients" ON clients FOR DELETE TO authenticated 
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- RLS Policies for quotes
CREATE POLICY "select_own_quotes" ON quotes FOR SELECT TO authenticated 
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
CREATE POLICY "insert_own_quotes" ON quotes FOR INSERT TO authenticated 
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
CREATE POLICY "update_own_quotes" ON quotes FOR UPDATE TO authenticated 
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
CREATE POLICY "delete_own_quotes" ON quotes FOR DELETE TO authenticated 
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- RLS Policies for quote_items
CREATE POLICY "select_own_quote_items" ON quote_items FOR SELECT TO authenticated 
  USING (quote_id IN (SELECT id FROM quotes WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())));
CREATE POLICY "insert_own_quote_items" ON quote_items FOR INSERT TO authenticated 
  WITH CHECK (quote_id IN (SELECT id FROM quotes WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())));
CREATE POLICY "update_own_quote_items" ON quote_items FOR UPDATE TO authenticated 
  USING (quote_id IN (SELECT id FROM quotes WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())))
  WITH CHECK (quote_id IN (SELECT id FROM quotes WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())));
CREATE POLICY "delete_own_quote_items" ON quote_items FOR DELETE TO authenticated 
  USING (quote_id IN (SELECT id FROM quotes WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())));

-- RLS Policies for quote_views
CREATE POLICY "select_own_quote_views" ON quote_views FOR SELECT TO authenticated 
  USING (quote_id IN (SELECT id FROM quotes WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())));
CREATE POLICY "insert_own_quote_views" ON quote_views FOR INSERT TO authenticated 
  WITH CHECK (quote_id IN (SELECT id FROM quotes WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())));

-- RLS Policies for quote_signatures
CREATE POLICY "select_own_quote_signatures" ON quote_signatures FOR SELECT TO authenticated 
  USING (quote_id IN (SELECT id FROM quotes WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())));
CREATE POLICY "insert_own_quote_signatures" ON quote_signatures FOR INSERT TO authenticated 
  WITH CHECK (quote_id IN (SELECT id FROM quotes WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())));

-- RLS Policies for invoices
CREATE POLICY "select_own_invoices" ON invoices FOR SELECT TO authenticated 
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
CREATE POLICY "insert_own_invoices" ON invoices FOR INSERT TO authenticated 
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
CREATE POLICY "update_own_invoices" ON invoices FOR UPDATE TO authenticated 
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
CREATE POLICY "delete_own_invoices" ON invoices FOR DELETE TO authenticated 
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- RLS Policies for invoice_items
CREATE POLICY "select_own_invoice_items" ON invoice_items FOR SELECT TO authenticated 
  USING (invoice_id IN (SELECT id FROM invoices WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())));
CREATE POLICY "insert_own_invoice_items" ON invoice_items FOR INSERT TO authenticated 
  WITH CHECK (invoice_id IN (SELECT id FROM invoices WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())));
CREATE POLICY "update_own_invoice_items" ON invoice_items FOR UPDATE TO authenticated 
  USING (invoice_id IN (SELECT id FROM invoices WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())))
  WITH CHECK (invoice_id IN (SELECT id FROM invoices WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())));
CREATE POLICY "delete_own_invoice_items" ON invoice_items FOR DELETE TO authenticated 
  USING (invoice_id IN (SELECT id FROM invoices WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())));

-- RLS Policies for subscriptions
CREATE POLICY "select_own_subscriptions" ON subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert_own_subscriptions" ON subscriptions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own_subscriptions" ON subscriptions FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- RLS Policies for newsletter_subscribers (public can insert, no read for auth users)
CREATE POLICY "insert_newsletter" ON newsletter_subscribers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "insert_newsletter_auth" ON newsletter_subscribers FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for activity_logs
CREATE POLICY "select_own_activity_logs" ON activity_logs FOR SELECT TO authenticated 
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
CREATE POLICY "insert_own_activity_logs" ON activity_logs FOR INSERT TO authenticated 
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- Functions for generating document numbers
CREATE OR REPLACE FUNCTION generate_quote_number(year INT)
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 10 FOR 5) AS INTEGER)), 0) + 1
  INTO next_num
  FROM quotes
  WHERE number LIKE 'DEV-' || year || '-%';
  
  RETURN 'DEV-' || year || '-' || LPAD(next_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_invoice_number(year INT)
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 10 FOR 5) AS INTEGER)), 0) + 1
  INTO next_num
  FROM invoices
  WHERE number LIKE 'FAC-' || year || '-%';
  
  RETURN 'FAC-' || year || '-' || LPAD(next_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes for performance
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_clients_company_id ON clients(company_id);
CREATE INDEX idx_quotes_company_id ON quotes(company_id);
CREATE INDEX idx_quotes_client_id ON quotes(client_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_share_token ON quotes(share_token);
CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX idx_quote_views_quote_id ON quote_views(quote_id);
CREATE INDEX idx_quote_signatures_quote_id ON quote_signatures(quote_id);
CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_quote_id ON invoices(quote_id);
CREATE INDEX idx_invoices_share_token ON invoices(share_token);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_activity_logs_company_id ON activity_logs(company_id);