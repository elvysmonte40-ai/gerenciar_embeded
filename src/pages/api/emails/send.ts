import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { sendCampaignEmail } from '../../../lib/resend';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { campaignId, to, variables } = body;

        if (!campaignId || !to) {
            throw new Error("campaignId e to (destinatário) são obrigatórios.");
        }

        // Buscar a campanha no banco para pegar o HTML e Nome (assunto)
        const { data: campaign, error } = await supabase
            .from('email_campaigns')
            .select('*')
            .eq('id', campaignId)
            .single();

        if (error || !campaign) {
            throw new Error("Campanha não encontrada ou erro no banco: " + error?.message);
        }

        if (campaign.status !== 'active') {
            throw new Error("A campanha não está ativa para envios.");
        }

        // Disparar via Resend
        const result = await sendCampaignEmail({
            to,
            subject: campaign.name,
            htmlContent: campaign.html_content,
            variables
        });

        if (!result.success) {
            throw result.error;
        }

        return new Response(JSON.stringify({ success: true, message: 'E-mail enviado com sucesso.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message || error }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
