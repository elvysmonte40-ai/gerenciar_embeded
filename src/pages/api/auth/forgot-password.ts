import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { email /*, captchaToken */ } = body;

        if (!email) {
            return new Response(
                JSON.stringify({ error: "Email é obrigatório." }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check if user is activated AND active before sending reset link
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('is_activated, status')
            .eq('email', email.trim().toLowerCase())
            .maybeSingle();

        // If not activated, inactive (or not found), silently return success to prevent email enumeration
        if (!profile?.is_activated || profile?.status === 'inactive') {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: "Se o email estiver cadastrado, você receberá um link de redefinição."
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${new URL(request.url).origin}/update-password`,
            // captchaToken,
        });

        if (error) {
            console.error("Erro ao solicitar redefinição:", error);
            // Return success regardless to prevent email enumeration
        } else {
            // Log password reset event
            const ipAddress = request.headers.get('x-forwarded-for')
                || request.headers.get('x-real-ip')
                || 'unknown';
            const userAgent = request.headers.get('user-agent') || 'unknown';

            const { data: fullProfile } = await supabaseAdmin
                .from('profiles')
                .select('id, organization_id')
                .eq('email', email.trim().toLowerCase())
                .maybeSingle();

            if (fullProfile) {
                await supabaseAdmin.from('auth_events').insert({
                    organization_id: fullProfile.organization_id,
                    user_id: fullProfile.id,
                    event_type: 'PASSWORD_RESET',
                    ip_address: ipAddress,
                    user_agent: userAgent,
                });
            }
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
