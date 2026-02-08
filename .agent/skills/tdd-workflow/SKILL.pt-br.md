---
name: tdd-workflow
description: Princípios do fluxo de trabalho de Test-Driven Development (Desenvolvimento Orientado por Testes). Ciclo RED-GREEN-REFACTOR.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Fluxo de Trabalho TDD (TDD Workflow)

> Escreva os testes primeiro, o código depois.

---

## 1. O Ciclo TDD

```
🔴 RED (Vermelho) → Escreva um teste que falha
     ↓
🟢 GREEN (Verde) → Escreva o código mínimo para passar
     ↓
🔵 REFACTOR (Refatorar) → Melhore a qualidade do código
     ↓
   Repetir...
```

---

## 2. As Três Leis do TDD

1. Escreva código de produção apenas para fazer um teste que falhou passar.
2. Escreva apenas o teste suficiente para demonstrar a falha.
3. Escreva apenas o código suficiente para fazer o teste passar.

---

## 3. Princípios da Fase RED

- **O que escrever**: Comportamento esperado, casos de borda e estados de erro.
- **Regras**: O teste DEVE falhar primeiro, o nome do teste deve descrever o comportamento esperado e use preferencialmente uma afirmação (assert) por teste.

---

## 4. Princípios da Fase GREEN

- **Código Mínimo**: Aplique YAGNI (Você não vai precisar disso), faça a coisa mais simples para passar e não otimize ainda.
- **Regras**: Não escreva código desnecessário e foque apenas em passar no teste, nada mais.

---

## 5. Princípios da Fase REFACTOR

- **O que melhorar**: Eliminar duplicidade, melhorar nomenclatura (tornar intenção clara), melhorar organização de estrutura e simplificar lógica.
- **Regras**: Todos os testes devem permanecer verdes, faça pequenas mudanças incrementais e dê commit após cada refatoração.

---

## 6. Padrão AAA

Todo teste segue:
- **Arrange** (Organizar): Configurar dados de teste.
- **Act** (Agir): Executar o código sob teste.
- **Assert** (Afirmar): Verificar o resultado esperado.

---

## 7. Quando Usar TDD

- **Valor Alto**: Novos recursos, correção de bugs e lógica complexa.
- **Valor Baixo**: Explorações (spikes) e layouts de UI.

---

## 8. Priorização de Testes

1. Caminho Feliz (Happy path).
2. Casos de Erro.
3. Casos de Borda (Edge cases).
4. Performance.

---

## 9. Anti-Padrões (NÃO FAÇA)

- Pular a fase RED (veja o teste falhar primeiro).
- Escrever testes depois do código.
- Excesso de engenharia inicial.
- Testar implementação técnica em vez de comportamento.

---

## 10. TDD Aumentado por IA

- **Agente A**: Escreve testes que falham (RED).
- **Agente B**: Implementa para passar (GREEN).
- **Agente C**: Otimiza (REFACTOR).

---

> **Lembre-se:** O teste é a especificação. Se você não consegue escrever o teste, você não entendeu o requisito.
