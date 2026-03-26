import { createClient } from '@supabase/supabase-js';

const GET = async ({ params, request }) => {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: "User ID is required" }), { status: 400 });
  }
  try {
    const supabaseUrl = "https://qedxpygkkwybrvxludjx.supabase.co";
    const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZHhweWdra3d5YnJ2eGx1ZGp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAzODQ0OSwiZXhwIjoyMDg1NjE0NDQ5fQ.xefVpPNcdVpBADfTbx2VK5vvw6M5dMMs_FpkEL0L09k";
    if (!supabaseUrl || !supabaseServiceRoleKey) ;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized: No token" }), { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid token" }), { status: 401 });
    }
    const { data: requesterProfile } = await supabaseAdmin.from("profiles").select("role, organization_id").eq("id", user.id).single();
    if (!requesterProfile) {
      return new Response(JSON.stringify({ error: "User profile not found" }), { status: 403 });
    }
    const isSelf = user.id === id;
    const isAdmin = requesterProfile.role === "admin";
    const { data: targetUser, error: targetError } = await supabaseAdmin.auth.admin.getUserById(id);
    if (targetError || !targetUser.user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }
    const targetOrgId = targetUser.user.user_metadata?.organization_id;
    if (!isSelf) {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden: You are not an admin" }), { status: 403 });
      }
      if (targetOrgId !== requesterProfile.organization_id) {
        return new Response(JSON.stringify({ error: "Forbidden: Different organization" }), { status: 403 });
      }
    }
    return new Response(JSON.stringify({
      id: targetUser.user.id,
      email: targetUser.user.email,
      user_metadata: targetUser.user.user_metadata,
      app_metadata: targetUser.user.app_metadata
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
