import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const POST: APIRoute = async ({ request }) => {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return new Response(
                JSON.stringify({ error: "Email e senha são obrigatórios." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
        const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

        const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const ipAddress = request.headers.get('x-forwarded-for')
            || request.headers.get('x-real-ip')
            || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        const { data, error } = await supabaseServer.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            // Log failed login attempt
            const { data: failedProfile } = await supabaseAdmin
                .from('profiles')
                .select('id, organization_id')
                .eq('email', email.trim().toLowerCase())
                .maybeSingle();

            if (failedProfile) {
                await supabaseAdmin.from('auth_events').insert({
                    organization_id: failedProfile.organization_id,
                    user_id: failedProfile.id,
                    event_type: 'LOGIN_FAILED',
                    ip_address: ipAddress,
                    user_agent: userAgent,
                    metadata: { reason: error.message },
                });
            }

            const message =
                error.message === "Invalid login credentials"
                    ? "Identificador ou senha incorretos."
                    : error.message;

            return new Response(
                JSON.stringify({ error: message }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        // Check if account is activated
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('is_activated, organization_id')
            .eq('id', data.user.id)
            .single();

        if (!profile?.is_activated) {
            return new Response(
                JSON.stringify({ error: "Sua conta ainda não foi ativada. Entre em contato com o administrador da sua organização." }),
                { status: 403, headers: { "Content-Type": "application/json" } }
            );
        }

        // Log successful login
        await supabaseAdmin.from('auth_events').insert({
            organization_id: profile.organization_id,
            user_id: data.user.id,
            event_type: 'LOGIN',
            ip_address: ipAddress,
            user_agent: userAgent,
        });

        return new Response(
            JSON.stringify({
                session: data.session,
                user: data.user,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (err: any) {
        console.error("Login API Error:", err);
        return new Response(
            JSON.stringify({ error: "Erro interno do servidor." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};
