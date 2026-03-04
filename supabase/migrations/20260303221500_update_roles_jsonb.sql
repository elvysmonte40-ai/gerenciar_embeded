-- Add permissions JSONB column to organization_roles
ALTER TABLE organization_roles 
ADD COLUMN permissions JSONB DEFAULT '{}'::jsonb;
