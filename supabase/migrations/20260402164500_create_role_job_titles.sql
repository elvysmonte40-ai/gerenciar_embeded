-- =====================================================
-- Migration: Role ↔ Job Titles junction + auto-sync
-- =====================================================

-- 1. Add color column to organization_roles
ALTER TABLE public.organization_roles
ADD COLUMN IF NOT EXISTS color text DEFAULT '#3B82F6';

-- 2. Junction table: organization_role ↔ job_title (N:N, but 1 job_title → 1 role enforced)
CREATE TABLE IF NOT EXISTS public.organization_role_job_titles (
  organization_role_id UUID NOT NULL REFERENCES public.organization_roles(id) ON DELETE CASCADE,
  job_title_id UUID NOT NULL REFERENCES public.job_titles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (organization_role_id, job_title_id)
);

-- Enforce: one job_title can only belong to one role
ALTER TABLE public.organization_role_job_titles
ADD CONSTRAINT unique_job_title_per_role UNIQUE (job_title_id);

-- 3. RLS for junction table
ALTER TABLE public.organization_role_job_titles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view role job titles in their org"
ON public.organization_role_job_titles FOR SELECT
USING (
  organization_role_id IN (
    SELECT id FROM public.organization_roles
    WHERE organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Admins can manage role job titles"
ON public.organization_role_job_titles FOR ALL
USING (
  organization_role_id IN (
    SELECT id FROM public.organization_roles
    WHERE organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
);

-- 4. Trigger: When a user's job_title_id changes, auto-assign the associated profile
CREATE OR REPLACE FUNCTION public.sync_profile_role_from_job_title()
RETURNS TRIGGER AS $$
DECLARE
  _role_id UUID;
BEGIN
  IF NEW.job_title_id IS DISTINCT FROM OLD.job_title_id THEN
    IF NEW.job_title_id IS NOT NULL THEN
      SELECT orjt.organization_role_id INTO _role_id
      FROM public.organization_role_job_titles orjt
      WHERE orjt.job_title_id = NEW.job_title_id
      LIMIT 1;

      IF FOUND THEN
        NEW.organization_role_id := _role_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_role_on_job_title_change ON public.profiles;
CREATE TRIGGER trg_sync_role_on_job_title_change
BEFORE UPDATE OF job_title_id ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_role_from_job_title();

-- 5. Trigger: When a job_title is linked to a role, update all users with that job_title
CREATE OR REPLACE FUNCTION public.sync_users_on_role_job_title_link()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET organization_role_id = NEW.organization_role_id
  WHERE job_title_id = NEW.job_title_id
    AND (organization_role_id IS DISTINCT FROM NEW.organization_role_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_users_on_role_job_link ON public.organization_role_job_titles;
CREATE TRIGGER trg_sync_users_on_role_job_link
AFTER INSERT ON public.organization_role_job_titles
FOR EACH ROW
EXECUTE FUNCTION public.sync_users_on_role_job_title_link();

-- 6. Trigger: When a job_title is UNLINKED from a role, clear the role from those users
CREATE OR REPLACE FUNCTION public.sync_users_on_role_job_title_unlink()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET organization_role_id = NULL
  WHERE job_title_id = OLD.job_title_id
    AND organization_role_id = OLD.organization_role_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_users_on_role_job_unlink ON public.organization_role_job_titles;
CREATE TRIGGER trg_sync_users_on_role_job_unlink
AFTER DELETE ON public.organization_role_job_titles
FOR EACH ROW
EXECUTE FUNCTION public.sync_users_on_role_job_title_unlink();

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload config';
