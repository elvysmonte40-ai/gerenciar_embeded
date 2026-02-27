import { supabase } from '../../lib/supabase';
import type {
    Process,
    ProcessVersion,
    ProcessStep,
    ProcessAttachment,
    ProcessApprover,
    ProcessWithDetails,
    ProcessVersionWithRelations
} from '../../types/processes';

export const ProcessService = {
    // --- Processes ---

    async listProcesses(organizationId: string, filters?: { departmentId?: string, search?: string }) {
        let query = supabase
            .from('processes')
            .select(`
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
            `)
            .eq('organization_id', organizationId)
            .eq('is_active', true);

        if (filters?.departmentId) {
            query = query.eq('department_id', filters.departmentId);
        }

        if (filters?.search) {
            query = query.or(`title.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
        }

        const { data, error } = await query.order('title');
        if (error) throw error;

        // Fetch profiles for all approvers to avoid N+1 queries or deep nested joins complexity
        const userIds = new Set<string>();
        data?.forEach((process: any) => {
            process.versions?.forEach((version: any) => {
                version.approvers?.forEach((approver: any) => {
                    if (approver.user_id) userIds.add(approver.user_id);
                });
            });
        });

        if (userIds.size > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, email, job_title')
                .in('id', Array.from(userIds));

            const profileMap = new Map(profiles?.map(p => [p.id, p]));

            // Attach profiles to approvers
            data?.forEach((process: any) => {
                process.versions?.forEach((version: any) => {
                    version.approvers = version.approvers?.map((approver: any) => ({
                        ...approver,
                        user: profileMap.get(approver.user_id) || null
                    }));
                });
            });
        }

        return data as ProcessWithDetails[];
    },

    async getProcessById(id: string) {
        const { data, error } = await supabase
            .from('processes')
            .select(`
                *,
                department:departments(name),
                viewer_roles:process_viewer_roles(organization_role_id),
                editor_roles:process_editor_roles(organization_role_id),
                current_version:process_versions!fk_processes_current_version(*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as ProcessWithDetails;
    },

    async getProcessByCode(code: string, organizationId: string) {
        const { data, error } = await supabase
            .from('processes')
            .select(`
                *,
                department:departments(name),
                viewer_roles:process_viewer_roles(organization_role_id),
                editor_roles:process_editor_roles(organization_role_id),
                current_version:process_versions!fk_processes_current_version(*)
            `)
            .eq('code', code)
            .eq('organization_id', organizationId)
            .single();

        if (error) throw error;
        return data as ProcessWithDetails;
    },

    async createProcess(processData: Partial<Process>, viewerRoleIds?: string[], editorRoleIds?: string[], pools?: string[]) {
        // 1. Create Process
        const processInsertData: any = { ...processData };
        if (pools) {
            processInsertData.pools = pools;
        }

        const { data: process, error: processError } = await supabase
            .from('processes')
            .insert(processInsertData)
            .select()
            .single();

        if (processError) throw processError;

        // 1.5. Save Viewer and Editor Roles
        if (viewerRoleIds && viewerRoleIds.length > 0) {
            await this.saveProcessViewerRoles(process.id, viewerRoleIds);
        }

        if (editorRoleIds && editorRoleIds.length > 0) {
            await this.saveProcessEditorRoles(process.id, editorRoleIds);
        }

        // 2. Create Initial Draft Version (v1)
        const { data: version, error: versionError } = await supabase
            .from('process_versions')
            .insert({
                process_id: process.id,
                version_number: 1,
                status: 'draft',
                created_by: process.created_by
            })
            .select()
            .single();

        if (versionError) {
            // Rollback (delete process) if version creation fails - manual transaction
            await supabase.from('processes').delete().eq('id', process.id);
            throw versionError;
        }

        return { process, version };
    },

    async updateProcess(id: string, updates: Partial<Process>) {
        const { data, error } = await supabase
            .from('processes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async saveProcessViewerRoles(processId: string, roleIds: string[]) {
        // Delete existing
        await supabase
            .from('process_viewer_roles')
            .delete()
            .eq('process_id', processId);

        // Insert new
        if (roleIds.length > 0) {
            const inserts = roleIds.map(roleId => ({
                process_id: processId,
                organization_role_id: roleId
            }));

            const { error } = await supabase
                .from('process_viewer_roles')
                .insert(inserts);

            if (error) throw error;
        }
    },

    async getProcessViewerRoles(processId: string) {
        const { data, error } = await supabase
            .from('process_viewer_roles')
            .select('organization_role_id')
            .eq('process_id', processId);

        if (error) throw error;
        return data.map(r => r.organization_role_id);
    },

    async saveProcessEditorRoles(processId: string, roleIds: string[]) {
        // Delete existing
        await supabase
            .from('process_editor_roles')
            .delete()
            .eq('process_id', processId);

        // Insert new
        if (roleIds.length > 0) {
            const inserts = roleIds.map(roleId => ({
                process_id: processId,
                organization_role_id: roleId
            }));

            const { error } = await supabase
                .from('process_editor_roles')
                .insert(inserts);

            if (error) throw error;
        }
    },

    async getProcessEditorRoles(processId: string) {
        const { data, error } = await supabase
            .from('process_editor_roles')
            .select('organization_role_id')
            .eq('process_id', processId);

        if (error) throw error;
        return data.map(r => r.organization_role_id);
    },

    // --- Versions ---

    async getVersions(processId: string) {
        const { data, error } = await supabase
            .from('process_versions')
            .select('*')
            .eq('process_id', processId)
            .order('version_number', { ascending: false });

        if (error) throw error;
        return data as ProcessVersion[];
    },

    async getVersionById(id: string) {
        const { data, error } = await supabase
            .from('process_versions')
            .select(`
                *,
                steps:process_steps(*),
                attachments:process_attachments(*),
                approvers:process_version_approvers(*),
                process:processes!process_versions_process_id_fkey(*)
            `)
            .eq('id', id)
            .single(); // Ensure single row

        if (error) throw error;

        // Manual sorting of steps since nested order in select isn't always reliable or flexible
        if (data && data.steps) {
            data.steps.sort((a: ProcessStep, b: ProcessStep) => a.order_index - b.order_index);
        }

        return data as ProcessVersionWithRelations;
    },

    async createNextVersion(processId: string, previousVersionId: string, userId: string) {
        // Get previous version to copy data
        const { data: prev, error: fetchError } = await supabase
            .from('process_versions')
            .select('version_number, flow_data')
            .eq('id', previousVersionId)
            .single();

        if (fetchError) throw fetchError;

        const nextVersionNumber = prev.version_number + 1;

        // Create new version
        const { data: newVersion, error: createError } = await supabase
            .from('process_versions')
            .insert({
                process_id: processId,
                version_number: nextVersionNumber,
                status: 'draft',
                flow_data: prev.flow_data, // Copy flow
                created_by: userId
            })
            .select()
            .single();

        if (createError) throw createError;

        // Copy Steps
        const { data: steps } = await supabase
            .from('process_steps')
            .select('*')
            .eq('process_version_id', previousVersionId);

        if (steps && steps.length > 0) {
            const newSteps = steps.map(s => ({
                process_version_id: newVersion.id,
                order_index: s.order_index,
                title: s.title,
                role_responsible: s.role_responsible,
                description_html: s.description_html,
                metadata: s.metadata
            }));

            await supabase.from('process_steps').insert(newSteps);
        }

        return newVersion;
    },

    async updateVersion(id: string, updates: Partial<ProcessVersion>) {
        const { data, error } = await supabase
            .from('process_versions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // --- Steps ---

    async saveSteps(versionId: string, steps: Partial<ProcessStep>[]) {
        // Strategy: Delete all existing and re-insert (simplest for ordering/sync)
        // OR Update in place. Re-insert is risky with attachments if linked to step_id, but here attachments allow null step_id.
        // Better: Upsert by ID if exists, insert if not.

        const { error } = await supabase
            .from('process_steps')
            .upsert(
                steps.map(s => ({
                    ...s,
                    process_version_id: versionId
                }))
            );

        if (error) throw error;
    },

    async deleteStep(stepId: string) {
        const { error } = await supabase
            .from('process_steps')
            .delete()
            .eq('id', stepId);
        if (error) throw error;
    },

    // --- Approvals ---

    async getApprovers(versionId: string) {
        const { data, error } = await supabase
            .from('process_version_approvers')
            .select(`
                *,
                user:user_id(email) -- Note: user_id joins to auth.users, might not be visible easily via standard client if RLS restricts. 
                                    -- Using profiles table is safer for names.
            `)
            .eq('process_version_id', versionId);

        if (error) throw error;
        return data;
    },

    // Helper to get profile info for approvers
    async getApproversWithProfiles(versionId: string) {
        const { data: approvers, error } = await supabase
            .from('process_version_approvers')
            .select('*')
            .eq('process_version_id', versionId);

        if (error) throw error;
        if (!approvers.length) return [];

        const userIds = approvers.map(a => a.user_id);
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email, job_title')
            .in('id', userIds);

        return approvers.map(a => ({
            ...a,
            profile: profiles?.find(p => p.id === a.user_id)
        }));
    },

    async addApprover(versionId: string, userId: string) {
        const { data, error } = await supabase
            .from('process_version_approvers')
            .insert({
                process_version_id: versionId,
                user_id: userId,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async removeApprover(approverId: string) {
        const { error } = await supabase
            .from('process_version_approvers')
            .delete()
            .eq('id', approverId);
        if (error) throw error;
    },

    async getPendingApprovals(userId: string) {
        const { data, error } = await supabase
            .from('process_version_approvers')
            .select(`
                *,
                version:process_versions!fk_approvers_version(
                    id, version_number, status,
                    process:processes(title, code)
                )
            `)
            .eq('user_id', userId)
            .eq('status', 'pending');

        if (error) throw error;
        return data; // Returns approver records with embedded version info
    },

    async reviewVersion(versionId: string, userId: string, status: 'approved' | 'rejected', comments?: string) {
        const { data, error } = await supabase
            .from('process_version_approvers')
            .update({
                status,
                comments,
                updated_at: new Date().toISOString()
            })
            .match({ process_version_id: versionId, user_id: userId }) // Safer match
            .select()
            .single();

        if (error) throw error;

        if (status === 'rejected') {
            // Revert version to draft
            await this.updateVersion(versionId, { status: 'draft' });
            // Reset other approvers? Or keep them as is? existing logic implies just one rejection kills it.
        } else if (status === 'approved') {
            // Check if ALL are approved
            const { data: allApprovers } = await supabase
                .from('process_version_approvers')
                .select('status')
                .eq('process_version_id', versionId);

            const allApproved = allApprovers?.every(a => a.status === 'approved');

            if (allApproved) {
                // Publish!
                await this.publishVersion(versionId, userId);
            }
        }

        return data;
    },

    async requestApproval(versionId: string) {
        // Check if has approvers
        const { count } = await supabase
            .from('process_version_approvers')
            .select('*', { count: 'exact', head: true })
            .eq('process_version_id', versionId);

        if (!count || count === 0) throw new Error("É necessário definir pelo menos um aprovador.");

        // Reset statuses to pending if re-requesting?
        await supabase
            .from('process_version_approvers')
            .update({ status: 'pending', comments: null })
            .eq('process_version_id', versionId);

        return this.updateVersion(versionId, { status: 'awaiting_approval' });
    },

    async publishVersion(versionId: string, userId: string) {
        // 1. Get version to know process_id
        const { data: version } = await supabase
            .from('process_versions')
            .select('process_id, version_number')
            .eq('id', versionId)
            .single();

        if (!version) throw new Error("Versão não encontrada");

        // 2. Transact (simulate)

        // Archive previous published
        await supabase
            .from('process_versions')
            .update({ status: 'archived' })
            .eq('process_id', version.process_id)
            .eq('status', 'published');

        // Publish this one
        const { data: published, error } = await supabase
            .from('process_versions')
            .update({
                status: 'published',
                published_at: new Date().toISOString(),
                published_by: userId
            })
            .eq('id', versionId)
            .select()
            .single();

        if (error) throw error;

        // Update Process pointer
        await supabase
            .from('processes')
            .update({ current_version_id: versionId })
            .eq('id', version.process_id);

        return published;
    }
};
