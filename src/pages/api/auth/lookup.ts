import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
    try {
        const { identifier } = await request.json();

        if (!identifier) {
            return new Response(JSON.stringify({ error: "Identificador não fornecido" }), { status: 400 });
        }

        let email: string | null = null;
        const cleanedIdentifier = identifier.replace(/\D/g, '');
        const isNumeric = /^\d+$/.test(cleanedIdentifier);

        // Se for numérico, tratamos como possível CPF
        if (isNumeric) {
            // Padronizar para 11 dígitos caso falte o zero à esquerda
            let cpfToSearch = cleanedIdentifier;
            if (cleanedIdentifier.length === 10) {
                cpfToSearch = '0' + cleanedIdentifier;
            }

            if (cpfToSearch.length === 11) {
                const { data, error } = await supabaseAdmin
                    .from('profiles')
                    .select('email')
                    .eq('cpf', cpfToSearch)
                    .maybeSingle();

                if (error) {
                    console.error("Lookup CPF Error:", error);
                    return new Response(JSON.stringify({ error: "Erro ao consultar identificador" }), { status: 500 });
                }

                if (data?.email) {
                    email = data.email;
                }
            } else {
                return new Response(JSON.stringify({ 
                    exists: false, 
                    error: "CPF inválido. Certifique-se de digitar os 11 números." 
                }), { status: 400 });
            }
        } 
        // Caso contrário, tratamos como Email diretamento (ou validação básica de email)
        else if (identifier.includes('@')) {
             const { data, error } = await supabaseAdmin
                .from('profiles')
                .select('email')
                .eq('email', identifier.trim().toLowerCase())
                .maybeSingle();

            if (error) {
                console.error("Lookup Email Error:", error);
                return new Response(JSON.stringify({ error: "Erro ao consultar email" }), { status: 500 });
            }

            if (data?.email) {
                email = data.email;
            }
        }

        if (email) {
            return new Response(JSON.stringify({ email, exists: true }));
        } else {
            return new Response(JSON.stringify({ 
                exists: false, 
                error: isNumeric 
                    ? "CPF não encontrado no sistema." 
                    : "Usuário não encontrado ou não cadastrado no sistema." 
            }), { status: 404 });
        }

    } catch (err) {
        console.error("Internal Auth Lookup Error:", err);
        return new Response(JSON.stringify({ error: "Erro interno no servidor" }), { status: 500 });
    }
};
