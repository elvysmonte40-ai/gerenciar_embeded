import { Resend } from 'resend';

// Verifica se a API key está disponível (usamos VITE_RESEND_API_KEY ou RESEND_API_KEY dependendo do env)
const apiKey = import.meta.env?.RESEND_API_KEY || process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

if (!resend) {
    console.warn('⚠️ RESEND_API_KEY não configurada no ambiente. Envios de e-mail não funcionarão.');
}

export interface SendTemplateEmailParams {
    to: string | string[];
    subject: string;
    htmlContent: string;  // Conteúdo HTML que virá do banco
    variables?: Record<string, string>; // Variáveis para Replace(ex: {{ nome }})
}

/**
 * Utilitário para processar as variáveis no HTML (simples Replace)
 */
function processHtmlVariables(html: string, variables?: Record<string, string>): string {
    if (!variables) return html;

    let processedHtml = html;
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        processedHtml = processedHtml.replace(regex, value);
    }
    return processedHtml;
}

/**
 * Envia um e-mail baseado na Campanha usando o resend
 */
export async function sendCampaignEmail({ to, subject, htmlContent, variables }: SendTemplateEmailParams) {
    if (!resend) throw new Error("Resend não configurado.");

    const finalHtml = processHtmlVariables(htmlContent, variables);

    try {
        const data = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>', // TODO: Mudar para domínio verificado do usuário
            to: Array.isArray(to) ? to : [to],
            subject,
            html: finalHtml,
        });
        return { success: true, data };
    } catch (error) {
        console.error("Erro no envio pelo Resend:", error);
        return { success: false, error };
    }
}
