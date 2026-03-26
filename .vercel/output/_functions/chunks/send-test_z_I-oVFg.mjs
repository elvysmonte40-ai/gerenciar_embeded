import { createClient } from '@supabase/supabase-js';
import { sendCampaignEmail } from './resend_2Fz3utdJ.mjs';

const supabaseAdmin = createClient(
  "https://qedxpygkkwybrvxludjx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZHhweWdra3d5YnJ2eGx1ZGp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAzODQ0OSwiZXhwIjoyMDg1NjE0NDQ5fQ.xefVpPNcdVpBADfTbx2VK5vvw6M5dMMs_FpkEL0L09k"
);
const POST = async ({ request }) => {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token inválido" }), { status: 401 });
    }
    const body = await request.json();
    const { to, subject, htmlContent, variables } = body;
    if (!to || !subject || !htmlContent) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios: to, subject, htmlContent" }), { status: 400 });
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
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
