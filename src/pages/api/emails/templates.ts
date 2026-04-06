import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabase-admin';
import { welcomeEmailTemplate, passwordResetEmailTemplate } from '../../../lib/email-templates';

const DEFAULT_TEMPLATES = {
    welcome: {
        subject: 'Bem-vindo(a) ao MIS! 🎉',
        html_content: welcomeEmailTemplate('{{nome}}'),
    },
    password_reset: {
        subject: 'Redefinir sua senha — MIS',
        html_content: passwordResetEmailTemplate('{{reset_url}}'),
    },
};

export const GET: APIRoute = async ({ request }) => {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401 });
        }

        const orgId = user.user_metadata?.organization_id;
        if (!orgId) {
            return new Response(JSON.stringify({ error: 'Organização não encontrada' }), { status: 400 });
        }

        const { data: customTemplates } = await supabaseAdmin
            .from('email_templates')
            .select('*')
            .eq('organization_id', orgId);

        const templates = ['welcome', 'password_reset'].map(type => {
            const custom = customTemplates?.find(t => t.template_type === type);
            const defaults = DEFAULT_TEMPLATES[type as keyof typeof DEFAULT_TEMPLATES];

            return {
                template_type: type,
                subject: custom?.subject || defaults.subject,
                html_content: custom?.html_content || defaults.html_content,
                is_customized: !!custom,
                updated_at: custom?.updated_at || null,
                label: type === 'welcome' ? 'Boas-vindas' : 'Redefinição de Senha',
                description: type === 'welcome'
                    ? 'Enviado quando um novo usuário é cadastrado no sistema.'
                    : 'Enviado quando um usuário solicita a redefinição de senha.',
            };
        });

        return new Response(JSON.stringify(templates), { status: 200 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};

export const PUT: APIRoute = async ({ request }) => {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401 });
        }

        const orgId = user.user_metadata?.organization_id;
        if (!orgId) {
            return new Response(JSON.stringify({ error: 'Organização não encontrada' }), { status: 400 });
        }

        const body = await request.json();
        const { template_type, subject, html_content } = body;

        if (!template_type || !subject || !html_content) {
            return new Response(JSON.stringify({ error: 'Campos obrigatórios: template_type, subject, html_content' }), { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('email_templates')
            .upsert(
                {
                    organization_id: orgId,
                    template_type,
                    subject,
                    html_content,
                    updated_by: user.id,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'organization_id,template_type' }
            )
            .select()
            .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, data }), { status: 200 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};

export const DELETE: APIRoute = async ({ request }) => {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401 });
        }

        const orgId = user.user_metadata?.organization_id;
        const url = new URL(request.url);
        const templateType = url.searchParams.get('template_type');

        if (!templateType) {
            return new Response(JSON.stringify({ error: 'template_type é obrigatório' }), { status: 400 });
        }

        await supabaseAdmin
            .from('email_templates')
            .delete()
            .eq('organization_id', orgId)
            .eq('template_type', templateType);

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
