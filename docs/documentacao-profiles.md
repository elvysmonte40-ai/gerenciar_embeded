# 🛡️ Gerenciamento de Perfis

## Visão Geral

O módulo de Perfis permite criar grupos de permissões que controlam o acesso aos dashboards e funcionalidades da plataforma. Cada usuário é vinculado a um perfil, herdando automaticamente suas permissões.

## Funcionalidades Principais

- **Criação de perfis** - Definição de grupos de permissão nomeados
- **Permissões de dashboard** - Seleção de quais dashboards cada perfil pode acessar
- **Controle de exportação** - Habilitar/desabilitar exportação de dados por perfil
- **Papéis Power BI** - Configuração de roles para RLS
- **Mapeamento de cargos** - Vinculação automática com cargos da Intranet

## Interface do Módulo

### Listagem de Perfis

Tabela horizontal com todos os perfis cadastrados:
- **Nome** - Identificador do perfil
- **Descrição** - Texto descritivo opcional
- **Dashboards** - Quantidade de dashboards vinculados
- **Status** - Toggle para ativar/desativar
- **Ações** - Botões de edição e exclusão

### Formulário de Cadastro/Edição

| Campo | Descrição | Obrigatório |
|-------|-----------|-------------|
| `Nome` | Identificador único do perfil | Sim |
| `Descrição` | Texto explicativo sobre o perfil | Não |
| `Dashboards` | Seleção múltipla de dashboards permitidos | Não |
| `Papéis Power BI` | Roles para Row Level Security (separados por vírgula) | Não |
| `Exportar Dados` | Habilita exportação de dados nos relatórios | Não |

### Permissão de Exportação

- O campo `can_export_data` controla a visibilidade do menu de exportação
- Validação realizada server-side via Edge Function (não pode ser burlada)
- Utiliza `CommandDisplayOption.Hidden` para ocultar completamente a opção
- Administradores possuem permissão de exportação por padrão
- Princípio de menor privilégio: padrão é `false` (negado)

## Mapeamento de Cargos (Intranet)

- Perfis podem ser vinculados a cargos da Intranet via tabela `profile_job_mappings`
- Durante a sincronização, usuários são automaticamente associados ao perfil correto
- Constraint única em `(company_id, job_role_id)` garante integridade
