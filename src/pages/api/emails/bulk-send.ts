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
        if (!authHeader) throw new Error('Não autorizado');

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) throw new Error('Sessão inválida');

        // Verificar se é admin usando service role para ignorar RLS na verificação de permissão
        const { data: profile } = await supabaseAdmin.from('profiles').select('role, is_super_admin').eq('id', user.id).single();
        
        if (!profile || (profile.role !== 'admin' && !profile.is_super_admin)) {
            throw new Error('Acesso negado: Apenas administradores podem enviar emails em massa.');
        }

        const body = await request.json();
        const { subject, htmlContent, filters } = body;

        if (!subject || !htmlContent || !filters) {
            throw new Error("Campos obrigatórios ausentes.");
        }

        // 1. Resolver destinatários
        let query = supabaseAdmin.from('profiles').select('email').eq('status', 'active').not('email', 'is', null);
        
        const { type, ids } = filters;
        if (type === 'roles') query = query.in('organization_role_id', ids);
        else if (type === 'departments') query = query.in('department_id', ids);
        else if (type === 'profiles') query = query.in('job_title_id', ids);
        else if (type === 'users') query = query.in('id', ids);

        const { data: profiles, error: queryError } = await query;
        if (queryError) throw queryError;

        const emails = [...new Set((profiles || []).map((p: any) => p.email).filter(Boolean) as string[])];
        
        if (emails.length === 0) {
            throw new Error("Nenhum destinatário encontrado com os filtros selecionados.");
        }

        // 2. Enviar emails
        // Nota: Resend suporta até 50 destinatários por chamada no campo 'to' de forma individualizada 
        // ou você pode enviar um por um. Para evitar timeouts e garantir logs individuais, 
        // vamos enviar em lotes de 50 ou um por um dependendo da necessidade de variáveis.
        // Como o usuário quer um comunicado geral, podemos usar o array no 'to'.

        const CHUNK_SIZE = 50; 
        const results = [];

        for (let i = 0; i < emails.length; i += CHUNK_SIZE) {
            const chunk = emails.slice(i, i + CHUNK_SIZE);
            const result = await sendCampaignEmail({
                to: chunk,
                subject,
                htmlContent,
            });
            results.push(result);
        }

        const failedCount = results.filter(r => !r.success).length;

        if (failedCount === results.length) {
            throw new Error("Falha total no envio. Verifique as configurações do provedor.");
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Processamento concluído. ${emails.length} destinatários processados em ${results.length} lotes.`,
            failedChunks: failedCount
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Erro no Bulk Send:', error);
        return new Response(JSON.stringify({ success: false, error: error.message || error }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
};
