import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const POST: APIRoute = async ({ request }) => {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        
        if (authError || !user) throw new Error('Sessão inválida');

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('organization_id, full_name')
            .eq('id', user.id)
            .single();

        if (!profile) throw new Error('Perfil não encontrado');

        const ipAddress = request.headers.get('x-forwarded-for') 
            || request.headers.get('x-real-ip') 
            || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Log the login event
        await supabaseAdmin.from('auth_events').insert({
            organization_id: profile.organization_id,
            user_id: user.id,
            event_type: 'LOGIN',
            ip_address: ipAddress,
            user_agent: userAgent,
            metadata: { source: 'password_setup' }
        });

        // Ensure is_activated and activated_at are set (in case they weren't yet)
        await supabaseAdmin.from('profiles').update({
            is_activated: true,
            activated_at: new Date().toISOString()
        }).eq('id', user.id);

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (err: any) {
        console.error("Record Event API Error:", err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
