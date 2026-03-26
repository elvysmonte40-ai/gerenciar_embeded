import { s as supabase } from './supabase_C4p1dVZL.mjs';
import { sendWelcomeEmail } from './resend_2Fz3utdJ.mjs';

const POST = async ({ request, redirect }) => {
  const formData = await request.formData();
  const companyName = formData.get("companyName")?.toString();
  const cnpj = formData.get("cnpj")?.toString();
  const segment = formData.get("segment")?.toString();
  const fullName = formData.get("fullName")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  if (!companyName || !email || !password || !fullName) {
    return new Response(
      JSON.stringify({ error: "Campos obrigatórios faltando." }),
      { status: 400 }
    );
  }
  try {
    const { data: orgId, error: orgError } = await supabase.rpc(
      "create_organization_and_return_id",
      {
        p_name: companyName,
        p_cnpj: cnpj || null,
        p_segment: segment || null
      }
    );
    if (orgError) {
      console.error("Erro RPC:", orgError);
      return new Response(
        JSON.stringify({ error: `Erro ao registrar empresa: ${orgError.message}` }),
        { status: 500 }
      );
    }
    const organizationId = orgId;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          organization_id: organizationId,
          role: "admin",
          // Primeiro usuário é admin
          is_super_admin: false
        }
      }
    });
    if (authError) {
      console.error("Erro ao criar usuário:", authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400 }
      );
    }
    sendWelcomeEmail(email, fullName, organizationId).catch((err) => {
      console.error("Erro ao enviar email de boas-vindas:", err);
    });
    return redirect("/dashboard?welcome=true");
  } catch (err) {
    console.error("Erro inesperado:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
