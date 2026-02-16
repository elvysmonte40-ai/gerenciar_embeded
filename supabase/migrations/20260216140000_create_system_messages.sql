-- Create system_messages table
CREATE TABLE IF NOT EXISTS public.system_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Rich HTML
    type TEXT NOT NULL DEFAULT 'popup' CHECK (type IN ('popup', 'banner')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'profile', 'user')),
    target_ids JSONB DEFAULT '[]'::jsonb, -- Array of UUIDs
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES public.organizations(id)
);

-- Enable RLS
ALTER TABLE public.system_messages ENABLE ROW LEVEL SECURITY;

-- Create system_message_reads table
CREATE TABLE IF NOT EXISTS public.system_message_reads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES public.system_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.system_message_reads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_messages

-- Admins can do everything
CREATE POLICY "Admins can manage system_messages" ON public.system_messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.organization_id = system_messages.organization_id
        )
    );

-- Users can view active messages targeting them
CREATE POLICY "Users can view relevant system_messages" ON public.system_messages
    FOR SELECT
    USING (
        status = 'active'
        AND (start_date IS NULL OR start_date <= now())
        AND (end_date IS NULL OR end_date >= now())
        AND (
            target_audience = 'all'
            OR (target_audience = 'profile' AND (
                SELECT role FROM public.profiles WHERE id = auth.uid()
            )::text = ANY (SELECT jsonb_array_elements_text(target_ids)))
            OR (target_audience = 'user' AND (
                auth.uid()::text = ANY (SELECT jsonb_array_elements_text(target_ids))
            ))
        )
         AND (
            organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
        )
    );


-- RLS Policies for system_message_reads

-- Users can insert their own reads
CREATE POLICY "Users can mark messages as read" ON public.system_message_reads
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can view their own reads
CREATE POLICY "Users can view their own reads" ON public.system_message_reads
    FOR SELECT
    USING (auth.uid() = user_id);
    
-- Admins can view all reads (analytics)
CREATE POLICY "Admins can view all reads" ON public.system_message_reads
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
             AND profiles.organization_id = (
                SELECT organization_id FROM public.system_messages WHERE id = system_message_reads.message_id
            )
        )
    );


-- Storage Bucket for Message Attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Authenticated users can upload message attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'message-attachments');

CREATE POLICY "Public can view message attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'message-attachments');
