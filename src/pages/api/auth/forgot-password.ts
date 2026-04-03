import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { email, captchaToken } = body;

        if (!email) {
            return new Response(
                JSON.stringify({ error: "Email é obrigatório." }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${new URL(request.url).origin}/update-password`,
            captchaToken,
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
