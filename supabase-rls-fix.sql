-- ============================================================
-- StudioSuite PRO -- Complete RLS Fix
-- ROOT CAUSE: Policies on other tables were querying profiles
-- to check is_admin, causing infinite recursion.
-- FIX: Use auth.uid() and auth.jwt() ONLY -- never query profiles
-- from within any policy.
-- Run in: https://supabase.com/dashboard/project/hpmsmhqdgzikbgaprcad/sql/new
-- ============================================================

-- ── STEP 1: Drop ALL existing policies on every table ─────────────────────

DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname
           FROM pg_policies
           WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
      r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ── STEP 2: Create a stable admin-check SECURITY DEFINER function ─────────
-- This runs as the DB owner, bypasses RLS, no recursion possible.

CREATE OR REPLACE FUNCTION public.is_admin_user(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = uid LIMIT 1),
    false
  );
$$;

-- ── STEP 3: Recreate all policies using ONLY auth.uid() ───────────────────
-- NEVER call is_admin_user() inside profiles policies (would still recurse).
-- For profiles: admins get full access via a JWT email claim check.

-- profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Admin can read/write ALL profiles (using email from JWT, no subquery)
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL
  USING (
    (auth.jwt() ->> 'email') = 'rasheequ.designs@gmail.com'
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'rasheequ.designs@gmail.com'
  );

-- payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payments_insert_own" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payments_update_own" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "payments_admin_all" ON public.payments
  FOR ALL
  USING ((auth.jwt() ->> 'email') = 'rasheequ.designs@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'rasheequ.designs@gmail.com');

-- plans table (public read, admin write)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans_select_all" ON public.plans
  FOR SELECT USING (true);

CREATE POLICY "plans_admin_write" ON public.plans
  FOR ALL
  USING ((auth.jwt() ->> 'email') = 'rasheequ.designs@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'rasheequ.designs@gmail.com');

-- enabled_features table (public read, admin write)
ALTER TABLE public.enabled_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "features_select_all" ON public.enabled_features
  FOR SELECT USING (true);

CREATE POLICY "features_admin_write" ON public.enabled_features
  FOR ALL
  USING ((auth.jwt() ->> 'email') = 'rasheequ.designs@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'rasheequ.designs@gmail.com');

-- site_settings table (public read, admin write)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_select_all" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "settings_admin_write" ON public.site_settings
  FOR ALL
  USING ((auth.jwt() ->> 'email') = 'rasheequ.designs@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'rasheequ.designs@gmail.com');

-- work_history table
ALTER TABLE public.work_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "work_history_select_own" ON public.work_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "work_history_insert_own" ON public.work_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "work_history_admin_all" ON public.work_history
  FOR ALL
  USING ((auth.jwt() ->> 'email') = 'rasheequ.designs@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'rasheequ.designs@gmail.com');

-- ── STEP 4: Grant permissions ─────────────────────────────────────────────

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.plans TO anon, authenticated;
GRANT SELECT ON public.enabled_features TO anon, authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enabled_features TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;

-- ── STEP 5: Fix the handle_new_user trigger (was also querying profiles) ──

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, current_plan, subscription_verified, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'free',
    false,
    (NEW.email = 'rasheequ.designs@gmail.com')
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        is_admin = (NEW.email = 'rasheequ.designs@gmail.com' OR public.profiles.is_admin),
        updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── STEP 6: Ensure admin profile has is_admin = true ─────────────────────

UPDATE public.profiles
SET is_admin = true,
    subscription_verified = true,
    current_plan = 'admin',
    updated_at = now()
WHERE email = 'rasheequ.designs@gmail.com';

-- ── STEP 7: Verify — all 3 should return rows ─────────────────────────────

SELECT 'policies' as check, count(*) as count FROM pg_policies WHERE schemaname = 'public'
UNION ALL
SELECT 'admin profile', count(*) FROM public.profiles WHERE email = 'rasheequ.designs@gmail.com' AND is_admin = true
UNION ALL
SELECT 'settings rows', count(*) FROM public.site_settings;