
CREATE TYPE public.upload_session_status AS ENUM ('draft', 'uploading', 'ready', 'launching', 'completed', 'failed');

CREATE TABLE public.upload_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.ad_accounts(id) ON DELETE SET NULL,
  campaign_name TEXT,
  files JSONB NOT NULL DEFAULT '[]'::jsonb,
  adset_assignments JSONB NOT NULL DEFAULT '{}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  status public.upload_session_status NOT NULL DEFAULT 'draft',
  error_log JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_upload_sessions_user ON public.upload_sessions(user_id);
CREATE INDEX idx_upload_sessions_started ON public.upload_sessions(started_at DESC);

ALTER TABLE public.upload_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own upload sessions"
  ON public.upload_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and managers can view all upload sessions"
  ON public.upload_sessions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Users can insert their own upload sessions"
  ON public.upload_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own upload sessions"
  ON public.upload_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upload sessions"
  ON public.upload_sessions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_upload_sessions_updated_at
  BEFORE UPDATE ON public.upload_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Creatives storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('creatives', 'creatives', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can read their own creatives"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'creatives' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own creatives"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'creatives' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own creatives"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'creatives' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own creatives"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'creatives' AND auth.uid()::text = (storage.foldername(name))[1]);
