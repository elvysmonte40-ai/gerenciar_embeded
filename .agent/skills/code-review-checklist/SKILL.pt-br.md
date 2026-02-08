---
name: code-review-checklist
description: Diretrizes de revisão de código cobrindo qualidade de código, segurança e melhores práticas.
allowed-tools: Read, Glob, Grep
---

# Checklist de Revisão de Código (Code Review Checklist)

## Checklist Rápido

### Correção
- [ ] O código faz o que deveria fazer.
- [ ] Casos de borda (edge cases) tratados.
- [ ] Tratamento de erros implementado.
- [ ] Sem bugs óbvios.

### Segurança
- [ ] Entradas validadas e sanitizadas.
- [ ] Sem vulnerabilidades de injeção SQL/NoSQL.
- [ ] Sem vulnerabilidades XSS ou CSRF.
- [ ] Sem segredos (secrets) ou credenciais sensíveis no código.
- [ ] **Específico de IA:** Proteção contra Prompt Injection (se aplicável).

### Performance
- [ ] Sem queries N+1.
- [ ] Sem loops desnecessários.
- [ ] Cache apropriado.
- [ ] Impacto no tamanho do bundle considerado.

### Qualidade de Código
- [ ] Nomenclatura clara.
- [ ] DRY - sem código duplicado.
- [ ] Princípios SOLID seguidos.
- [ ] Nível de abstração apropriado.

### Testes e Documentação
- [ ] Testes unitários para código novo.
- [ ] Casos de borda testados.
- [ ] Lógica complexa comentada.
- [ ] APIs públicas documentadas.

---

## Padrões de Revisão IA & LLM (2025)

- **Lógica & Alucinações**: Verifique se a lógica segue um caminho verificável e se a IA considerou estados vazios, timeouts e falhas parciais.
- **Prompt Engineering**: Verifique se os prompts estão estruturados e seguros, evitando prompts vagos no código.

---

## Anti-Padrões a Sinalizar

- ❌ **Números Mágicos**: Use constantes nomeadas.
- ❌ **Aninhamento Profundo**: Use retornos antecipados (early returns).
- ❌ **Funções Longas**: Use funções pequenas e focadas.
- ❌ **Tipo `any`**: Use tipos apropriados no TypeScript.

---

## Guia de Comentários de Revisão

- 🔴 **BLOCKING (Bloqueante)**: Problemas graves (ex: vulnerabilidade de segurança).
- 🟡 **SUGGESTION (Sugestão)**: Melhorias importantes (ex: performance).
- 🟢 **NIT (Detalhe)**: Observações menores (ex: preferir `const` a `let`).
- ❓ **QUESTION (Pergunta)**: Dúvidas sobre o comportamento (ex: "o que acontece se for nulo?").
