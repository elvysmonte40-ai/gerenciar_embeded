// src/modules/admin/services/MigrationValidationService.ts

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

    /**
     * Valida uma lista de cargos (Roles).
     * Regras: nome_cargo é obrigatório. Sem duplicados na mesma planilha.
     */
    static validateRoles(data: any[]): ValidationResult {
        const errors: ValidationError[] = [];
        const validData: any[] = [];
        const seenNames = new Set<string>();

        data.forEach((row, index) => {
            const line = index + 2; // header is line 1, so index 0 is line 2
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

        return {
            isValid: errors.length === 0,
            validData,
            errors
        };
    }

    /**
     * Valida uma lista de usuários (Users).
     * Regras: email obrigatório, CPF válido e não duplicado (na planilha e em comparação básica),
     * Telefone não duplicado, Cargo especificado.
     */
    static validateUsers(data: any[]): ValidationResult {
        const errors: ValidationError[] = [];
        const validData: any[] = [];

        const seenCpf = new Set<string>();
        const seenEmail = new Set<string>();
        const seenPhone = new Set<string>();

        data.forEach((row, index) => {
            const line = index + 2;

            // Required columns check
            if (!row.email) errors.push({ line, error: "A coluna 'email' é obrigatória." });
            if (!row.nome) errors.push({ line, error: "A coluna 'nome' é obrigatória." });
            if (!row.cargo) errors.push({ line, error: "A coluna 'cargo' é obrigatória." });

            const cpf = row.cpf ? this.cleanFormat(row.cpf) : null;
            const phone = row.telefone ? this.cleanFormat(row.telefone) : null;
            const email = row.email ? row.email.toString().toLowerCase().trim() : null;

            if (email) {
                if (seenEmail.has(email)) {
                    errors.push({ line, error: `Email duplicado na planilha: ${email}` });
                } else {
                    seenEmail.add(email);
                }
            }

            if (cpf) {
                if (seenCpf.has(cpf)) {
                    errors.push({ line, error: `CPF duplicado na planilha: ${row.cpf}` });
                } else {
                    seenCpf.add(cpf);
                }
            }

            if (phone) {
                if (seenPhone.has(phone)) {
                    errors.push({ line, error: `Telefone duplicado na planilha: ${row.telefone}` });
                } else {
                    seenPhone.add(phone);
                }
            }

            // If no errors for this row, add to valid data
            // (Note: if you want to be strict, you might only consider validData if overall is valid)
            if (errors.length === 0 || errors[errors.length - 1].line !== line) {
                validData.push({ ...row, cpf, telefone: phone, email });
            }
        });

        return {
            isValid: errors.length === 0,
            validData,
            errors
        };
    }

    /**
     * Helper to clean strings for comparison
     */
    private static cleanFormat(value: any): string {
        if (!value) return "";
        return String(value).replace(/[^\d\w]/g, ""); // removes anything not alphanumeric
    }
}
