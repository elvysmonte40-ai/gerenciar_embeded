import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

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
        const { data: { user: adminUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !adminUser) {
            return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401 });
        }

        const orgId = adminUser.user_metadata?.organization_id;
        if (!orgId) {
            return new Response(JSON.stringify({ error: 'Organização não encontrada' }), { status: 400 });
        }

        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Campo obrigatório: userId' }), { status: 400 });
        }

        // Get target user info for email
        const { data: targetUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (userError || !targetUser?.user) {
            return new Response(JSON.stringify({ error: 'Usuário não encontrado' }), { status: 404 });
        }

        const targetEmail = targetUser.user.email;
        if (!targetEmail) {
            return new Response(JSON.stringify({ error: 'Usuário sem e-mail cadastrado' }), { status: 400 });
        }

        // Generate invitation link (same as welcome email)
        const baseUrl = import.meta.env.PUBLIC_SITE_URL || new URL(request.url).origin;
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email: targetEmail,
            options: {
                redirectTo: `${baseUrl}/update-password`,
            },
        });

        if (inviteError) {
            return new Response(JSON.stringify({ error: `Falha ao gerar link: ${inviteError.message}` }), { status: 500 });
        }

        const actionLink = inviteData?.properties?.action_link;
        const confirmationUrl = actionLink 
            ? `${baseUrl}/auth/confirm?token_url=${encodeURIComponent(actionLink)}`
            : '';


        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Link de ativação gerado.',
            setupLink: confirmationUrl,
            email: targetEmail
        }), { status: 200 });


    } catch (err: any) {
        console.error('Erro na ativação manual:', err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
