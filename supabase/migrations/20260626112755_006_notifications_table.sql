/*
# Création de la table notifications et ajout de tracking pour le compteur de documents

1. Nouvelle table `notifications`
   - `id` (uuid, PK)
   - `user_id` (uuid, FK vers users)
   - `title` (text)
   - `message` (text)
   - `type` (text, valeurs : candidature, quote_accepted, quote_refused, invoice_paid, payment, subscription, admin)
   - `read` (boolean, default false)
   - `created_at` (timestamptz)

2. Nouvelle table `document_counts`
   - `user_id` (uuid, PK, FK vers users)
   - `quotes_count` (integer, default 0)
   - `invoices_count` (integer, default 0)
   - `updated_at` (timestamptz)

3. Sécurité
   - RLS sur notifications : owner-scoped
   - RLS sur document_counts : owner-scoped
*/

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('candidature', 'quote_accepted', 'quote_refused', 'invoice_paid', 'payment', 'subscription', 'admin', 'info')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

CREATE TABLE IF NOT EXISTS document_counts (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  quotes_count INTEGER NOT NULL DEFAULT 0,
  invoices_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE document_counts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_document_counts" ON document_counts;
CREATE POLICY "select_own_document_counts" ON document_counts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_document_counts" ON document_counts;
CREATE POLICY "insert_own_document_counts" ON document_counts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_document_counts" ON document_counts;
CREATE POLICY "update_own_document_counts" ON document_counts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_document_counts" ON document_counts;
CREATE POLICY "delete_own_document_counts" ON document_counts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
