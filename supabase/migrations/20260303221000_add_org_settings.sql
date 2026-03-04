-- Add settings columns to organizations table
ALTER TABLE organizations
ADD COLUMN logo_url text,
ADD COLUMN accent_color text,
ADD COLUMN timezone text DEFAULT 'America/Sao_Paulo';

-- Create Storage Bucket for tenant assets (logos)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tenant_assets', 'tenant_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'tenant_assets');

CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'tenant_assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'tenant_assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'tenant_assets' AND auth.role() = 'authenticated');
