-- Prestations library (per company)
CREATE TABLE prestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  default_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  tva_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  unit TEXT DEFAULT 'forfait',
  keywords TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prestations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_prestations" ON prestations FOR SELECT TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
CREATE POLICY "insert_own_prestations" ON prestations FOR INSERT TO authenticated
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
CREATE POLICY "update_own_prestations" ON prestations FOR UPDATE TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
CREATE POLICY "delete_own_prestations" ON prestations FOR DELETE TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE INDEX idx_prestations_company_id ON prestations(company_id);

CREATE TRIGGER update_prestations_updated_at
  BEFORE UPDATE ON prestations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Allow public token-based access to quotes and invoices (for share links)
-- These policies enable anonymous users to view quote/invoice data via share token
-- Without adding these, the public pages /q/[token] and /i/[token] cannot load data

CREATE POLICY "public_select_quotes_by_token" ON quotes FOR SELECT TO anon
  USING (share_token IS NOT NULL);

CREATE POLICY "public_select_quote_items_by_quote" ON quote_items FOR SELECT TO anon
  USING (quote_id IN (SELECT id FROM quotes WHERE share_token IS NOT NULL));

CREATE POLICY "public_select_clients_for_quotes" ON clients FOR SELECT TO anon
  USING (id IN (
    SELECT client_id FROM quotes WHERE share_token IS NOT NULL
    UNION
    SELECT client_id FROM invoices WHERE share_token IS NOT NULL
  ));

CREATE POLICY "public_select_companies_for_quotes" ON companies FOR SELECT TO anon
  USING (id IN (
    SELECT company_id FROM quotes WHERE share_token IS NOT NULL
    UNION
    SELECT company_id FROM invoices WHERE share_token IS NOT NULL
  ));

CREATE POLICY "public_insert_quote_views" ON quote_views FOR INSERT TO anon
  WITH CHECK (quote_id IN (SELECT id FROM quotes WHERE share_token IS NOT NULL));

CREATE POLICY "public_insert_quote_signatures" ON quote_signatures FOR INSERT TO anon
  WITH CHECK (quote_id IN (SELECT id FROM quotes WHERE share_token IS NOT NULL));

CREATE POLICY "public_update_quotes_status" ON quotes FOR UPDATE TO anon
  USING (share_token IS NOT NULL)
  WITH CHECK (share_token IS NOT NULL);

CREATE POLICY "public_select_invoices_by_token" ON invoices FOR SELECT TO anon
  USING (share_token IS NOT NULL);

CREATE POLICY "public_select_invoice_items_by_invoice" ON invoice_items FOR SELECT TO anon
  USING (invoice_id IN (SELECT id FROM invoices WHERE share_token IS NOT NULL));

CREATE POLICY "public_update_invoices_status" ON invoices FOR UPDATE TO anon
  USING (share_token IS NOT NULL)
  WITH CHECK (share_token IS NOT NULL);