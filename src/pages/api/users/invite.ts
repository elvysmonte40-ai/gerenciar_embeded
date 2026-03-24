import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import { sendWelcomeEmail } from "../../../lib/resend";

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
        const { fullName, email, role, organization_id, cpf, birthDate, jobTitle, department, sector, managerId, gender, password, organizationRoleId, sendWelcome } = body;

        if (!email || !organization_id) {
            return new Response(JSON.stringify({ error: "Email and Organization ID are required" }), { status: 400 });
        }

        // Check if requester belongs to the same organization
        const requesterOrgId = user.user_metadata.organization_id;
        if (requesterOrgId !== organization_id) {
            return new Response(JSON.stringify({ error: "Unauthorized organization access" }), { status: 403 });
        }

        let resultData;

        if (password) {
            // Create User with Password (Auto-Confirm)
            const { data, error } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    organization_id,
                    full_name: fullName,
                    role: role || 'user',
                    cpf: cpf || null,
                    birth_date: birthDate || null,
                    job_title: jobTitle || null,
                    department: department || null,
                    sector: sector || null,
                    manager_id: managerId || null,
                    gender: gender || null,
                    organization_role_id: organizationRoleId || null
                }
            });

            if (error) throw error;
            resultData = data;
        } else {
            // Invite User (Email link)
            const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
                data: {
                    organization_id,
                    full_name: fullName,
                    role: role || 'user',
                    cpf: cpf || null,
                    birth_date: birthDate || null,
                    job_title: jobTitle || null,
                    department: department || null,
                    sector: sector || null,
                    manager_id: managerId || null,
                    gender: gender || null,
                    organization_role_id: organizationRoleId || null
                }
            });

            if (error) throw error;
            resultData = data;
        }

        // Send Welcome Email if requested
        if (sendWelcome) {
            await sendWelcomeEmail(email, fullName, organization_id);
        }

        return new Response(JSON.stringify({ message: password ? "User created successfully" : "User invited successfully", user: resultData.user }), { status: 200 });

    } catch (err: any) {
        console.error("Server error:", err);
        return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { status: err.status || 500 });
    }
};
