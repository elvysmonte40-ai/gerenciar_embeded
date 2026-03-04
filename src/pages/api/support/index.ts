import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

// Helper for Resend. Assuming RESEND_API_KEY is available in the environment
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { type, message, route, userAgent } = body;

        if (!message) {
            return new Response(JSON.stringify({ error: 'Mensagem é obrigatória' }), { status: 400 });
        }

        // Get user session
        const authHeader = request.headers.get('Authorization');
        let userEmail = 'Usuário Anônimo';
        let orgId = '';

        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            const { data: { user } } = await supabase.auth.getUser(token);
            if (user) {
                userEmail = user.email || 'Desconhecido';

                const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
                if (profile) orgId = profile.organization_id;
            }
        }

        // If Resend is configured, send the email
        if (RESEND_API_KEY) {
            const emailHtml = `
                <h2>Novo Ticket de Suporte (${type})</h2>
                <p><strong>Usuário:</strong> ${userEmail}</p>
                <p><strong>Organização:</strong> ${orgId}</p>
                <p><strong>Rota/Página:</strong> ${route}</p>
                <p><strong>Browser Info:</strong> ${userAgent}</p>
                <hr/>
                <h3>Mensagem:</h3>
                <p>${message.replace(/\n/g, '<br/>')}</p>
            `;

            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'Gerenciar Suporte <suporte@gerenciar.com.br>', // Change this to a verified domain
                    to: ['devs@atingravity.com'], // Change this to your support mail
                    subject: `[${type.toUpperCase()}] Novo Chamado Gerenciar`,
                    html: emailHtml
                })
            });
        }

        // We could also log this to a `support_tickets` table if it existed...
        // For now, we just reply with success.

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (e: any) {
        console.error("Support Route Error:", e);
        return new Response(JSON.stringify({ error: e.message || 'Erro interno interno.' }), { status: 500 });
    }
};
