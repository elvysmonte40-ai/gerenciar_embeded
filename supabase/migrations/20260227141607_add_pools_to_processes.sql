-- Migration to add pools to processes table
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS pools JSONB DEFAULT '[]'::jsonb;
