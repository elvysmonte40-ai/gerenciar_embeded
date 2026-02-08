---
name: architecture
description: Framework de tomada de decisão arquitetônica. Análise de requisitos, avaliação de trade-offs, documentação de ADR. Use ao tomar decisões de arquitetura ou analisar o design do sistema.
allowed-tools: Read, Glob, Grep
---

# Framework de Decisão de Arquitetura

> "Requisitos direcionam a arquitetura. Trade-offs (escolhas e concessões) informam as decisões. ADRs capturam a lógica."

## 🎯 Regra de Leitura Seletiva

**Leia APENAS os arquivos relevantes para a solicitação!** Verifique o mapa de conteúdo e encontre o que você precisa.

| Arquivo | Descrição | Quando Ler |
|------|-------------|--------------|
| `context-discovery.md` | Perguntas a fazer, classificação do projeto | Iniciando design de arquitetura |
| `trade-off-analysis.md` | Templates de ADR, framework de trade-off | Documentando decisões |
| `pattern-selection.md` | Árvores de decisão, anti-padrões | Escolhendo padrões |
| `examples.md` | Exemplos de MVP, SaaS, Enterprise | Implementações de referência |
| `patterns-reference.md` | Consulta rápida de padrões | Comparação de padrões |

---

## 🔗 Skills Relacionadas

| Skill | Uso Para |
|-------|---------|
| `@[skills/database-design]` | Design de schema de banco de dados |
| `@[skills/api-patterns]` | Padrões de design de API |
| `@[skills/deployment-procedures]` | Arquitetura de deploy |

---

## Princípio Central

**"Simplicidade é o grau máximo de sofisticação."**

- Comece de forma simples
- Adicione complexidade APENAS quando provado necessário
- Você sempre pode adicionar padrões depois
- Remover complexidade é MUITO mais difícil do que adicioná-la

---

## Checklist de Validação

Antes de finalizar a arquitetura:

- [ ] Requisitos claramente compreendidos
- [ ] Restrições identificadas
- [ ] Cada decisão possui análise de trade-off
- [ ] Alternativas mais simples foram consideradas
- [ ] ADRs escritos para decisões significativas
- [ ] A experiência da equipe condiz com os padrões escolhidos
