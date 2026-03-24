import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { sendCampaignEmail } from '../../../lib/resend';

const supabaseAdmin = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

export const POST: APIRoute = async ({ request }) => {
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

        const body = await request.json();
        const { to, subject, htmlContent, variables } = body;

        if (!to || !subject || !htmlContent) {
            return new Response(JSON.stringify({ error: 'Campos obrigatórios: to, subject, htmlContent' }), { status: 400 });
        }

        const result = await sendCampaignEmail({
            to,
            subject,
            htmlContent,
            variables
        });

        if (!result.success) {
            throw result.error;
        }

        return new Response(JSON.stringify({ success: true, message: `Email enviado para ${to}` }), { status: 200 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
