# migracao-dados.md

## Objetivo
Criar um novo submódulo "Migração" no módulo de Configurações, projetado para permitir a importação manual de dados iniciais do sistema através de planilhas do Excel. Todo o conjunto será projetado de forma segura, suportando validações obrigatórias e processo em cascata (ex: obrigatoriedade da inserção de Cargos antes de Usuários).

## Project Type
**WEB** (Uso dos agentes: `frontend-specialist`, `backend-specialist`, `database-architect`)

## Critérios de Sucesso (Done When)
- [ ] O submenu de Migração está posicionado debaixo da área "Geral" da barra de administração.
- [ ] Uma planilha (XLSX ou CSV) pode ser carregada, lida localmente no client-side e repassada ao serviço de validação.
- [ ] O sistema aplica as regras de consistência para rejeitar arquivos com linhas sem campos obrigatórios, CPFs duplicados ou telefones duplicados.
- [ ] Existe o controle de hierarquia cascata (roles inseridos precisam existir localmente e no db antes da persistência de usuários).
- [ ] Toda a transação e lote de inserts para a base Supabase ocorre de forma devidamente particionada/segura.

## Tech Stack
- Frontend: `Astro` (Routes), `React` (Components), `TailwindCSS`
- Bibliotecas: Para o parse local deve ser incorporado ou uma biblioteca como `xlsx` ou `papaparse`.
- Backend/DB: `Supabase` API client (`supabase-js`) para Bulk Inserts seguros.

## File Structure (Arquitetura Proposta)
```text
src/
├── components/AdminSidebar.astro   [MODIFY] (Novo link na sidebar)
├── pages/admin/migration/index.astro [NEW] (Wrapper de Rota Principal)
└── modules/admin/
    ├── components/
    │   ├── MigrationManager.tsx    [NEW] (Container central e abas)
    │   └── DataUploader.tsx        [NEW] (Leitor de arquivo e preview)
    └── services/
        ├── MigrationValidationService.ts [NEW] (Validações de regras como CPF duplos e campos vazios)
        └── MigrationInsertService.ts     [NEW] (Batch Actions ao Supabase)
```

## Tarefas (Task Breakdown)
- [ ] **Task 1:** Atualizar o `AdminSidebar.astro` incluindo a nova opção e criar o componente principal container de página em `src/pages/admin/migration/index.astro`. → **Verify**: Link aparece e redireciona. 
- [ ] **Task 2:** Desenvolver o componente `DataUploader.tsx` para interceptar inputs de arquivo e ler os dados crus (XLSX ou CSV).  → **Verify**: O componente deve mostrar visualmente a malha de dados carregados do arquivo local (preview grid).
- [ ] **Task 3:** Implementar as validações básicas no `MigrationValidationService`. Função deve varrer linhas duplicadas localmente, testar formato de dados e sinalizar linhas com erro.  → **Verify**: Tentar enviar duplicadas ou vazias aciona alerta no componente da UI.
- [ ] **Task 4:** Desenvolver painéis no `MigrationManager` para definir a ordem cascata (Passo 1: Cargos, Passo 2: O resto). Bloquear passo 2 caso dependa do Passo 1 ainda não migrado.  → **Verify**: Fluxo reflete o lock/unlock nas abas.
- [ ] **Task 5:** Ligar a camada final ao `MigrationInsertService.ts` aplicando o bulk insert e upserts da Supabase.  → **Verify**: Confirmar na interface e tabela (Supabase) a existências das massas testadas.

## ✅ Phase X: Verification
- [ ] Script Audit (Security/Linting): Executar `python .agent/scripts/checklist.py .` para validação geral do P0 ao P3.
- [ ] UI e Permissões verificadas e bloqueadas sob `admin` role local.
- [ ] Build e testes de render sem quebra.
