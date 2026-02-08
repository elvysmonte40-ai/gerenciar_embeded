---
name: api-patterns
description: Princípios de design de API e tomada de decisão. Seleção de REST vs GraphQL vs tRPC, formatos de resposta, versionamento, paginação.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Padrões de API (API Patterns)

> Princípios de design de API e tomada de decisão para 2025.
> **Aprenda a PENSAR, não apenas copiar padrões fixos.**

## 🎯 Regra de Leitura Seletiva

**Leia APENAS os arquivos relevantes para a solicitação!** Verifique o mapa de conteúdo e encontre o que você precisa.

---

## 📑 Mapa de Conteúdo

| Arquivo | Descrição | Quando Ler |
|------|-------------|--------------|
| `api-style.md` | Árvore de decisão: REST vs GraphQL vs tRPC | Escolhendo o tipo de API |
| `rest.md` | Nomenclatura de recursos, métodos HTTP, códigos de status | Projetando API REST |
| `response.md` | Padrão envelope, formato de erro, paginação | Estrutura de resposta |
| `graphql.md` | Design de schema, quando usar, segurança | Considerando GraphQL |
| `trpc.md` | Monorepo TypeScript, type safety | Projetos TS fullstack |
| `versioning.md` | Versionamento por URI/Header/Query | Planejamento da evolução da API |
| `auth.md` | JWT, OAuth, Passkey, API Keys | Seleção de padrão de Auth |
| `rate-limiting.md` | Token bucket, sliding window | Proteção de API |
| `documentation.md` | Melhores práticas de OpenAPI/Swagger | Documentação |
| `security-testing.md` | OWASP API Top 10, testes de auth/authz | Auditorias de segurança |

---

## 🔗 Skills Relacionadas

| Necessidade | Skill |
|------|-------|
| Implementação de API | `@[skills/backend-development]` |
| Estrutura de dados | `@[skills/database-design]` |
| Detalhes de segurança | `@[skills/security-hardening]` |

---

## ✅ Checklist de Decisão

Antes de projetar uma API:

- [ ] **Perguntou ao usuário sobre os consumidores da API?**
- [ ] **Escolheu o estilo de API para ESTE contexto?** (REST/GraphQL/tRPC)
- [ ] **Definiu um formato de resposta consistente?**
- [ ] **Planejou a estratégia de versionamento?**
- [ ] **Considerou as necessidades de autenticação?**
- [ ] **Planejou o rate limiting?**
- [ ] **Abordagem de documentação definida?**

---

## ❌ Anti-Padrões

**NÃO FAÇA:**
- Usar REST como padrão para tudo
- Usar verbos em endpoints REST (/getUsers)
- Retornar formatos de resposta inconsistentes
- Expor erros internos aos clientes
- Pular o rate limiting

**FAÇA:**
- Escolha o estilo da API com base no contexto
- Pergunte sobre os requisitos do cliente
- Documente minuciosamente
- Use os códigos de status HTTP apropriados

---

## Script

| Script | Propósito | Comando |
|--------|---------|---------|
| `scripts/api_validator.py` | Validação de endpoints de API | `python scripts/api_validator.py <caminho_do_projeto>` |
