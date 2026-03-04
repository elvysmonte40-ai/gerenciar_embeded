export interface ValidationError {
    line: number;
    error: string;
}

export interface ValidationResult {
    isValid: boolean;
    validData: any[];
    errors: ValidationError[];
}

export class MigrationValidationService {

    // 1. Pessoais Base
    static validatePessoaisBase(data: any[]): ValidationResult {
        const errors: ValidationError[] = [];
        const validData: any[] = [];
        const seenEmail = new Set<string>();
        const seenCpf = new Set<string>();

        data.forEach((row, index) => {
            const line = index + 2;
            let hasError = false;

            if (!row.email) { errors.push({ line, error: "A coluna 'email' é obrigatória." }); hasError = true; }
            if (!row.nome) { errors.push({ line, error: "A coluna 'nome' é obrigatória." }); hasError = true; }
            if (!row.cpf) { errors.push({ line, error: "A coluna 'cpf' é obrigatória." }); hasError = true; }

            const email = row.email ? String(row.email).toLowerCase().trim() : null;
            const cpf = row.cpf ? MigrationValidationService.cleanFormat(row.cpf) : null;

            if (email) {
                if (seenEmail.has(email)) {
                    errors.push({ line, error: `Email duplicado na planilha: ${email}` });
                    hasError = true;
                } else {
                    seenEmail.add(email);
                }
            }
            if (cpf) {
                if (seenCpf.has(cpf)) {
                    errors.push({ line, error: `CPF duplicado na planilha: ${row.cpf}` });
                    hasError = true;
                } else {
                    seenCpf.add(cpf);
                }
            }

            if (!hasError) validData.push({ ...row, email, cpf });
        });

        return { isValid: errors.length === 0, validData, errors };
    }

    // 2. Cargos
    static validateRoles(data: any[]): ValidationResult {
        const errors: ValidationError[] = [];
        const validData: any[] = [];
        const seenNames = new Set<string>();

        data.forEach((row, index) => {
            const line = index + 2;
            const nome = row.nome_cargo?.toString().trim();

            if (!nome) {
                errors.push({ line, error: "A coluna 'nome_cargo' é obrigatória." });
                return;
            }

            const lowerName = nome.toLowerCase();
            if (seenNames.has(lowerName)) {
                errors.push({ line, error: `Cargo duplicado na planilha: ${nome}` });
                return;
            }

            seenNames.add(lowerName);
            validData.push(row);
        });

        return { isValid: errors.length === 0, validData, errors };
    }

    // 3. Departamentos
    static validateDepartments(data: any[]): ValidationResult {
        const errors: ValidationError[] = [];
        const validData: any[] = [];
        const seenNames = new Set<string>();

        data.forEach((row, index) => {
            const line = index + 2;
            const nome = row.nome_departamento?.toString().trim();

            if (!nome) {
                errors.push({ line, error: "A coluna 'nome_departamento' é obrigatória." });
                return;
            }

            const lowerName = nome.toLowerCase();
            if (seenNames.has(lowerName)) {
                errors.push({ line, error: `Departamento duplicado na planilha: ${nome}` });
                return;
            }

            seenNames.add(lowerName);
            validData.push(row);
        });

        return { isValid: errors.length === 0, validData, errors };
    }

    // 4. Setores
    static validateSectors(data: any[]): ValidationResult {
        const errors: ValidationError[] = [];
        const validData: any[] = [];
        const seenCombo = new Set<string>();

        data.forEach((row, index) => {
            const line = index + 2;
            const nomeSetor = row.nome_setor?.toString().trim();
            const nomeDepto = row.nome_departamento?.toString().trim();

            if (!nomeSetor) { errors.push({ line, error: "A coluna 'nome_setor' é obrigatória." }); return; }
            if (!nomeDepto) { errors.push({ line, error: "A coluna 'nome_departamento' é obrigatória para vincular o setor." }); return; }

            const combo = `${nomeDepto.toLowerCase()}|${nomeSetor.toLowerCase()}`;
            if (seenCombo.has(combo)) {
                errors.push({ line, error: `Setor duplicado no mesmo departamento na planilha.` });
                return;
            }

            seenCombo.add(combo);
            validData.push(row);
        });

        return { isValid: errors.length === 0, validData, errors };
    }

    // 5. Associações
    static validateAssociations(data: any[]): ValidationResult {
        const errors: ValidationError[] = [];
        const validData: any[] = [];

        data.forEach((row, index) => {
            const line = index + 2;
            let hasError = false;

            // Chave primária de vínculo: idealmente Email ou CPF
            const email = row.email?.toString().toLowerCase().trim();
            const cpf = row.cpf ? MigrationValidationService.cleanFormat(row.cpf) : null;
            if (!email && !cpf) {
                errors.push({ line, error: "A coluna 'email' ou 'cpf' é obrigatória para identificar quem será associado." });
                hasError = true;
            }

            // Exige pelo menos UM vínculo
            if (!row.cargo && !row.departamento && !row.setor && !row.lider_email) {
                errors.push({ line, error: "Nenhuma associação solicitada (cargo, departamento, setor, lider_email vazios)." });
                hasError = true;
            }

            if (!hasError) validData.push({ ...row, email, cpf });
        });

        return { isValid: errors.length === 0, validData, errors };
    }

    private static cleanFormat(value: any): string {
        if (!value) return "";
        return String(value).replace(/[^\d\w]/g, "");
    }
}
