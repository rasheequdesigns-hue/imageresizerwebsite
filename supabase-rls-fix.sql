-- ============================================================
-- StudioSuite PRO — Supabase RLS Fix & Complete Schema Setup
-- Run this in: https://hpmsmhqdgzikbgaprcad.supabase.co/project/hpmsmhqdgzikbgaprcad/sql/new
-- ============================================================

-- STEP 1: Drop ALL existing broken RLS policies

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "Service role bypass" ON public.profiles;
DROP POLICY IF EXISTS "allow_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

DROP POLICY IF EXISTS "Users can read own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can read all payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can update all payments" ON public.payments;
DROP POLICY IF EXISTS "payments_read_own" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
DROP POLICY IF EXISTS "payments_admin_all" ON public.payments;
DROP POLICY IF EXISTS "allow_all" ON public.payments;
DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
DROP POLICY IF EXISTS "payments_update_own" ON public.payments;

DROP POLICY IF EXISTS "plans_read_all" ON public.plans;
DROP POLICY IF EXISTS "plans_admin_all" ON public.plans;
DROP POLICY IF EXISTS "allow_all" ON public.plans;
DROP POLICY IF EXISTS "plans_select_all" ON public.plans;

DROP POLICY IF EXISTS "features_read_all" ON public.enabled_features;
DROP POLICY IF EXISTS "features_admin_all" ON public.enabled_features;
DROP POLICY IF EXISTS "allow_all" ON public.enabled_features;
DROP POLICY IF EXISTS "features_select_all" ON public.enabled_features;

DROP POLICY IF EXISTS "settings_read_all" ON public.site_settings;
DROP POLICY IF EXISTS "settings_admin_all" ON public.site_settings;
DROP POLICY IF EXISTS "allow_all" ON public.site_settings;
DROP POLICY IF EXISTS "settings_select_all" ON public.site_settings;

DROP POLICY IF EXISTS "work_history_read_own" ON public.work_history;
DROP POLICY IF EXISTS "work_history_insert_own" ON public.work_history;
DROP POLICY IF EXISTS "allow_all" ON public.work_history;
DROP POLICY IF EXISTS "work_history_select_own" ON public.work_history;


-- STEP 2: Create Tables if they don't exist

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  phone TEXT,
  org TEXT,
  current_plan TEXT DEFAULT 'free',
  plan_expiry TIMESTAMPTZ,
  subscription_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  utr_number TEXT UNIQUE,
  plan_type TEXT NOT NULL,
  amount_paid NUMERIC(10,2),
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_inr NUMERIC(10,2) DEFAULT 0,
  duration_days INTEGER DEFAULT 30,
  max_file_size_mb INTEGER DEFAULT 25,
  badge TEXT,
  features JSONB DEFAULT '[]',
  allowed_tool_ids TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.enabled_features (
  tool_id TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.work_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_id TEXT,
  tool_name TEXT,
  filename TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- STEP 3: Enable RLS on all tables

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enabled_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_history ENABLE ROW LEVEL SECURITY;


-- STEP 4: Create SIMPLE, non-recursive RLS policies
-- CRITICAL: Only use auth.uid() directly — never query profiles from within a profiles policy!

-- profiles
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- payments
CREATE POLICY "payments_insert_own" ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payments_select_own" ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "payments_update_own" ON public.payments FOR UPDATE
  USING (auth.uid() = user_id);

-- plans (public read)
CREATE POLICY "plans_select_all" ON public.plans FOR SELECT USING (true);
CREATE POLICY "plans_write_auth" ON public.plans FOR ALL USING (auth.role() = 'authenticated');

-- enabled_features (public read)
CREATE POLICY "features_select_all" ON public.enabled_features FOR SELECT USING (true);
CREATE POLICY "features_write_auth" ON public.enabled_features FOR ALL USING (auth.role() = 'authenticated');

-- site_settings (public read)
CREATE POLICY "settings_select_all" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "settings_write_auth" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');

-- work_history
CREATE POLICY "work_history_insert_own" ON public.work_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "work_history_select_own" ON public.work_history FOR SELECT
  USING (auth.uid() = user_id);


-- STEP 5: Seed Default Plans

INSERT INTO public.plans (id, name, price_inr, duration_days, max_file_size_mb, badge, features, allowed_tool_ids)
VALUES
  ('free', 'Free Tier', 0, 3650, 25, 'Basic',
   '["Access to 50 Tools","25MB File Upload Limit","Standard Processing Speed"]', 'all'),
  ('pro-monthly', 'Pro Monthly', 499, 30, 250, 'Popular',
   '["All 50 Master Tools Unlocked","250MB File Upload Limit","Priority Email Support","Automated UTR Verification"]', 'all'),
  ('pro-yearly', 'Pro Annual', 4999, 365, 1000, 'Best Value',
   '["All Pro Features Included","1GB Max File Upload Size","2 Months Free Savings","Dedicated Support"]', 'all')
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name, price_inr = EXCLUDED.price_inr, duration_days = EXCLUDED.duration_days,
      max_file_size_mb = EXCLUDED.max_file_size_mb, badge = EXCLUDED.badge,
      features = EXCLUDED.features, allowed_tool_ids = EXCLUDED.allowed_tool_ids, updated_at = NOW();


-- STEP 6: Seed Default Site Settings

INSERT INTO public.site_settings (key, value)
VALUES
  ('admin_upi', 'rasheequ.designs@gmail.com'),
  ('footer_contact', '{"company":"StudioSuite PRO","address":"100 Innovation Parkway, Suite 400, Tech Park","phone":"+91 98765 43210","email":"support@studiosuitepro.com","hours":"Mon - Fri: 9:00 AM - 6:00 PM IST"}'),
  ('admin_passcode', 'admin2026')
ON CONFLICT (key) DO NOTHING;


-- STEP 7: Auto-create profile on new user signup

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, current_plan, subscription_verified, is_admin)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'free', FALSE,
    (NEW.email = 'rasheequ.designs@gmail.com')
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        is_admin = (NEW.email = 'rasheequ.designs@gmail.com' OR profiles.is_admin),
        updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- STEP 8: Grant permissions

GRANT SELECT ON public.plans TO anon, authenticated;
GRANT SELECT ON public.enabled_features TO anon, authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT SELECT, INSERT ON public.work_history TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.enabled_features TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT UPDATE ON public.payments TO authenticated;


-- VERIFY (run after the script):
-- SELECT * FROM public.plans;          -- Should return 3 rows
-- SELECT * FROM public.site_settings;  -- Should return 3 rows
-- SELECT count(*) FROM public.profiles; -- Should work without error
