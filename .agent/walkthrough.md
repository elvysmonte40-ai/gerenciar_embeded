# Walkthrough - Implementação de Permissões Granulares

## Visão Geral
Implementamos um sistema de permissões granulares que permite aos administradores configurar o acesso (Visualizar, Criar, Editar, Excluir) para cada módulo do sistema (Usuários, Processos, Indicadores, Perfis) individualmente.

## Alterações Realizadas

### 1. Banco de Dados
- **Tabela `organization_roles`**: Adicionada coluna `permissions` (JSONB) para armazenar a configuração de permissões.

### 2. Lógica de Permissões (`src/utils/permissions.ts`)
- Interface `AppPermissions` definida para tipar a estrutura JSON.
- Função `hasPermission(permissions, resource, action)` implementada para verificar acesso de forma centralizada.
- Função `fetchUserPermissions(userId)` para carregar permissões do usuário logado.

### 3. Interface de Gerenciamento de Perfis
- **RoleForm**: Atualizado para incluir uma matriz de checkboxes, permitindo configurar cada ação para cada recurso.
- **RoleList**: Agora exibe/oculta botões de gerenciamento com base na permissão `organization.manage_settings`.

### 4. Proteção de Componentes e Rotas
- **AppLayout**: Oculta itens do menu lateral (Usuários, Processos, Indicadores, Configurações) se o usuário não tiver permissão de visualizar o respectivo módulo.
- **Listas (UserList, ProcessList, IndicatorsList)**: Ocultam botões de "Novo" e ações de "Editar/Excluir" se o usuário não tiver permissão.
- **Detalhes/Edição**:
    - `ProcessCreate`: Redireciona se não tiver `processes.create`.
    - `ProcessEditor`: Exibe erro se não tiver `processes.edit`.
    - `IndicatorDetails/MonthlyEntryGrid`: Desabilita inputs se não tiver `indicators.edit`.

## Como Verificar

### Pré-requisitos
- Estar logado como Administrador da Organização.

### Passo a Passo

1.  **Configurar um Perfil Restrito**
    - Vá em **Configurações > Perfis**.
    - Crie ou Edite um perfil (ex: "Analista de Processos").
    - **Permissões**:
        - **Processos**: Marque `Visualizar`, `Criar`, `Editar`.
        - **Usuários**: Desmarque tudo (ou deixe apenas `Visualizar`).
        - **Indicadores**: Desmarque tudo.
    - Salve o perfil.

2.  **Atribuir Perfil a um Usuário**
    - Vá em **Usuários**.
    - Edite um usuário de teste e atribua o perfil "Analista de Processos".

3.  **Testar Acesso (Login com Usuário de Teste)**
    - Faça login com o usuário de teste.
    - **Menu Lateral**:
        - Deve ver "Processos".
        - Se desmarcou `Visualizar` usuários, "Usuários" não deve aparecer.
        - "Indicadores" não deve aparecer.
    - **Processos**:
        - Tente criar um processo (deve conseguir).
        - Tente editar um processo (deve conseguir).
    - **Acesso Direto (Teste de URL)**:
        - Tente acessar `/users` (se foi bloqueado): Deve ser redirecionado ou ver erro.
        - Tente acessar `/processes/novo`: Deve funcionar.

### Arquivos Modificados
- `src/utils/permissions.ts`
- `src/types/dashboard.ts`
- `src/modules/admin/components/RoleForm.tsx`
- `src/layouts/AppLayout.astro`
- `src/modules/users/components/UserList.tsx`
- `src/modules/processes/components/create/ProcessCreate.tsx`
- `src/modules/processes/components/editor/ProcessEditor.tsx`
- `src/modules/indicators/pages/IndicatorsList.tsx`
- `src/modules/indicators/pages/IndicatorDetails.tsx`
