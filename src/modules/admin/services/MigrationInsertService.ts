import { supabase } from "../../../lib/supabase";

export class MigrationInsertService {

    // 1. Pessoais Base
    static async insertPessoaisBase(users: any[], organizationId: string): Promise<{ success: number; errors: any[] }> {
        const results = { success: 0, errors: [] as any[] };

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            results.errors.push("Sessão expirada ou não encontrada.");
            return results;
        }

        // Fetch existing users to prevent false positives and silent skips from Auth API
        const { data: existingProfiles } = await supabase
            .from('profiles')
            .select('email, cpf')
            .eq('organization_id', organizationId);

        const existingEmails = new Set(existingProfiles?.map(p => p.email?.toLowerCase().trim()));
        const existingCpfs = new Set(existingProfiles?.map(p => p.cpf?.replace(/[^\d\w]/g, "")));

        const BATCH_SIZE = 5;
        const DELAY_BETWEEN_BATCHES_MS = 500;

        for (let i = 0; i < users.length; i += BATCH_SIZE) {
            const batch = users.slice(i, i + BATCH_SIZE);

            const batchPromises = batch.map(async (user) => {
                try {
                    const email = user.email?.toLowerCase().trim();
                    const cpf = user.cpf ? String(user.cpf).replace(/[^\d\w]/g, "") : null;

                    if (email && existingEmails.has(email)) {
                        results.errors.push(`Aviso: O email ${email} já está cadastrado nesta organização e foi ignorado na criação base.`);
                        return { status: 'rejected', reason: 'Email já cadastrado' };
                    }
                    if (cpf && existingCpfs.has(cpf)) {
                        results.errors.push(`Aviso: O CPF ${user.cpf} já está associado a alguém nesta organização e foi ignorado.`);
                        return { status: 'rejected', reason: 'CPF já cadastrado' };
                    }

                    const response = await fetch('/api/users/invite', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`
                        },
                        body: JSON.stringify({
                            fullName: user.nome,
                            email: user.email,
                            cpf: user.cpf || null,
                            birthDate: user.data_nascimento || null,
                            gender: user.genero || null,
                            organization_id: organizationId,
                            role: "user",
                            jobTitle: null,
                            department: null,
                            sector: null,
                            managerId: null,
                        }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        results.errors.push(`Usuário ${user.email}: ${data.error || 'Erro ao convidar usuário'}`);
                        return { status: 'rejected', reason: data.error };
                    } else {
                        results.success++;
                        return { status: 'fulfilled', value: data };
                    }

                } catch (err: any) {
                    results.errors.push(`Falha de rede ao convidar ${user.email}: ${err.message}`);
                    return { status: 'rejected', reason: err.message };
                }
            });

            await Promise.allSettled(batchPromises);

            if (i + BATCH_SIZE < users.length) {
                await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
            }
        }

        return results;
    }

    // 2. Cargos
    static async insertRoles(roles: any[], organizationId: string): Promise<{ success: number; errors: any[] }> {
        const results = { success: 0, errors: [] as any[] };

        try {
            const payload = roles.map(r => ({
                organization_id: organizationId,
                title: r.nome_cargo,
                is_active: true
            }));

            const { data, error } = await supabase
                .from('job_titles')
                .upsert(payload, { onConflict: 'organization_id,title' })
                .select();

            if (error) throw error;
            results.success = payload.length;
        } catch (err: any) {
            console.error("Erro na importação de cargos:", err);
            results.errors.push(err.message || "Erro desconhecido ao inserir lote de cargos.");
        }

        return results;
    }

    // 3. Departamentos
    static async insertDepartments(departments: any[], organizationId: string): Promise<{ success: number; errors: any[] }> {
        const results = { success: 0, errors: [] as any[] };

        try {
            const payload = departments.map(d => ({
                organization_id: organizationId,
                name: d.nome_departamento,
                is_active: true
            }));

            const { data, error } = await supabase
                .from('departments')
                .upsert(payload, { onConflict: 'organization_id,name' })
                .select();

            if (error) throw error;
            results.success = payload.length;
        } catch (err: any) {
            console.error("Erro na importação de departamentos:", err);
            results.errors.push(err.message || "Erro desconhecido ao inserir lote de departamentos.");
        }

        return results;
    }

    // 4. Setores
    static async insertSectors(sectors: any[], organizationId: string): Promise<{ success: number; errors: any[] }> {
        const results = { success: 0, errors: [] as any[] };

        try {
            // First we need to fetch all departments to map their names to IDs
            const { data: depts } = await supabase
                .from('departments')
                .select('id, name')
                .eq('organization_id', organizationId);

            const deptMap = new Map<string, string>();
            depts?.forEach(d => deptMap.set(d.name.toLowerCase().trim(), d.id));

            const payload: any[] = [];

            for (const s of sectors) {
                const deptName = s.nome_departamento?.toString().toLowerCase().trim();
                const deptId = deptMap.get(deptName);

                if (!deptId) {
                    results.errors.push(`Setor ${s.nome_setor}: Departamento '${s.nome_departamento}' não encontrado.`);
                    continue;
                }

                payload.push({
                    organization_id: organizationId,
                    department_id: deptId,
                    name: s.nome_setor,
                    is_active: true
                });
            }

            if (payload.length > 0) {
                const { data, error } = await supabase
                    .from('sectors')
                    // Assuming composite unique key isn't strictly defined by default, but typically name + dept_id
                    .upsert(payload)
                    .select();

                if (error) throw error;
                results.success = payload.length;
            }

        } catch (err: any) {
            console.error("Erro na importação de setores:", err);
            results.errors.push(err.message || "Erro ao inserir setores.");
        }

        return results;
    }

    // 5. Associações
    static async updateAssociations(associations: any[], organizationId: string): Promise<{ success: number; errors: any[] }> {
        const results = { success: 0, errors: [] as any[] };

        try {
            // Fetch everything we need to map names to IDs
            const [
                { data: jobTitles },
                { data: departments },
                { data: sectors },
                { data: orgRoles },
                { data: profiles }
            ] = await Promise.all([
                supabase.from('job_titles').select('id, title').eq('organization_id', organizationId),
                supabase.from('departments').select('id, name').eq('organization_id', organizationId),
                supabase.from('sectors').select('id, name').eq('organization_id', organizationId),
                supabase.from('organization_roles').select('id, name').eq('organization_id', organizationId),
                supabase.from('profiles').select('id, email, cpf').eq('organization_id', organizationId)
            ]);

            const jtMap = new Map(jobTitles?.map(j => [j.title.toLowerCase().trim(), j.id]));
            const deptMap = new Map(departments?.map(d => [d.name.toLowerCase().trim(), d.id]));
            const sectorMap = new Map(sectors?.map(s => [s.name.toLowerCase().trim(), s.id]));
            const roleMap = new Map(orgRoles?.map(r => [r.name.toLowerCase().trim(), r.id]));

            // Map users by Email AND by CPF
            const userEmailMap = new Map(profiles?.filter(p => p.email).map(p => [p.email.toLowerCase().trim(), p.id]));
            const userCpfMap = new Map();
            profiles?.forEach(p => {
                if (p.cpf) {
                    userCpfMap.set(p.cpf.replace(/[^\d\w]/g, ""), p.id);
                }
            });

            for (const row of associations) {
                const rawEmail = row.email?.toString().toLowerCase().trim();
                const rawCpf = row.cpf ? row.cpf.toString().replace(/[^\d\w]/g, "") : null;
                const rawCargo = row.cargo?.toString().toLowerCase().trim();
                const rawDepto = row.departamento?.toString().toLowerCase().trim();
                const rawSetor = row.setor?.toString().toLowerCase().trim();
                const rawLiderEmail = row.lider_email?.toString().toLowerCase().trim();
                const rawRole = row.perfil_de_acesso?.toString().toLowerCase().trim();

                // Identificar quem vai receber o UPDATE
                const userId = (rawEmail && userEmailMap.get(rawEmail)) || (rawCpf && userCpfMap.get(rawCpf));

                if (!userId) {
                    results.errors.push(`Usuário não encontrado: Email=${rawEmail} / CPF=${rawCpf}`);
                    continue;
                }

                // Prepare Update Payload
                const updatePayload: any = {};

                if (rawCargo) {
                    const jtId = jtMap.get(rawCargo);
                    if (jtId) updatePayload.job_title = jtId;
                    else results.errors.push(`${rawEmail || rawCpf}: Cargo '${row.cargo}' não encontrado.`);
                }

                if (rawDepto) {
                    const dId = deptMap.get(rawDepto);
                    if (dId) updatePayload.department = dId;
                    else results.errors.push(`${rawEmail || rawCpf}: Departamento '${row.departamento}' não encontrado.`);
                }

                if (rawSetor) {
                    const sId = sectorMap.get(rawSetor);
                    if (sId) updatePayload.sector = sId;
                    else results.errors.push(`${rawEmail || rawCpf}: Setor '${row.setor}' não encontrado.`);
                }

                if (rawLiderEmail) {
                    const mId = userEmailMap.get(rawLiderEmail);
                    if (mId) updatePayload.manager_id = mId;
                    else results.errors.push(`${rawEmail || rawCpf}: Líder '${row.lider_email}' não encontrado.`);
                }

                if (rawRole) {
                    const rId = roleMap.get(rawRole);
                    if (rId) updatePayload.organization_role_id = rId;
                    else results.errors.push(`${rawEmail || rawCpf}: Perfil de Acesso '${row.perfil_de_acesso}' não encontrado. Cadastre o Perfil de Acesso primeiro.`);
                }

                // Só processa se tiver algo pra atualizar
                if (Object.keys(updatePayload).length > 0) {
                    const { error } = await supabase
                        .from('profiles')
                        .update(updatePayload)
                        .eq('id', userId);

                    if (error) {
                        results.errors.push(`Erro ao atualizar ${rawEmail || rawCpf}: ${error.message}`);
                    } else {
                        results.success++;
                    }
                }
            }

        } catch (err: any) {
            console.error("Erro na atualização de associações:", err);
            results.errors.push(err.message || "Erro desconhecido ao processar vínculos.");
        }

        return results;
    }
}
