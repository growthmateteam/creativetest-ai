-- Add Facebook OAuth columns to ad_accounts
ALTER TABLE public.ad_accounts
  ADD COLUMN IF NOT EXISTS fb_account_id text,
  ADD COLUMN IF NOT EXISTS bm_id text,
  ADD COLUMN IF NOT EXISTS access_token text,
  ADD COLUMN IF NOT EXISTS token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS linked_page_id text,
  ADD COLUMN IF NOT EXISTS linked_page_name text,
  ADD COLUMN IF NOT EXISTS linked_ig_id text,
  ADD COLUMN IF NOT EXISTS linked_ig_username text,
  ADD COLUMN IF NOT EXISTS connection_status text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS connected_by uuid,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_ad_accounts_fb_account_id ON public.ad_accounts(fb_account_id);
CREATE INDEX IF NOT EXISTS idx_ad_accounts_token_expires ON public.ad_accounts(token_expires_at) WHERE token_expires_at IS NOT NULL;

-- OAuth state CSRF tokens
CREATE TABLE IF NOT EXISTS public.fb_oauth_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes')
);

CREATE INDEX IF NOT EXISTS idx_fb_oauth_states_state ON public.fb_oauth_states(state);

ALTER TABLE public.fb_oauth_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own oauth state"
  ON public.fb_oauth_states FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own oauth state"
  ON public.fb_oauth_states FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages oauth states"
  ON public.fb_oauth_states FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- In-app notifications table (for token expiry alerts and other events)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages notifications"
  ON public.notifications FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');