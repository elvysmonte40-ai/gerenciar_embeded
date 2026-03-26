import { s as supabase } from './supabase_C4p1dVZL.mjs';
import { sendCampaignEmail } from './resend_2Fz3utdJ.mjs';

const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { campaignId, to, variables } = body;
    if (!campaignId || !to) {
      throw new Error("campaignId e to (destinatário) são obrigatórios.");
    }
    const { data: campaign, error } = await supabase.from("email_campaigns").select("*").eq("id", campaignId).single();
    if (error || !campaign) {
      throw new Error("Campanha não encontrada ou erro no banco: " + error?.message);
    }
    if (campaign.status !== "active") {
      throw new Error("A campanha não está ativa para envios.");
    }
    const result = await sendCampaignEmail({
      to,
      subject: campaign.name,
      htmlContent: campaign.html_content,
      variables
    });
    if (!result.success) {
      throw result.error;
    }
    return new Response(JSON.stringify({ success: true, message: "E-mail enviado com sucesso." }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message || error }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
