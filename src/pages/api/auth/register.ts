import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import { sendWelcomeEmail } from "../../../lib/resend";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();

  const companyName = formData.get("companyName")?.toString();
  const cnpj = formData.get("cnpj")?.toString();
  const segment = formData.get("segment")?.toString();
  const fullName = formData.get("fullName")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  // const captchaToken = formData.get("cf-turnstile-response")?.toString();

  if (!companyName || !email || !password || !fullName) {
    return new Response(
      JSON.stringify({ error: "Campos obrigatórios faltando." }),
      { status: 400 }
    );
  }

  try {
    // 1. Criar Organização via RPC seguro (contorna RLS no Insert e Return)
    const { data: orgId, error: orgError } = await supabase.rpc(
      'create_organization_and_return_id',
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

    // orgId agora é o UUID retornado diretamente
    const organizationId = orgId;

    // 2. Criar Usuário com Metadados da Organização
    // O Trigger 'handle_new_user' vai cuidar de criar o perfil e vincular.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // captchaToken,
        data: {
          full_name: fullName,
          organization_id: organizationId,
          role: 'admin', // Primeiro usuário é admin
          is_super_admin: false,
        },
      },
    });

    if (authError) {
      // Rollback manual (opcional, já que RLS isola a org órfã, mas idealmente deletaríamos)
      // Como estamos no cliente público/anon, talvez não tenhamos permissão de delete.
      // Em produção real, usaríamos uma Edge Function para atomicidade.
      console.error("Erro ao criar usuário:", authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400 }
      );
    }

    // 3. Enviar email de boas-vindas (fire-and-forget)
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
