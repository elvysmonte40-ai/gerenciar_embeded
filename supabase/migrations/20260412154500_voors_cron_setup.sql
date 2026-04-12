-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create app_secrets table for storing secure configuration
CREATE TABLE IF NOT EXISTS public.app_secrets (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Only service_role can access (no policies = no client access)
ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;

-- Generate and store a secure CRON_SECRET
INSERT INTO public.app_secrets (key, value)
VALUES ('CRON_SECRET', 'voors-cron-' || encode(gen_random_bytes(24), 'hex'))
ON CONFLICT (key) DO NOTHING;

-- Schedule nightly Voors sync at 3:00 AM BRT (06:00 UTC)
-- Uses pg_net to make HTTP POST to the sync endpoint with the cron secret
SELECT cron.schedule(
    'voors-nightly-sync',
    '0 6 * * *',
    $$
    SELECT net.http_post(
        url := 'https://mis.online.net.br/api/voors/sync',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-cron-secret', (SELECT value FROM public.app_secrets WHERE key = 'CRON_SECRET')
        ),
        body := '{}'::jsonb
    );
    $$
);
