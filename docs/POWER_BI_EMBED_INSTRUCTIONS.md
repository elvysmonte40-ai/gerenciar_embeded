# Guia de Configuração: Power BI Embedded ("App Owns Data")

Este guia detalha o processo técnico para configurar o Power BI Embedded no cenário **"App owns data"** (B2B), onde sua aplicação autentica via **Service Principal** e os usuários finais não precisam de licenças Power BI.

## 1. Configuração no Azure AD (Entra ID)

### 1.1 Criar o App Registration
1. Acesse o [Portal do Azure](https://portal.azure.com/).
2. Vá em **App registrations** > **New registration**.
3. Nome: `PowerBI-Embed-App` (ou similar).
4. Supported account types: **Single tenant**.
5. Clique em **Register**.

### 1.2 Gerar Client Secret
1. No menu do App criado, vá em **Certificates & secrets**.
2. **New client secret**.
3. Copie o **Value** imediatamente (você não verá novamente). Este será seu `PBI_CLIENT_SECRET`.

### 1.3 Permissões (Opcional para Service Principal, mas recomendado)
1. Vá em **API Permissions** > **Add a permission**.
2. Escolha **Power BI Service** > **Delegated permissions**.
3. Selecione `Report.Read.All` e `Dataset.Read.All` (apenas para documentação, pois Service Principal usa permissões de Workspace).

### 1.4 Coletar IDs
Anote os seguintes valores da tela **Overview**:
- **Application (client) ID** (`PBI_CLIENT_ID`)
- **Directory (tenant) ID** (`PBI_TENANT_ID`)

---

## 2. Configuração no Power BI Service

### 2.1 Habilitar Service Principals
1. Acesse o [Power BI Admin Portal](https://app.powerbi.com/admin-portal).
2. Vá em **Tenant settings**.
3. Procure por **Developer settings** > **Allow service principals to use Power BI APIs**.
4. **Enable** (Habilite para "The entire organization" ou um Security Group específico onde o App do Azure foi adicionado).

### 2.2 Configurar o Workspace
1. Vá até o Workspace onde está o relatório.
2. Clique em **Manage access**.
3. Adicione o **Nome do App Registration** (criado no passo 1.1) como **Member** ou **Admin**.
   - *Nota: Service Principals não funcionam no "My Workspace". Deve ser um Workspace V2.*

### 2.3 Coletar IDs do Relatório
Abra o relatório no navegador e pegue da URL:
- `https://app.powerbi.com/groups/{WORKSPACE_ID}/reports/{REPORT_ID}`

---

## 3. Implementação Backend (Gerar Token)

A aplicação deve gerar um **Embed Token** no servidor (nunca exponha credenciais no front).

**Endpoint:** `POST https://api.powerbi.com/v1.0/myorg/GenerateToken`

**Fluxo de Autenticação:**
1. Gerar **Access Token** no Azure AD (Resource: `https://analysis.windows.net/powerbi/api`).
2. Usar o Access Token para chamar a API do Power BI e gerar o **Embed Token** para o relatório específico.

**Exemplo de Payload (Node.js/Astro):**
```javascript
// 1. Get AD Token
const authContext = new AuthenticationContext(`https://login.microsoftonline.com/${tenantId}`);
// ... obter token via client_credentials ...

// 2. Generate Embed Token
const response = await fetch(`https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/GenerateToken`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${adToken}` },
  body: JSON.stringify({ accessLevel: 'View' })
});
const { token } = await response.json();
```

---

## 4. Implementação Frontend (Renderizar)

Utilize a biblioteca oficial `powerbi-client-react`.

```jsx
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';

<PowerBIEmbed
	embedConfig={{
		type: 'report',
		id: '<ReportId>',
		embedUrl: '<EmbedUrl>',
		accessToken: '<EmbedToken>', // O token gerado no passo 3
		tokenType: models.TokenType.Embed, // Importante: Use 'Embed' para Service Principal
		settings: {
			panes: {
				filters: { visible: false },
				pageNavigation: { visible: false }
			}
		}
	}}
	cssClassName="h-screen w-full"
/>
```

## Checklist de Segurança
- [ ] As credenciais (Client Secret) estão apenas no servidor (.env).
- [ ] O RLS (Row Level Security) está configurado no Dataset do Power BI? (Se sim, é necessário passar o `identities` na geração do Embed Token).
- [ ] O Workspace está isolado de outros dados sensíveis?
