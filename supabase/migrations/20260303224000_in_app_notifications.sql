-- Notifications Table
CREATE TABLE IF NOT EXISTS public.in_app_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text,
    type text DEFAULT 'info', -- 'info', 'warning', 'alert', 'success'
    link text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_in_app_notif_user ON public.in_app_notifications(user_id);
CREATE INDEX idx_in_app_notif_unread ON public.in_app_notifications(user_id) WHERE is_read = false;

ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" 
ON public.in_app_notifications FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" 
ON public.in_app_notifications FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" 
ON public.in_app_notifications FOR INSERT 
WITH CHECK (true); -- Usually restricted to server roles or specific logic

-- Function to check red indicators (mock logic for closing month)
CREATE OR REPLACE FUNCTION public.check_red_indicators()
RETURNS void AS $$
DECLARE
    v_indicator RECORD;
    v_msg text;
BEGIN
    -- This function finds indicators below target in the current/previous month
    -- and inserts a notification for the organization admins or specific users.
    
    FOR v_indicator IN 
        SELECT 
            i.id, i.name, i.organization_id,
            iv.actual_value, iv.target_value,
            o.name as org_name
        FROM public.indicators i
        JOIN public.indicator_values iv ON i.id = iv.indicator_id
        JOIN public.organizations o ON i.organization_id = o.id
        WHERE iv.actual_value < iv.target_value
          AND extract(month from iv.reference_date) = extract(month from now())
    LOOP
        v_msg := 'O indicador ' || v_indicator.name || ' está abaixo da meta (' || 
                 v_indicator.actual_value || ' / ' || v_indicator.target_value || ').';
                 
        -- Insert warning for admins of that org
        INSERT INTO public.in_app_notifications (organization_id, user_id, title, message, type, link)
        SELECT 
            v_indicator.organization_id,
            p.id,
            'Alerta de Meta Não Atingida',
            v_msg,
            'warning',
            '/indicators/' || v_indicator.id
        FROM public.profiles p
        WHERE p.organization_id = v_indicator.organization_id
          AND p.role = 'admin';

    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
