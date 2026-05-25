-- Per-user ad account access list (used by Assistants/Managers to scope visibility)
CREATE TABLE public.user_account_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES public.ad_accounts(id) ON DELETE CASCADE,
  granted_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, account_id)
);

ALTER TABLE public.user_account_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own account access"
  ON public.user_account_access FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and managers can view all account access"
  ON public.user_account_access FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins and managers can insert account access"
  ON public.user_account_access FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins and managers can delete account access"
  ON public.user_account_access FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Team invites (pending users)
CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'revoked');

CREATE TABLE public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  role public.app_role NOT NULL,
  account_ids UUID[] NOT NULL DEFAULT '{}',
  invited_by UUID NOT NULL,
  status public.invite_status NOT NULL DEFAULT 'pending',
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX team_invites_email_pending_unique
  ON public.team_invites (lower(email)) WHERE status = 'pending';

ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers can view invites"
  ON public.team_invites FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins and managers can insert invites"
  ON public.team_invites FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
    AND auth.uid() = invited_by
  );

CREATE POLICY "Admins and managers can update invites"
  ON public.team_invites FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete invites"
  ON public.team_invites FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins/managers to view all profiles (already true) and manage user_roles
CREATE POLICY "Managers can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can insert roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can update roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'manager'));
