const brandColor = '#d60000';
const brandDark = '#af0000';
const brandLight = '#ff1a1a';
const bgColor = '#f0f2f5';
const cardBg = '#ffffff';
const textColor = '#111827';
const lightTextColor = '#4b5563';
const mutedColor = '#9ca3af';
const borderColor = '#e5e7eb';
const accentBg = '#fef2f2';
const accentBorder = '#fecaca';

const getBaseUrl = () => {
  // @ts-ignore
  const envUrl = (typeof import.meta.env !== 'undefined' && import.meta.env.PUBLIC_SITE_URL)
                 || (typeof process !== 'undefined' && process.env.PUBLIC_SITE_URL)
                 || 'https://mis.online.net.br';

  return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
};

function escapeHtml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function button(url: string, text: string): string {
  const safeUrl = escapeHtml(url);
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 32px auto 16px;">
      <tr>
        <td align="center" style="border-radius: 10px; background-color: ${brandColor};">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeUrl}" style="height:54px;v-text-anchor:middle;width:280px;" arcsize="19%" strokecolor="${brandDark}" fillcolor="${brandColor}">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;">
              ${text}
            </center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${safeUrl}" target="_blank" style="display: inline-block; padding: 16px 48px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 10px; background-color: ${brandColor}; border: 2px solid ${brandDark}; letter-spacing: 0.3px; mso-hide: all;">
            ${text}
          </a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>`;
}

function fallbackLink(url: string, label: string = 'Caso o botão não funcione, copie e cole o link abaixo no seu navegador:'): string {
  const safeUrl = escapeHtml(url);
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 32px; max-width: 480px;">
      <tr>
        <td align="center" style="padding: 16px 24px; background-color: ${bgColor}; border-radius: 8px; border: 1px solid ${borderColor};">
          <p style="margin: 0 0 8px; font-size: 12px; color: ${mutedColor}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.4;">
            ${label}
          </p>
          <a href="${safeUrl}" target="_blank" style="font-size: 12px; color: ${brandColor}; word-break: break-all; text-decoration: underline; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6;">
            ${safeUrl}
          </a>
        </td>
      </tr>
    </table>`;
}

function divider(): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 28px 0;">
      <tr>
        <td style="border-top: 1px solid ${borderColor}; font-size: 1px; line-height: 1px;">&nbsp;</td>
      </tr>
    </table>`;
}

function featureItem(icon: string, text: string): string {
  return `
    <tr>
      <td style="padding: 8px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td valign="top" width="32" style="padding-right: 12px;">
              <div style="width: 28px; height: 28px; border-radius: 8px; background-color: ${accentBg}; text-align: center; line-height: 28px; font-size: 14px;">
                ${icon}
              </div>
            </td>
            <td valign="middle" style="font-size: 14px; color: ${lightTextColor}; line-height: 1.5;">
              ${text}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>MIS - Sistema de Gestão</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-content { padding: 24px 20px !important; }
      .email-header { padding: 28px 20px 20px !important; }
      .email-footer { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${bgColor}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">

  <!-- PREHEADER (hidden text for inbox preview) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    MIS — Sistema de Gestão Inteligente
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${bgColor}; padding: 48px 16px;">
    <tr>
      <td align="center">

        <!-- MAIN CONTAINER -->
        <table role="presentation" class="email-container" width="580" cellspacing="0" cellpadding="0" border="0" style="background-color: ${cardBg}; border-radius: 16px; overflow: hidden; border: 1px solid ${borderColor};">

          <!-- HEADER -->
          <tr>
            <td class="email-header" style="padding: 36px 40px 24px; text-align: center; background-color: ${cardBg};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="padding-left: 16px; border-left: 4px solid ${brandColor};">
                    <h1 style="margin: 0; font-size: 30px; font-weight: 900; color: ${textColor}; letter-spacing: 5px; text-transform: uppercase; font-family: 'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1;">
                      MIS<span style="color: ${brandColor};">.</span>
                    </h1>
                    <p style="margin: 3px 0 0; font-size: 9px; color: ${mutedColor}; text-transform: uppercase; letter-spacing: 2.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                      Gestão Inteligente
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ACCENT BAR -->
          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, ${brandColor} 0%, ${brandLight} 50%, ${brandColor} 100%); font-size: 1px; line-height: 1px;">
              &nbsp;
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td class="email-content" style="padding: 40px 44px 48px;">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="email-footer" style="padding: 28px 40px 32px; background-color: #f9fafb; border-top: 1px solid ${borderColor}; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: ${lightTextColor}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                MIS by Online Telecom
              </p>
              <p style="margin: 0 0 16px; font-size: 11px; color: ${mutedColor}; line-height: 1.6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                Este é um e-mail automático. Não é necessário respondê-lo.
              </p>
              <p style="margin: 0; font-size: 11px; color: ${mutedColor}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                © ${new Date().getFullYear()} MIS. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>

        <!-- SUPPORT LINK -->
        <table role="presentation" width="580" cellspacing="0" cellpadding="0" border="0" style="margin-top: 20px;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; font-size: 12px; color: ${mutedColor}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                Precisa de ajuda?
                <a href="https://wa.me/5586994111300" style="color: ${brandColor}; text-decoration: none; font-weight: 600;">
                  Fale com o Suporte
                </a>
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
  const baseUrl = getBaseUrl();
  const loginUrl = `${baseUrl}/login`;

  const content = `
    <div style="text-align: center;">
      <!-- Icon badge -->
      <div style="margin: 0 auto 20px; width: 56px; height: 56px; border-radius: 50%; background-color: ${accentBg}; border: 2px solid ${accentBorder}; line-height: 56px; font-size: 28px;">
        👋
      </div>

      <h2 style="margin: 0 0 12px; font-size: 24px; font-weight: 800; color: ${textColor}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3;">
        Bem-vindo(a), ${firstName}!
      </h2>

      <p style="margin: 0 0 32px; font-size: 15px; line-height: 1.7; color: ${lightTextColor}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 440px; margin-left: auto; margin-right: auto;">
        Sua conta no portal <strong style="color: ${textColor};">MIS</strong> foi criada com sucesso.
        Estamos felizes em ter você conosco!
      </p>

      ${button(loginUrl, 'Acessar o Portal MIS')}
      ${fallbackLink(loginUrl)}
    </div>`;

  return baseLayout(content);
}

