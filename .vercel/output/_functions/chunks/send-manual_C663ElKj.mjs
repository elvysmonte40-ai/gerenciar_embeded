import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from './resend_2Fz3utdJ.mjs';

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
    const { data: { user: adminUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !adminUser) {
      return new Response(JSON.stringify({ error: "Token inválido" }), { status: 401 });
    }
    const orgId = adminUser.user_metadata?.organization_id;
    if (!orgId) {
      return new Response(JSON.stringify({ error: "Organização não encontrada" }), { status: 400 });
    }
    const body = await request.json();
    const { type, userId } = body;
    if (!type || !userId) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios: type, userId" }), { status: 400 });
    }
    if (!["welcome", "password_reset"].includes(type)) {
      return new Response(JSON.stringify({ error: "Tipo inválido. Use: welcome ou password_reset" }), { status: 400 });
    }
    const { data: targetUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !targetUser?.user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), { status: 404 });
    }
    const targetEmail = targetUser.user.email;
    if (!targetEmail) {
      return new Response(JSON.stringify({ error: "Usuário sem email cadastrado" }), { status: 400 });
    }
    const { data: profile } = await supabaseAdmin.from("profiles").select("full_name").eq("id", userId).single();
    const fullName = profile?.full_name || "Usuário";
    if (type === "welcome") {
      const result = await sendWelcomeEmail(targetEmail, fullName, orgId);
      if (!result.success) {
        return new Response(JSON.stringify({ error: "Falha ao enviar email de boas-vindas" }), { status: 500 });
      }
      return new Response(JSON.stringify({ success: true, message: `Email de boas-vindas enviado para ${targetEmail}` }), { status: 200 });
    }
    if (type === "password_reset") {
      const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: targetEmail,
        options: {
          redirectTo: `${new URL(request.url).origin}/update-password`
        }
      });
      if (resetError) {
        return new Response(JSON.stringify({ error: `Falha ao gerar link de reset: ${resetError.message}` }), { status: 500 });
      }
      const { sendPasswordResetEmail } = await import('./resend_2Fz3utdJ.mjs');
      const resetUrl = resetData?.properties?.action_link || "";
      const result = await sendPasswordResetEmail(targetEmail, resetUrl, orgId);
      if (!result.success) {
        return new Response(JSON.stringify({ error: "Falha ao enviar email de redefinição via Resend" }), { status: 500 });
      }
      return new Response(JSON.stringify({ success: true, message: `Email de redefinição enviado para ${targetEmail}` }), { status: 200 });
    }
    return new Response(JSON.stringify({ error: "Tipo não suportado" }), { status: 400 });
  } catch (err) {
    console.error("Erro no envio manual:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
