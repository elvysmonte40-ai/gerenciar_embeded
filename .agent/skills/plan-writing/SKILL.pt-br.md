---
name: plan-writing
description: Planejamento estruturado de tarefas com divisões claras, dependências e critérios de verificação. Use ao implementar recursos, refatorar ou qualquer trabalho de múltiplas etapas.
allowed-tools: Read, Glob, Grep
---

# Escrita de Planos (Plan Writing)

> Origem: obra/superpowers

## Visão Geral
Esta skill fornece um framework para dividir o trabalho em tarefas claras e acionáveis, com critérios de verificação.

## Princípios de Divisão de Tarefas

### 1. Tarefas Pequenas e Focadas
- Cada tarefa deve levar de 2 a 5 minutos.
- Um resultado claro por tarefa.
- Independentemente verificável.

### 2. Verificação Clara
- Como você sabe que está pronto?
- O que você pode checar/testar?
- Qual é a saída (output) esperada?

### 3. Ordenação Lógica
- Dependências identificadas.
- Trabalho em paralelo onde for possível.
- Caminho crítico destacado.
- **A Fase de Verificação é sempre a ÚLTIMA.**

### 4. Nomenclatura Dinâmica na Raiz do Projeto
- Arquivos de plano são salvos como `{task-slug}.md` na RAIZ DO PROJETO.
- Nome derivado da tarefa (ex: "add auth" → `auth-feature.md`).
- **NUNCA** dentro de `.claude/`, `docs/` ou pastas temporárias.

## Princípios de Planejamento (NÃO são Templates!)

> 🔴 **SEM templates fixos. Cada plano é ÚNICO para a tarefa.**

### Princípio 1: Mantenha CURTO
- Máximo de 5-10 tarefas claras.
- Apenas itens acionáveis.
- Uma linha por tarefa.
- **Regra:** Se o plano for maior que 1 página, está longo demais. Simplifique.

---

### Princípio 2: Seja ESPECÍFICO, Não Genérico
- ✅ Certo: "Rodar `npx create-next-app`" em vez de "Configurar projeto".
- ✅ Certo: "Instalar next-auth, criar `/api/auth/[...nextauth].ts`" em vez de "Adicionar autenticação".
- **Regra:** Cada tarefa deve ter um resultado claro e verificável.

---

### Princípio 3: Conteúdo Dinâmico Baseado no Tipo de Projeto

- **NOVO PROJETO**: Decida a tech stack, defina o MVP e a estrutura de arquivos.
- **ADIÇÃO DE RECURSO**: Identifique arquivos afetados, dependências necessárias e como verificar.
- **CORREÇÃO DE BUG**: Identifique a causa raiz, arquivo/linha a alterar e como testar a correção.

---

### Princípio 4: Scripts São Específicos do Projeto
- **Frontend/React**: `ux_audit.py`, `accessibility_checker.py`.
- **Backend/API**: `api_validator.py`, `security_scan.py`.
- **Mobile**: `mobile_audit.py`.
- **Database**: `schema_validator.py`.
- **Regra:** Adicione apenas os scripts relevantes para ESTA tarefa.

---

### Princípio 5: Verificação é Simples
- ✅ Certo: "Rodar `npm run dev`, clicar no botão, ver o toast" em vez de "Verificar se o componente funciona".
- ✅ Certo: "curl localhost:3000/api/users retorna 200" em vez de "Testar a API".

---

## Estrutura do Plano (Flexível!)

```
# [Nome da Tarefa]

## Objetivo
Uma frase: O que estamos construindo/corrigindo?

## Tarefas
- [ ] Tarefa 1: [Ação específica] → Verificar: [Como checar]
- [ ] Tarefa 2: [Ação específica] → Verificar: [Como checar]

## Pronto Quando (Done When)
- [ ] [Critério principal de sucesso]
```

---

## Melhores Práticas (Referência Rápida)
1. **Comece com o objetivo**.
2. **Máximo 10 tarefas**.
3. **Cada tarefa verificável**.
4. **Específico do projeto**.
5. **Atualize conforme avança** (`[x]`).

---

## Quando Usar
- Novo projeto do zero.
- Adicionando um recurso.
- Corrigindo um bug (se for complexo).
- Refatorando múltiplos arquivos.
