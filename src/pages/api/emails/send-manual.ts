import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '../../../lib/resend';
import { welcomeEmailTemplate, passwordResetEmailTemplate } from '../../../lib/email-templates';

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
        const { type, userId } = body;

        if (!type || !userId) {
            return new Response(JSON.stringify({ error: 'Campos obrigatórios: type, userId' }), { status: 400 });
        }

        if (!['welcome', 'password_reset'].includes(type)) {
            return new Response(JSON.stringify({ error: 'Tipo inválido. Use: welcome ou password_reset' }), { status: 400 });
        }

        // Get target user info
        const { data: targetUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (userError || !targetUser?.user) {
            return new Response(JSON.stringify({ error: 'Usuário não encontrado' }), { status: 404 });
        }

        const targetEmail = targetUser.user.email;
        if (!targetEmail) {
            return new Response(JSON.stringify({ error: 'Usuário sem email cadastrado' }), { status: 400 });
        }

        // Get user profile for full name
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('full_name')
            .eq('id', userId)
            .single();

        const fullName = profile?.full_name || 'Usuário';

        if (type === 'welcome') {
            // Para boas-vindas, geramos um link de recuperação para o usuário configurar a senha
            const baseUrl = import.meta.env.PUBLIC_SITE_URL || new URL(request.url).origin;
            const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
                type: 'recovery',
                email: targetEmail,
                options: {
                    redirectTo: `${baseUrl}/update-password`,
                },
            });

            if (resetError) {
                console.warn('Falha ao gerar link de setup, enviando boas-vindas simples:', resetError.message);
            }

            const resetUrl = resetData?.properties?.action_link || '';
            
            // Importação dinâmica para evitar loops e usar a nova função que vamos criar
            const { sendWelcomeWithPasswordReset } = await import('../../../lib/resend');
            
            const result = await sendWelcomeWithPasswordReset(targetEmail, fullName, resetUrl, orgId);
            
            if (!result.success) {
                return new Response(JSON.stringify({ error: 'Falha ao enviar email de boas-vindas' }), { status: 500 });
            }
            
            // Ativa a conta
            await supabaseAdmin
                .from('profiles')
                .update({ is_activated: true })
                .eq('id', userId);

            return new Response(JSON.stringify({ success: true, message: `Email de boas-vindas com setup enviado para ${targetEmail}` }), { status: 200 });
        }

        if (type === 'password_reset') {
            // Use Supabase Auth to generate reset link
            const baseUrl = import.meta.env.PUBLIC_SITE_URL || new URL(request.url).origin;
            const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
                type: 'recovery',
                email: targetEmail,
                options: {
                    redirectTo: `${baseUrl}/update-password`,
                },
            });

            if (resetError) {
                return new Response(JSON.stringify({ error: `Falha ao gerar link de reset: ${resetError.message}` }), { status: 500 });
            }

            // Send email via Resend with custom template
            const { sendPasswordResetEmail } = await import('../../../lib/resend');
            
            const resetUrl = resetData?.properties?.action_link || '';
            const result = await sendPasswordResetEmail(targetEmail, resetUrl, orgId);

            if (!result.success) {
                return new Response(JSON.stringify({ error: 'Falha ao enviar email de redefinição via Resend' }), { status: 500 });
            }

            return new Response(JSON.stringify({ success: true, message: `Email de redefinição enviado para ${targetEmail}` }), { status: 200 });
        }

        return new Response(JSON.stringify({ error: 'Tipo não suportado' }), { status: 400 });
    } catch (err: any) {
        console.error('Erro no envio manual:', err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
