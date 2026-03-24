import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

type ResendEventType =
    | 'email.sent'
    | 'email.delivered'
    | 'email.delivery_delayed'
    | 'email.complained'
    | 'email.bounced'
    | 'email.opened'
    | 'email.clicked';

const statusMap: Record<string, { field: string; status: string }> = {
    'email.sent': { field: 'sent_at', status: 'sent' },
    'email.delivered': { field: 'delivered_at', status: 'delivered' },
    'email.bounced': { field: 'bounced_at', status: 'bounced' },
    'email.complained': { field: 'bounced_at', status: 'complained' },
    'email.opened': { field: 'opened_at', status: 'opened' },
    'email.clicked': { field: 'clicked_at', status: 'clicked' },
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const event = await request.json();
        const eventType = event.type as ResendEventType;
        const emailId = event.data?.email_id;

        if (!emailId || !statusMap[eventType]) {
            return new Response('OK', { status: 200 });
        }

        const mapping = statusMap[eventType];
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const updateData: Record<string, any> = {
            status: mapping.status,
            [mapping.field]: new Date().toISOString(),
        };

        if (eventType === 'email.bounced') {
            updateData.error_message = event.data?.bounce?.message || 'Bounce';
        }

        await supabaseAdmin
            .from('email_logs')
            .update(updateData)
            .eq('resend_email_id', emailId);

        return new Response('OK', { status: 200 });
    } catch (err) {
        console.error('Webhook error:', err);
        return new Response('OK', { status: 200 });
    }
};
