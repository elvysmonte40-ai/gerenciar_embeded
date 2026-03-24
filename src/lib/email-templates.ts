const brandColor = '#E67E22';
const brandDark = '#D35400';
const bgColor = '#f8f9fa';
const textColor = '#2d3748';
const mutedColor = '#718096';

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:${bgColor};font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${bgColor};padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
          <tr>
            <td style="background:linear-gradient(135deg,${brandColor},${brandDark});padding:32px 40px;text-align:center;">
              <span style="font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">🔷 Gerenciar</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background-color:#f7f8fa;border-top:1px solid #edf2f7;text-align:center;">
              <p style="margin:0;font-size:12px;color:${mutedColor};">
                © ${new Date().getFullYear()} Gerenciar by Tatutec. Todos os direitos reservados.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:${mutedColor};">
                Este é um email automático, por favor não responda.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function welcomeEmailTemplate(fullName: string): string {
  const firstName = fullName.split(' ')[0];
  const content = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:${textColor};">
      Bem-vindo(a), ${firstName}! 🎉
    </h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${textColor};">
      Sua conta no <strong>Gerenciar</strong> foi criada com sucesso. Estamos muito felizes em ter você conosco!
    </p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:${textColor};">
      Com o Gerenciar você pode:
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:12px 16px;background-color:#fff8f0;border-radius:8px;border-left:4px solid ${brandColor};">
          <p style="margin:0 0 8px;font-size:14px;color:${textColor};">✅ Gerenciar sua equipe e organograma</p>
          <p style="margin:0 0 8px;font-size:14px;color:${textColor};">📊 Acompanhar indicadores e dashboards</p>
          <p style="margin:0 0 8px;font-size:14px;color:${textColor};">📋 Mapear e controlar processos</p>
          <p style="margin:0;font-size:14px;color:${textColor};">📧 Enviar campanhas de email</p>
        </td>
      </tr>
    </table>
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
      <tr>
        <td style="border-radius:8px;background:linear-gradient(135deg,${brandColor},${brandDark});">
          <a href="https://gerenciar.tatutec.com.br/login" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;">
            Acessar o Gerenciar →
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:24px 0 0;font-size:14px;color:${mutedColor};text-align:center;">
      Se precisar de ajuda, entre em contato conosco.
    </p>`;
  return baseLayout(content);
}

export function passwordResetEmailTemplate(resetUrl: string): string {
  const content = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:${textColor};">
      Redefinir sua senha 🔐
    </h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${textColor};">
      Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Gerenciar</strong>.
    </p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:${textColor};">
      Clique no botão abaixo para criar uma nova senha:
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px;">
      <tr>
        <td style="border-radius:8px;background:linear-gradient(135deg,${brandColor},${brandDark});">
          <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;">
            Redefinir Senha →
          </a>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px;">
      <tr>
        <td style="padding:12px 16px;background-color:#fff5f5;border-radius:8px;border-left:4px solid #e53e3e;">
          <p style="margin:0;font-size:14px;color:#c53030;">
            ⚠️ Se você não solicitou esta redefinição, ignore este email. Sua senha permanecerá a mesma.
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:${mutedColor};text-align:center;">
      Este link expira em 1 hora por questões de segurança.
    </p>`;
  return baseLayout(content);
}
