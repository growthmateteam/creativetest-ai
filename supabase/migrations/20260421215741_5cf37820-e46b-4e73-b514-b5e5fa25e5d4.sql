
CREATE TYPE public.launch_status AS ENUM ('pending', 'success', 'partial', 'failed');

CREATE TABLE public.launch_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launched_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  account_id UUID NOT NULL REFERENCES public.ad_accounts(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  campaign_id TEXT,
  adset_names TEXT[] NOT NULL DEFAULT '{}',
  ad_count INT NOT NULL DEFAULT 0,
  settings_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  status public.launch_status NOT NULL DEFAULT 'pending',
  error_log JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_launch_logs_created_at ON public.launch_logs(created_at DESC);
CREATE INDEX idx_launch_logs_launched_by ON public.launch_logs(launched_by);
CREATE INDEX idx_launch_logs_account_id ON public.launch_logs(account_id);

ALTER TABLE public.launch_logs ENABLE ROW LEVEL SECURITY;

-- Admins and managers see everything; assistants see only their own
CREATE POLICY "Admins and managers can view all launches"
  ON public.launch_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Users can view their own launches"
  ON public.launch_logs FOR SELECT TO authenticated
  USING (auth.uid() = launched_by);

-- Authenticated users can insert their own launch records
CREATE POLICY "Users can insert their own launches"
  ON public.launch_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = launched_by);