export function passwordResetEmailTemplate(resetUrl: string): string {
  const content = `
    <div style="text-align: center;">
      <!-- Icon badge -->
      <div style="margin: 0 auto 20px; width: 56px; height: 56px; border-radius: 50%; background-color: ${accentBg}; border: 2px solid ${accentBorder}; line-height: 56px; font-size: 28px;">
        🔐
      </div>

      <h2 style="margin: 0 0 12px; font-size: 24px; font-weight: 800; color: ${textColor}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3;">
        Redefinição de Senha
      </h2>

      <p style="margin: 0 0 32px; font-size: 15px; line-height: 1.7; color: ${lightTextColor}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 440px; margin-left: auto; margin-right: auto;">
        Recebemos uma solicitação para redefinir a senha da sua conta no <strong style="color: ${textColor};">MIS</strong>.
        Clique no botão abaixo para criar uma nova senha.
      </p>

      ${button(resetUrl, 'Definir Nova Senha')}
      ${fallbackLink(resetUrl)}

      <!-- Warning box -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 8px 0 24px;">
        <tr>
          <td style="padding: 16px 20px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; text-align: left;">
            <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
              <strong>Atenção:</strong> Se você não solicitou esta alteração, pode ignorar este e-mail com segurança. Sua senha atual permanecerá inalterada.
            </p>
          </td>
        </tr>
      </table>

      <p style="margin: 0; font-size: 12px; color: ${mutedColor}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        Por segurança, este link expira em <strong>60 minutos</strong>.
      </p>
    </div>`;

  return baseLayout(content);
}

export function welcomeWithPasswordResetTemplate(fullName: string, resetUrl: string): string {
  const firstName = fullName.split(' ')[0];
  const baseUrl = getBaseUrl();

  const content = `
    <div style="text-align: center;">
      <!-- Icon badge -->
      <div style="margin: 0 auto 20px; width: 56px; height: 56px; border-radius: 50%; background-color: ${accentBg}; border: 2px solid ${accentBorder}; line-height: 56px; font-size: 28px;">
        🚀
      </div>

      <h2 style="margin: 0 0 12px; font-size: 24px; font-weight: 800; color: ${textColor}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3;">
        Olá, ${firstName}!
      </h2>

      <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.7; color: ${lightTextColor}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 440px; margin-left: auto; margin-right: auto;">
        Seu acesso ao portal <strong style="color: ${textColor};">MIS</strong> foi liberado!
      </p>
      <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.7; color: ${lightTextColor}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 440px; margin-left: auto; margin-right: auto;">
        Para começar, configure sua senha pessoal clicando no botão abaixo:
      </p>

      ${button(resetUrl, 'Configurar Minha Senha')}
      ${fallbackLink(resetUrl)}
    </div>

    <!-- Features section -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 8px 0 28px; padding: 20px 24px; background-color: #f9fafb; border-radius: 12px; border: 1px solid ${borderColor};">
      <tr>
        <td>
          <p style="margin: 0 0 16px; font-size: 11px; font-weight: 700; color: ${mutedColor}; text-transform: uppercase; letter-spacing: 1.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            Recursos disponíveis
          </p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            ${featureItem('📊', 'Dashboards inteligentes em tempo real')}
            ${featureItem('⚙️', 'Gestão de processos e indicadores')}
            ${featureItem('👥', 'Controle de acessos e organograma')}
          </table>
        </td>
      </tr>
    </table>

    <div style="text-align: center;">
      <p style="margin: 0; font-size: 12px; color: ${mutedColor}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        Após configurar sua senha, salve o portal nos favoritos:
        <a href="${baseUrl}" style="color: ${brandColor}; font-weight: 600; text-decoration: none;">
          ${baseUrl.replace('https://', '')}
        </a>
      </p>
    </div>`;

  return baseLayout(content);
}
