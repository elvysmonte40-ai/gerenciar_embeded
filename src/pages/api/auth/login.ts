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

        // Create a server-side Supabase client (bypasses client-side captcha requirement)
        const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

        const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        const { data, error } = await supabaseServer.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            const message =
                error.message === "Invalid login credentials"
                    ? "Identificador ou senha incorretos."
                    : error.message;

            return new Response(
                JSON.stringify({ error: message }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

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
