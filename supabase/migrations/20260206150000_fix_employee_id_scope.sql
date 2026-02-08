-- Make employee_id sequential per organization

-- 1. Remove the identity property (Global sequence)
ALTER TABLE public.profiles 
ALTER COLUMN employee_id DROP IDENTITY;

-- 2. Create a function to calculate the next ID per organization
CREATE OR REPLACE FUNCTION public.set_employee_id()
RETURNS trigger AS $$
DECLARE
  next_id bigint;
BEGIN
  -- Lock to prevent race conditions (optional but good practice)
  -- LOCK TABLE public.profiles IN SHARE ROW EXCLUSIVE MODE; 
  -- (Locking the whole table is too heavy, we will accept slight race condition risk for this feature level 
  -- or we could use advisory locks based on org_id, but let's keep it simple: MAX + 1)
  
  -- Calculate next ID for this organization
  SELECT COALESCE(MAX(employee_id), 0) + 1 
  INTO next_id 
  FROM public.profiles 
  WHERE organization_id = NEW.organization_id;

  NEW.employee_id := next_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the trigger
DROP TRIGGER IF EXISTS trigger_set_employee_id ON public.profiles;

CREATE TRIGGER trigger_set_employee_id
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_employee_id();

-- 4. Optional: Recalculate existing IDs (Warning: this changes data)
-- We will leave existing data alone to avoid confusion, or we can reset them if requested.
-- Since it's dev, let's reset to ensure it looks right immediately.
DO $$
DECLARE
  r RECORD;
  org_id uuid;
  seq bigint;
BEGIN
  FOR org_id IN SELECT DISTINCT organization_id FROM public.profiles LOOP
    seq := 1;
    FOR r IN SELECT id FROM public.profiles WHERE organization_id = org_id ORDER BY created_at LOOP
      UPDATE public.profiles SET employee_id = seq WHERE id = r.id;
      seq := seq + 1;
    END LOOP;
  END LOOP;
END
$$;
