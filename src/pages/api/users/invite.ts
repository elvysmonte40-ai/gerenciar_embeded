import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const POST: APIRoute = async ({ request }) => {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const token = authHeader.replace("Bearer ", "");
        // Check if the requester is valid using admin to getUser (or anon client)
        // Here we trust the token and verification by supabase.auth.getUser()
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

        if (userError || !user) {
            console.error("Erro na validação do token:", userError);
            return new Response(JSON.stringify({ error: `Invalid token: ${userError?.message || 'No user found'}` }), { status: 401 });
        }

        // Parse Body
        const body = await request.json();
        const { fullName, email, role, organization_id, cpf, birthDate, jobTitle, department, managerId, gender } = body;

        if (!email || !organization_id) {
            return new Response(JSON.stringify({ error: "Email and Organization ID are required" }), { status: 400 });
        }

        // Check if requester belongs to the same organization
        const requesterOrgId = user.user_metadata.organization_id;
        if (requesterOrgId !== organization_id) {
            // Allow super admin bypass if needed, but for now enforce org match
            // Unless the requester is a super_admin?
            // For now, strict check:
            return new Response(JSON.stringify({ error: "Unauthorized organization access" }), { status: 403 });
        }

        // Invite User
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: {
                organization_id: organization_id,
                full_name: fullName,
                role: role || 'user',
                cpf,
                birth_date: birthDate,
                job_title: jobTitle,
                department,
                manager_id: managerId,
                gender,
            }
        });

        if (inviteError) {
            console.error("Error inviting user:", inviteError);
            return new Response(JSON.stringify({ error: inviteError.message }), { status: 400 });
        }

        return new Response(JSON.stringify({ message: "User invited successfully", user: inviteData.user }), { status: 200 });

    } catch (err: any) {
        console.error("Server error:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
};
