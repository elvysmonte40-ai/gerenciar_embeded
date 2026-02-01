# Roadmap de Desenvolvimento - Aplicação B2B Gestão Integrada

## 🎯 Visão Geral
**Objetivo:** Plataforma unificada de gestão empresarial B2B.
**Stack:** Astro (Frontend/SSR), Supabase (Backend/Auth/DB).
**Futuro:** Clerk (Auth avançado), Resend (Emails).

---

## 🧠 Brainstorming & Decisões Arquiteturais

### 1. Modelo de Multi-tenancy (Gestão B2B)
*   **Decisão:** Utilizar `organization_id` em todas as tabelas críticas (RLS - Row Level Security).
*   **Por que:** Garante isolamento total de dados entre empresas clientes no Supabase.
*   **Ideia:** Criar tabela `organizations` desde o início para vincular usuários (Tabela `profiles`) a uma empresa.

### 2. Estratégia de Power BI Embed
*   **Cenário:** B2B (Muitos clientes externos).
*   **Abordagem:** "App owns data" (Service Principal).
*   **Benefício:** Os usuários finais NÃO precisam de licença Power BI Pro. A aplicação autentica com uma conta mestre (Service Principal) no Azure.
*   **Necessário:** Azure AD App, Security Group, e workspace do Power BI configurado.

### 3. Astro: SSR vs Static
*   **Decisão:** Hybrid Rendering (SSR para áreas logadas/dashboard, Static para LP/Marketing).
*   **Por que:** Necessário SSR para gerar tokens do Power BI de forma segura (lado do servidor) sem expor segredos no client.

---

## 📅 Fases do Projeto

### 📍 Fase 1: Alicerce & Integração Core (FOCO ATUAL)
*   **Setup:** Astro + Tailwind + Supabase Client.
*   **Banco de Dados:** Schema inicial (`profiles`, `organizations`).
*   **Auth:** Login básico via Supabase (Magic Link ou Email/Senha).
*   **Power BI:** Rota de API para geração de Embed Token e Componente React/Astro para renderização.
*   **Gestão de Usuários:** Listagem simples e convite (mock inicial).

### Fase 2: Gestão de Usuários Avançada & Permissões
*   Implementação de Roles (Admin, Gestor, Operador).
*   Contexto de Organização (Troca de empresa se aplicável).
*   Refinamento de RLS.

### Fase 3: Gestão de Ponto (Futuro)
*   Tabelas de registro de ponto.
*   Geolocalização e validação.

### Fase 4: Gestão de Indicadores e Metas (Futuro)
*   CRUD de KPIs.
*   Visualização de metas vs realizado (além do Power BI).

### Fase 5: Notificações & Emails
*   Integração Resend.
*   Alertas de metas e ponto.

---

## ✅ Próximos Passos
Aprovar o `implementation_plan.md` da Fase 1 para início imediato.
