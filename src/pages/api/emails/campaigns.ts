import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
    try {
        const { data, error } = await supabase
            .from('email_campaigns')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { name, trigger_event, html_content, status } = body;

        const { data, error } = await supabase
            .from('email_campaigns')
            .insert({ name, trigger_event, html_content, status })
            .select()
            .single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};

export const PUT: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { id, name, trigger_event, html_content, status } = body;

        if (!id) throw new Error("ID obrigatório");

        const { data, error } = await supabase
            .from('email_campaigns')
            .update({ name, trigger_event, html_content, status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
