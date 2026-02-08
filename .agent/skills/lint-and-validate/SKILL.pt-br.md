---
name: lint-and-validate
description: Controle de qualidade automático, linting e procedimentos de análise estática. Use após cada modificação de código para garantir a correção sintática e os padrões do projeto.
allowed-tools: Read, Glob, Grep, Bash
---

# Skill de Lint e Validação (Lint and Validate)

> **OBRIGATÓRIO:** Execute as ferramentas de validação apropriadas após CADA alteração de código. Não finalize uma tarefa até que o código esteja livre de erros.

### Procedimentos por Ecossistema

#### Node.js / TypeScript
1. **Lint/Fix:** `npm run lint` ou `npx eslint "caminho" --fix`
2. **Tipos:** `npx tsc --noEmit`
3. **Segurança:** `npm audit --audit-level=high`

#### Python
1. **Linter (Ruff):** `ruff check "caminho" --fix` (Rápido e Moderno)
2. **Segurança (Bandit):** `bandit -r "caminho" -ll`
3. **Tipos (MyPy):** `mypy "caminho"`

## O Ciclo de Qualidade (Quality Loop)
1. **Escrever/Editar Código**
2. **Executar Auditoria:** `npm run lint && npx tsc --noEmit`
3. **Analisar Relatório:** Verifique a seção de erros e avisos.
4. **Corrigir e Repetir:** Enviar código com falhas na auditoria final NÃO é permitido.

## Tratamento de Erros
- Se o `lint` falhar: Corrija os problemas de estilo ou sintaxe imediatamente.
- Se o `tsc` falhar: Corrija as incompatibilidades de tipo antes de prosseguir.
- Se nenhuma ferramenta estiver configurada: Verifique a raiz do projeto por `.eslintrc`, `tsconfig.json`, `pyproject.toml` e sugira a criação de um.

---
**Regra Estrita:** Nenhum código deve ser commitado ou relatado como "concluído" sem passar por estas checagens.

---

## Scripts

| Script | Propósito | Comando |
|--------|---------|---------|
| `scripts/lint_runner.py` | Check de lint unificado | `python scripts/lint_runner.py <caminho_do_projeto>` |
| `scripts/type_coverage.py` | Análise de cobertura de tipos | `python scripts/type_coverage.py <caminho_do_projeto>` |
