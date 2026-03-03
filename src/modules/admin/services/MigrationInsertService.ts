import { supabase } from "../../../lib/supabase";

export class MigrationInsertService {

    /**
     * Insere os cargos na tabela `job_titles`.
     * Retorna os resultados com sucesso ou falha por linha.
     */
    static async insertRoles(roles: any[], organizationId: string): Promise<{ success: number; errors: any[] }> {
        const results = { success: 0, errors: [] as any[] };

        // We can do a bulk insert, but for better error tracking per row, batch insertion or individual is often used.
        // Let's do bulk upsert based on name and organization to prevent exact duplicates in DB.

        try {
            const payload = roles.map(r => ({
                organization_id: organizationId,
                title: r.nome_cargo,
                is_active: true
            }));

            // Optional: You could fetch existing roles first to map IDs or prevent duplicates,
            // but unique constraints on (organization_id, title) would handle it cleanly if they exist.
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

    /**
     * Insere/Convida a lista de usuários usando a API local para registrar na Auth do Supabase.
     */
    static async insertUsers(users: any[], organizationId: string): Promise<{ success: number; errors: any[] }> {
        const results = { success: 0, errors: [] as any[] };

        // Fetch current Job Titles to map names to IDs
        const { data: jobTitles } = await supabase
            .from('job_titles')
            .select('id, title')
            .eq('organization_id', organizationId);

        const jobTitleMap = new Map<string, string>();
        if (jobTitles) {
            jobTitles.forEach(jt => jobTitleMap.set(jt.title.toLowerCase(), jt.id));
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            results.errors.push("Sessão expirada ou não encontrada.");
            return results;
        }

        // Send requests sequentially or in small batches to avoid rate limits on the Auth API
        for (const user of users) {
            try {
                const jtId = jobTitleMap.get(String(user.cargo).toLowerCase().trim());

                if (!jtId) {
                    results.errors.push(`Usuário ${user.email}: Cargo '${user.cargo}' não encontrado no banco de dados. Cadastre o cargo primeiro.`);
                    continue; // Skip this user
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
                        cpf: user.cpf,
                        role: "user", // default permission role
                        jobTitleId: jtId,
                        organization_id: organizationId,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    results.errors.push(`Usuário ${user.email}: ${data.error || 'Erro ao convidar usuário'}`);
                } else {
                    results.success++;
                }

            } catch (err: any) {
                results.errors.push(`Falha de rede ao convidar ${user.email}: ${err.message}`);
            }
        }

        return results;
    }
}
