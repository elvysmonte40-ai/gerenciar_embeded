import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qedxpygkkwybrvxludjx.supabase.co";
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZHhweWdra3d5YnJ2eGx1ZGp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAzODQ0OSwiZXhwIjoyMDg1NjE0NDQ5fQ.xefVpPNcdVpBADfTbx2VK5vvw6M5dMMs_FpkEL0L09k";
const cronSecret = "changeme_in_prod";
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
const cleanCpf = (cpf) => cpf?.replace(/\D/g, "");
const POST = async ({ request }) => {
  return handleSync(request);
};
const GET = async ({ request }) => {
  return handleSync(request);
};
async function handleSync(request) {
  try {
    let organizationIdsToSync = [];
    const authHeader = request.headers.get("Authorization");
    const internalCronHeader = request.headers.get("x-cron-secret");
    const url = new URL(request.url);
    const queryCronSecret = url.searchParams.get("cron_secret");
    if (internalCronHeader === cronSecret || queryCronSecret === cronSecret) {
      const { data: orgs, error } = await supabaseAdmin.from("voors_settings").select("organization_id").eq("auto_sync_enabled", true);
      if (error) throw error;
      organizationIdsToSync = orgs.map((o) => o.organization_id);
      if (organizationIdsToSync.length === 0) {
        return new Response(JSON.stringify({ message: "No organizations configured for auto-sync." }), { status: 200 });
      }
    } else if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized: Invalid token" }), { status: 401 });
      const { data: profile } = await supabaseAdmin.from("profiles").select("organization_id, role").eq("id", user.id).single();
      if (!profile || profile.role !== "admin") {
        return new Response(JSON.stringify({ error: "Unauthorized: Admins only" }), { status: 403 });
      }
      organizationIdsToSync = [profile.organization_id];
    } else {
      return new Response(JSON.stringify({ error: "Missing Authentication" }), { status: 401 });
    }
    const results = [];
    for (const orgId of organizationIdsToSync) {
      try {
        const { data: settings } = await supabaseAdmin.from("voors_settings").select("token").eq("organization_id", orgId).single();
        if (!settings?.token) {
          results.push({ orgId, status: "skipped", reason: "No token configured" });
          continue;
        }
        const voorsApiUrl = "http://social.nela.com.br:1344/goals?startDate=2022-07-01&endDate=2050-12-31";
        const voorsResponse = await fetch(voorsApiUrl, {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
            "Authorization": settings.token,
            "Accept": "*/*"
          }
        });
        if (!voorsResponse.ok) {
          throw new Error(`Voors API returned ${voorsResponse.status}`);
        }
        const payload = await voorsResponse.json();
        await supabaseAdmin.from("voors_users_staging").delete().eq("organization_id", orgId);
        await supabaseAdmin.from("voors_users_staging").insert({
          organization_id: orgId,
          payload,
          status: "success"
        });
        const { data: mappings } = await supabaseAdmin.from("voors_field_mapping").select("*");
        const mappingDict = mappings?.reduce((acc, curr) => {
          acc[curr.voors_key] = curr.system_column;
          return acc;
        }, {}) || {};
        const departmentsInPayload = [...new Set(payload.map((u) => u.departmentName).filter(Boolean))];
        const { data: existingDepts } = await supabaseAdmin.from("departments").select("id, name").eq("organization_id", orgId);
        const deptMap = {};
        for (const d of existingDepts || []) deptMap[d.name.toLowerCase()] = d.id;
        for (const dName of departmentsInPayload) {
          const cleanName = String(dName).trim();
          if (!deptMap[cleanName.toLowerCase()]) {
            const { data: newDept } = await supabaseAdmin.from("departments").insert({ organization_id: orgId, name: cleanName, is_active: true }).select("id").single();
            if (newDept) deptMap[cleanName.toLowerCase()] = newDept.id;
          }
        }
        const jobsInPayload = [...new Set(payload.map((u) => u.jobRoleTitle).filter(Boolean))];
        const { data: existingJobs } = await supabaseAdmin.from("job_titles").select("id, title").eq("organization_id", orgId);
        const jobMap = {};
        for (const j of existingJobs || []) jobMap[j.title.toLowerCase()] = j.id;
        for (const jTitle of jobsInPayload) {
          const cleanTitle = String(jTitle).trim();
          if (!jobMap[cleanTitle.toLowerCase()]) {
            const { data: newJob } = await supabaseAdmin.from("job_titles").insert({ organization_id: orgId, title: cleanTitle, is_active: true }).select("id").single();
            if (newJob) jobMap[cleanTitle.toLowerCase()] = newJob.id;
          }
        }
        const { data: allProfiles } = await supabaseAdmin.from("profiles").select("id, full_name").eq("organization_id", orgId);
        const nameToProfileIdMap = {};
        if (allProfiles) {
          allProfiles.forEach((p) => {
            if (p.full_name) {
              nameToProfileIdMap[p.full_name.trim().toLowerCase()] = p.id;
            }
          });
        }
        let createdCount = 0;
        let updatedCount = 0;
        let activeCount = 0;
        let inactiveCount = 0;
        payload.sort((a, b) => {
          const dateA = a["data de admissao"] ? new Date(a["data de admissao"]).getTime() : Number.MAX_SAFE_INTEGER;
          const dateB = b["data de admissao"] ? new Date(b["data de admissao"]).getTime() : Number.MAX_SAFE_INTEGER;
          return dateA - dateB;
        });
        const emailToAuthId = {};
        let hasMoreUsers = true;
        let page = 1;
        while (hasMoreUsers) {
          const { data: usersData, error: usersErr } = await supabaseAdmin.auth.admin.listUsers({
            page,
            perPage: 1e3
          });
          if (usersErr || !usersData?.users || usersData.users.length === 0) {
            hasMoreUsers = false;
            if (usersErr) console.error("Error fetching admin users:", usersErr);
            break;
          }
          usersData.users.forEach((u) => {
            if (u.email && u.user_metadata?.organization_id === orgId) {
              emailToAuthId[u.email.toLowerCase()] = u.id;
            }
          });
          if (usersData.users.length < 1e3) {
            hasMoreUsers = false;
          } else {
            page++;
          }
        }
        for (const voorsUser of payload) {
          const rawCpf = voorsUser.CPF;
          if (!rawCpf) continue;
          const userCpfRaw = cleanCpf(rawCpf);
          if (!userCpfRaw || userCpfRaw.length !== 11) continue;
          const profileData = {};
          for (const [vKey, val] of Object.entries(voorsUser)) {
            const sysCol = mappingDict[vKey];
            if (sysCol && val !== void 0) {
              if (val === null || String(val).trim() === "") {
                if (sysCol !== "cpf" && sysCol !== "status") {
                  if (sysCol === "department" || sysCol === "department_id") profileData["department_id"] = null;
                  else if (sysCol === "job_title" || sysCol === "job_title_id") profileData["job_title_id"] = null;
                  else profileData[sysCol] = null;
                }
                continue;
              }
              if (sysCol === "status") {
                profileData[sysCol] = val === "active" || String(val).toLowerCase() === "ativo" ? "active" : "inactive";
              } else if (sysCol === "department" || sysCol === "department_id") {
                profileData["department_id"] = deptMap[String(val).trim().toLowerCase()] || null;
              } else if (sysCol === "job_title" || sysCol === "job_title_id") {
                profileData["job_title_id"] = jobMap[String(val).trim().toLowerCase()] || null;
              } else if (sysCol === "manager_name" || sysCol === "manager_id") {
                profileData["manager_name"] = val;
                profileData["manager_id"] = nameToProfileIdMap[String(val).trim().toLowerCase()] || null;
              } else if (sysCol === "cpf") {
                profileData["cpf"] = userCpfRaw;
              } else {
                profileData[sysCol] = val;
              }
            }
          }
          if (profileData.status === "active") activeCount++;
          else if (profileData.status === "inactive") inactiveCount++;
          if (profileData["name"]) {
            if (!profileData["full_name"]) profileData["full_name"] = profileData["name"];
          }
          const allowedColumns = [
            "full_name",
            "role",
            "status",
            "cpf",
            "birth_date",
            "can_export_data",
            "manager_id",
            "manager_name",
            "gender",
            "admission_date",
            "inactivation_date",
            "job_title_id",
            "department_id",
            "sector_id",
            "organization_role_id"
          ];
          for (const k of Object.keys(profileData)) {
            if (!allowedColumns.includes(k)) {
              delete profileData[k];
            }
          }
          const voorsEmail = (voorsUser.email || `voors_${userCpfRaw}@org${orgId}.com`).toLowerCase();
          const userFullName = profileData.full_name || voorsUser.userFullName || "Usuário Integrado";
          let matchedProfileId = null;
          const { data: cpfMatch } = await supabaseAdmin.from("profiles").select("id").eq("cpf", userCpfRaw).eq("organization_id", orgId).maybeSingle();
          if (cpfMatch) {
            matchedProfileId = cpfMatch.id;
          } else if (emailToAuthId[voorsEmail]) {
            matchedProfileId = emailToAuthId[voorsEmail];
          }
          if (matchedProfileId) {
            if (!profileData.cpf) profileData.cpf = userCpfRaw;
            delete profileData.email;
            if (Object.keys(profileData).length > 0) {
              const { error: upErr } = await supabaseAdmin.from("profiles").update(profileData).eq("id", matchedProfileId);
              if (upErr) {
                console.error("Erro ao atualizar", userFullName, upErr);
              } else {
                updatedCount++;
              }
            }
          } else {
            const { data: authUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
              email: voorsEmail,
              email_confirm: true,
              password: Math.random().toString(36).slice(-10) + "A1!",
              user_metadata: {
                full_name: userFullName,
                organization_id: orgId,
                cpf: userCpfRaw,
                role: profileData.role || "user"
              }
            });
            if (!createUserError && authUser?.user) {
              delete profileData.email;
              profileData.cpf = userCpfRaw;
              await supabaseAdmin.from("profiles").update(profileData).eq("id", authUser.user.id);
              createdCount++;
              emailToAuthId[voorsEmail] = authUser.user.id;
            } else {
              console.error("Error creating user inside Voors sync:", createUserError);
            }
          }
        }
        await supabaseAdmin.from("voors_settings").update({ last_sync_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("organization_id", orgId);
        await supabaseAdmin.from("voors_sync_history").insert({
          organization_id: orgId,
          trigger_type: authHeader ? "manual" : "cron",
          status: "success",
          total_users_fetched: payload.length,
          total_users_created: createdCount,
          total_users_updated: updatedCount,
          active_users_count: activeCount,
          inactive_users_count: inactiveCount
        });
        results.push({ orgId, status: "success", created: createdCount, updated: updatedCount, active: activeCount, inactive: inactiveCount });
      } catch (err) {
        console.error(`Sync error for org ${orgId}:`, err);
        await supabaseAdmin.from("voors_sync_history").insert({
          organization_id: orgId,
          trigger_type: authHeader ? "manual" : "cron",
          status: "error",
          error_message: err.message
        });
        results.push({ orgId, status: "error", message: err.message });
      }
    }
    return new Response(JSON.stringify({ success: true, results }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Voors API Route Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500 });
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
