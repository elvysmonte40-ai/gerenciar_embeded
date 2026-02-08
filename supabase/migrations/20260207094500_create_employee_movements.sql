-- 1. Add foreign keys to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS sector_id uuid REFERENCES public.sectors(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS job_title_id uuid REFERENCES public.job_titles(id) ON DELETE SET NULL;

-- 2. Create employee_movements table
CREATE TABLE IF NOT EXISTS public.employee_movements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type text NOT NULL, -- 'Promocao', 'Transferencia', 'Investidura', 'Alteracao de Cargo', 'Alteracao de Setor', 'Alteracao de Departamento'
    
    old_department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
    new_department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
    
    old_sector_id uuid REFERENCES public.sectors(id) ON DELETE SET NULL,
    new_sector_id uuid REFERENCES public.sectors(id) ON DELETE SET NULL,
    
    old_job_title_id uuid REFERENCES public.job_titles(id) ON DELETE SET NULL,
    new_job_title_id uuid REFERENCES public.job_titles(id) ON DELETE SET NULL,
    
    justification text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid REFERENCES public.profiles(id)
);

-- 3. Enable RLS on employee_movements
ALTER TABLE public.employee_movements ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Read: Users can view movements in their organization (or maybe only admins/managers? Sticking to org-wide for now based on context)
CREATE POLICY "Users can view movements in their organization"
ON public.employee_movements FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM public.profiles
        WHERE id = auth.uid()
    )
);

-- Write: System/Triggers will write, but Admins might need to manually correct/insert if needed?
-- For now, let's allow Admins to manage just in case.
CREATE POLICY "Admins can manage movements"
ON public.employee_movements FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    )
);

-- 5. Create Trigger Function to track changes
CREATE OR REPLACE FUNCTION track_employee_movements()
RETURNS TRIGGER AS $$
DECLARE
    movement_type text;
    current_user_id uuid;
BEGIN
    -- Only track changes if department, sector, or job_title changes
    IF (OLD.department_id IS DISTINCT FROM NEW.department_id) OR
       (OLD.sector_id IS DISTINCT FROM NEW.sector_id) OR
       (OLD.job_title_id IS DISTINCT FROM NEW.job_title_id) THEN
       
       -- Determine movement type (simplified logic, can be refined)
       IF (OLD.job_title_id IS DISTINCT FROM NEW.job_title_id) THEN
           movement_type := 'Alteracao de Cargo';
       ELSIF (OLD.department_id IS DISTINCT FROM NEW.department_id) THEN
           movement_type := 'Transferencia'; -- Department change often implies transfer
       ELSIF (OLD.sector_id IS DISTINCT FROM NEW.sector_id) THEN
           movement_type := 'Alteracao de Setor';
       ELSE
           movement_type := 'Alteracao Cadastral';
       END IF;

       -- Get current user ID (who performed the update)
       -- Note: auth.uid() might be null if updated via direct SQL/admin console, handle gracefully
       current_user_id := auth.uid();

       INSERT INTO public.employee_movements (
           organization_id,
           profile_id,
           type,
           old_department_id, new_department_id,
           old_sector_id, new_sector_id,
           old_job_title_id, new_job_title_id,
           created_by
       ) VALUES (
           NEW.organization_id,
           NEW.id,
           movement_type,
           OLD.department_id, NEW.department_id,
           OLD.sector_id, NEW.sector_id,
           OLD.job_title_id, NEW.job_title_id,
           current_user_id
       );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Attach Trigger to profiles table
DROP TRIGGER IF EXISTS on_profile_change_track_movement ON public.profiles;
CREATE TRIGGER on_profile_change_track_movement
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE PROCEDURE track_employee_movements();
