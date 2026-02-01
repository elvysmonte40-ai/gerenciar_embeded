
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Authenticate User
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            throw new Error('User not authenticated')
        }

        // 2. Parse Input
        const { organization_id, group_id, report_id } = await req.json()
        if (!organization_id || !group_id || !report_id) {
            throw new Error('Missing organization_id, group_id, or report_id')
        }

        // 3. Retrieve Credentials Securely (via Service Role)
        // We must use the Service Role Client to call the security definer function securely if RLS is tricky,
        // but here we defined the RPC to optionally check user permissions or trusted inputs.
        // Actually our RPC `get_decrypted_powerbi_creds` is `security definer`.
        // We can call it with our current client IF we granted permission to authenticated users (which we didn't, only service_role).
        // So we MUST use Admin Client.

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { data: creds, error: credsError } = await supabaseAdmin
            .rpc('get_decrypted_powerbi_creds', { org_id: organization_id })
            .single()

        if (credsError || !creds) {
            console.error('Creds Error:', credsError)
            throw new Error('Failed to retrieve credentials for this organization')
        }

        const { pbi_tenant_id, pbi_client_id, client_secret } = creds

        // 4. Get Microsoft Access Token
        const tokenResponse = await fetch(
            `https://login.microsoftonline.com/${pbi_tenant_id}/oauth2/v2.0/token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: pbi_client_id,
                    client_secret: client_secret,
                    scope: 'https://analysis.windows.net/powerbi/api/.default',
                }),
            }
        )

        const tokenData = await tokenResponse.json()
        if (!tokenResponse.ok) {
            throw new Error(`Failed to get MS Access Token: ${JSON.stringify(tokenData)}`)
        }

        const accessToken = tokenData.access_token

        // 5. Generate Power BI Embed Token
        const embedUrl = `https://api.powerbi.com/v1.0/myorg/groups/${group_id}/reports/${report_id}/GenerateToken`

        const embedResponse = await fetch(embedUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                accessLevel: 'View',
                // Optional: Implement RLS for Power BI here using "identities"
            }),
        })

        const embedData = await embedResponse.json()
        if (!embedResponse.ok) {
            throw new Error(`Failed to get Embed Token: ${JSON.stringify(embedData)}`)
        }

        // 6. Return Result
        return new Response(
            JSON.stringify({
                embedToken: embedData.token,
                tokenId: embedData.tokenId,
                expiration: embedData.expiration,
                // We might need to return accessToken too if client needs it for other things, but usually just embedToken is safer
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
