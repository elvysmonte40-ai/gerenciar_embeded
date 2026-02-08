---
name: database-design
description: Princípios de design de banco de dados e tomada de decisão. Design de schema, estratégia de indexação, seleção de ORM e bancos de dados serverless.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Design de Banco de Dados (Database Design)

> **Aprenda a PENSAR, não apenas a copiar padrões SQL.**

---

## 🎯 Regra de Leitura Seletiva

**Leia APENAS os arquivos relevantes!** Escolha entre:
- `database-selection.md`: PostgreSQL vs SQLite vs Turso vs Neon.
- `orm-selection.md`: Drizzle vs Prisma vs Kysely.
- `schema-design.md`: Normalização, chaves e relacionamentos.
- `indexing.md`: Tipos de índices e performance.
- `optimization.md`: N+1 e `EXPLAIN ANALYZE`.
- `migrations.md`: Mudanças de schema seguras.

---

## ⚠️ Princípio Central

- Pergunte ao usuário sobre preferências quando não estiver claro.
- Escolha Banco de Dados/ORM baseando-se no **CONTEXTO**.
- Não use PostgreSQL como padrão para tudo (SQLite pode ser suficiente para apps simples).

---

## ✅ Checklist de Decisão

- [ ] Perguntou ao usuário sobre a preferência de banco de dados?
- [ ] Escolheu o banco de dados para ESTE contexto?
- [ ] Considerou o ambiente de deployment?
- [ ] Planejou a estratégia de indexação?
- [ ] Definiu os tipos de relacionamento?

---

## ❌ Anti-Padrões (NÃO FAÇA)

- Ignorar a indexação.
- Usar `SELECT *` em produção.
- Armazenar JSON quando dados estruturados seriam melhores.
- Ignorar consultas N+1.

---

> **Lembre-se:** A estrutura dos seus dados define a saúde do seu aplicativo. Projete com inteligência.
