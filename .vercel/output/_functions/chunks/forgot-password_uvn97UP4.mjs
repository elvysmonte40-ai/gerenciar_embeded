import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qedxpygkkwybrvxludjx.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZHhweWdra3d5YnJ2eGx1ZGp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAzODQ0OSwiZXhwIjoyMDg1NjE0NDQ5fQ.xefVpPNcdVpBADfTbx2VK5vvw6M5dMMs_FpkEL0L09k";
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/update-password`
    });
    if (error) {
      console.error("Erro ao solicitar redefinição:", error);
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "Se o email estiver cadastrado, você receberá um link de redefinição."
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Erro inesperado:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
