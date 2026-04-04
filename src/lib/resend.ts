import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { welcomeEmailTemplate, passwordResetEmailTemplate } from './email-templates';

const apiKey = import.meta.env.RESEND_API_KEY;
const fromName = import.meta.env.RESEND_FROM_NAME || 'MIS';
const fromEmail = import.meta.env.RESEND_FROM_EMAIL || 'noreply@tatutec.com.br';

export const resend = apiKey ? new Resend(apiKey) : null;

if (!resend) {
    console.warn('⚠️ RESEND_API_KEY não configurada no ambiente. Envios de e-mail não funcionarão.');
}

function getSupabaseAdmin() {
    const url = import.meta.env.PUBLIC_SUPABASE_URL;
    const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
}

function getFromAddress(): string {
    return `${fromName} <${fromEmail}>`;
}

export interface SendTemplateEmailParams {
    to: string | string[];
    subject: string;
    htmlContent: string;
    variables?: Record<string, string>;
}

function processHtmlVariables(html: string, variables?: Record<string, string>): string {
    if (!variables) return html;
    let processedHtml = html;
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        processedHtml = processedHtml.replace(regex, value);
    }
    return processedHtml;
}

async function logEmail(params: {
    resendEmailId?: string;
    emailType: string;
    toEmail: string;
    subject: string;
    organizationId?: string;
}) {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) return;
    try {
        await supabaseAdmin.from('email_logs').insert({
            resend_email_id: params.resendEmailId,
            email_type: params.emailType,
            from_email: fromEmail,
            to_email: params.toEmail,
            subject: params.subject,
            organization_id: params.organizationId || null,
            status: 'sent',
        });
    } catch (err) {
        console.error('Erro ao registrar log de email:', err);
    }
}

export async function sendWelcomeEmail(to: string, fullName: string, organizationId?: string) {
    if (!resend) throw new Error("Resend não configurado.");

    let subject = `Bem-vindo(a) ao MIS, ${fullName.split(' ')[0]}! 🎉`;
    let html = welcomeEmailTemplate(fullName);

    // Tentar buscar template customizado no banco
    if (organizationId) {
        const supabaseAdmin = getSupabaseAdmin();
        if (supabaseAdmin) {
            const { data: template } = await supabaseAdmin
                .from('email_templates')
                .select('subject, html_content')
                .eq('organization_id', organizationId)
                .eq('template_type', 'welcome')
                .single();

            if (template) {
                subject = template.subject || subject;
                html = processHtmlVariables(template.html_content, { nome: fullName });
            }
        }
    }

    try {
        const { data } = await resend.emails.send({
            from: getFromAddress(),
            to: [to],
            subject,
            html,
        });

        await logEmail({
            resendEmailId: data?.id,
            emailType: 'welcome',
            toEmail: to,
            subject,
            organizationId,
        });

        return { success: true, data };
    } catch (error) {
        console.error("Erro ao enviar email de boas-vindas:", error);
        return { success: false, error };
    }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string, organizationId?: string) {
    if (!resend) throw new Error("Resend não configurado.");

    let subject = 'Redefinir sua senha — MIS';
    let html = passwordResetEmailTemplate(resetUrl);

    // Tentar buscar template customizado
    if (organizationId) {
        const supabaseAdmin = getSupabaseAdmin();
        if (supabaseAdmin) {
            const { data: template } = await supabaseAdmin
                .from('email_templates')
                .select('subject, html_content')
                .eq('organization_id', organizationId)
                .eq('template_type', 'password_reset')
                .single();

            if (template) {
                subject = template.subject || subject;
                html = processHtmlVariables(template.html_content, { reset_url: resetUrl });
            }
        }
    }

    try {
        const { data } = await resend.emails.send({
            from: getFromAddress(),
            to: [to],
            subject,
            html,
        });

        await logEmail({
            resendEmailId: data?.id,
            emailType: 'password_reset',
            toEmail: to,
            subject,
        });

        return { success: true, data };
    } catch (error) {
        console.error("Erro ao enviar email de redefinição:", error);
        return { success: false, error };
    }
}

export async function sendCampaignEmail({ to, subject, htmlContent, variables }: SendTemplateEmailParams) {
    if (!resend) throw new Error("Resend não configurado.");

    const finalHtml = processHtmlVariables(htmlContent, variables);

    try {
        const data = await resend.emails.send({
            from: getFromAddress(),
            to: Array.isArray(to) ? to : [to],
            subject,
            html: finalHtml,
        });

        const recipient = Array.isArray(to) ? to[0] : to;
        await logEmail({
            resendEmailId: (data as any)?.data?.id,
            emailType: 'campaign',
            toEmail: recipient,
            subject,
        });

        return { success: true, data };
    } catch (error) {
        console.error("Erro no envio pelo Resend:", error);
        return { success: false, error };
    }
}
