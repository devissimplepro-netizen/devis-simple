CREATE TABLE IF NOT EXISTS stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL UNIQUE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT NOT NULL REFERENCES stripe_customers(customer_id) ON DELETE CASCADE,
  subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'not_started',
  price_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_stripe_customer" ON stripe_customers FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert_own_stripe_customer" ON stripe_customers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own_stripe_customer" ON stripe_customers FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "select_own_stripe_subscription" ON stripe_subscriptions FOR SELECT TO authenticated
  USING (customer_id IN (SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid()));
CREATE POLICY "insert_own_stripe_subscription" ON stripe_subscriptions FOR INSERT TO authenticated
  WITH CHECK (customer_id IN (SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid()));
CREATE POLICY "update_own_stripe_subscription" ON stripe_subscriptions FOR UPDATE TO authenticated
  USING (customer_id IN (SELECT customer_id FROM stripe_customers WHERE user_id = auth.uid()));
