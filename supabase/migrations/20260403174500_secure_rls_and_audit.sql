-- Secure organization_settings by removing direct access to secrets via client
DROP POLICY IF EXISTS "Admins can view their organization settings" ON public.organization_settings;
DROP POLICY IF EXISTS "Admins can insert their organization settings" ON public.organization_settings;
DROP POLICY IF EXISTS "Admins can update their organization settings" ON public.organization_settings;

-- Triggers for profiles and settings to enable automatic audit logs
-- Ensure audit_trigger_func already exists from 20260303223000_audit_logs.sql
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trig_audit_profiles') THEN 
    CREATE TRIGGER trig_audit_profiles AFTER INSERT OR UPDATE OR DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func(); 
  END IF; 
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trig_audit_organization_settings') THEN 
    CREATE TRIGGER trig_audit_organization_settings AFTER INSERT OR UPDATE OR DELETE ON public.organization_settings FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func(); 
  END IF;
  
  -- Add trigger for system_messages too (AUDIT)
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trig_audit_system_messages') THEN 
    CREATE TRIGGER trig_audit_system_messages AFTER INSERT OR UPDATE OR DELETE ON public.system_messages FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func(); 
  END IF;
END $$;
