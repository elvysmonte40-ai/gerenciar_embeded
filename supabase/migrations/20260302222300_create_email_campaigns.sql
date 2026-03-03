-- 20260302222300_create_email_campaigns.sql

-- Criar a tabela para as campanhas de email dinâmicas
CREATE TABLE IF NOT EXISTS public.email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    trigger_event TEXT NOT NULL, -- Ex: 'manual', 'welcome_email', 'reset_password'
    html_content TEXT,           -- Template em HTML (com vars ex: {{nome}})
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- Permissões de Leitura para membros da organização ou admins (ajustando conforme regras base do projeto)
CREATE POLICY "Admins podem ver tudo" ON public.email_campaigns
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = auth.uid() 
            AND public.profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins podem inserir" ON public.email_campaigns
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = auth.uid() 
            AND public.profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins podem atualizar" ON public.email_campaigns
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = auth.uid() 
            AND public.profiles.role = 'admin'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = auth.uid() 
            AND public.profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins podem deletar" ON public.email_campaigns
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = auth.uid() 
            AND public.profiles.role = 'admin'
        )
    );

-- Trigger de Updated At (usando função padrão do Supabase se existir ou criando aqui de forma simples)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_email_campaigns_updated_at') THEN
        CREATE TRIGGER set_email_campaigns_updated_at
            BEFORE UPDATE ON public.email_campaigns
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
EXCEPTION
    WHEN undefined_function THEN
        -- Handle caso handle_updated_at não exista globalmente no schema ainda
        NULL;
END
$$;
