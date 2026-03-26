import{s as t}from"./supabase.CyU2cgPu.js";const f={async listProcesses(s,e){let r=t.from("processes").select(`
                *,
                department:departments(name),
                viewer_roles:process_viewer_roles(organization_role_id),
                editor_roles:process_editor_roles(organization_role_id),
                current_version:process_versions!fk_processes_current_version(*),
                versions:process_versions!process_versions_process_id_fkey(
                    id, 
                    status, 
                    version_number, 
                    created_at,
                    approvers:process_version_approvers(id, status, user_id)
                )
            `).eq("organization_id",s).eq("is_active",!0);e?.departmentId&&(r=r.eq("department_id",e.departmentId)),e?.search&&(r=r.or(`title.ilike.%${e.search}%,code.ilike.%${e.search}%`));const{data:o,error:i}=await r.order("title");if(i)throw i;const a=new Set;if(o?.forEach(c=>{c.versions?.forEach(p=>{p.approvers?.forEach(n=>{n.user_id&&a.add(n.user_id)})})}),a.size>0){const{data:c}=await t.from("profiles").select("id, full_name, email, job_title").in("id",Array.from(a)),p=new Map(c?.map(n=>[n.id,n]));o?.forEach(n=>{n.versions?.forEach(d=>{d.approvers=d.approvers?.map(_=>({..._,user:p.get(_.user_id)||null}))})})}return o},async getProcessById(s){const{data:e,error:r}=await t.from("processes").select(`
                *,
                department:departments(name),
                viewer_roles:process_viewer_roles(organization_role_id),
                editor_roles:process_editor_roles(organization_role_id),
                current_version:process_versions!fk_processes_current_version(*)
            `).eq("id",s).single();if(r)throw r;return e},async getProcessByCode(s,e){const{data:r,error:o}=await t.from("processes").select(`
                *,
                department:departments(name),
                viewer_roles:process_viewer_roles(organization_role_id),
                editor_roles:process_editor_roles(organization_role_id),
                current_version:process_versions!fk_processes_current_version(*)
            `).eq("code",s).eq("organization_id",e).single();if(o)throw o;return r},async createProcess(s,e,r,o){const i={...s};o&&(i.pools=o);const{data:a,error:c}=await t.from("processes").insert(i).select().single();if(c)throw c;e&&e.length>0&&await this.saveProcessViewerRoles(a.id,e),r&&r.length>0&&await this.saveProcessEditorRoles(a.id,r);const{data:p,error:n}=await t.from("process_versions").insert({process_id:a.id,version_number:1,status:"draft",created_by:a.created_by}).select().single();if(n)throw await t.from("processes").delete().eq("id",a.id),n;return{process:a,version:p}},async updateProcess(s,e){const{data:r,error:o}=await t.from("processes").update(e).eq("id",s).select().single();if(o)throw o;return r},async saveProcessViewerRoles(s,e){if(await t.from("process_viewer_roles").delete().eq("process_id",s),e.length>0){const r=e.map(i=>({process_id:s,organization_role_id:i})),{error:o}=await t.from("process_viewer_roles").insert(r);if(o)throw o}},async getProcessViewerRoles(s){const{data:e,error:r}=await t.from("process_viewer_roles").select("organization_role_id").eq("process_id",s);if(r)throw r;return e.map(o=>o.organization_role_id)},async saveProcessEditorRoles(s,e){if(await t.from("process_editor_roles").delete().eq("process_id",s),e.length>0){const r=e.map(i=>({process_id:s,organization_role_id:i})),{error:o}=await t.from("process_editor_roles").insert(r);if(o)throw o}},async getProcessEditorRoles(s){const{data:e,error:r}=await t.from("process_editor_roles").select("organization_role_id").eq("process_id",s);if(r)throw r;return e.map(o=>o.organization_role_id)},async getVersions(s){const{data:e,error:r}=await t.from("process_versions").select("*").eq("process_id",s).order("version_number",{ascending:!1});if(r)throw r;return e},async getVersionById(s){const{data:e,error:r}=await t.from("process_versions").select(`
                *,
                steps:process_steps(*),
                attachments:process_attachments(*),
                approvers:process_version_approvers(*),
                process:processes!process_versions_process_id_fkey(*)
            `).eq("id",s).single();if(r)throw r;return e&&e.steps&&e.steps.sort((o,i)=>o.order_index-i.order_index),e},async createNextVersion(s,e,r){const{data:o,error:i}=await t.from("process_versions").select("version_number, flow_data").eq("id",e).single();if(i)throw i;const a=o.version_number+1,{data:c,error:p}=await t.from("process_versions").insert({process_id:s,version_number:a,status:"draft",flow_data:o.flow_data,created_by:r}).select().single();if(p)throw p;const{data:n}=await t.from("process_steps").select("*").eq("process_version_id",e);if(n&&n.length>0){const d=n.map(_=>({process_version_id:c.id,order_index:_.order_index,title:_.title,role_responsible:_.role_responsible,description_html:_.description_html,metadata:_.metadata}));await t.from("process_steps").insert(d)}return c},async updateVersion(s,e){const{data:r,error:o}=await t.from("process_versions").update(e).eq("id",s).select().single();if(o)throw o;return r},async saveSteps(s,e){const{error:r}=await t.from("process_steps").upsert(e.map(o=>({...o,process_version_id:s})));if(r)throw r},async deleteStep(s){const{error:e}=await t.from("process_steps").delete().eq("id",s);if(e)throw e},async getApprovers(s){const{data:e,error:r}=await t.from("process_version_approvers").select(`
                *,
                user:user_id(email) -- Note: user_id joins to auth.users, might not be visible easily via standard client if RLS restricts. 
                                    -- Using profiles table is safer for names.
            `).eq("process_version_id",s);if(r)throw r;return e},async getApproversWithProfiles(s){const{data:e,error:r}=await t.from("process_version_approvers").select("*").eq("process_version_id",s);if(r)throw r;if(!e.length)return[];const o=e.map(a=>a.user_id),{data:i}=await t.from("profiles").select("id, full_name, email, job_title").in("id",o);return e.map(a=>({...a,profile:i?.find(c=>c.id===a.user_id)}))},async addApprover(s,e){const{data:r,error:o}=await t.from("process_version_approvers").insert({process_version_id:s,user_id:e,status:"pending"}).select().single();if(o)throw o;return r},async removeApprover(s){const{error:e}=await t.from("process_version_approvers").delete().eq("id",s);if(e)throw e},async getPendingApprovals(s){const{data:e,error:r}=await t.from("process_version_approvers").select(`
                *,
                version:process_versions!fk_approvers_version(
                    id, version_number, status,
                    process:processes(title, code)
                )
            `).eq("user_id",s).eq("status","pending");if(r)throw r;return e},async reviewVersion(s,e,r,o){const{data:i,error:a}=await t.from("process_version_approvers").update({status:r,comments:o,updated_at:new Date().toISOString()}).match({process_version_id:s,user_id:e}).select().single();if(a)throw a;if(r==="rejected")await this.updateVersion(s,{status:"draft"});else if(r==="approved"){const{data:c}=await t.from("process_version_approvers").select("status").eq("process_version_id",s);c?.every(n=>n.status==="approved")&&await this.publishVersion(s,e)}return i},async requestApproval(s){const{count:e}=await t.from("process_version_approvers").select("*",{count:"exact",head:!0}).eq("process_version_id",s);if(!e||e===0)throw new Error("É necessário definir pelo menos um aprovador.");return await t.from("process_version_approvers").update({status:"pending",comments:null}).eq("process_version_id",s),this.updateVersion(s,{status:"awaiting_approval"})},async publishVersion(s,e){const{data:r}=await t.from("process_versions").select("process_id, version_number").eq("id",s).single();if(!r)throw new Error("Versão não encontrada");await t.from("process_versions").update({status:"archived"}).eq("process_id",r.process_id).eq("status","published");const{data:o,error:i}=await t.from("process_versions").update({status:"published",published_at:new Date().toISOString(),published_by:e}).eq("id",s).select().single();if(i)throw i;return await t.from("processes").update({current_version_id:s}).eq("id",r.process_id),o}};export{f as P};
