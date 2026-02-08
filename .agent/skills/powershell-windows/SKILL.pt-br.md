---
name: powershell-windows
description: Padrões de PowerShell para Windows. Armadilhas críticas, sintaxe de operadores e tratamento de erros.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Padrões PowerShell Windows (PowerShell Windows Patterns)

> Padrões críticos e armadilhas para o Windows PowerShell.

---

## 1. Regras de Sintaxe e Operadores

### CRÍTICO: Parênteses Obrigatórios
Cada chamada de cmdlet DEVE estar entre parênteses ao usar operadores lógicos.
- ✅ Certo: `if ((Test-Path "a") -or (Test-Path "b"))`
- ❌ Errado: `if (Test-Path "a" -or Test-Path "b")`

---

## 2. Restrição de Unicode/Emoji

### CRÍTICO: Nada de Unicode/Emojis em Scripts
**Regra:** Use apenas caracteres ASCII em scripts PowerShell para evitar erros inesperados.
- Use `[OK]` ou `[+]` em vez de emojis de sucesso.
- Use `[!]` ou `[X]` em vez de círculos vermelhos ou cruzes.

---

## 3. Padrões de Verificação de Nulo
Sempre verifique se um objeto existe antes de acessar suas propriedades:
- ✅ Certo: `if ($text) { $text.Length }`
- ❌ Errado: `$text.Length`

---

## 4. Operações de Arquivos e JSON

- **Caminhos**: Use `Join-Path` para garantir compatibilidade de caminhos entre plataformas.
- **JSON**: SEMPRE especifique `-Depth` ao usar `ConvertTo-Json` (ex: `ConvertTo-Json -Depth 10`).

---

## 5. Tratamento de Erros e Template

Use `Set-StrictMode -Version Latest` e envolva sua lógica principal em blocos `try/catch`.
Não use `return` dentro do bloco `try`; realize o retorno após o tratamento.

| Erro Comum | Causa Probável | Correção |
|---------------|-------|-----|
| "parameter 'or'" | Falta de parênteses | Envolva os cmdlets em `()` |
| "Unexpected token" | Caractere Unicode | Use apenas ASCII |

---

> **Lembre-se:** O PowerShell tem regras de sintaxe únicas. Parênteses, uso exclusivo de ASCII e checagens de nulo não são negociáveis.
