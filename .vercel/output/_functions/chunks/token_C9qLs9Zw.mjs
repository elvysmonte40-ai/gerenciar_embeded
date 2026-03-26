import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qedxpygkkwybrvxludjx.supabase.co";
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZHhweWdra3d5YnJ2eGx1ZGp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAzODQ0OSwiZXhwIjoyMDg1NjE0NDQ5fQ.xefVpPNcdVpBADfTbx2VK5vvw6M5dMMs_FpkEL0L09k";
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
const POST = async ({ request }) => {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid token" }), { status: 401 });
    }
    const { organization_id, group_id, report_id } = await request.json();
    if (!organization_id || !group_id || !report_id) {
      return new Response(JSON.stringify({ error: "Missing required parameters: organization_id, group_id, report_id" }), { status: 400 });
    }
    const { data: profile, error: profileError } = await supabaseAdmin.from("profiles").select("organization_id").eq("id", user.id).single();
    if (profileError || !profile || profile.organization_id !== organization_id) {
      return new Response(JSON.stringify({ error: "Unauthorized: User does not belong to this organization" }), { status: 403 });
    }
    const { data: settings, error: settingsError } = await supabaseAdmin.from("organization_settings").select("pbi_tenant_id, pbi_client_id, pbi_client_secret").eq("organization_id", organization_id).single();
    if (settingsError || !settings) {
      return new Response(JSON.stringify({ error: "Power BI settings not found for this organization" }), { status: 404 });
    }
    const { pbi_tenant_id, pbi_client_id, pbi_client_secret } = settings;
    if (!pbi_tenant_id || !pbi_client_id || !pbi_client_secret) {
      return new Response(JSON.stringify({ error: "Incomplete Power BI configuration for this organization" }), { status: 400 });
    }
    const authorityUrl = `https://login.microsoftonline.com/${pbi_tenant_id}/oauth2/token`;
    const adBody = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: pbi_client_id,
      client_secret: pbi_client_secret,
      resource: "https://analysis.windows.net/powerbi/api"
    });
    const adResponse = await fetch(authorityUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: adBody
    });
    const adData = await adResponse.json();
    if (!adResponse.ok) {
      throw new Error(`Azure AD Error: ${adData.error_description || adData.error}`);
    }
    const accessToken = adData.access_token;
    const embedTokenUrl = `https://api.powerbi.com/v1.0/myorg/groups/${group_id}/reports/${report_id}/GenerateToken`;
    const pbiResponse = await fetch(embedTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ accessLevel: "View" })
    });
    const pbiData = await pbiResponse.json();
    if (!pbiResponse.ok) {
      throw new Error(`Power BI Error: ${JSON.stringify(pbiData)}`);
    }
    return new Response(JSON.stringify({
      accessToken: pbiData.token,
      // This is the Embed Token
      embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${report_id}&groupId=${group_id}`,
      reportId: report_id,
      expiry: pbiData.expiration
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("PBI Embed Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
