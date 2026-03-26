import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { w as welcomeEmailTemplate, p as passwordResetEmailTemplate } from './email-templates_C8YvwTUp.mjs';

const apiKey = "re_53n7Ft5v_4eYqpgkVdiYeBFnr6SwwqLDK";
const fromName = "Gerenciar";
const fromEmail = "noreply@tatutec.com.br";
const resend = new Resend(apiKey) ;
if (!resend) {
  console.warn("⚠️ RESEND_API_KEY não configurada no ambiente. Envios de e-mail não funcionarão.");
}
function getSupabaseAdmin() {
  const url = "https://qedxpygkkwybrvxludjx.supabase.co";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZHhweWdra3d5YnJ2eGx1ZGp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAzODQ0OSwiZXhwIjoyMDg1NjE0NDQ5fQ.xefVpPNcdVpBADfTbx2VK5vvw6M5dMMs_FpkEL0L09k";
  return createClient(url, key);
}
function getFromAddress() {
  return `${fromName} <${fromEmail}>`;
}
function processHtmlVariables(html, variables) {
  if (!variables) return html;
  let processedHtml = html;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    processedHtml = processedHtml.replace(regex, value);
  }
  return processedHtml;
}
async function logEmail(params) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return;
  try {
    await supabaseAdmin.from("email_logs").insert({
      resend_email_id: params.resendEmailId,
      email_type: params.emailType,
      from_email: fromEmail,
      to_email: params.toEmail,
      subject: params.subject,
      organization_id: params.organizationId || null,
      status: "sent"
    });
  } catch (err) {
    console.error("Erro ao registrar log de email:", err);
  }
}
async function sendWelcomeEmail(to, fullName, organizationId) {
  if (!resend) throw new Error("Resend não configurado.");
  let subject = `Bem-vindo(a) ao Gerenciar, ${fullName.split(" ")[0]}! 🎉`;
  let html = welcomeEmailTemplate(fullName);
  if (organizationId) {
    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      const { data: template } = await supabaseAdmin.from("email_templates").select("subject, html_content").eq("organization_id", organizationId).eq("template_type", "welcome").single();
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
      html
    });
    await logEmail({
      resendEmailId: data?.id,
      emailType: "welcome",
      toEmail: to,
      subject,
      organizationId
    });
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao enviar email de boas-vindas:", error);
    return { success: false, error };
  }
}
async function sendPasswordResetEmail(to, resetUrl, organizationId) {
  if (!resend) throw new Error("Resend não configurado.");
  let subject = "Redefinir sua senha — Gerenciar";
  let html = passwordResetEmailTemplate(resetUrl);
  if (organizationId) {
    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      const { data: template } = await supabaseAdmin.from("email_templates").select("subject, html_content").eq("organization_id", organizationId).eq("template_type", "password_reset").single();
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
      html
    });
    await logEmail({
      resendEmailId: data?.id,
      emailType: "password_reset",
      toEmail: to,
      subject
    });
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao enviar email de redefinição:", error);
    return { success: false, error };
  }
}
async function sendCampaignEmail({ to, subject, htmlContent, variables }) {
  if (!resend) throw new Error("Resend não configurado.");
  const finalHtml = processHtmlVariables(htmlContent, variables);
  try {
    const data = await resend.emails.send({
      from: getFromAddress(),
      to: Array.isArray(to) ? to : [to],
      subject,
      html: finalHtml
    });
    const recipient = Array.isArray(to) ? to[0] : to;
    await logEmail({
      resendEmailId: data?.data?.id,
      emailType: "campaign",
      toEmail: recipient,
      subject
    });
    return { success: true, data };
  } catch (error) {
    console.error("Erro no envio pelo Resend:", error);
    return { success: false, error };
  }
}

export { resend, sendCampaignEmail, sendPasswordResetEmail, sendWelcomeEmail };
