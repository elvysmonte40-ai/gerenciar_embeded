import { s as supabase } from './supabase_C4p1dVZL.mjs';

const RESEND_API_KEY = "re_53n7Ft5v_4eYqpgkVdiYeBFnr6SwwqLDK";
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { type, message, route, userAgent } = body;
    if (!message) {
      return new Response(JSON.stringify({ error: "Mensagem é obrigatória" }), { status: 400 });
    }
    const authHeader = request.headers.get("Authorization");
    let userEmail = "Usuário Anônimo";
    let orgId = "";
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userEmail = user.email || "Desconhecido";
        const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single();
        if (profile) orgId = profile.organization_id;
      }
    }
    if (RESEND_API_KEY) {
      const emailHtml = `
                <h2>Novo Ticket de Suporte (${type})</h2>
                <p><strong>Usuário:</strong> ${userEmail}</p>
                <p><strong>Organização:</strong> ${orgId}</p>
                <p><strong>Rota/Página:</strong> ${route}</p>
                <p><strong>Browser Info:</strong> ${userAgent}</p>
                <hr/>
                <h3>Mensagem:</h3>
                <p>${message.replace(/\n/g, "<br/>")}</p>
            `;
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "Gerenciar Suporte <suporte@gerenciar.com.br>",
          // Change this to a verified domain
          to: ["devs@atingravity.com"],
          // Change this to your support mail
          subject: `[${type.toUpperCase()}] Novo Chamado Gerenciar`,
          html: emailHtml
        })
      });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    console.error("Support Route Error:", e);
    return new Response(JSON.stringify({ error: e.message || "Erro interno interno." }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
