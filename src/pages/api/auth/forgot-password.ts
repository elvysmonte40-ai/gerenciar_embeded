import type { APIRoute } from "astro";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return new Response(
                JSON.stringify({ error: "Email é obrigatório." }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
            redirectTo: `${new URL(request.url).origin}/update-password`,
        });

        if (error) {
            console.error("Erro ao solicitar redefinição:", error);
            // Return success regardless to prevent email enumeration
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: "Se o email estiver cadastrado, você receberá um link de redefinição."
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (err: any) {
        console.error("Erro inesperado:", err);
        return new Response(
            JSON.stringify({ error: "Erro interno do servidor." }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
