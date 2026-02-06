# 📊 Gerenciamento de Dashboards

> [!NOTE]
> **Status da Implementação:** Em Progresso 🚧
> Documentação validada em relação à versão atual. Itens marcados com `[x]` estão implementados. Itens com `[ ]` estão pendentes.

## Visão Geral

Este módulo permite o gerenciamento centralizado dos dashboards do Power BI que serão disponibilizados aos usuários da plataforma. Através desta interface, é possível configurar a integração com relatórios existentes no Power BI Service, definir permissões de acesso e personalizar a exibição.

## Funcionalidades Principais

- [x] **Cadastro de dashboards** - Registro de novos relatórios Power BI na plataforma
- [ ] **Ordenação** - Definição da ordem de exibição no menu lateral (Pendente)
- [ ] **Controle de status** - Ativação/desativação de dashboards sem exclusão (Pendente)
- [ ] **Agrupamento** - Vinculação de dashboards a menus específicos (Pendente)

## Interface do Módulo

### Listagem de Dashboards

Tabela com todos os dashboards cadastrados, contendo:
- [x] **Título** - Nome de identificação do dashboard
- [ ] **Menu Associado** - Grupo de menu vinculado (Pendente)
- [ ] **Status** - Toggle para ativar/desativar exibição (Pendente)
- [x] **Ações** - Botões de edição e exclusão

### Formulário de Cadastro/Edição

| Campo | Descrição | Obrigatório | Status |
|-------|-----------|-------------|--------|
| `Título` | Nome exibido aos usuários | Sim | ✅ Implementado |
| `Descrição` | Texto descritivo opcional | Não | ✅ Implementado |
| `Report ID` | Identificador único do relatório no Power BI | Sim | ✅ Implementado |
| `Group ID` | Identificador do workspace no Power BI | Sim | ✅ Implementado |
| `Menu` | Grupo de menu para agrupamento | Sim | ❌ Pendente |
| `Ordem` | Posição na listagem (crescente) | Sim | ❌ Pendente |
| `Allowed Groups` | Permissões de acesso por grupo (RLS) | Não | ✅ Implementado |

### Configurações de Embedding

> ⚠️ As configurações abaixo estão atualmente **hardcoded** no componente `DashboardEmbed.tsx` e não são editáveis pelo formulário ainda.

- [ ] **Tipo de Embedding** (Pendente no banco/form)
  - `Usuários Externos`: Utiliza token de aplicação (App Owns Data)
  - `Usuários Internos`: Utiliza RLS com identidade do usuário (User Owns Data)
- [ ] **Ocultar Painel de Filtros**: Remove a área de filtros do relatório (Hardcoded como `false`)
- [ ] **Ocultar Menu Inferior**: Remove a barra de navegação de páginas do Power BI (Hardcoded como `false`)

## Requisitos Técnicos

- [x] O `Report ID` e `Group ID` devem ser obtidos no Power BI Service
- [x] A conta de serviço Power BI deve ter permissão de leitura no workspace
- [ ] Para RLS, os papéis devem estar configurados no modelo de dados do Power BI (Conceito validado, mas configuração dinâmica pendente)

## Próximos Passos (To-Do)

1. **Adicionar campos na tabela `organization_dashboards`**:
   - `menu_group` (texto ou enum)
   - `order` (inteiro)
   - `is_active` (booleano)
   - `settings` (JSON para configurações de embed)

2. **Atualizar `DashboardForm.tsx`**:
   - Incluir campos de Menu, Ordem e Configurações Visuais.

3. **Atualizar `DashboardEmbed.tsx`**:
   - Aceitar configurações via props em vez de hardcoded.
