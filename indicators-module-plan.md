# [Módulo] Implementação da Plataforma de Indicadores

## Objetivo
Desenvolver uma Plataforma de Indicadores "inspirada no Quattrus" permitindo que usuários criem, acompanhem e visualizem KPIs mensais (Realizado, Orçado, Meta) com análise automática de desvios.

## Fase 1: Requisitos e Regras de Negócio
- [x] Levantamento de Requisitos: Revisar sistemas de gestão de KPIs existentes (referência Quattrus). 
- [x] Definir Configuração do Indicador:
    - **Direção**: "Melhor para Cima" (Quanto maior, melhor) ou "Melhor para Baixo" (Quanto menor, melhor).
- [x] Definir cálculo de "Resultado":
    - **Performance %** = (Realizado / Meta) * 100
    - **Desvio** = Realizado - Meta
    - **Tendência**: Comparar mês atual vs mês anterior.
- [x] Definir Lógica do "Farol" (Status):
    - 🟢 **Verde**: Atingimento de meta (Meta batida).
    - 🟡 **Amarelo**: Não atingimento de meta (Meta não batida).
    - 🔴 **Vermelho**: Terceiro mês consecutivo sem bater a meta OU Meta anual comprometida.
- [ ] Definir Lógica de "Acumulado": Soma de Realizado/Meta do início do ano até o mês atual.

## Fase 2: Arquitetura de Banco de Dados
- [x] Criar tabela `indicators`:
    - `id` (uuid, PK)
    - `organization_id` (uuid, FK)
    - `title` (text)
    - `direction` ('HIGHER_BETTER' | 'LOWER_BETTER')
    - `unit` ('currency' | 'percent' | 'number')
    - `periodicity` (padrão 'monthly')
- [x] Criar tabela `indicator_entries`:
    - `id` (uuid, PK)
    - `indicator_id` (uuid, FK)
    - `month` (int, 1-12)
    - `year` (int)
    - `target` (decimal) -> Meta
    - `budget` (decimal) -> Orçado
    - `realized` (decimal) -> Realizado
- [x] Aplicar políticas RLS em `indicators` permitindo acesso apenas ao `organization_id` vinculado.
- [x] Aplicar políticas RLS em `indicator_entries` permitindo acesso apenas à organização do `indicator_id` vinculado.

## Fase 3: Backend e Motor de Cálculo
- [x] Criar Funções de Banco de Dados Supabase (RPC) ou Helpers TypeScript para cálculos: `calculate_status(realized, target, direction)`.
- [x] Implementar Server Actions (Astro/React) para mutação segura de dados:
    - `createIndicator(data)`
    - `upsertMonthlyEntry(indicatorId, month, year, values)`
- [x] Implementar serviço de busca de dados `getIndicatorsWithLatestEntry(orgId)`.

## Fase 4: Implementação UI/UX (Dashboard e Entrada)
- [x] **Design System & UX**: Consultar e aplicar estritamente:
    - Skill: `.agent/skills/frontend-design/SKILL.md` (Princípios de Design e Psicologia UX).
    - Documentação: `docs/FRONTEND_DESIGN_SYSTEM.md` (Identidade Visual da Aplicação).
    - Objetivo: Interface "Wow Factor", clean e de alta performance.
- [x] **Entrada de Dados (Grid)**: Criar componente `MonthlyEntryGrid` para inserir dados de Ano/Mês (Realizado, Orçado, Meta).
    - Sugestão: Visualização tipo planilha (Excel-like) para edição em massa.
- [x] **Layout**: Criar `src/modules/indicators/layouts/IndicatorsLayout.astro` com barra lateral específica do módulo (ex: "Meus Indicadores", "Dashboards").
- [x] **Dashboard (Visualização em Lista)**: Criar página `IndicatorList` mostrando cartões de resumo com cores de status.
- [ ] **Visualização**: Implementar lógica para renderizar gráficos "Realizado vs Orçado vs Meta" (ex: usando Recharts).
- [x] **Integração**: Adicionar link "Indicadores" na navegação do Cabeçalho Global.

## Fase 5: Verificação e Testes
- [x] **Teste de Cálculo**: Entrada: Meta=100, Realizado=95 -> Verificar Status=Amarelo (95%).
- [x] **Teste RLS**: Tentar buscar indicadores de um `organization_id` diferente (deve retornar vazio/erro).
- [x] **Teste UI**: Verificação de responsividade móvel para a grid de entrada de dados.
- [x] **Teste de Fluxo**: Criar Indicador -> Adicionar Dados -> Verificar Atualização do Dashboard.

## Concluído Quando
- [x] Schema do banco de dados aplicado e tipos gerados.
- [x] Usuário consegue gerenciar totalmente Indicadores (CRUD).
- [x] Usuário consegue inserir dados mensais (Realizado, Orçado, Meta).
- [x] Dashboard visualiza corretamente o status de desempenho (Verde/Amarelo/Vermelho).
- [x] Dados estritamente isolados por Organização (RLS).
