import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
    const tenantId = import.meta.env.PBI_TENANT_ID;
    const clientId = import.meta.env.PBI_CLIENT_ID;
    const clientSecret = import.meta.env.PBI_CLIENT_SECRET;
    const workspaceId = import.meta.env.PBI_WORKSPACE_ID;
    const reportId = import.meta.env.PBI_REPORT_ID;

    if (!tenantId || !clientId || !clientSecret || !workspaceId || !reportId) {
        return new Response(JSON.stringify({
            error: 'Power BI credentials missing in environment variables'
        }), { status: 500 });
    }

    try {
        // 1. Get Azure AD Access Token
        const authorityUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/token`;
        const adBody = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
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

        // 2. Generate Embed Token
        const embedTokenUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/GenerateToken`;
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
            throw new Error(`Power BI Error: ${JSON.stringify(pbiData)}`);
        }

        // 3. Return Data
        return new Response(JSON.stringify({
            accessToken: pbiData.token,
            embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${workspaceId}`,
            reportId: reportId,
            expiry: pbiData.expiration,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('PBI Embed Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
