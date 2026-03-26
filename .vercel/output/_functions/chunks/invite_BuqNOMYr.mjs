import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from './resend_2Fz3utdJ.mjs';

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
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      console.error("Erro na validação do token:", userError);
      return new Response(JSON.stringify({ error: `Invalid token: ${userError?.message || "No user found"}` }), { status: 401 });
    }
    const body = await request.json();
    const { fullName, email, role, organization_id, cpf, birthDate, jobTitle, department, sector, managerId, gender, password, organizationRoleId, sendWelcome } = body;
    if (!email || !organization_id) {
      return new Response(JSON.stringify({ error: "Email and Organization ID are required" }), { status: 400 });
    }
    const requesterOrgId = user.user_metadata.organization_id;
    if (requesterOrgId !== organization_id) {
      return new Response(JSON.stringify({ error: "Unauthorized organization access" }), { status: 403 });
    }
    let resultData;
    if (password) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          organization_id,
          full_name: fullName,
          role: role || "user",
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
      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: {
          organization_id,
          full_name: fullName,
          role: role || "user",
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
    if (sendWelcome) {
      await sendWelcomeEmail(email, fullName, organization_id);
    }
    return new Response(JSON.stringify({ message: password ? "User created successfully" : "User invited successfully", user: resultData.user }), { status: 200 });
  } catch (err) {
    console.error("Server error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { status: err.status || 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
