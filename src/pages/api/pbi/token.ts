import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const POST: APIRoute = async ({ request }) => {
    try {
        // 1. Verify User Authentication
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), { status: 401 });
        }

        // 2. Parse Request Body
        const { organization_id, group_id, report_id } = await request.json();

        if (!organization_id || !group_id || !report_id) {
            return new Response(JSON.stringify({ error: 'Missing required parameters: organization_id, group_id, report_id' }), { status: 400 });
        }

        // 3. Verify User belongs to Organization
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || profile.organization_id !== organization_id) {
             return new Response(JSON.stringify({ error: 'Unauthorized: User does not belong to this organization' }), { status: 403 });
        }

        // 4. Fetch Organization Power BI Credentials
        const { data: settings, error: settingsError } = await supabaseAdmin
            .from('organization_settings')
            .select('pbi_tenant_id, pbi_client_id, pbi_client_secret')
            .eq('organization_id', organization_id)
            .single();

        if (settingsError || !settings) {
            return new Response(JSON.stringify({ error: 'Power BI settings not found for this organization' }), { status: 404 });
        }

        const { pbi_tenant_id, pbi_client_id, pbi_client_secret } = settings;

        if (!pbi_tenant_id || !pbi_client_id || !pbi_client_secret) {
             return new Response(JSON.stringify({ error: 'Incomplete Power BI configuration for this organization' }), { status: 400 });
        }

        // 5. Get Azure AD Access Token
        const authorityUrl = `https://login.microsoftonline.com/${pbi_tenant_id}/oauth2/token`;
        const adBody = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: pbi_client_id,
            client_secret: pbi_client_secret,
            resource: 'https://analysis.windows.net/powerbi/api',
        });

        const adResponse = await fetch(authorityUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: adBody,
        });

        const adData = await adResponse.json();
        if (!adResponse.ok) {
            throw new Error(`Azure AD Error: ${adData.error_description || adData.error}`);
        }
        const accessToken = adData.access_token;

        // 6. Generate Embed Token
        const embedTokenUrl = `https://api.powerbi.com/v1.0/myorg/groups/${group_id}/reports/${report_id}/GenerateToken`;
        
        const pbiResponse = await fetch(embedTokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ accessLevel: 'View' }),
        });

        const pbiData = await pbiResponse.json();
        
        if (!pbiResponse.ok) {
             // Handle specific Power BI errors roughly
             throw new Error(`Power BI Error: ${JSON.stringify(pbiData)}`);
        }

        // 7. Return Data
        return new Response(JSON.stringify({
            accessToken: pbiData.token, // This is the Embed Token
            embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${report_id}&groupId=${group_id}`,
            reportId: report_id,
            expiry: pbiData.expiration,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('PBI Embed Error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
    }
};
