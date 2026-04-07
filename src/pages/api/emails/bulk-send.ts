import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { sendBatchEmails, processHtmlVariables, type BatchEmailItem } from '../../../lib/resend';

const supabaseAdmin = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

export const POST: APIRoute = async ({ request }) => {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) throw new Error('Não autorizado');

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) throw new Error('Sessão inválida');

        // Verificar se é admin usando service role para ignorar RLS na verificação de permissão
        const { data: profile } = await supabaseAdmin.from('profiles').select('role, is_super_admin, organization_id').eq('id', user.id).single();
        
        if (!profile || (profile.role !== 'admin' && !profile.is_super_admin)) {
            throw new Error('Acesso negado: Apenas administradores podem enviar emails em massa.');
        }

        const body = await request.json();
        const { subject, htmlContent, filters, templateType } = body;

        if (!subject || !htmlContent || !filters) {
            throw new Error("Campos obrigatórios ausentes.");
        }

        // 1. Resolver destinatários com mais dados
        let query = supabaseAdmin.from('profiles')
            .select('email, full_name, id')
            .eq('status', 'active')
            .not('email', 'is', null);
        
        const { type, ids, onlyCorporateDomains, activationStatus } = filters;
        if (type === 'roles') query = query.in('organization_role_id', ids);
        else if (type === 'departments') query = query.in('department_id', ids);
        else if (type === 'profiles') query = query.in('job_title_id', ids);
        else if (type === 'users') query = query.in('id', ids);

        if (activationStatus === 'activated') query = query.not('last_login_at', 'is', null);
        else if (activationStatus === 'not_activated') query = query.is('last_login_at', null);

        if (onlyCorporateDomains) {
            const { data: orgDomains } = await supabaseAdmin
                .from('organization_domains')
                .select('domain')
                .eq('organization_id', profile.organization_id);

            const domains = orgDomains?.map(d => d.domain.toLowerCase()) || [];

            if (domains.length === 0) {
                throw new Error("Nenhum domínio corporativo cadastrado para esta organização.");
            }

            const orQuery = domains.map(d => `email.ilike.%@${d}`).join(',');
            query = query.or(orQuery);
        }

        const { data: profiles, error: queryError } = await query;
        if (queryError) throw queryError;

        if (!profiles || profiles.length === 0) {
            throw new Error("Nenhum destinatário encontrado com os filtros selecionados.");
        }

        // 2. Preparar emails individuais (personalizados)
        const emailItems: BatchEmailItem[] = [];
        const recipientIds: string[] = [];
        
        for (const p of profiles) {
            if (!p.email) continue;
            
            recipientIds.push(p.id);
            let finalHtml = htmlContent;
            const variables: Record<string, string> = {
                nome: p.full_name?.split(' ')[0] || 'Usuário',
                nome_completo: p.full_name || 'Usuário',
            };

            // Se for reset de senha ou boas-vindas unificado, precisamos gerar o link único para este usuário
            if (templateType === 'password_reset' || templateType === 'welcome') {
                const baseUrl = import.meta.env.PUBLIC_SITE_URL || new URL(request.url).origin;
                const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
                    type: templateType === 'welcome' ? 'invite' : 'recovery',
                    email: p.email,
                    options: {
                        redirectTo: `${baseUrl}/update-password`
                    }
                });
                
                if (linkError) {
                    console.error(`Erro ao gerar link de reset para ${p.email}:`, linkError.message);
                    continue; 
                }
                
                variables['reset_url'] = linkData.properties.action_link;
            }

            // Processar variáveis no HTML
            finalHtml = processHtmlVariables(finalHtml, variables);

            emailItems.push({
                to: p.email,
                subject: subject,
                html: finalHtml,
                emailType: templateType || 'campaign',
                organizationId: profile.organization_id
            });
        }

        if (emailItems.length === 0) {
            throw new Error("Falha ao preparar emails para os destinatários selecionados.");
        }

        // 3. Enviar via Resend Batch (que agora lida com os chunks de 100 internamente)
        const results = await sendBatchEmails(emailItems);
        
        const successCount = results.filter(r => r.success).length;

        if (successCount === 0 && emailItems.length > 0) {
            throw new Error("Falha total no envio em massa. Verifique os logs.");
        }

        // 4. ATIVAÇÃO: Marcar todos os destinatários como "autorizados a logar" (is_activated = true)
        // Isso permite que eles acessem o sistema após receberem o e-mail
        if (recipientIds.length > 0) {
            await supabaseAdmin
                .from('profiles')
                .update({ is_activated: true })
                .in('id', recipientIds);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Processamento concluído. ${emailItems.length} destinatários processados individualmente.`,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Erro no Bulk Send API:', error);
        return new Response(JSON.stringify({ success: false, error: error.message || error }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
};

